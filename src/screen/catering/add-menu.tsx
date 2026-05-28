import { CreateMenuPayload, useCreateMenuMutation } from "@/src/features/catering/menu";
import { cn } from "@/src/utils/cn";
import { shadowStyle } from "@/src/utils/helper";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types & Constants ────────────────────────────────────────────────────────


const MENU_TYPE_OPTIONS = [
  { label: "Appetizer", value: "Appetizer" },
  { label: "Starter", value: "Starter" },
  { label: "Main Course", value: "Main Course" },
  { label: "Dessert", value: "Dessert" },
  { label: "Beverage", value: "Beverage" },
];

const MENU_TYPE_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  Appetizer: "restaurant",
  Starter: "local-dining",
  "Main Course": "dinner-dining",
  Dessert: "cake",
  Beverage: "local-drink",
};

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
        <Text className="text-xl font-extrabold text-[#181114] tracking-tight">
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
  } = useForm<CreateMenuPayload>({
    defaultValues: {
      name: "",
      description: "",
      type: "Vegetarian",
    },
  });

  const createMenuMutation = useCreateMenuMutation(cateringId);

  const onSubmit = async (data: CreateMenuPayload) => {
    try {
      await createMenuMutation.mutateAsync({

        name: data.name,
        description: data.description,
        type: data.type,
        guestCount: data.guestCount ? Number(data.guestCount) : undefined,
        note: data.note  ? data.note : undefined,
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
    <SafeAreaView className="flex-1 bg-[#f8f6f7]" edges={["bottom", "top"]}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ title: "Add Menu Item"  ,
      headerTitleStyle:{
        fontFamily:"PlusJakartaSans-Bold",
        fontSize:18 
      } , headerTitleAlign:"center" ,
       headerRight: () => (
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={createMenuMutation.isPending}
              activeOpacity={0.85}
              className="rounded-full !bg-primary px-4 py-2 items-center justify-center"
              style={{ ...shadowStyle, opacity: createMenuMutation.isPending ? 0.7 : 1 }}
            >
              {createMenuMutation.isPending ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-xs text-white font-semibold tracking-tight">
                  Add 
                </Text>
              )}
            </TouchableOpacity>
          )

      }} 
      
      />
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={120}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-4 pb-4">
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
                      value={value?.toString() ?? ""}
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

            <View className="mb-5">
              <Text className="mb-1 ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Menu note
              </Text>
              <Controller
                control={control}
                name="note"
                rules={{
                  maxLength: {
                    value: 255,
                    message: "MenuNote must be less than 255 characters",
                  },
                }}
                render={({ field: { value, onChange } }) => (
                  <>
                    <TextInput
                      placeholder="Menu note for the menu item "
                      placeholderTextColor="#9CA3AF"
                      className="rounded-md border border-gray-200 bg-white px-4 py-4 text-base text-[#181114]"
                      value={value}
                      onChangeText={onChange}
                      multiline
                      numberOfLines={3}
                      style={{ textAlignVertical: "top", minHeight: 96 }}
                    />
                    {errors.note && (
                      <Text className="mt-1 ml-1 text-xs text-red-500">
                        {errors.note.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>
                        <View className="mb-5">
              <Text className="mb-1 ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Guest Count
              </Text>
              <Controller
                control={control}
                name="guestCount"
                rules={{
                  maxLength: {
                    value: 255,
                    message: "Guest count must be less than 255 characters",
                  },
                }}
                render={({ field: { value, onChange } }) => (
                  <>
                    <TextInput
                    keyboardType="numeric"
                      placeholder="Guest count for the menu item "
                      placeholderTextColor="#9CA3AF"
                      className="rounded-md border border-gray-200 bg-white px-4 py-4 text-base text-[#181114]"
                      value={value?.toString() ?? ""}
                      onChangeText={onChange}
                      multiline
                      numberOfLines={3}
                    />
                    {errors.guestCount && (
                      <Text className="mt-1 ml-1 text-xs text-red-500">
                        {errors.guestCount.message}
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
            <View className="mb-5" style={{ zIndex: 20, elevation: 20 }}>
              <Text className="mb-1 ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Menu Category
              </Text>
              <Controller
                control={control}
                name="type"
                rules={{ required: "Menu category is required" }}
                render={({ field: { value, onChange } }) => (
                  <>
                  <Animated.View >
                    <Dropdown
                      style={{
                        height: 56,
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        borderRadius: 6,
                        paddingHorizontal: 16,
                        backgroundColor: "#ffffff",
                      }}
                      containerStyle={{
                        borderRadius: 12,
                        borderColor: "#e5e7eb",
                        maxHeight: 220,
                        zIndex: 999,
                        elevation: 12,
                      }}
                      data={MENU_TYPE_OPTIONS}
                      labelField="label"
                      valueField="value"
                      placeholder="Select menu category"
                      value={value}
                      dropdownPosition="top"
                      renderLeftIcon={() =>
                        value ? (
                          <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-pink-50"
                          >
                            <MaterialIcons
                              name={MENU_TYPE_ICONS[value] ?? "restaurant-menu"}
                              size={18}
                              color="#ee2b8c"
                            />
                          </View>
                        ) : null
                      }
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
                        <Animated.View className="flex-row items-center justify-between px-4 py-3" >
                          <View className="flex-row items-center gap-3">
                            <View className="h-8 w-8 items-center justify-center rounded-full bg-pink-50">
                              <MaterialIcons
                                name={MENU_TYPE_ICONS[item.value] ?? "restaurant-menu"}
                                size={18}
                                color="#ee2b8c"
                              />
                            </View>
                            <Text className="text-[15px] font-medium text-[#181114]">
                              {item.label}
                            </Text>
                          </View>
                          {value === item.value && (
                            <MaterialIcons
                              name="check"
                              size={18}
                              color="#ee2b8c"
                            />
                          )}
                        </Animated.View>
                      )}
                    />
                    </Animated.View>
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

          {/* Submit */}
          
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
