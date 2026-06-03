import { Text } from "@/src/components/ui/Text";
import { useGetBusinessById, useUpdateBusiness } from "@/src/features/business";
import { useBusinessDraftStore } from "@/src/features/business/store/useBusiness";
import { BusinessCategory } from "@/src/features/business/types";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { ScrollView as ScrollViewType } from "react-native";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CATEGORY_FIELDS,
  CATEGORY_OPTIONS,
  VENDOR_CATEGORIES,
  type FieldConfig,
  type FormState,
} from "./business-form-constants";

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function EditBusinessScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { businessId } = useLocalSearchParams<{ businessId: string }>();
  const { data: business, isLoading } = useGetBusinessById(businessId ?? "");
  const updateBusiness = useUpdateBusiness();
  const draftBusiness = useBusinessDraftStore((state) => state.business);
  const clearBusinessDraft = useBusinessDraftStore((state) => state.clearBusiness);
  const businessInfo = draftBusiness ?? business?.businessInformation ?? null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormState>({
    mode: "onChange",
    defaultValues: {
      businessName: "",
      description: "",
      city: "",
      country: "",
      vendorType: "",
      vendorCategoryId: "",
      categoryDetails: {},
      email: "",
      contactPhone: "",
      websiteUrl: "",
      whatsappNumber: "",
      contactPersonName: "",
    },
  });

  const form = watch();

  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const scrollRef = useRef<ScrollViewType>(null);

  useEffect(() => {
    return () => {
      clearBusinessDraft();
    };
  }, [clearBusinessDraft]);

  useEffect(() => {
    register("email", {
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Please enter a valid email address.",
      },
    });
  }, [register]);

  useEffect(() => {
    if (businessInfo && !initialized) {
      setValue("businessName", businessInfo.businessName ?? "");
      setValue("description", businessInfo.description ?? "");
      setValue("city", businessInfo.city ?? "");
      setValue("country", businessInfo.country ?? "");
      setValue("vendorCategoryId", businessInfo.category ?? "" as any);
      setValue("vendorType", "");
      setValue("categoryDetails", {});
      setValue("email", businessInfo.email ?? "");
      setValue("contactPhone", businessInfo.contactPhone ?? "");
      setValue("websiteUrl", businessInfo.websiteUrl ?? "");
      setValue("whatsappNumber", businessInfo.whatsappNumber ?? "");
      setValue("contactPersonName", businessInfo.contactPersonname ?? businessInfo.contactPersonName ?? "");
      setCoverImage(businessInfo.cover ?? null);
      setInitialized(true);
    }
  }, [businessInfo, initialized, setValue]);

  useEffect(() => {
    if (form.vendorCategoryId) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [form.vendorCategoryId]);

  const updateCategoryDetail = (key: string, value: string | boolean) =>
    setValue(
      "categoryDetails",
      { ...form.categoryDetails, [key]: value },
      { shouldDirty: true }
    );

  const onSubmitForm = async () => {
    if (!form?.businessName?.trim()) {
      Alert.alert("Required", "Please enter a business name.");
      return;
    }
    if (!form.vendorCategoryId) {
      Alert.alert("Required", "Please select a category.");
      return;
    }
    if (form.vendorCategoryId === BusinessCategory.Venue && !form.vendorType) {
      Alert.alert("Required", "Please select a venue type.");
      return;
    }

    updateBusiness.mutate(
      {
        id: businessId!,
        payload: {
          businessName: form.businessName.trim(),
          description: form.description.trim() || undefined,
          category: form.vendorCategoryId || undefined,
          cover: coverImage ?? undefined,
          city: form.city.trim() || undefined,
          country: form.country.trim() || undefined,
          email: form.email.trim() || undefined,
          contactPhone: form.contactPhone.trim() || undefined,
          websiteUrl: form.websiteUrl.trim() || undefined,
          whatsappNumber: form.whatsappNumber.trim() || undefined,
          contactPersonName: form.contactPersonName.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Business updated!", [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: () => {
          Alert.alert("Error", "Failed to update business. Please try again.");
        },
      }
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSubmit(onSubmitForm)}
          disabled={updateBusiness.isPending}
          style={{
            backgroundColor: "#ee2b8c",
            paddingHorizontal: 18,
            paddingVertical: 8,
            borderRadius: 50,
            marginRight: 12,
            opacity: updateBusiness.isPending ? 0.6 : 1,
          }}
        >
          <Text className="text-white font-bold text-[15px]">
            {updateBusiness.isPending ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleSubmit, onSubmitForm, updateBusiness.isPending]);

  const pickImage = async (
    setter: (uri: string) => void,
    aspect: [number, number]
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setter(result.assets[0].uri);
    }
  };

  // ─── Category-specific field renderer ───────────────────────────────────────

  const renderCategoryField = (field: FieldConfig) => {
    const value = form.categoryDetails[field.key];

    if (field.type === "toggle") {
      return (
        <View
          key={field.key}
          className="flex-row items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm"
        >
          <View className="flex-row items-center gap-3 flex-1 mr-4">
            {field.icon && (
              <MaterialIcons name={field.icon} size={18} color="#9ca3af" />
            )}
            <Text className="text-[#181114] font-medium text-[14px] flex-1">
              {field.label}
            </Text>
          </View>
          <Switch
            value={!!value}
            onValueChange={(val) => updateCategoryDetail(field.key, val)}
            trackColor={{ false: "#e5e7eb", true: "#ee2b8c" }}
            thumbColor="white"
          />
        </View>
      );
    }

    if (field.type === "dropdown") {
      const dropdownData = (field.options ?? []).map((o) => ({
        label: o,
        value: o,
      }));
      return (
        <View key={field.key}>
          <Text
            variant="h1"
            className="text-[11px] text-[#594048] uppercase tracking-widest ml-1 mb-1.5"
          >
            {field.label}
          </Text>
          <Dropdown
            style={{
              height: 50,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 12,
              paddingHorizontal: 16,
              backgroundColor: "white",
            }}
            placeholderStyle={{ color: "#d1d5db", fontSize: 15 }}
            selectedTextStyle={{
              color: "#181114",
              fontSize: 15,
              fontWeight: "600",
            }}
            data={dropdownData}
            labelField="label"
            valueField="value"
            placeholder={`Select ${field.label.toLowerCase()}`}
            value={(value as string) ?? null}
            onChange={(item) => updateCategoryDetail(field.key, item.value)}
            renderItem={(item, selected) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  backgroundColor: selected ? "#fdf2f8" : "white",
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: selected ? "#ee2b8c" : "#181114",
                    fontWeight: selected ? "600" : "400",
                  }}
                >
                  {item.label}
                </Text>
                {selected && (
                  <MaterialIcons
                    name="check-circle"
                    size={16}
                    color="#ee2b8c"
                  />
                )}
              </View>
            )}
          />
        </View>
      );
    }

    // text or number
    return (
      <View key={field.key}>
        <Text
          variant="h1"
          className="text-[11px] text-[#594048] uppercase tracking-widest ml-1 mb-1.5"
        >
          {field.label}
        </Text>
        <View className="flex-row items-center bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          {field.icon && (
            <MaterialIcons
              name={field.icon}
              size={18}
              color="#9ca3af"
              style={{ marginLeft: 14 }}
            />
          )}
          <TextInput
            className="flex-1 px-2.5 py-4 text-[#181114] font-semibold text-[15px]"
            placeholder={field.placeholder}
            placeholderTextColor="#d1d5db"
            keyboardType={field.type === "number" ? "numeric" : "default"}
            value={(value as string) ?? ""}
            onChangeText={(text) => updateCategoryDetail(field.key, text)}
          />
          {field.unit && (
            <Text className="text-gray-400 text-[13px] pr-4">{field.unit}</Text>
          )}
        </View>
      </View>
    );
  };

  // ─── Loading state ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#f8f6f7] items-center justify-center">
        <ActivityIndicator color="#ee2b8c" />
      </SafeAreaView>
    );
  }

  if (!businessInfo) {
    return (
      <SafeAreaView className="flex-1 bg-[#f8f6f7] items-center justify-center">
        <MaterialIcons name="storefront" size={48} color="#d1d5db" />
        <Text variant="h2" className="text-[#594048] mt-3 text-base">
          Business not found
        </Text>
      </SafeAreaView>
    );
  }

  // ─── JSX ──────────────────────────────────────────────────────────────────────

  const activeCategory = VENDOR_CATEGORIES.find(
    (c) => c.value === form.vendorCategoryId
  );
  const activeFields = form.vendorCategoryId
    ? CATEGORY_FIELDS[form.vendorCategoryId]
    : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      className="flex-1 bg-[#f8f6f7]"
    >
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cover Image */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => pickImage(setCoverImage, [16, 7])}
          className="w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-[#f0edee] mb-6"
          style={{ aspectRatio: 16 / 7 }}
        >
          {coverImage ? (
            <Image source={{ uri: coverImage }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="flex-1 items-center justify-center gap-2">
              <MaterialIcons name="add-a-photo" size={26} color="#9ca3af" />
              <Text className="text-[11px] text-gray-400 font-medium">Tap to upload cover photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Form fields */}
        <View className="gap-5">

          {/* ── Section: Basic Info ── */}
          <Text className="text-xs font-semibold text-[#ee2b8c] uppercase tracking-widest ml-1">Basic Info</Text>

          <View>
            <Text variant="h1" className="text-[11px] text-[#594048] uppercase tracking-widest ml-1 mb-1.5">Business Name <Text className="text-[#ee2b8c]">*</Text></Text>
            <TextInput
              className="w-full bg-white border border-gray-100 rounded-xl px-5 py-4 text-[#181114] font-semibold text-[15px]"
              placeholder="e.g. Velvet Atelier"
              placeholderTextColor="#d1d5db"
              value={form.businessName}
              onChangeText={(text) =>
                setValue("businessName", text, { shouldDirty: true })
              }
            />
          </View>

          <View>
            <Text variant="h1" className="text-[11px] text-[#594048] uppercase tracking-widest ml-1 mb-1.5">Description</Text>
            <TextInput
              className="w-full bg-white border border-gray-100 rounded-xl px-5 py-4 text-[#181114] text-[15px]"
              placeholder="Tell the world about your unique brand..."
              placeholderTextColor="#d1d5db"
              multiline
              textAlignVertical="top"
              style={{ minHeight: 100 }}
              value={form.description}
              onChangeText={(text) =>
                setValue("description", text, { shouldDirty: true })
              }
            />
          </View>

          {/* City + Country */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text variant="h1" className="text-[11px] text-[#594048] uppercase tracking-widest ml-1 mb-1.5">City</Text>
              <View className="flex-row items-center bg-white border border-gray-100 rounded-xl overflow-hidden">
                <MaterialIcons name="location-city" size={16} color="#9ca3af" style={{ marginLeft: 12 }} />
                <TextInput
                  className="flex-1 px-2.5 py-4 text-[#181114] font-semibold text-[15px]"
                  placeholder="Kathmandu"
                  placeholderTextColor="#d1d5db"
                  value={form.city}
                  onChangeText={(text) => setValue("city", text, { shouldDirty: true })}
                />
              </View>
            </View>
            <View className="flex-1">
              <Text variant="h1" className="text-[11px] text-[#594048] uppercase tracking-widest ml-1 mb-1.5">Country</Text>
              <View className="flex-row items-center bg-white border border-gray-100 rounded-xl overflow-hidden">
                <MaterialIcons name="public" size={16} color="#9ca3af" style={{ marginLeft: 12 }} />
                <TextInput
                  className="flex-1 px-2.5 py-4 text-[#181114] font-semibold text-[15px]"
                  placeholder="Nepal"
                  placeholderTextColor="#d1d5db"
                  value={form.country}
                  onChangeText={(text) => setValue("country", text, { shouldDirty: true })}
                />
              </View>
            </View>
          </View>

          {/* ── Section: Contact Details ── */}
          <View className="h-px bg-gray-100 my-1" />
          <Text className="text-xs font-semibold text-[#ee2b8c] uppercase tracking-widest ml-1">Contact Details</Text>

          {/* Grouped contact card */}
          <View className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {/* Contact Person */}
            <View className="flex-row items-center px-4 py-3.5 border-b border-gray-100">
              <MaterialIcons name="person-outline" size={18} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-3 text-[#181114] font-semibold text-[15px]"
                placeholder="Contact person name"
                placeholderTextColor="#d1d5db"
                value={form.contactPersonName}
                onChangeText={(text) => setValue("contactPersonName", text, { shouldDirty: true })}
              />
            </View>
            {/* Email */}
            <View className="flex-row items-center px-4 py-3.5">
              <MaterialIcons name="mail-outline" size={18} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-3 text-[#181114] font-semibold text-[15px]"
                placeholder="Email address"
                placeholderTextColor="#d1d5db"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(text) =>
                  setValue("email", text, { shouldDirty: true, shouldValidate: true })
                }
              />
            </View>
            {!!errors.email?.message && (
              <Text className="text-xs text-red-500 px-4 pb-2 -mt-1">
                {errors.email.message}
              </Text>
            )}
          </View>

          {/* Phone numbers + website */}
          <View className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {/* Primary phone */}
            <View className="flex-row items-center px-4 py-3.5 border-b border-gray-100">
              <MaterialIcons name="phone" size={18} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-3 text-[#181114] font-semibold text-[15px]"
                placeholder="Primary phone number"
                placeholderTextColor="#d1d5db"
                keyboardType="phone-pad"
                value={form.contactPhone}
                onChangeText={(text) => setValue("contactPhone", text, { shouldDirty: true })}
              />
            </View>
            {/* WhatsApp / mobile */}
            <View className="flex-row items-center px-4 py-3.5 border-b border-gray-100">
              <MaterialIcons name="chat" size={18} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-3 text-[#181114] font-semibold text-[15px]"
                placeholder="WhatsApp / additional mobile"
                placeholderTextColor="#d1d5db"
                keyboardType="phone-pad"
                value={form.whatsappNumber}
                onChangeText={(text) => setValue("whatsappNumber", text, { shouldDirty: true })}
              />
            </View>
            {/* Website */}
            <View className="flex-row items-center px-4 py-3.5">
              <MaterialIcons name="language" size={18} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-3 text-[#181114] font-semibold text-[15px]"
                placeholder="Website URL"
                placeholderTextColor="#d1d5db"
                keyboardType="url"
                autoCapitalize="none"
                value={form.websiteUrl}
                onChangeText={(text) => setValue("websiteUrl", text, { shouldDirty: true })}
              />
            </View>
          </View>

          {/* ── Section: Category ── */}
          <View className="h-px bg-gray-100 my-1" />
          <Text className="text-xs font-semibold text-[#ee2b8c] uppercase tracking-widest ml-1">Category</Text>

          <View>
            <Dropdown
              style={{
                height: 50,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 12,
                paddingHorizontal: 16,
                backgroundColor: "white",
              }}
              placeholderStyle={{ color: "#d1d5db", fontSize: 15 }}
              selectedTextStyle={{ color: "#181114", fontSize: 15, fontWeight: "600" }}
              data={CATEGORY_OPTIONS}
              labelField="label"
              valueField="value"
              placeholder="Select category"
              value={form.vendorCategoryId || null}
              onChange={(item) => {
                setValue("vendorCategoryId", item.value, { shouldDirty: true });
                setValue("vendorType", "", { shouldDirty: true });
                setValue("categoryDetails", {}, { shouldDirty: true });
              }}
              renderItem={(item, selected) => (
                <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: selected ? "#fdf2f8" : "white" }}>
                  <Text style={{ flex: 1, fontSize: 15, color: selected ? "#ee2b8c" : "#181114", fontWeight: selected ? "600" : "400" }}>
                    {item.label}
                  </Text>
                  {selected && <MaterialIcons name="check-circle" size={16} color="#ee2b8c" />}
                </View>
              )}
            />
          </View>

          {/* Sub-type — shown only if selected category has subtypes */}
          {activeCategory?.subtypes && activeCategory.subtypes.length > 0 && (
            <View>
              <Text variant="h1" className="text-[11px] text-[#594048] uppercase tracking-widest ml-1 mb-1.5">{activeCategory.name} Type <Text className="text-[#ee2b8c]">*</Text></Text>
              <Dropdown
                style={{
                  height: 50,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  backgroundColor: "white",
                }}
                placeholderStyle={{ color: "#d1d5db", fontSize: 15 }}
                selectedTextStyle={{ color: "#181114", fontSize: 15, fontWeight: "600" }}
                data={activeCategory.subtypes.map((s) => ({ label: s, value: s }))}
                labelField="label"
                valueField="value"
                placeholder={`Select type`}
                value={form.vendorType || null}
                onChange={(item) =>
                  setValue("vendorType", item.value, { shouldDirty: true })
                }
                renderItem={(item, selected) => (
                  <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: selected ? "#fdf2f8" : "white" }}>
                    <Text style={{ flex: 1, fontSize: 15, color: selected ? "#ee2b8c" : "#181114", fontWeight: selected ? "600" : "400" }}>
                      {item.label}
                    </Text>
                    {selected && <MaterialIcons name="check-circle" size={16} color="#ee2b8c" />}
                  </View>
                )}
              />
            </View>
          )}

          {/* Category-specific fields */}
          {activeFields && activeFields.length > 0 && (
            <View className="gap-6">
              {activeFields.map(renderCategoryField)}
            </View>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
