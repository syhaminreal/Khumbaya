import {
  CountryOption,
  CountryPickerModal,
} from "@/src/components/ui/CountryPhone";
import { Text } from "@/src/components/ui/Text";
import { COUNTRY_DATA } from "@/src/constants/countrydata";
import { useGetEventGuestCategories, useInviteGuest } from "@/src/features/guests/api/use-guests";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type ExcelGuestItem = {
  id: string;
  guestName: string;
  countryCode: string;
  phoneNumber: string;
  isFamily: boolean;
  noOfGuests: number;
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

export default function ExcelReviewScreen() {
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

  const mapping = useMemo(() => {
    try {
      const raw = Array.isArray(params.mapping)
        ? params.mapping[0]
        : params.mapping;
      return raw ? JSON.parse(String(raw)) : {};
    } catch {
      return {};
    }
  }, [params.mapping]);

  const rows = useMemo(() => {
    try {
      const raw = Array.isArray(params.rows) ? params.rows[0] : params.rows;
      return raw ? JSON.parse(String(raw)) : [];
    } catch {
      return [];
    }
  }, [params.rows]);

  const defaultCountryCode = useMemo(() => {
    const raw = Array.isArray(params.defaultCountryCode)
      ? params.defaultCountryCode[0]
      : params.defaultCountryCode;
    return raw ? String(raw) : DEFAULT_COUNTRY.dialCode;
  }, [params.defaultCountryCode]);

  const initialGuests = useMemo<ExcelGuestItem[]>(() => {
    if (!rows.length || !mapping.guestName) return [];

    return rows.map((row: Record<string, string>, index: number) => {
      const guestName = row[mapping.guestName] || "";
      const rawPhone = row[mapping.phoneNumber] || "";

      // Detect if this is a family from Excel data or default to false
      const isFamilyRaw = row[mapping.isFamily];
      const isFamily = isFamilyRaw
        ? ["yes", "true", "1", "family", "y"].includes(String(isFamilyRaw).toLowerCase().trim())
        : false;

      // Get number of guests from Excel or default to 1
      const noOfGuestsRaw = row[mapping.noOfGuests];
      const noOfGuests = noOfGuestsRaw
        ? parseInt(String(noOfGuestsRaw).replace(/\D/g, ""), 10) || 1
        : 1;

      // Parse phone number
      let phoneValue = rawPhone;
      let countryCode = defaultCountryCode;

      // Check if phone already has country code
      if (mapping.countryCode && row[mapping.countryCode]) {
        countryCode = String(row[mapping.countryCode]).replace(/\D/g, "");
      }

      const { code, local } = splitPhone(phoneValue, countryCode);

      return {
        id: `guest-${index}-${Date.now()}`,
        guestName,
        countryCode: code,
        phoneNumber: local,
        isFamily,
        noOfGuests: Math.max(1, noOfGuests),
      };
    }).filter((g: ExcelGuestItem) => g.guestName.trim() || g.phoneNumber.trim());
  }, [rows, mapping, defaultCountryCode]);

  const [guests, setGuests] = useState<ExcelGuestItem[]>(initialGuests);
  const [isInviting, setIsInviting] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeGuestId, setActiveGuestId] = useState<string | null>(null);
  const {data:category}  = useGetEventGuestCategories(eventId)
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    DEFAULT_COUNTRY
  );

  const updateGuest = useCallback(
    (id: string, field: keyof ExcelGuestItem, value: string | boolean | number) => {
      setGuests((current) =>
        current.map((guest) =>
          guest.id === id ? { ...guest, [field]: value } : guest
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
    (guest: ExcelGuestItem) => {
      const digits = guest.countryCode.replace(/\D/g, "");
      const match = COUNTRY_DATA.find((c) => c.dialCode === digits);
      setSelectedCountry(match ?? DEFAULT_COUNTRY);
      setActiveGuestId(guest.id);
      setPickerVisible(true);
    },
    []
  );

  const handleCountrySelect = useCallback(
    (country: CountryOption) => {
      if (activeGuestId) {
        updateGuest(activeGuestId, "countryCode", country.dialCode);
      }
      setSelectedCountry(country);
      setPickerVisible(false);
      setActiveGuestId(null);
    },
    [activeGuestId, updateGuest]
  );

  const handleInvite = useCallback(async () => {
    if (!eventId) {
      Alert.alert("Error", "Invalid event.");
      return;
    }

    if (!guests.length) {
      Alert.alert("No guests", "Please go back and import guests first.");
      return;
    }

    setIsInviting(true);
    let successCount = 0;
    const failed: string[] = [];

    for (const guest of guests) {
      try {
        const name = guest.guestName.trim();
        const phone = normalizeDigits(guest.phoneNumber);
        const countryCode = normalizeDigits(guest.countryCode);

        if (!name || !phone) {
          failed.push(guest.guestName || "Unknown");
          continue;
        }

        const finalPhone = buildPhone(countryCode, phone);

        await inviteGuestMutation.mutateAsync({
          eventId,
          payload: {
            invitation_name: name,
            phone: finalPhone,
            fullName: name,
            isFamily: guest.isFamily,
            isDraft: false,
            category:category?.[0].value || "Friend",
            role: "guest",
            status: "pending",
            isAccomodation: false,
            numberOfGuests: guest.isFamily ? guest.noOfGuests : 1,
          },
        });
        successCount++;
      } catch {
        failed.push(guest.guestName || "Unknown");
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
  }, [guests, eventId, inviteGuestMutation, router]);

  const totalGuests = useMemo(() => {
    return guests.reduce((total, guest) => {
      return total + (guest.isFamily ? guest.noOfGuests : 1);
    }, 0);
  }, [guests]);

  return (
    <SafeAreaView className="flex-1 bg-[#f6f5f7]" edges={["top", "bottom"]}
    >
      <CountryPickerModal
        visible={pickerVisible}
        selected={selectedCountry}
        onSelect={handleCountrySelect}
        onClose={() => {
          setPickerVisible(false);
          setActiveGuestId(null);
        }}
      />

      <View className="flex-row items-center px-5 pt-4 pb-2">
        <Pressable onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="arrow-back" size={24} color="#1a1b3a" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xl font-bold text-[#1a1b3a]">
            Review {guests.length} Guest{guests.length !== 1 ? "s" : ""}
          </Text>
          <Text className="text-xs text-slate-500">
            {totalGuests} total attendee{totalGuests !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <View className="px-5" style={{ gap: 16 }}>
          {guests.map((guest) => {
            const country = resolveCountryForCode(guest.countryCode);
            return (
              <View
                key={guest.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                {/* Guest Name */}
                <Text className="text-[11px] font-semibold text-slate-500">
                  GUEST NAME <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="mt-1 h-12 rounded-lg border border-slate-200 px-4 text-base text-slate-800"
                  value={guest.guestName}
                  onChangeText={(value) =>
                    updateGuest(guest.id, "guestName", value)
                  }
                  placeholder="Enter guest name"
                  placeholderTextColor="#94a3b8"
                />

                {/* Phone Number */}
                <Text className="text-[11px] font-semibold text-slate-500 mt-3">
                  PHONE NUMBER <Text className="text-red-500">*</Text>
                  <Text className="text-slate-400 font-normal"> (format: +977-9876543210)</Text>
                </Text>
                <View className="mt-1 h-12 w-full flex-row items-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <Pressable
                    onPress={() => openCountryPicker(guest)}
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
                    value={guest.phoneNumber}
                    onChangeText={(value) =>
                      updateGuest(guest.id, "phoneNumber", value)
                    }
                    keyboardType="phone-pad"
                    placeholder="9876543210"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                {/* Is Family Toggle */}
                <View className="mt-4 flex-row items-center justify-between">
                  <View>
                    <Text className="text-sm font-semibold text-[#1a1b3a]">
                      Is this a family/group?
                    </Text>
                    <Text className="text-xs text-slate-500">
                      Enable if inviting multiple people together
                    </Text>
                  </View>
                  <Switch
                    value={guest.isFamily}
                    onValueChange={(value) =>
                      updateGuest(guest.id, "isFamily", value)
                    }
                    trackColor={{ false: "#e2e8f0", true: "rgba(238,43,140,0.3)" }}
                    thumbColor={guest.isFamily ? "#EE2B8C" : "#f4f4f5"}
                  />
                </View>

                {/* Number of Guests - Only show if isFamily is true */}
                {guest.isFamily && (
                  <View className="mt-3">
                    <Text className="text-[11px] font-semibold text-slate-500">
                      NUMBER OF GUESTS
                      <Text className="text-slate-400 font-normal"> (default: 1)</Text>
                    </Text>
                    <View className="mt-1 flex-row items-center gap-3">
                      <Pressable
                        onPress={() =>
                          updateGuest(
                            guest.id,
                            "noOfGuests",
                            Math.max(1, guest.noOfGuests - 1)
                          )
                        }
                        className="h-10 w-10 items-center justify-center rounded-lg bg-slate-100"
                      >
                        <Ionicons name="remove" size={20} color="#1a1b3a" />
                      </Pressable>
                      <TextInput
                        className="h-12 w-20 rounded-lg border border-slate-200 px-4 text-center text-base text-slate-800"
                        value={String(guest.noOfGuests)}
                        onChangeText={(value) => {
                          const num = parseInt(value.replace(/\D/g, ""), 10);
                          updateGuest(guest.id, "noOfGuests", isNaN(num) ? 1 : Math.max(1, num));
                        }}
                        keyboardType="number-pad"
                      />
                      <Pressable
                        onPress={() =>
                          updateGuest(guest.id, "noOfGuests", guest.noOfGuests + 1)
                        }
                        className="h-10 w-10 items-center justify-center rounded-lg bg-slate-100"
                      >
                        <Ionicons name="add" size={20} color="#1a1b3a" />
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Invite Button */}
      <View
        className="absolute left-5 right-5"
        style={{ bottom: Math.max(insets.bottom, 12) + 12 }}
      >
        <Pressable
          className={`h-14 rounded-2xl items-center justify-center flex-row ${
            guests.length === 0 ? "bg-gray-200" : "bg-[#EE2B8C]"
          }`}
          onPress={handleInvite}
          disabled={isInviting || guests.length === 0}
          style={
            guests.length > 0
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
              <Ionicons name="people-outline" size={20} color="#fff" />
              <Text className="ml-2 text-sm font-semibold text-white">
                Invite {guests.length} group{guests.length !== 1 ? "s" : ""}
                {totalGuests !== guests.length && ` (${totalGuests} guests)`}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
