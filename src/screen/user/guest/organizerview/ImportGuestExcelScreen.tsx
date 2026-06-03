import { Text } from "@/src/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import * as XLSX from "xlsx";

type ExcelRow = Record<string, string>;

type ColumnMapping = {
  guestName: string;
  phoneNumber: string;
  countryCode: string;
  isFamily: string;
  numberOfGuests: string;
};

const GUEST_FIELDS = [
  { key: "guestName", label: "Guest Name", required: true, example: "e.g. John Doe" },
  { key: "phoneNumber", label: "Phone Number", required: true, example: "e.g. 9812345678 (will format as +977-9876543210)" },
  { key: "countryCode", label: "Country Code", required: false, example: "e.g. 977 (default: 977)" },
  { key: "isFamily", label: "Is Family", required: false, example: "e.g. yes/no, true/false, or 1/0" },
  { key: "numberOfGuests", label: "Number of Guests", required: false, example: "e.g. 5 (default: 1, used when Is Family = yes)" },
] as const;

const normalizeHeader = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

const autoMapColumns = (headers: string[]): ColumnMapping => {
  const normalized = headers.map((header) => ({
    header,
    key: normalizeHeader(header),
  }));

  const findHeader = (candidates: string[]) => {
    const match = normalized.find((item) => candidates.includes(item.key));
    return match?.header ?? "";
  };

  return {
    guestName: findHeader(["guestname", "fullname", "name", "guest", "username", "person"]),
    phoneNumber: findHeader(["phone", "phonenumber", "mobile", "mobilenumber", "cell", "tel"]),
    countryCode: findHeader(["countrycode", "dialcode", "callingcode", "country", "code"]),
    isFamily: findHeader(["isfamily", "family", "group", "isfamilygroup", "familygroup", "multiple"]),
    numberOfGuests: findHeader(["noofguests", "numberofguests", "guestcount", "count", "guests", "size", "familysize"]),
  };
};

const buildRowObjects = (rows: unknown[][]): ExcelRow[] => {
  if (!rows.length) return [];
  const headers = rows[0].map((item) => String(item ?? "").trim());

  return rows
    .slice(1)
    .map((row) => {
      const record: ExcelRow = {};
      headers.forEach((header, index) => {
        record[header] = String(row[index] ?? "").trim();
      });
      return record;
    })
    .filter((record) => Object.values(record).some((value) => value.length));
};

export default function ImportGuestExcelScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const eventId = Number(params.eventId);

  const [fileName, setFileName] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<ExcelRow[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    guestName: "",
    phoneNumber: "",
    countryCode: "",
    isFamily: "",
    numberOfGuests: "",
  });

  const columnOptions = useMemo(
    () => [
      { label: "— Select column —", value: "" },
      ...columns.map((col) => ({ label: col, value: col })),
    ],
    [columns]
  );

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
      const file = new FileSystem.File(asset.uri);
      const base64 = await file.base64();

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
    return GUEST_FIELDS.filter(
      (field) => field.required && !mapping[field.key as keyof ColumnMapping]
    );
  }, [mapping]);

  const handleReview = useCallback(() => {
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

    router.push({
      pathname: "./excel-review" as any,
      params: {
        eventId: String(eventId),
        mapping: JSON.stringify(mapping),
        rows: JSON.stringify(rows),
      },
    });
  }, [eventId, mapping, missingRequiredFields, rows, router]);

  const mappedCount = useMemo(() => {
    return Object.values(mapping).filter((v) => v).length;
  }, [mapping]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <Pressable onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="arrow-back" size={24} color="#1a1b3a" />
        </Pressable>
        <Text className="text-xl font-bold text-[#1a1b3a] flex-1">
          Import from Excel
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-5" style={{ gap: 24 }}>
          {/* Expected Fields Info */}
          <View
            className="rounded-xl border border-slate-200 p-4"
            style={{ backgroundColor: "#f8fafc" }}
          >
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="information-circle" size={18} color="#EE2B8C" />
              <Text className="text-sm font-semibold text-[#1a1b3a]">
                Fields We Accept
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              <View className="flex-row items-start gap-2">
                <Text className="text-xs text-slate-600 w-24 font-medium">Guest Name</Text>
                <Text className="text-xs text-slate-500 flex-1">Required - The name of the guest or family head</Text>
              </View>
              <View className="flex-row items-start gap-2">
                <Text className="text-xs text-slate-600 w-24 font-medium">Number</Text>
                <Text className="text-xs text-slate-500 flex-1">Required - Phone number stored as +977-9876543210 format</Text>
              </View>
              <View className="flex-row items-start gap-2">
                <Text className="text-xs text-slate-600 w-24 font-medium">Is Family</Text>
                <Text className="text-xs text-slate-500 flex-1">Optional - true/false, yes/no, or 1/0 (default: false)</Text>
              </View>
              <View className="flex-row items-start gap-2">
                <Text className="text-xs text-slate-600 w-24 font-medium">No of Guests</Text>
                <Text className="text-xs text-slate-500 flex-1">Optional - Number when Is Family is true (default: 1)</Text>
              </View>
            </View>
          </View>

          {/* File Upload Section */}
          <View style={{ gap: 8 }}>
            <Text className="text-sm font-semibold text-[#1a1b3a]">
              Step 1: Upload Excel File
            </Text>
            <TouchableOpacity
              onPress={pickFile}
              className="flex-row items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4"
              style={{ borderStyle: fileName ? "solid" : "dashed" }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: fileName ? "rgba(238,43,140,0.1)" : "#f1f5f9" }}
                >
                  <Ionicons
                    name={fileName ? "document-text" : "cloud-upload-outline"}
                    size={20}
                    color={fileName ? "#EE2B8C" : "#64748b"}
                  />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-slate-800">
                    {fileName ?? "Select Excel file"}
                  </Text>
                  <Text className="text-xs text-slate-500">
                    {fileName
                      ? `${rows.length} rows found`
                      : "Supports .xlsx, .xls, .csv"}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Column Mapping Section */}
          {columns.length > 0 && (
            <View style={{ gap: 16 }}>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-[#1a1b3a]">
                  Step 2: Map Columns
                </Text>
                <View
                  className="px-2 py-1 rounded-full"
                  style={{
                    backgroundColor:
                      mappedCount === GUEST_FIELDS.length
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(238,43,140,0.1)",
                  }}
                >
                  <Text
                    className="text-xs font-medium"
                    style={{
                      color:
                        mappedCount === GUEST_FIELDS.length
                          ? "#16a34a"
                          : "#EE2B8C",
                    }}
                  >
                    {mappedCount}/{GUEST_FIELDS.length} mapped
                  </Text>
                </View>
              </View>

              <Text className="text-xs text-slate-500 -mt-2">
                Match your Excel columns to guest fields. Required fields must be mapped.
              </Text>

              <View style={{ gap: 12 }}>
                {GUEST_FIELDS.map((field) => {
                  const isMapped = !!mapping[field.key as keyof ColumnMapping];
                  const hasError = field.required && !isMapped;

                  return (
                    <View
                      key={field.key}
                      className="rounded-xl border border-slate-200 bg-white p-4"
                      style={{
                        borderColor: hasError ? "#f87171" : "#e2e8f0",
                      }}
                    >
                      <View className="flex-row items-center gap-1 mb-2">
                        <Text className="text-xs font-semibold text-[#1a1b3a]">
                          {field.label}
                        </Text>
                        {field.required && (
                          <Text className="text-xs text-red-500">*</Text>
                        )}
                        {isMapped && (
                          <Ionicons
                            name="checkmark-circle"
                            size={14}
                            color="#22c55e"
                            style={{ marginLeft: 4 }}
                          />
                        )}
                      </View>

                      <Dropdown
                        style={{
                          height: 48,
                          borderWidth: 1,
                          borderColor: hasError ? "#f87171" : "#e2e8f0",
                          borderRadius: 8,
                          paddingHorizontal: 12,
                          backgroundColor: "#ffffff",
                        }}
                        placeholderStyle={{ color: "#94a3b8", fontSize: 14 }}
                        selectedTextStyle={{ color: "#1a1b3a", fontSize: 14 }}
                        data={columnOptions}
                        labelField="label"
                        valueField="value"
                        placeholder="Select Excel column"
                        value={mapping[field.key as keyof ColumnMapping]}
                        onChange={(item: { value: string }) =>
                          setMapping((prev) => ({
                            ...prev,
                            [field.key]: item.value,
                          }))
                        }
                      />

                      <Text className="text-[11px] text-slate-400 mt-2">
                        {field.example}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Preview Tip */}
          {columns.length > 0 && (
            <View
              className="rounded-xl border border-dashed border-slate-300 p-4"
              style={{ backgroundColor: "#f8fafc" }}
            >
              <View className="flex-row items-start gap-2">
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#64748b"
                />
                <Text className="text-xs text-slate-500 flex-1">
                  Next step: Review and edit each guest before importing.
                  You&apos;ll be able to edit names, phone numbers, family status, and guest count.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Review Button */}
      <View className="absolute bottom-8 left-5 right-5">
        <TouchableOpacity
          onPress={handleReview}
          disabled={!columns.length || missingRequiredFields.length > 0}
          className={`h-14 rounded-2xl items-center justify-center flex-row ${
            !columns.length || missingRequiredFields.length > 0
              ? "bg-gray-200"
              : "bg-[#EE2B8C]"
          }`}
          style={
            columns.length && missingRequiredFields.length === 0
              ? {
                  shadowColor: "#EE2B8C",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 8,
                  elevation: 8,
                }
              : {}
          }
        >
          <Ionicons
            name="eye-outline"
            size={20}
            color={
              !columns.length || missingRequiredFields.length > 0
                ? "#9CA3AF"
                : "#fff"
            }
          />
          <Text
            className={`ml-2 text-sm font-semibold ${
              !columns.length || missingRequiredFields.length > 0
                ? "text-gray-400"
                : "text-white"
            }`}
          >
            {!columns.length
              ? "Upload a file first"
              : missingRequiredFields.length > 0
              ? `Map ${missingRequiredFields.length} required field${
                  missingRequiredFields.length > 1 ? "s" : ""
                }`
              : `Review ${rows.length} guest${rows.length > 1 ? "s" : ""}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}