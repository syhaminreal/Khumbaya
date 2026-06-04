import { Text } from "@/src/components/ui/Text";
import { photos } from "@/src/constants/gallery";
import { useCreateBusiness } from "@/src/features/business";
import { BusinessCategory } from "@/src/features/business/types";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { ScrollView as ScrollViewType } from "react-native";
import {
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
import {
  CATEGORY_FIELDS,
  CATEGORY_OPTIONS,
  VENDOR_CATEGORIES,
  type FieldConfig,
  type FormState,
} from "./business-form-constants";

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CreateBusinessScreen() {
  const router = useRouter();
  const createBusiness = useCreateBusiness();

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
  const scrollRef = useRef<ScrollViewType>(null);

  useEffect(() => {
    register("email", {
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Please enter a valid email address.",
      },
    });
  }, [register]);

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

    createBusiness.mutate(
      {
        businessName: form.businessName.trim(),
        description: form.description.trim() || undefined,
        category: form.vendorCategoryId,
        cover: coverImage ?? photos[Math.floor(((Math.random() * 1000) % 6) + 1)]?.url,
        city: form.city.trim() || undefined,
        country: form.country.trim() || undefined,
        categoryDetails: form.categoryDetails,
        email: form.email.trim() || undefined,
        contactPhone: form.contactPhone.trim() || undefined,
        websiteUrl: form.websiteUrl.trim() || undefined,
        whatsappNumber: form.whatsappNumber.trim() || undefined,
        contactPersonName: form.contactPersonName.trim() || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Business created!", [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: () => {
          Alert.alert("Error", "Failed to create business. Please try again.");
        },
      }
    );
  };

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
        {/* Page title */}
        <View className="mb-5">
          <Text className="text-2xl font-bold text-[#181114]">Create Business</Text>
          <Text className="text-sm text-gray-400 mt-1">Fill in your business details to get started</Text>
        </View>

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
              renderItem={(item) => (
                <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "white" }}>
                  <Text style={{ flex: 1, fontSize: 15, color: "#181114", fontWeight: "400" }}>
                    {item.label}
                  </Text>
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
                renderItem={(item) => (
                  <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "white" }}>
                    <Text style={{ flex: 1, fontSize: 15, color: "#181114", fontWeight: "400" }}>
                      {item.label}
                    </Text>
                  </View>
                )}
              />
            </View>
          )}

          {/* Security-specific fields */}
          {activeFields && activeFields.length > 0 && (
            <View className="gap-6">
              {activeFields.map(renderCategoryField)}
            </View>
          )}

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

        </View>

        {/* Submit — inside scroll so it's reachable at the end */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubmit(onSubmitForm)}
          disabled={createBusiness.isPending}
          className="w-full bg-[#ee2b8c] rounded-2xl py-5 flex-row items-center justify-center gap-3 mt-8"
          style={{
            shadowColor: "#ee2b8c",
            shadowOpacity: 0.25,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
            opacity: createBusiness.isPending ? 0.6 : 1,
          }}
        >
          <Text className="text-white font-extrabold text-[18px] tracking-tight">
            {createBusiness.isPending ? "Creating..." : "Create Business"}
          </Text>
          {!createBusiness.isPending && (
            <MaterialIcons name="arrow-forward" size={22} color="white" />
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
