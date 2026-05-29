import { useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  useCreateGiftCategory,
  useGiftCategoriesByEvent,
  useUpdateGiftCategory,
} from "@/src/features/gifts/hooks/use-gifts";

interface CategoryFormData {
  name: string;
  description: string;
}

const AddGiftCategory = () => {
  const params = useLocalSearchParams();
  const eventId = Number(params.eventId?.toString() ?? 0);
  const categoryId = Number(params.categoryId?.toString() ?? 0);
  const isEditMode = categoryId > 0;
  const router = useRouter();

  const { data: categories = [], isLoading } =
    useGiftCategoriesByEvent(eventId);
  const category = categories.find((item) => item.id === categoryId);
  const createGiftCategoryMutation = useCreateGiftCategory();
  const updateGiftCategoryMutation = useUpdateGiftCategory();

  const { control, handleSubmit, setValue } = useForm<CategoryFormData>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!isEditMode || !category) {
      return;
    }

    setValue("name", category.name ?? "");
    setValue("description", category.description ?? "");
  }, [category, isEditMode, setValue]);

  const onSubmit = async (data: CategoryFormData) => {
    if (!data.name.trim()) {
      Alert.alert("Validation", "Category name is required.");
      return;
    }

    try {
      if (isEditMode) {
        await updateGiftCategoryMutation.mutateAsync({
          categoryId: String(categoryId),
          eventId: String(eventId),
          payload: {
            name: data.name.trim(),
            description: data.description.trim(),
          },
        });
      } else {
        await createGiftCategoryMutation.mutateAsync({
          eventId: String(eventId),
          payload: {
            name: data.name.trim(),
            description: data.description.trim(),
          },
        });
      }

      Alert.alert(
        "Success",
        `Gift category ${isEditMode ? "updated" : "created"} successfully.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message ||
          `Unable to ${isEditMode ? "update" : "create"} category.`
      );
    }
  };

  if (isEditMode && isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Loading category...</Text>
      </SafeAreaView>
    );
  }

  if (isEditMode && !category) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-4">
        <Text className="text-center text-gray-500">
          Gift category not found.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen
        options={{
          title: isEditMode ? "Edit Gift Category" : "Create Gift Category",
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
          <View className="mb-4">
            <Text className="text-base font-semibold mb-3">
              {isEditMode ? "Update category" : "Category details"}
            </Text>

            <Text className="text-sm text-gray-600 mb-2">Name</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Category name"
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"
                />
              )}
            />

            <Text className="text-sm text-gray-600 mt-4 mb-2">Description</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Category description"
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"
                />
              )}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            className="rounded-2xl bg-[#ee2b8c] px-5 py-4 items-center"
          >
            <Text className="text-white font-semibold">
              {isEditMode ? "Update Category" : "Save Category"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddGiftCategory;
