import { Text } from "@/src/components/ui/Text";
import {
  useBudgetCategoryMutation,
  useCategoryDetails,
  useUpdateCategoryMutation,
} from "@/src/features/budget/hooks/use-budget";
import { budgetCategoryFormSchema } from "@/src/features/budget/schema";
import { useCategory } from "@/src/features/general-category/use-category";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

export default function AddBudgetItemScreen({
  editMode = false,
}: {
  editMode?: boolean;
}) {
  const router = useRouter();
  const { eventId, categoryId } = useLocalSearchParams();

  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useCategory("budget");
  const categories = categoriesResponse?.data || [];

  const { data: categoryData, isLoading: isCategoryLoading } =
    useCategoryDetails(Number(categoryId || 0), {
      enabled: editMode && !!categoryId,
    });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(budgetCategoryFormSchema),
    defaultValues: {
      name: "",
      allocatedBudget: "",
    },
  });

  // Pre-fill form with fetched category data in edit mode
  useEffect(() => {
    if (editMode && categoryData) {
      setValue("name", categoryData.name);
      setValue("allocatedBudget", categoryData.allocatedBudget.toString());
    }
  }, [editMode, categoryData, setValue]);

  const addMutation = useBudgetCategoryMutation(Number(eventId || 0));
  const updateMutation = useUpdateCategoryMutation(
    Number(categoryId || 0),
    Number(eventId || 0)
  );

  const mutation = editMode ? updateMutation : addMutation;

  // Show loading state while fetching category data in edit mode
  if (editMode && isCategoryLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#ee2b8c" />
      </View>
    );
  }

  const onSubmit = async (data: any) => {
    //check if there is the sub event in the data using the react hook 
    if (!eventId) {
      Alert.alert("Error", "Event ID is missing");
      return;
    }

    if (editMode && !categoryId) {
      Alert.alert("Error", "Category ID is missing");
      return;
    }

    try {
      await mutation.mutateAsync({
        name: data.name,
        allocatedBudget: parseFloat(data.allocatedBudget),
      });

      Alert.alert(
        "Success",
        editMode
          ? "Budget category updated successfully!"
          : "Budget category created successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        (editMode
          ? "Failed to update budget category. Please try again."
          : "Failed to create budget category. Please try again.");
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View className="flex-1 bg-[#f8f6f7]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-5"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm text-gray-700 mb-2" variant="h2">
          Category
        </Text>
        <View className="bg-white rounded-md shadow-sm border border-gray-100 mb-6">
          {isCategoriesLoading ? (
            <View className="h-14 items-center justify-center">
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#ee2b8c" />
                <Text className="text-sm text-gray-600">
                  Loading categories...
                </Text>
              </View>
            </View>
          ) : (
            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange } }) => (
                <Dropdown
                  style={{
                    height: 50,
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    backgroundColor: "white",
                  }}
                  placeholderStyle={{ color: "#9CA3AF" }}
                  selectedTextStyle={{ color: "#111827", fontSize: 14 }}
                  data={categories.map((cat: any) => ({ // 
                    label: cat.name,
                    value: cat.name,
                  }))}
                  labelField="label"
                  valueField="value"
                  placeholder="Select a category"
                  value={value}
                  onChange={(item: any) => onChange(item.value)}
                />
              )}
            />
          )}
        </View>
        {errors.name && (
          <Text className="text-red-500 text-xs mb-4">
            {errors.name.message}
          </Text>
        )}
        {/*
          Adding the sub event list in this also 
        */}
        <Text className="text-sm  text-gray-700 mb-2" variant="h2">
          Select Sub event
        </Text>

        <View className="bg-white rounded-sm px-4 h-14 shadow-sm border border-gray-100 mb-6">
          <Controller
            control={control}
            name="subEventId"
            render={({ field: { value, onChange } }) => (
              <TextInput
                className="flex-1 text-sm font-medium text-[#181114]"
                placeholder="Sub EventId"
                placeholderTextColor="#9ca3af"
                value={value?.toString()}
                onChangeText={onChange}
                keyboardType="numeric"
              />
            )}
          />
        </View>

        <Text className="text-sm  text-gray-700 mb-2" variant="h2">
          Allocated Budget
        </Text>
        <View className="bg-white rounded-sm px-4 h-14 shadow-sm border border-gray-100 mb-6">
          <Controller
            control={control}
            name="allocatedBudget"
            render={({ field: { value, onChange } }) => (
              <TextInput
                className="flex-1 text-sm font-medium text-[#181114]"
                placeholder="Rs. 0"
                placeholderTextColor="#9ca3af"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
              />
            )}
          />
        </View>
        {errors.allocatedBudget && (
          <Text className="text-red-500 text-xs mb-4">
            {errors.allocatedBudget.message}
          </Text>
        )}

        <TouchableOpacity
          className="bg-[#ee2b8c] rounded-md h-14 items-center justify-center shadow-lg disabled:opacity-50"
          activeOpacity={0.8}
          disabled={mutation.isPending}
          onPress={handleSubmit(onSubmit)}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-base" variant="h2">
              {editMode ? "Save changes" : "Add Category"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
