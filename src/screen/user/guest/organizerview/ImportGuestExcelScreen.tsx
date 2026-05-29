import { Text } from "@/src/components/ui/Text";
import {
  useGetEventGuestCategories,
  useInviteGuest,
} from "@/src/features/guests/api/use-guests";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { TextInput } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import * as XLSX from "xlsx";

const REQUIRED_FIELDS = [
  { key: "guestName", label: "Guest name", required: true },
  { key: "countryCode", label: "Country code", required: true },
  { key: "phoneNumber", label: "Phone number", required: true },
  { key: "familyName", label: "Family / invitation name", required: false },
] as const;

type FieldKey = (typeof REQUIRED_FIELDS)[number]["key"];

type RowRecord = Record<string, string>;

type ColumnMap = Record<FieldKey, string>;

const normalizeHeader = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

const autoMapColumns = (headers: string[]): ColumnMap => {
  const normalized = headers.map((header) => ({
    header,
    key: normalizeHeader(header),
  }));

  const findHeader = (candidates: string[]) => {
    const match = normalized.find((item) => candidates.includes(item.key));
    return match?.header ?? "";
  };

  return {
    guestName: findHeader(["guestname", "fullname", "name", "guest"]),
    countryCode: findHeader([
      "countrycode",
      "dialcode",
      "callingcode",
      "country",
    ]),
    phoneNumber: findHeader(["phone", "phonenumber", "mobile", "mobilenumber"]),
    familyName: findHeader(["family", "invitation", "invitationname"]),
  };
};

const buildRowObjects = (rows: unknown[][]): RowRecord[] => {
  if (!rows.length) return [];
  const headers = rows[0].map((item) => String(item ?? "").trim());

  return rows
    .slice(1)
    .map((row) => {
      const record: RowRecord = {};
      headers.forEach((header, index) => {
        record[header] = String(row[index] ?? "").trim();
      });
      return record;
    })
    .filter((record) => Object.values(record).some((value) => value.length));
};

const formatPhone = (countryCode: string, phoneNumber: string) => {
  const code = countryCode.trim();
  const phone = phoneNumber.replace(/\s+/g, "");
  if (!code) return phone;
  return `${code.startsWith("+") ? code : `+${code}`}${phone}`;
};

export default function ImportGuestExcelScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const eventId = Number(params.eventId);
  const inviteMutation = useInviteGuest();
  const { data: guestCategories = [], isLoading: isGuestCategoriesLoading } =
    useGetEventGuestCategories(eventId || null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<RowRecord[]>([]);
  const [mapping, setMapping] = useState<ColumnMap>({
    guestName: "",
    countryCode: "",
    phoneNumber: "",
    familyName: "",
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [importing, setImporting] = useState(false);

  const columnOptions = useMemo(
    () => [
      { label: "Not mapped", value: "" },
      ...columns.map((col) => ({ label: col, value: col })),
    ],
    [columns]
  );

  const categoryOptions = useMemo(
    () => guestCategories,
    [guestCategories]
  );

  useEffect(() => {
    if (!selectedCategory && categoryOptions.length) {
      setSelectedCategory(categoryOptions[0].value);
    }
  }, [categoryOptions, selectedCategory]);

  const pickFile = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    setFileName(asset.name ?? "Imported file");

    try {
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const workbook = XLSX.read(base64, { type: "base64" });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      const sheetRows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        defval: "",
      }) as unknown[][];

      if (!sheetRows.length) {
        Alert.alert("No data", "We couldn't find any rows in this file.");
        return;
      }

      const headers = sheetRows[0].map((item) => String(item ?? "").trim());
      setColumns(headers);
      setRows(buildRowObjects(sheetRows));
      setMapping(autoMapColumns(headers));
    } catch (error: any) {
      Alert.alert("Import failed", error?.message || "Unable to read file.");
    }
  }, []);

  const missingRequiredFields = useMemo(() => {
    return REQUIRED_FIELDS.filter(
      (field) => field.required && !mapping[field.key]
    );
  }, [mapping]);

  const previewRows = useMemo(() => rows.slice(0, 5), [rows]);

  const handleImport = useCallback(
    async (isDraft: boolean) => {
      if (!eventId || isNaN(eventId)) {
        Alert.alert("Missing event", "We can't find the event for this import.");
        return;
      }

      if (missingRequiredFields.length) {
        Alert.alert(
          "Missing mapping",
          `Please map: ${missingRequiredFields.map((f) => f.label).join(", ")}`
        );
        return;
      }

      if (!rows.length) {
        Alert.alert("No data", "Please pick a file with guest rows.");
        return;
      }

      setImporting(true);
      let successCount = 0;
      let failCount = 0;

      try {
        for (const row of rows) {
          const guestName = row[mapping.guestName]?.trim();
          const phoneNumber = row[mapping.phoneNumber]?.trim();
          const countryCode = row[mapping.countryCode]?.trim() ?? "";
          const familyName = mapping.familyName
            ? row[mapping.familyName]?.trim()
            : "";
          const category = selectedCategory.trim();

          if (!guestName || !phoneNumber) {
            failCount += 1;
            continue;
          }

          const phone = formatPhone(countryCode, phoneNumber);
          const invitationName = familyName || guestName;

          await inviteMutation.mutateAsync({
            eventId,
            payload: {
              fullName: guestName,
              invitation_name: invitationName || guestName,
              isDraft,
              phone,
              isFamily: Boolean(familyName),
              role: "guest",
              category: category || "uncategorized",
              status: isDraft ? "draft" : "pending",
              isAccomodation: false,
            },
          });
          successCount += 1;
        }

        Alert.alert(
          "Import complete",
          `${successCount} guest(s) imported. ${failCount} skipped.`
        );
        router.back();
      } catch (error: any) {
        Alert.alert("Import failed", error?.message || "Please try again.");
      } finally {
        setImporting(false);
      }
    },
    [eventId, inviteMutation, mapping, missingRequiredFields, rows, router]
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f6f5f7] px-4 pt-3" edges={[]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-base font-jakarta-bold text-slate-900">
          Import guests from Excel
        </Text>
        <Text className="text-sm text-slate-500 mt-1">
          Upload a sheet, map the columns, then choose Draft or Send.
        </Text>

        <TouchableOpacity
          onPress={pickFile}
          className="mt-4 flex-row items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-4"
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="document-text-outline" size={20} color="#EE2B8C" />
            <View>
              <Text className="text-sm text-slate-900">Select Excel file</Text>
              <Text className="text-xs text-slate-500">
                {fileName ?? "No file selected"}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        {columns.length > 0 && (
          <View className="mt-6">
            <Text className="text-sm font-jakarta-bold text-slate-900">
              Map columns
            </Text>
            <Text className="text-xs text-slate-500 mt-1">
              Required fields must be mapped to continue.
            </Text>

            <View className="mt-4" style={{ gap: 14 }}>
              {REQUIRED_FIELDS.map((field) => (
                <View key={field.key}>
                  <Text className="text-xs font-semibold tracking-wide text-[#1a1b3a]">
                    {field.label} {field.required ? "*" : ""}
                  </Text>
                  <Dropdown
                    style={{
                      height: 56,
                      borderWidth: 1,
                      borderColor: field.required && !mapping[field.key]
                        ? "#f87171"
                        : "#e2e8f0",
                      borderRadius: 6,
                      paddingHorizontal: 16,
                      backgroundColor: "#ffffff",
                      marginTop: 8,
                    }}
                    placeholderStyle={{ color: "#94a3b8", fontSize: 14 }}
                    selectedTextStyle={{ color: "#1a1b3a", fontSize: 14 }}
                    data={columnOptions}
                    labelField="label"
                    valueField="value"
                    placeholder="Select column"
                    value={mapping[field.key]}
                    onChange={(item: { value: string }) =>
                      setMapping((prev) => ({ ...prev, [field.key]: item.value }))
                    }
                  />
                </View>
              ))}
            </View>

            <View className="mt-4">
              <Text className="text-xs font-semibold tracking-wide text-[#1a1b3a]">
                Category (applies to all)
              </Text>
              <Dropdown
                style={{
                  height: 56,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  borderRadius: 6,
                  paddingHorizontal: 16,
                  backgroundColor: "#ffffff",
                  marginTop: 8,
                }}
                placeholderStyle={{ color: "#94a3b8", fontSize: 14 }}
                selectedTextStyle={{ color: "#1a1b3a", fontSize: 14 }}
                data={categoryOptions}
                labelField="label"
                valueField="value"
                placeholder={
                  isGuestCategoriesLoading
                    ? "Loading categories..."
                    : categoryOptions.length
                      ? "Select category"
                      : "No categories available"
                }
                disable={isGuestCategoriesLoading || !categoryOptions.length}
                value={selectedCategory}
                onChange={(item: { value: string }) =>
                  setSelectedCategory(item.value)
                }
              />
            </View>
          </View>
        )}

        {previewRows.length > 0 && (
          <View className="mt-6">
            <Text className="text-sm font-jakarta-bold text-slate-900">
              Preview (first 5 rows)
            </Text>
            <View className="mt-3" style={{ gap: 10 }}>
              {previewRows.map((row, index) => (
                <View
                  key={`${row[mapping.guestName] ?? "row"}-${index}`}
                  className="rounded-md border border-slate-200 bg-white p-3"
                >
                  <Text className="text-sm text-slate-900">
                    {row[mapping.guestName] || "Unnamed guest"}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-1">
                    Phone: {row[mapping.phoneNumber] || "—"}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-1">
                    Country code: {row[mapping.countryCode] || "—"}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-1">
                    Category: {selectedCategory || "—"}
                  </Text>
                  {!!mapping.familyName && (
                    <Text className="text-xs text-slate-500 mt-1">
                      Family: {row[mapping.familyName] || "—"}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="mt-8" style={{ gap: 12 }}>
          <Pressable
            className="items-center justify-center rounded-md border border-slate-200 py-3"
            onPress={() => handleImport(true)}
            disabled={importing || inviteMutation.isPending}
          >
            <Text className="font-semibold text-slate-700">
              {importing ? "Importing..." : "Import as Draft"}
            </Text>
          </Pressable>
          <Pressable
            className="items-center justify-center rounded-md bg-primary py-3"
            onPress={() => handleImport(false)}
            disabled={importing || inviteMutation.isPending}
          >
            <Text className="font-semibold text-white">
              {importing ? "Importing..." : "Send Invites"}
            </Text>
          </Pressable>
        </View>

        <View className="mt-6 rounded-md border border-dashed border-slate-200 bg-slate-50 p-3">
          <Text className="text-xs text-slate-500">
            Tip: If your sheet has a “Family” column, we’ll use it as the
            invitation name. Otherwise, we’ll copy the guest name.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
