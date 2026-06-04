import { Text } from "@/src/components/ui/Text";
import { useReviews } from "@/src/features/review/hooks/use-review";
import { useAuthStore } from "@/src/store/AuthStore";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FALLBACK_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDIWVyUn7mizRXt-pU0k_RKFdAfNF_d21mLZuL6fE-z88oUHVipXSGUhNmA5WfOISIeb5QApM1WV-MqiArQgJejxYGuerwubu6lcVkwkED06qEDLGBM7Xqz0ISW7b9rPn7S5ZW1hwAZxyVJLtwp0mkKKpGBUzYThC2D9AsRi-INlhoD8olL86wNyceuSQjvSCGLvlkuKEaRRpvGNa3ooDKEzBTa-g2eoD-4QuvwrSjC7f8_Nwv5Gm18EKFeYf5rKFnpg1QNMlLOq18";

export default function BusinessReviewListScreen() {
  const { businessId } = useLocalSearchParams<{ businessId: string }>();
  const { user } = useAuthStore();
  const businessIdNumber = Number(businessId);

  const { data, isLoading, isError } = useReviews(
    Number.isNaN(businessIdNumber)
      ? undefined
      : { businessId: businessIdNumber, page: 1, limit: 20 }
  );

  const reviews =
    data?.items.map((review) => ({
      id: String(review.id),
      reviewerName:
        review.reviewerName?.trim() ||
        review.username?.trim() ||
        (review.userId === user?.id ? user.username?.trim() : "") ||
        "Anonymous",
      reviewerAvatarUrl:
        review.reviewerAvatar ??
        review.user?.photo ??
        (review.userId === user?.id ? user.photo : null) ??
        review.businessAvatar ??
        FALLBACK_AVATAR,
      rating: review.rating,
      quote: review.description ?? "",
      date: new Date(review.createdAt).toLocaleDateString(),
    })) ?? [];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#ee2b8c" />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <MaterialIcons name="error-outline" size={48} color="#f97316" />
        <Text className="text-base text-[#374151] mt-3 text-center">
          Unable to load reviews at the moment.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f8f6f7]">
      <View className="px-4 pt-4 pb-3 bg-white border-b border-gray-100">
        <Text variant="h1" className="text-lg text-[#181114]">
          Reviews
        </Text>
        <Text variant="caption" className="text-xs text-gray-500 mt-1">
          {data?.totalItems ?? 0} review{data?.totalItems === 1 ? "" : "s"}
        </Text>
      </View>

      {reviews.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="rate-review" size={64} color="#d1d5db" />
          <Text className="text-center text-gray-500 mt-4">
            No reviews have been submitted for this business yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          renderItem={({ item }) => (
            <View className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
              <View className="flex-row items-center gap-3 mb-3">
                <Image
                  source={{ uri: item.reviewerAvatarUrl || FALLBACK_AVATAR }}
                  className="w-11 h-11 rounded-full bg-gray-100"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <Text variant="h1" className="text-sm text-[#181114]">
                    {item.reviewerName}
                  </Text>
                  <Text variant="caption" className="text-[11px] text-gray-400">
                    {item.date}
                  </Text>
                </View>
                <View className="flex-row items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <MaterialIcons
                      key={index}
                      name="star"
                      size={14}
                      color={index < item.rating ? "#ee2b8c" : "#e5e7eb"}
                    />
                  ))}
                </View>
              </View>
              <Text className="text-sm text-[#374151] leading-6">
                {item.quote}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
