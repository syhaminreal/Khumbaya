import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useDeleteGift,
  useDeleteGiftCategory,
  useGiftCategoriesByEvent,
  useGiftsByEvent,
} from "@/src/features/gifts/hooks/use-gifts";

const giftRoutes = {
  add: "/(protected)/(client-stack)/events/[eventId]/(organizer)/gifts/add",
  addCategory:
    "/(protected)/(client-stack)/events/[eventId]/(organizer)/gifts/add-category",
  editGift:
    "/(protected)/(client-stack)/events/[eventId]/(organizer)/gifts/[giftId]",
  editCategory:
    "/(protected)/(client-stack)/events/[eventId]/(organizer)/gifts/categories/[categoryId]",
} as const;

const GiftDashboard = () => {
  const params = useLocalSearchParams();
  const eventId = Number(params.eventId?.toString() ?? 0);
  const router = useRouter();

  const categoriesQuery = useGiftCategoriesByEvent(eventId);
  const giftsQuery = useGiftsByEvent(eventId);

  const deleteCategoryMutation = useDeleteGiftCategory();
  const deleteGiftMutation = useDeleteGift();

  const categories = categoriesQuery.data ?? [];
  const gifts = giftsQuery.data ?? [];
  const isLoading = categoriesQuery.isLoading || giftsQuery.isLoading;
  const getCategoryName = (
    categoryId: number | null,
    category?: string | null
  ) => {
    if (category?.trim()) {
      return category;
    }

    return (
      categories.find((item) => item.id === categoryId)?.name ?? "Uncategorized"
    );
  };

  const handleDeleteCategory = (categoryId: number) => {
    Alert.alert(
      "Delete category",
      "This will remove the gift category permanently.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteCategoryMutation.mutate({
              categoryId,
              eventId: String(eventId),
            });
          },
        },
      ]
    );
  };

  const handleDeleteGift = (giftId: number) => {
    Alert.alert("Delete gift", "This will remove the gift from the event.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteGiftMutation.mutate({
            giftId,
            eventId: String(eventId),
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ title: "Gifts" }} />

      <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row flex-wrap gap-3">
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: giftRoutes.addCategory,
                params: { eventId: String(eventId) },
              })
            }
            className="flex-1 rounded-2xl border border-pink-200 bg-pink-50 px-4 py-4"
          >
            <Text className="text-sm font-semibold text-pink-700">
              New Category
            </Text>
            <Text className="text-xs text-pink-500 mt-1">
              Create a gift category
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: giftRoutes.add,
                params: { eventId: String(eventId) },
              })
            }
            className="flex-1 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-4"
          >
            <Text className="text-sm font-semibold text-indigo-700">
              Add Gift
            </Text>
            <Text className="text-xs text-indigo-500 mt-1">
              Create a regular gift
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: giftRoutes.add,
                params: { eventId: String(eventId), mode: "send" },
              })
            }
            className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4"
          >
            <Text className="text-sm font-semibold text-emerald-700">
              Send Gift
            </Text>
            <Text className="text-xs text-emerald-500 mt-1">
              Send a gift item to a guest
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold mb-3">Gift categories</Text>
          {isLoading ? (
            <Text className="text-sm text-gray-500">Loading categories…</Text>
          ) : categories.length === 0 ? (
            <Text className="text-sm text-gray-500">
              No categories found. Add one to organize gifts.
            </Text>
          ) : (
            categories.map((category) => (
              <View
                key={category.id}
                className="mb-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="font-semibold text-gray-900">
                      {category.name}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      {category.description ?? "No description"}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: giftRoutes.editCategory,
                          params: {
                            eventId: String(eventId),
                            categoryId: String(category.id),
                          },
                        })
                      }
                      className="rounded-full bg-slate-100 px-3 py-2"
                    >
                      <Ionicons
                        name="create-outline"
                        size={16}
                        color="#0f172a"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteCategory(category.id)}
                      className="rounded-full bg-red-100 px-3 py-2"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#b91c1c"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View>
          <Text className="text-lg font-bold mb-3">Gifts</Text>
          {isLoading ? (
            <Text className="text-sm text-gray-500">Loading gifts…</Text>
          ) : gifts.length === 0 ? (
            <Text className="text-sm text-gray-500">
              No gifts added for this event yet.
            </Text>
          ) : (
            gifts.map((gift) => (
              <View
                key={gift.id}
                className="mb-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="font-semibold text-gray-900">
                      {gift.title}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      Category:{" "}
                      {getCategoryName(gift.categoryId, gift.category)}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      Price:{" "}
                      {gift.price != null
                        ? `${gift.price} ${gift.currency ?? "NPR"}`
                        : "Not set"}
                    </Text>
                    {gift.recipientName ? (
                      <Text className="text-sm text-gray-500 mt-1">
                        Recipient: {gift.recipientName}
                      </Text>
                    ) : null}
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: giftRoutes.editGift,
                          params: {
                            eventId: String(eventId),
                            giftId: String(gift.id),
                          },
                        })
                      }
                      className="rounded-full bg-slate-100 px-3 py-2"
                    >
                      <Ionicons
                        name="create-outline"
                        size={16}
                        color="#0f172a"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteGift(gift.id)}
                      className="rounded-full bg-red-100 px-3 py-2"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#b91c1c"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GiftDashboard;
