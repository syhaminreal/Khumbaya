import AvatarPicker from "@/src/components/ui/AvatarPicker";
import {
  CountryOption,
  CountryPickerModal,
} from "@/src/components/ui/CountryPhone";
import { COUNTRY_DATA } from "@/src/constants/countrydata";
import { useUpdateUserMe } from "@/src/features/user/api/use-user";
import { useAuthStore } from "@/src/store/AuthStore";
import { formatDate, parseDate } from "@/src/utils/helper";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FOOD_OPTIONS = [
  "Vegetarian",
  "Non-Veg",
  "Vegan",
  "No Preference",
] as const;

const BIO_MAX = 500;

const toDateInputValue = (value?: string | Date | null) => {
  if (!value) return "";
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  bio: string;
  foodPreference: string;
  location: string;
  country: string;
  city: string;
  address: string;
  zip: string;
  dob: string;
}

type FormErrors = Partial<Record<keyof ProfileForm, string>>;

export default function EditProfileScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [loading, setLoading] = useState(true);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    COUNTRY_DATA[0]
  );
  const [pickerVisible, setPickerVisible] = useState(false);

  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const fetchUserProfile = useAuthStore((state) => state.fetchUserProfile);
  const isProfileLoading = useAuthStore((state) => state.isProfileLoading);
  const updateUserMeMutation = useUpdateUserMe();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const [form, setForm] = useState<ProfileForm>({
    name: "",
    email: "",
    phone: "",
    bio: "",
    foodPreference: "",
    location: "",
    country: "",
    city: "",
    address: "",
    zip: "",
    dob: "",
  });

  const resolveCountryFromPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (!digits) return COUNTRY_DATA[0];
    const match = COUNTRY_DATA.filter((c) => digits.startsWith(c.dialCode)).sort(
      (a, b) => b.dialCode.length - a.dialCode.length
    )[0];
    return match ?? COUNTRY_DATA[0];
  };

  useEffect(() => {
    if (!isProfileLoading && user) {
      setForm({
        name: user.username || "",
        email: user.email.includes("@khumbaya.com") ? "" : user.email,
        phone: user.phone || "",
        bio: user.bio || "",
        foodPreference: user.foodPreference || "",
        location: user.location || "",
        country: user.country || "",
        city: user.city || "",
        address: user.address || "",
        zip: user.zip || "",
        dob: toDateInputValue(user.dob),
      });
      if (user.phone) {
        setSelectedCountry(resolveCountryFromPhone(user.phone));
      }
      setLoading(false);
    } else if (!isProfileLoading && !user) {
      setLoading(false);
    }
  }, [user, isProfileLoading]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  const set = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.email.trim()) e.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = "Enter a valid email address";
    setErrors(e);
    if (Object.keys(e).length > 0)
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaveState("saving");
    try {
      const payload = {
        username: form.name.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        bio: form.bio.trim() || undefined,
        foodPreference: form.foodPreference.trim() || undefined,
        location: form.location.trim() || undefined,
        country: form.country.trim() || undefined,
        city: form.city.trim() || undefined,
        address: form.address.trim() || undefined,
        zip: form.zip.trim() || undefined,
        dob: toDateInputValue(form.dob) || undefined,
        familyId: user?.familyId ?? undefined,
      };

      const updatedUser = await updateUserMeMutation.mutateAsync(payload);

      updateUser({
        ...(updatedUser ?? {}),
        username: updatedUser?.username ?? null,
        email: updatedUser?.email ?? null,
        phone: updatedUser?.phone ?? null,
        bio: updatedUser?.bio ?? null,
        foodPreference: updatedUser?.foodPreference ?? null,
        location: updatedUser?.location ?? null,
        country: updatedUser?.country ?? null,
        city: updatedUser?.city ?? null,
        address: updatedUser?.address ?? null,
        zip: updatedUser?.zip ?? null,
        dob: updatedUser?.dob ?? null,
      });

      setSaveState("saved");
      setTimeout(() => router.back(), 600);
    } catch (error) {
      setSaveState("idle");
      Alert.alert("Save Failed", "Please check your connection and try again.");
    }
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library."
      );
      return;
    }
  };

  const openDobPicker = () => {
    setShowDobPicker(true);
  };

  const onDobChange = (event: DateTimePickerEvent, pickedDate?: Date) => {
    if (event.type === "dismissed") {
      setShowDobPicker(false);
      return;
    }

    if (!pickedDate) return;

    set("dob", toDateInputValue(pickedDate));
    setShowDobPicker(false);
  };

  const phoneDigits = form.phone.replace(/\D/g, "");
  const localPhoneDigits = phoneDigits.startsWith(selectedCountry.dialCode)
    ? phoneDigits.slice(selectedCountry.dialCode.length)
    : phoneDigits;

  const handleSelectCountry = (country: CountryOption) => {
    setSelectedCountry(country);
    const matched = COUNTRY_DATA.filter((c) => phoneDigits.startsWith(c.dialCode)).sort(
      (a, b) => b.dialCode.length - a.dialCode.length
    )[0];
    const digitsWithoutCountry = matched
      ? phoneDigits.slice(matched.dialCode.length)
      : localPhoneDigits;
    const nextPhone =
      digitsWithoutCountry.length > 0
        ? `+${country.dialCode}-${digitsWithoutCountry}`
        : "";
    set("phone", nextPhone);
  };

  const isSaving = saveState === "saving";

  if (loading || isProfileLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f8f6f7]">
        <ActivityIndicator size="large" color="#ec4899" />
        <Text className="mt-3 text-base text-gray-500">
          {isProfileLoading
            ? "Fetching latest profile..."
            : "Loading profile..."}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f8f6f7]" edges={["bottom"]}>
      <CountryPickerModal
        visible={pickerVisible}
        selected={selectedCountry}
        onSelect={handleSelectCountry}
        onClose={() => setPickerVisible(false)}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 40,
          }}
        >
          {/* Avatar */}
          <AvatarPicker name={form.name} onPick={pickAvatar} />

          {/* Personal Details */}
          <View className="mt-5 mb-3">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Personal Details
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </Text>
            <TextInput
              className="bg-white rounded-md px-4 py-3.5 text-sm text-gray-900 border border-gray-200"
              placeholder="Enter your legal name"
              placeholderTextColor="#9CA3AF"
              value={form.name}
              onChangeText={(v) => set("name", v)}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Email Address <Text className="text-pink-500">*</Text>
            </Text>
            <TextInput
              className={`bg-white rounded-md px-4 py-3.5 text-sm text-gray-900 border ${errors.email ? "border-red-500" : "border-gray-200"}`}
              placeholder="name@example.com"
              placeholderTextColor="#9CA3AF"
              value={form.email}
              onChangeText={(v) => set("email", v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text className="text-xs text-red-500 mt-1">{errors.email}</Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </Text>
            {/* AI  */}
            <View className="h-14 flex-row items-center rounded-md border border-gray-200 bg-white overflow-hidden">
              <Pressable
                onPress={() => setPickerVisible(true)}
                className="h-full flex-row items-center gap-1.5 px-3 border-r border-gray-200"
              >
                <Image
                  source={selectedCountry.image}
                  style={{ width: 26, height: 18, borderRadius: 3 }}
                  resizeMode="cover"
                />
                <Text className="text-sm font-medium text-gray-800">
                  +{selectedCountry.dialCode}
                </Text>
              </Pressable>
              <TextInput
                className="flex-1 px-4 text-base text-gray-900"
                placeholder="98XXXXXXXX"
                placeholderTextColor="#9CA3AF"
                value={localPhoneDigits}
                onChangeText={(v) => {
                  const digits = v.replace(/\D/g, "");
                  const nextPhone =
                    digits.length > 0
                      ? `+${selectedCountry.dialCode}-${digits}`
                      : "";
                  set("phone", nextPhone);
                }}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Date of Birth */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Date of Birth
            </Text>
            <TouchableOpacity
              onPress={openDobPicker}
              className="bg-white rounded-md px-4 py-3.5 border border-gray-200"
              activeOpacity={0.8}
            >
              <Text className="text-sm text-gray-900">
                {form.dob ? formatDate(form.dob) : "Select your date of birth"}
              </Text>
            </TouchableOpacity>

            {showDobPicker && (
              <DateTimePicker
                value={form.dob ? parseDate(form.dob) : new Date()}
                mode="date"
                is24Hour={false}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDobChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Location Details */}
          <View className="mt-5 mb-3">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Location Details
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Location
            </Text>
            <TextInput
              className="bg-white rounded-md px-4 py-3.5 text-sm text-gray-900 border border-gray-200"
              placeholder="Enter your location"
              placeholderTextColor="#9CA3AF"
              value={form.location}
              onChangeText={(v) => set("location", v)}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Country
            </Text>
            <TextInput
              className="bg-white rounded-md px-4 py-3.5 text-sm text-gray-900 border border-gray-200"
              placeholder="Enter your country"
              placeholderTextColor="#9CA3AF"
              value={form.country}
              onChangeText={(v) => set("country", v)}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              City
            </Text>
            <TextInput
              className="bg-white rounded-md px-4 py-3.5 text-sm text-gray-900 border border-gray-200"
              placeholder="Enter your city"
              placeholderTextColor="#9CA3AF"
              value={form.city}
              onChangeText={(v) => set("city", v)}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Address
            </Text>
            <TextInput
              className="bg-white rounded-md px-4 py-3.5 text-sm text-gray-900 border border-gray-200"
              placeholder="Enter your address"
              placeholderTextColor="#9CA3AF"
              value={form.address}
              onChangeText={(v) => set("address", v)}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Zip Code
            </Text>
            <TextInput
              className="bg-white rounded-md px-4 py-3.5 text-sm text-gray-900 border border-gray-200"
              placeholder="Enter your zip code"
              placeholderTextColor="#9CA3AF"
              value={form.zip}
              onChangeText={(v) => set("zip", v)}
              keyboardType="numeric"
            />
          </View>

          {/* Stay Preferences */}
          <View className="mt-5 mb-3">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Stay Preferences
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Food Preference
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {FOOD_OPTIONS.map((opt) => {
                const active = form.foodPreference === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    // Use w-[31%] to roughly simulate grid-cols-3 with gap
                    className={`w-[31%] min-w-[80px] items-center justify-center px-2 py-1 h-10 rounded-full border ${active
                      ? "bg-pink-500 border-pink-500"
                      : "bg-white border-gray-200"
                      }`}
                    onPress={() => set("foodPreference", opt)}
                  >
                    <Text
                      className={`text-xs font-medium ${active ? "text-white" : "text-gray-500"}`}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* About You */}
          <View className="mt-5 mb-3">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              About You
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Bio
            </Text>
            <TextInput
              className="bg-white rounded-md px-4 py-3.5 text-sm text-gray-900 border border-gray-200 h-24"
              style={{ textAlignVertical: "top" }}
              placeholder="Tell others about yourself, your profession, your interests…"
              placeholderTextColor="#9CA3AF"
              value={form.bio}
              onChangeText={(v) => {
                if (v.length <= BIO_MAX) set("bio", v);
              }}
              multiline
              maxLength={BIO_MAX}
            />
            <Text className="text-xs text-right mt-1 text-gray-400">
              {form.bio.length}/{BIO_MAX}
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className="bg-pink-500 rounded-md py-4 flex-row items-center justify-center gap-2 mt-6 mb-4"
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            {isSaving ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-base font-bold text-white">Saving…</Text>
              </>
            ) : saveState === "saved" ? (
              <Text className="text-base font-bold text-white">Saved!</Text>
            ) : (
              <Text className="text-base font-bold text-white">
                Update Profile
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
