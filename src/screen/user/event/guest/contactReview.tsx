import {
  CountryOption,
  CountryPickerModal,
} from "@/src/components/ui/CountryPhone";
import { Text } from "@/src/components/ui/Text";
import { COUNTRY_DATA } from "@/src/constants/countrydata";
import {
  useGetEventGuestCategories,
  useInviteGuest,
} from "@/src/features/guests/api/use-guests";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type ContactItem = {
  id: string;
  name: string;
  phone: string;
  countryCode: string;
  category: string;
};

const normalizeDigits = (value: string) => value.replace(/[^0-9+]/g, "");

const DEFAULT_COUNTRY = COUNTRY_DATA.find((c) => c.dialCode === "977") ??
  COUNTRY_DATA[0];

const buildPhone = (countryCode: string, phone: string) => {
  const rawPhone = phone.trim();
  const phoneDigits = rawPhone.replace(/\D/g, "");
  if (!phoneDigits) return "";

  const resolveDialCode = (digits: string) => {
    const matches = COUNTRY_DATA.filter((c) => digits.startsWith(c.dialCode));
    if (!matches.length) return null;
    return matches.sort((a, b) => b.dialCode.length - a.dialCode.length)[0];
  };

  const codeFromParam =
    countryCode.trim().replace(/\D/g, "") || DEFAULT_COUNTRY.dialCode;

  const detected = rawPhone.startsWith("+") ? resolveDialCode(phoneDigits) : null;
  const codeDigits = detected?.dialCode || codeFromParam;

  let stripped = phoneDigits.replace(/^0+/, "");
  if (stripped.startsWith(codeDigits)) {
    stripped = stripped.slice(codeDigits.length);
  }

  return `+${codeDigits}-${stripped}`;
};

const splitPhone = (raw: string, fallbackCode: string) => {
  const cleaned = raw.trim();
  if (!cleaned) return { code: fallbackCode, local: "" };

  const digits = cleaned.replace(/\D/g, "");
  if (!digits) return { code: fallbackCode, local: "" };

  if (cleaned.startsWith("+")) {
    const matches = COUNTRY_DATA.filter((c) => digits.startsWith(c.dialCode));
    const detected = matches.sort((a, b) => b.dialCode.length - a.dialCode.length)[0];
    const code = detected?.dialCode || fallbackCode;
    const local = digits.startsWith(code) ? digits.slice(code.length) : digits;
    return { code, local };
  }

  return { code: fallbackCode, local: digits };
};

export default function ContactReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const inviteGuestMutation = useInviteGuest();
  const insets = useSafeAreaInsets();

  const eventId = useMemo(() => {
    const raw = Array.isArray(params.eventId)
      ? params.eventId[0]
      : params.eventId;
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  }, [params.eventId]);

  const { data: guestCategories = [], isLoading: isGuestCategoriesLoading } =
    useGetEventGuestCategories(eventId || null);

  const inviteWithFamily = useMemo(
    () => String(params.inviteWithFamily) === "true",
    [params.inviteWithFamily]
  );

  const familyGuestCount = useMemo(() => {
    const raw = Array.isArray(params.familyGuestCount)
      ? params.familyGuestCount[0]
      : params.familyGuestCount;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [params.familyGuestCount]);

  const dialCode = useMemo(() => {
    const raw = Array.isArray(params.dialCode)
      ? params.dialCode[0]
      : params.dialCode;
    return raw ? String(raw) : DEFAULT_COUNTRY.dialCode;
  }, [params.dialCode]);

  const initialContacts = useMemo<ContactItem[]>(() => {
    try {
      const raw = Array.isArray(params.contacts)
        ? params.contacts[0]
        : params.contacts;
      if (!raw) return [];
      const parsed = JSON.parse(String(raw)) as {
        id: string;
        name: string;
        phone: string;
      }[];
      return parsed.map((item) => ({
        ...(() => {
          const { code, local } = splitPhone(
            item.phone ?? "",
            dialCode || DEFAULT_COUNTRY.dialCode
          );
          return {
            id: item.id,
            name: item.name ?? "",
            phone: local,
            countryCode: code,
          };
        })(),
        category: "",
      }));
    } catch {
      return [];
    }
  }, [params.contacts, dialCode]);

  const [contacts, setContacts] = useState<ContactItem[]>(initialContacts);
  const [isInviting, setIsInviting] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    DEFAULT_COUNTRY
  );

  useEffect(() => {
    if (!guestCategories.length) return;
    setContacts((current) =>
      current.map((contact) =>
        contact.category
          ? contact
          : { ...contact, category: guestCategories[0].value }
      )
    );
  }, [guestCategories]);

  const updateContact = useCallback(
    (id: string, field: keyof ContactItem, value: string) => {
      setContacts((current) =>
        current.map((contact) =>
          contact.id === id ? { ...contact, [field]: value } : contact
        )
      );
    },
    []
  );

  const resolveCountryForCode = useCallback((code: string) => {
    const digits = code.replace(/\D/g, "");
    return COUNTRY_DATA.find((c) => c.dialCode === digits) ?? DEFAULT_COUNTRY;
  }, []);

  const openCountryPicker = useCallback(
    (contact: ContactItem) => {
      const digits = contact.countryCode.replace(/\D/g, "");
      const match = COUNTRY_DATA.find((c) => c.dialCode === digits);
      setSelectedCountry(match ?? DEFAULT_COUNTRY);
      setActiveContactId(contact.id);
      setPickerVisible(true);
    },
    []
  );

  const handleCountrySelect = useCallback(
    (country: CountryOption) => {
      if (activeContactId) {
        updateContact(activeContactId, "countryCode", country.dialCode);
      }
      setSelectedCountry(country);
      setPickerVisible(false);
      setActiveContactId(null);
    },
    [activeContactId, updateContact]
  );

  const handleInvite = useCallback(async () => {
    if (!eventId) {
      Alert.alert("Error", "Invalid event.");
      return;
    }

    if (!contacts.length) {
      Alert.alert("No contacts", "Please go back and select contacts first.");
      return;
    }

    setIsInviting(true);
    let successCount = 0;
    const failed: string[] = [];

    for (const contact of contacts) {
      try {
        const name = contact.name.trim();
        const phone = normalizeDigits(contact.phone);
        const countryCode = normalizeDigits(contact.countryCode);

        if (!name || !phone) {
          failed.push(contact.name || "Unknown");
          continue;
        }

        const finalPhone = buildPhone(countryCode, phone);

        await inviteGuestMutation.mutateAsync({
          eventId,
          payload: {
            invitation_name: name,
            phone: finalPhone,
            fullName: name,
            numberOfGuests: inviteWithFamily ? familyGuestCount : 1,
            isFamily: inviteWithFamily,
            isDraft: false,
            role: "Guest",
            category: contact.category || "Friend",
            status: "pending",
            isAccomodation: false,
          },
        });
        successCount++;
      } catch {
        failed.push(contact.name || "Unknown");
      }
    }

    setIsInviting(false);

    if (failed.length > 0) {
      Alert.alert(
        "Partial Success",
        `${successCount} invited. Failed: ${failed.join(", ")}`,
        [{ text: "OK", onPress: () => successCount > 0 && router.back() }]
      );
    } else {
      Alert.alert(
        "Success",
        `${successCount} guest${successCount > 1 ? "s" : ""} invited!`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
  }, [contacts, eventId, inviteGuestMutation, inviteWithFamily, router]);

  return (
    <SafeAreaView className="flex-1 bg-[#f6f5f7]" edges={["top", "bottom"]}>
      <CountryPickerModal
        visible={pickerVisible}
        selected={selectedCountry}
        onSelect={handleCountrySelect}
        onClose={() => {
          setPickerVisible(false);
          setActiveContactId(null);
        }}
      />

      <View className="flex-row items-center px-5 pt-4 pb-2">
        <Pressable onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="arrow-back" size={24} color="#1a1b3a" />
        </Pressable>
        <Text className="text-xl font-bold text-[#1a1b3a] flex-1">
          Review contacts
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-5" style={{ gap: 12 }}>
          {contacts.map((contact) => {
            const country = resolveCountryForCode(contact.countryCode);
            return (
              <View
                key={contact.id}
                className="rounded-md border border-slate-200 bg-white p-4"
              >
                <Text className="text-[11px] font-semibold text-slate-500">
                  NAME
                </Text>
                <TextInput
                  className="mt-1 h-14 rounded-md border border-slate-200 px-4 text-base text-slate-800"
                  value={contact.name}
                  onChangeText={(value) =>
                    updateContact(contact.id, "name", value)
                  }
                />

                <Text className="text-[11px] font-semibold text-slate-500 mt-3">
                  PHONE
                </Text>
                <View className="mt-1 h-14 w-full flex-row items-center overflow-hidden rounded-md border border-slate-200 bg-white">
                  <Pressable
                    onPress={() => openCountryPicker(contact)}
                    className="h-full flex-row items-center gap-1.5 border-r border-slate-200 px-3"
                  >
                    <Image
                      source={country.image}
                      style={{ width: 26, height: 18, borderRadius: 3 }}
                      resizeMode="cover"
                    />
                    <Text className="text-sm font-medium text-slate-800">
                      +{country.dialCode}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#94A3B8" />
                  </Pressable>
                  <TextInput
                    className="flex-1 px-4 text-base text-slate-900"
                    value={contact.phone}
                    onChangeText={(value) =>
                      updateContact(contact.id, "phone", value)
                    }
                    keyboardType="phone-pad"
                    placeholder="9812345678"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View className="mt-3" style={{ gap: 12 }}>
                  <Text className="text-[11px] font-semibold text-slate-500">
                    CATEGORY
                  </Text>
                  <Dropdown
                    style={{
                      height: 56,
                      borderWidth: 1,
                      borderColor: "#e2e8f0",
                      borderRadius: 6,
                      paddingHorizontal: 16,
                      backgroundColor: "#ffffff",
                    }}
                    placeholderStyle={{ color: "#94a3b8", fontSize: 14 }}
                    selectedTextStyle={{ color: "#1a1b3a", fontSize: 14 }}
                    data={guestCategories}
                    labelField="label"
                    valueField="value"
                    placeholder={
                      isGuestCategoriesLoading
                        ? "Loading categories..."
                        : guestCategories.length
                          ? "Select category"
                          : "No categories"
                    }
                    disable={
                      isGuestCategoriesLoading || !guestCategories.length
                    }
                    value={contact.category}
                    onChange={(item: { value: string }) =>
                      updateContact(contact.id, "category", item.value)
                    }
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View
        className="absolute left-5 right-5"
        style={{ bottom: Math.max(insets.bottom, 12) + 12 }}
      >
        <Pressable
          className={`h-14 rounded-md items-center justify-center flex-row ${
            contacts.length === 0 ? "bg-gray-200" : "bg-[#EE2B8C]"
          }`}
          onPress={handleInvite}
          disabled={isInviting || contacts.length === 0}
          style={
            contacts.length > 0
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
          {isInviting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="person-add-outline" size={20} color="#fff" />
              <Text className="ml-2 text-sm font-semibold text-white">
                Invite {contacts.length} contact{contacts.length > 1 ? "s" : ""}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
