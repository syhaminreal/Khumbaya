import { Text } from "@/src/components/ui/Text";
import { WriteReviewModal } from "@/src/components/vendor/WriteReviewModal";
import { useReviews } from "@/src/features/review/hooks/use-review";
import { useAuthStore } from "@/src/store/AuthStore";
import { shadowStyle } from "@/src/utils/helper";
import { MaterialIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";

const FALLBACK_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDIWVyUn7mizRXt-pU0k_RKFdAfNF_d21mLZuL6fE-z88oUHVipXSGUhNmA5WfOISIeb5QApM1WV-MqiArQgJejxYGuerwubu6lcVkwkED06qEDLGBM7Xqz0ISW7b9rPn7S5ZW1hwAZxyVJLtwp0mkKKpGBUzYThC2D9AsRi-INlhoD8olL86wNyceuSQjvSCGLvlkuKEaRRpvGNa3ooDKEzBTa-g2eoD-4QuvwrSjC7f8_Nwv5Gm18EKFeYf5rKFnpg1QNMlLOq18";

interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatarUrl: string;
  rating: number;
  quote: string;
  date: string;
  userId: number | string;
  reviewId: number | string;
}

interface ReviewSectionProps {
  /** Numeric business ID used to fetch reviews */
  businessId: number;
  /** String form of the ID passed to the modal */
  resolvedId: string;
}

const normalizeText = (value?: string | null, fallback = ""): string =>
  value?.trim() || fallback;

const normalizeAvatarUrl = (...sources: Array<string | null | undefined>) =>
  sources
    .find((source) => typeof source === "string" && source.trim().length > 0)
    ?.trim() || FALLBACK_AVATAR;

const formatReviewDate = (createdAt?: string | null) => {
  if (!createdAt) {
    return "Unknown date";
  }

  const parsed = new Date(createdAt);
  return Number.isNaN(parsed.getTime())
    ? "Unknown date"
    : parsed.toLocaleDateString();
};

function ReviewCard({ review }: { review: Review }) {
  return (
    <View
      style={[
        {
          width: 300,
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: "#f3f4f6",
        },
        shadowStyle,
      ]}
    >
      <View className="flex-row items-center gap-3 mb-3">
        <Image
          source={{ uri: review.reviewerAvatarUrl }}
          className="h-10 w-10 rounded-full bg-gray-100"
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text className="text-sm font-semibold text-[#181114]">
            {review.reviewerName}
          </Text>
          <Text className="text-[10px] text-gray-400 mt-0.5">
            {review.date}
          </Text>
        </View>
        <View className="bg-amber-50 px-2 py-1 rounded-lg flex-row items-center gap-0.5">
          <MaterialIcons name="star" size={13} color="#f59e0b" />
          <Text className="text-xs font-bold text-amber-600">
            {review.rating}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-0.5 mb-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <MaterialIcons
            key={`${review.id}-star-${i}`}
            name="star"
            size={13}
            color={i < review.rating ? "#f59e0b" : "#e5e7eb"}
          />
        ))}
      </View>

      <Text
        className="text-sm text-gray-600 leading-5 italic"
        numberOfLines={4}
      >
        "{review.quote}"
      </Text>
    </View>
  );
}

function EmptyReviews() {
  return (
    <View className="items-center py-10 bg-gray-50 rounded-2xl">
      <View className="h-14 w-14 rounded-full bg-gray-100 items-center justify-center mb-3">
        <MaterialIcons name="rate-review" size={28} color="#d1d5db" />
      </View>
      <Text className="text-gray-500 font-semibold text-sm">
        No reviews yet
      </Text>
      <Text className="text-gray-400 text-xs mt-1">
        Be the first to share your experience
      </Text>
    </View>
  );
}

export function ReviewSection({ businessId, resolvedId }: ReviewSectionProps) {
  const { user } = useAuthStore();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<
    | { id: number | string; rating: number; description?: string | null }
    | undefined
  >(undefined);

  const { data: reviewData } = useReviews(
    Number.isNaN(businessId) ? undefined : { businessId, page: 1, limit: 10 }
  );

  const reviewItems = reviewData?.items ?? [];
  const currentUserId = user?.id !== undefined ? String(user.id) : "";

  const reviews = useMemo(
    () =>
      reviewItems.map((review) => {
        const isCurrentUser =
          review.userId !== undefined &&
          String(review.userId) === currentUserId;

        return {
          id: String(review.id),
          reviewerName:
            normalizeText(review.reviewerName) ||
            normalizeText(review.username) ||
            (isCurrentUser ? normalizeText(user?.username) : "") ||
            "Anonymous",
          reviewerAvatarUrl: normalizeAvatarUrl(
            review.reviewerAvatar,
            review.user?.photo,
            isCurrentUser ? user?.photo : undefined,
            review.businessAvatar
          ),
          rating: review.rating,
          quote: normalizeText(review.description),
          date: formatReviewDate(review.createdAt),
          userId: review.userId,
          reviewId: review.id,
        };
      }),
    [reviewItems, currentUserId, user?.photo, user?.username]
  );

  const userReview = useMemo(
    () =>
      user
        ? reviewItems.find(
            (review) =>
              review.userId !== undefined &&
              String(review.userId) === currentUserId
          )
        : undefined,
    [reviewItems, currentUserId, user]
  );

  const reviewCount = reviewData?.totalItems ?? reviews.length;
  const reviewButtonLabel = userReview ? "Edit Review" : "Write Review";

  const openReviewModal = () => {
    setReviewToEdit(
      userReview
        ? {
            id: userReview.id,
            rating: userReview.rating,
            description: userReview.description,
          }
        : undefined
    );
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setReviewToEdit(undefined);
  };

  return (
    <>
      <View className="mt-2 bg-white px-4 pt-5 pb-6">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-lg font-bold text-[#181114]">Reviews</Text>
            <Text className="text-xs text-gray-400">{reviewCount} total</Text>
          </View>

          {user && (
            <Pressable
              onPress={openReviewModal}
              className="flex-row items-center gap-1.5 bg-primary px-3 py-1.5 rounded-full"
              style={{
                elevation: 2,
                shadowColor: "#ee2b8c",
                shadowOpacity: 0.3,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
              }}
            >
              <MaterialIcons name="edit" size={12} color="#fff" />
              <Text className="text-white text-xs font-semibold">
                {reviewButtonLabel}
              </Text>
            </Pressable>
          )}
        </View>

        {reviews.length === 0 ? (
          <EmptyReviews />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
          >
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </ScrollView>
        )}
      </View>

      <WriteReviewModal
        visible={showReviewModal}
        onClose={closeReviewModal}
        businessId={resolvedId}
        initialReview={reviewToEdit}
      />
    </>
  );
}
