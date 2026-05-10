import { useCreateMenuMutation } from "@/src/features/catering/menu";
import { cn } from "@/src/utils/cn";
import { shadowStyle } from "@/src/utils/helper";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types & Constants ────────────────────────────────────────────────────────

interface MenuFormData {
  name: string;
  description: string;
  type: string;
  menuType: string;
}

const MENU_TYPE_OPTIONS = [
  { label: "Starter", value: "Starter" },
  { label: "Main Course", value: "Main Course" },
  { label: "Dessert", value: "Dessert" },
  { label: "Beverage", value: "Beverage" },
  { label: "Appetizer", value: "Appetizer" },
];

const DISH_TYPE_OPTIONS = [
  { label: "Vegetarian", value: "Vegetarian" },
  { label: "Non-Vegetarian", value: "Non-Vegetarian" },
  { label: "Vegan", value: "Vegan" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const FormSection = ({
  title,
  subtitle,
  children,
  icon,
  iconColor = "#ee2b8c",
  iconBg = "bg-primary/10",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  iconBg?: string;
}) => (
  <View className="mb-3 mt-2">
    <View className="flex-row items-center mb-5 px-1">
      <View
        className={cn(
          "w-10 h-10 rounded-xl items-center justify-center mr-3",
          iconBg
        )}
      >
        <MaterialIcons name={icon} size={20} color={iconColor} />
      </View>
      <View>
        <Text className="text-lg font-bold text-[#181114] tracking-tight">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-xs font-medium text-gray-500">{subtitle}</Text>
        )}
      </View>
    </View>
    <View className="px-1">{children}</View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AddMenuScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cateringId = parseInt(params.cateringId as string, 10);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MenuFormData>({
    defaultValues: {
      name: "",
      description: "",
      type: "Vegetarian",
      menuType: "Main Course",
    },
  });

  const createMenuMutation = useCreateMenuMutation(cateringId);

  const onSubmit = async (data: MenuFormData) => {
    try {
      await createMenuMutation.mutateAsync({
        name: data.name,
        description: data.description,
        type: data.type ?? "Vegetarian",
        menuType: data.menuType,
      });

      Alert.alert("Success", "Menu item added successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add menu item";
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8f6f7]" edges={["bottom"]}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={120}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-4 py-4">
          {/* Dish Info */}
          <FormSection
            title="Dish Info"
            subtitle="Name and description"
            icon="restaurant-menu"
          >
            <View className="mb-5">
              <Text className="mb-1 ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Dish Name
              </Text>
              <Controller
                control={control}
                name="name"
                rules={{
                  required: "Dish name is required",
                  maxLength: {
                    value: 255,
                    message: "Name must be less than 255 characters",
                  },
                }}
                render={({ field: { value, onChange } }) => (
                  <>
                    <TextInput
                      placeholder="e.g., Paneer Tikka Masala"
                      placeholderTextColor="#9CA3AF"
                      className="h-14 rounded-md border border-gray-200 bg-white px-4 text-base text-[#181114]"
                      value={value}
                      onChangeText={onChange}
                    />
                    {errors.name && (
                      <Text className="mt-1 ml-1 text-xs text-red-500">
                        {errors.name.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>

            <View className="mb-5">
              <Text className="mb-1 ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Description
              </Text>
              <Controller
                control={control}
                name="description"
                rules={{
                  required: "Description is required",
                  maxLength: {
                    value: 255,
                    message: "Description must be less than 255 characters",
                  },
                }}
                render={({ field: { value, onChange } }) => (
                  <>
                    <TextInput
                      placeholder="Brief description of the dish"
                      placeholderTextColor="#9CA3AF"
                      className="rounded-md border border-gray-200 bg-white px-4 py-4 text-base text-[#181114]"
                      value={value}
                      onChangeText={onChange}
                      multiline
                      numberOfLines={3}
                      style={{ textAlignVertical: "top", minHeight: 96 }}
                    />
                    {errors.description && (
                      <Text className="mt-1 ml-1 text-xs text-red-500">
                        {errors.description.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>
          </FormSection>

          {/* Dish Type */}
          <FormSection
            title="Dish Type"
            subtitle="Dietary classification"
            icon="eco"
            iconColor="#046c00"
            iconBg="bg-tertiary-container"
          >
            <View className="mb-5">
              <Text className="mb-1 ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Dietary Type
              </Text>
              <Controller
                control={control}
                name="type"
                rules={{ required: "Dish type is required" }}
                render={({ field: { value, onChange } }) => (
                  <>
                    <Dropdown
                      style={{
                        height: 56,
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        borderRadius: 6,
                        paddingHorizontal: 16,
                        backgroundColor: "#ffffff",
                      }}
                      data={DISH_TYPE_OPTIONS}
                      labelField="label"
                      valueField="value"
                      placeholder="Select dietary type"
                      value={value}
                      onChange={(item) => onChange(item.value)}
                      selectedTextStyle={{
                        color: "#ee2b8c",
                        fontSize: 15,
                        fontWeight: "600",
                      }}
                      placeholderStyle={{ color: "#9CA3AF", fontSize: 15 }}
                      itemTextStyle={{ color: "#181114", fontSize: 15 }}
                      activeColor="#fdf2f8"
                      renderItem={(item) => (
                        <View className="flex-row items-center justify-between px-4 py-3">
                          <Text className="text-[15px] font-medium text-[#181114]">
                            {item.label}
                          </Text>
                          {value === item.value && (
                            <MaterialIcons
                              name="check"
                              size={18}
                              color="#ee2b8c"
                            />
                          )}
                        </View>
                      )}
                    />
                    {errors.type && (
                      <Text className="mt-1 ml-1 text-xs text-red-500">
                        {errors.type.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>
          </FormSection>

          {/* Category */}
          <FormSection
            title="Category"
            subtitle="Where this dish appears on the menu"
            icon="category"
            iconColor="#a23665"
            iconBg="bg-secondary-container/20"
          >
            <View className="mb-5">
              <Text className="mb-1 ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Menu Category
              </Text>
              <Controller
                control={control}
                name="menuType"
                rules={{ required: "Menu category is required" }}
                render={({ field: { value, onChange } }) => (
                  <>
                    <Dropdown
                      style={{
                        height: 56,
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        borderRadius: 6,
                        paddingHorizontal: 16,
                        backgroundColor: "#ffffff",
                      }}
                      data={MENU_TYPE_OPTIONS}
                      labelField="label"
                      valueField="value"
                      placeholder="Select menu category"
                      value={value}
                      onChange={(item) => onChange(item.value)}
                      selectedTextStyle={{
                        color: "#ee2b8c",
                        fontSize: 15,
                        fontWeight: "600",
                      }}
                      placeholderStyle={{ color: "#9CA3AF", fontSize: 15 }}
                      itemTextStyle={{ color: "#181114", fontSize: 15 }}
                      activeColor="#fdf2f8"
                      renderItem={(item) => (
                        <View className="flex-row items-center justify-between px-4 py-3">
                          <Text className="text-[15px] font-medium text-[#181114]">
                            {item.label}
                          </Text>
                          {value === item.value && (
                            <MaterialIcons
                              name="check"
                              size={18}
                              color="#ee2b8c"
                            />
                          )}
                        </View>
                      )}
                    />
                    {errors.menuType && (
                      <Text className="mt-1 ml-1 text-xs text-red-500">
                        {errors.menuType.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>
          </FormSection>

          {/* Submit */}
          <View className="mt-6 px-1">
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={createMenuMutation.isPending}
              activeOpacity={0.8}
              className="rounded-xl bg-primary py-4 items-center justify-center"
              style={shadowStyle}
            >
              {createMenuMutation.isPending ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white text-base font-black tracking-tight">
                  Add Menu Item
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
