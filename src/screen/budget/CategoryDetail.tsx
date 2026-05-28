import { InfoIcon } from "@/src/components/ui/InfoIcon";
import { Text } from "@/src/components/ui/Text";
import {
    useCategoryDetails,
    useDeleteCategoryMutation,
} from "@/src/features/budget/hooks/use-budget";
import { useSubEventsOfEvent } from "@/src/features/events/hooks/use-event";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    TouchableOpacity,
    View,
} from "react-native";

interface Expense {
  id: number;
  categoryId: number;
  name: string;
  businessId: string | null;
  subEventid?: number | null;
  allocatedAmount: number;
  nextDueDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryDetailsData {
  id: number;
  name: string;
  eventId: number;
  allocatedBudget: number;
  allocated: number;
  spent: number;
  pending: number;
  remaining: number;
  createdAt: string;
  updatedAt: string;
  expenses: Expense[];
}

export default function CategoryDetailsScreen() {
  const router = useRouter();
  const { eventId, categoryId, navigationEventid } = useLocalSearchParams();
  const subEventid = eventId != navigationEventid ? navigationEventid : undefined;
  const { data, isLoading, isError } = useCategoryDetails(Number(categoryId));
  const { data: subEventDetail } = useSubEventsOfEvent(Number(eventId));
  const deleteMutation = useDeleteCategoryMutation(
    Number(categoryId || 0),
    Number(eventId || 0)
  );

  const [menuVisible, setMenuVisible] = useState(false);

  const handleAddExpensePress = () => {
    router.push({
      pathname: `/(protected)/(client-stack)/events/[eventId]/(organizer)/budget/[categoryId]/add-expense`,
      params: { eventId: eventId?.toString(), categoryId: (categoryId).toString(), subEventid: subEventid?.toString() },
    });
  };

  const handleEditCategory = () => {
    setMenuVisible(false);
    router.push({
      pathname: `./edit-budget-category`,
      params: {
        categoryId: categoryId,
      },
    });
  };

  const handleDeleteCategory = () => {
    setMenuVisible(false);
    Alert.alert(
      "Delete Category",
      "Are you sure you want to delete this category? This action cannot be undone.",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync();
              Alert.alert("Success", "Category deleted successfully!", [
                {
                  text: "OK",
                  onPress: () => {
                    router.back();
                  },
                },
              ]);
            } catch (error: any) {
              const errorMessage =
                error?.message ||
                "Failed to delete category. Please try again.";
              Alert.alert("Error", errorMessage);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#ee2b8c" />
      </View>
    );
  }

  const categoryData = data as CategoryDetailsData | undefined;

  if (isError || !categoryData) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text variant="body" style={{ color: "#6B7280" }}>
          Failed to load category details.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f8f6f7]">
      <Stack.Screen
        options={{
          headerTitle: `${categoryData.name}`,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              className="pr-4"
              activeOpacity={0.7}
            >
              <MaterialIcons name="more-vert" size={24} color="#181114" />
            </TouchableOpacity>
          ),
        }}
      />
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable className="flex-1 bg-black/50" onPress={() => setMenuVisible(false)}>
          <View className="absolute bottom-0 bg-white shadow-lg w-full pb-4">
            <TouchableOpacity
              onPress={handleEditCategory}
              className="flex-row items-center gap-3 px-5 py-4 border-b border-gray-100"
            >
              <MaterialIcons name="edit" size={20} color="#181114" />
              <Text className="text-[#181114]" variant="h2">
                Edit Category
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteCategory}
              className="flex-row items-center gap-3 px-5 py-4"
            >
              <MaterialIcons name="delete" size={20} color="#ee2b8c" />
              <Text className="text-[#ee2b8c]" variant="h2">
                Delete Category
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <ScrollView className="flex-1" contentContainerClassName="pb-24" showsVerticalScrollIndicator={false}>
        <View className="mx-5 mt-5 bg-white rounded-md p-6 shadow-sm border border-gray-100 overflow-hidden">
          {/* Allocated Budget Header */}
          <View className="mb-6 py-3 border-b border-gray-100">
            <Text className="text-[10px] text-gray-400 mb-1 uppercase tracking-widest" variant="h2">
              Total Budget
            </Text>
            <Text className="text-2xl text-[#181114] font-bold" variant="h1">
              Rs. {categoryData.allocatedBudget.toLocaleString()}
            </Text>
          </View>

          {/* Stats Section */}
          <View className="flex-row gap-4 justify-between p-4 bg-[#f8f6f7] rounded-md">
            <View className="items-center flex-1">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Text className="text-[10px] text-gray-500 uppercase" variant="h2">
                  Spend
                </Text>
                <InfoIcon
                  title="Spend"
                  description="Total amount that has been paid out. This is the actual money spent from your allocated budget."
                  iconStyle="!text-gray-400"
                />
              </View>
              <Text className="text-sm text-[#ee2b8c] text-center" variant="h2" style={{ flexShrink: 1 }}>
                Rs. {categoryData.spent.toLocaleString()}
              </Text>
            </View>

            <View className="items-center flex-1">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Text className="text-[10px] text-gray-500 uppercase" variant="h2">
                  Remaining
                </Text>
                <InfoIcon
                  title="Remaining"
                  description="Amount remaining in this category that hasn't been spent or allocated."
                  iconStyle="!text-gray-400"
                />
              </View>
              <Text
                className={`text-sm text-center ${categoryData.remaining >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
                  }`}
                style={{ flexShrink: 1 }}
                variant="h2"
              >
                Rs. {categoryData.remaining.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center justify-between px-5 mt-8 mb-4">
          <Text className="text-lg text-[#181114]" variant="h2">
            Associated Expenses
          </Text>
        </View>

        {/* Expenses List */}
        {categoryData?.expenses && categoryData.expenses.length > 0 ? (
          <View className="px-5 gap-3">
            {categoryData.expenses.map((expense: Expense) => {
              const subEvent = (subEventDetail || []).find((s: any) => s.id === expense.subEventid);
              return (
                <TouchableOpacity
                  key={expense.id}
                  activeOpacity={0.7}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-row items-start gap-4"
                  onPress={() => {
                    router.push(`/(protected)/(client-stack)/events/${eventId}/(organizer)/budget/${categoryId}/${expense.id}`);
                  }}
                >
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="text-base text-[#181114] flex-1" variant="h2">
                        {expense.name}
                      </Text>
                    </View>
                    <View className="gap-1">
                      <View className="flex-row gap-2">
                        <Text className="text-xs text-gray-500" variant="h2">
                          Allocated:
                        </Text>
                        <Text className="text-xs text-[#181114]" variant="h2">
                          Rs. {expense.allocatedAmount.toLocaleString()}
                        </Text>
                      </View>
                      {expense.notes && (
                        <View className="flex-row gap-2">
                          <Text className="text-xs text-gray-500" variant="h2">
                            Notes:
                          </Text>
                          <Text className="text-xs text-[#181114] " variant="h2">
                            {expense.notes}
                          </Text>
                        </View>
                      )}
                      {subEvent && (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          className="mt-1 self-start bg-pink-50 px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border border-pink-200"
                         
                        >
                          <MaterialIcons name="local-activity" size={14} color="#ee2b8c" />
                          <Text className="text-xs text-[#ee2b8c] font-semibold" variant="h2">
                            {subEvent.title ?? subEvent.name ?? "Untitled sub-event"}
                          </Text>
                        </TouchableOpacity>
                      )}
                      <Text className="text-[10px] text-gray-400 mt-1" variant="h2">
                        Due {new Date(expense.nextDueDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#d1d5db" />
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View className="mx-5 bg-white rounded-2xl p-8 items-center gap-3">
            <MaterialIcons name="receipt-long" size={40} color="#d1d5db" />
            <Text className="text-gray-500 text-center" variant="h2">
              No expenses yet
            </Text>
            <Text className="text-xs text-gray-400 text-center" variant="h2">
              Add an expense to track spending in this category
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        className="absolute right-5 bottom-8 flex-row items-center gap-2 px-6 py-3 rounded-full bg-[#ee2b8c] shadow-lg active:opacity-80"
        activeOpacity={0.8}
        onPress={handleAddExpensePress}
      >
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text className="text-white text-xs  tracking-tight" variant="h2">
          Add Expense
        </Text>
      </TouchableOpacity>
    </View>
  );
}
