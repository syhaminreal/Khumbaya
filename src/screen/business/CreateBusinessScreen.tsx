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
        {/* Visual Assets */}
        <View className="mb-8 gap-5">
          {/* Cover Image */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => pickImage(setCoverImage, [16, 7])}
            className="w-full rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-[#f0edee]"
            style={{ aspectRatio: 16 / 7 }}
          >
            {coverImage ? (
              <Image
                source={{ uri: coverImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="flex-1 items-center justify-center gap-1">
                <MaterialIcons name="add-a-photo" size={28} color="#9ca3af" />
                <Text variant="h1" className="text-[10px] text-gray-400 uppercase tracking-widest">
                  Upload Cover
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Form fields */}
        <View className="gap-6">
          {/* Business Name */}
          <View>
            <Text variant="h1" className="text-[11px] text-[#594048] uppercase tracking-widest ml-1 mb-1.5">
              Business Name
            </Text>
            <TextInput
              className="w-full bg-white border border-gray-100 rounded-xl px-5 py-4 text-[#181114] font-semibold text-[15px] shadow-sm"
              placeholder="e.g. Velvet Atelier"
              placeholderTextColor="#d1d5db"
              value={form.businessName}
              onChangeText={(text) =>
                setValue("businessName", text, { shouldDirty: true })
              }
            />
          </View>

          {/* Description */}
          <View>
            <Text variant="h1" className="text-[11px] text-[#594048] uppercase tracking-widest ml-1 mb-1.5">
              Description
            </Text>
            <TextInput
              className="w-full bg-white border border-gray-100 rounded-xl px-5 py-4 text-[#181114] font-medium text-[15px] shadow-sm"
              placeholder="Tell the world about your unique brand..."
              placeholderTextColor="#d1d5db"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ minHeight: 110 }}
              value={form.description}
              onChangeText={(text) =>
                setValue("description", text, { shouldDirty: true })
              }
            />
          </View>

          {/* Email */}
          <View>
            <Text variant="h1" className="text-[11px] text-[#594048] uppercase tracking-widest ml-1 mb-1.5">
              Email(Optional)
            </Text>
            <View className="flex-row items-center bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <MaterialIcons name="email" size={18} color="#9ca3af" style={{ marginLeft: 14 }} />
              <TextInput
                className="flex-1 px-2.5 py-4 text-[#181114] font-semibold text-[15px]"
                placeholder="contact@example.com"
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
              <Text className="text-xs text-red-500 mt-2">
                {errors.email.message}
              </Text>
            )}
          </View>

          {/* Phone Number */}
          <View>
            <Text variant="h1" className="text-[11px] text-[#594048] uppercase tracking-widest ml-1 mb-1.5">
              Phone Number(Optional)
            </Text>
            <View className="flex-row items-center bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <MaterialIcons name="phone" size={18} color="#9ca3af" style={{ marginLeft: 14 }} />
              <TextInput
                className="flex-1 px-2.5 py-4 text-[#181114] font-semibold text-[15px]"
                placeholder="+977 98XXXXXXXX"
                placeholderTextColor="#d1d5db"
                keyboardType="phone-pad"
                value={form.contactPhone}
                onChangeText={(text) =>
                  setValue("contactPhone", text, { shouldDirty: true })
                }
              />
            </View>
          </View>

          {/* Category */}
          <View>
            <Text variant="h1" className="text-[11px] text-[#594048] uppercase tracking-widest ml-1 mb-1.5">
              Category
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
              <Text variant="h1" className="text-[11px] text-[#594048] uppercase tracking-widest ml-1 mb-1.5">
                {activeCategory.name} Type
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

          {/* Security-specific fields */}
          {activeFields && activeFields.length > 0 && (
            <View className="gap-6">
              {activeFields.map(renderCategoryField)}
            </View>
          )}

          {/* City + Country — at the bottom */}
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text variant="h1" className="text-[11px] text-[#594048] uppercase tracking-widest ml-1 mb-1.5">
                City
              </Text>
              <View className="flex-row items-center bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <MaterialIcons
                  name="location-city"
                  size={18}
                  color="#9ca3af"
                  style={{ marginLeft: 14 }}
                />
                <TextInput
                  className="flex-1 px-2.5 py-4 text-[#181114] font-semibold text-[15px]"
                  placeholder="Kathmandu"
                  placeholderTextColor="#d1d5db"
                  value={form.city}
                  onChangeText={(text) =>
                    setValue("city", text, { shouldDirty: true })
                  }
                />
              </View>
            </View>

            <View className="flex-1">
              <Text variant="h1" className="text-[11px] text-[#594048] uppercase tracking-widest ml-1 mb-1.5">
                Country
              </Text>
              <View className="flex-row items-center bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <MaterialIcons
                  name="public"
                  size={18}
                  color="#9ca3af"
                  style={{ marginLeft: 14 }}
                />
                <TextInput
                  className="flex-1 px-2.5 py-4 text-[#181114] font-semibold text-[15px]"
                  placeholder="Nepal"
                  placeholderTextColor="#d1d5db"
                  value={form.country}
                  onChangeText={(text) =>
                    setValue("country", text, { shouldDirty: true })
                  }
                />
              </View>
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
