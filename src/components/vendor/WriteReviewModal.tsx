import {
  useCreateReviewForBusiness,
  useUpdateReview,
} from "@/src/features/review/hooks/use-review";
import { useAuthStore } from "@/src/store/AuthStore";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../ui/Text";

interface WriteReviewModalProps {
  visible: boolean;
  onClose: () => void;
  businessId: string;
  initialReview?: {
    id: number | string;
    rating: number;
    description?: string | null;
  };
}

const { height: screenHeight } = Dimensions.get("window");
const DISMISS_THRESHOLD = 100;
const MAX_CHARS = 500;

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
const RATING_COLORS = [
  "",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#ee2b8c",
];

export function WriteReviewModal({
  visible,
  onClose,
  businessId,
  initialReview,
}: WriteReviewModalProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { mutateAsync: submitReview, isPending: isCreating } =
    useCreateReviewForBusiness();
  const { mutateAsync: updateReview, isPending: isUpdating } =
    useUpdateReview();

  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [quote, setQuote] = useState("");
  const [errors, setErrors] = useState<{ rating?: string; quote?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const starScale = useRef(
    [1, 2, 3, 4, 5].map(() => new Animated.Value(1))
  ).current;

  const animateStar = (index: number) => {
    Animated.sequence([
      Animated.timing(starScale[index], {
        toValue: 1.4,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(starScale[index], {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 5,
      }),
    ]).start();
  };

  const handleStarPress = (star: number) => {
    setRating(star);
    animateStar(star - 1);
    if (errors.rating) setErrors((e) => ({ ...e, rating: undefined }));
  };

  const handleClose = () => {
    setRating(0);
    setHoveredStar(0);
    setQuote("");
    setErrors({});
    setSubmitted(false);
    pan.setValue({ x: 0, y: 0 });
    opacity.setValue(1);
    onClose();
  };

  useEffect(() => {
    if (visible) {
      setRating(initialReview?.rating ?? 0);
      setQuote(initialReview?.description ?? "");
      setSubmitted(false);
    }
  }, [visible, initialReview]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_evt, gestureState) =>
        Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          Animated.event([null, { dy: pan.y }], { useNativeDriver: false })(
            evt,
            gestureState
          );
          opacity.setValue(
            Math.max(0, 1 - gestureState.dy / (screenHeight * 0.5))
          );
        }
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (gestureState.dy > DISMISS_THRESHOLD || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.parallel([
            Animated.spring(pan.y, {
              toValue: 0,
              useNativeDriver: false,
              tension: 65,
              friction: 11,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const validate = () => {
    const next: typeof errors = {};
    if (rating === 0) next.rating = "Please tap a star to rate";
    if (!quote.trim()) next.quote = "Please share your experience";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const isEditMode = Boolean(initialReview?.id);
  const saving = isCreating || isUpdating;

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (isEditMode && initialReview?.id) {
        await updateReview({
          id: initialReview.id,
          payload: {
            rating,
            description: quote.trim(),
          },
        });
      } else {
        await submitReview({
          businessId,
          payload: {
            rating,
            description: quote.trim(),
          },
        });
      }
      setSubmitted(true);
    } catch {
      Alert.alert(
        "Error",
        `Failed to ${isEditMode ? "update" : "submit"} review. Please try again.`
      );
    }
  };

  const activeStar = hoveredStar || rating;
  const charCount = quote.length;

  if (submitted) {
    return (
      <Modal visible={visible} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 items-center justify-center px-8">
          <View className="bg-white rounded-3xl p-8 items-center w-full">
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              <MaterialIcons name="favorite" size={36} color="#ee2b8c" />
            </View>
            <Text
              variant="h1"
              className="text-[#181114] text-2xl font-bold mb-2 text-center"
            >
              Thank You!
            </Text>
            <Text className="text-gray-500 text-sm text-center leading-6 mb-6">
              Your review helps future couples find the perfect vendor for their
              special day.
            </Text>
            <View className="flex-row gap-0.5 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <MaterialIcons
                  key={s}
                  name="star"
                  size={28}
                  color={s <= rating ? "#ee2b8c" : "#e5e7eb"}
                />
              ))}
            </View>
            <Pressable
              onPress={handleClose}
              className="w-full bg-primary rounded-xl py-4 items-center"
            >
              <Text variant="h1" className="text-white font-semibold text-base">
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <Animated.View style={[{ opacity }, { flex: 1 }]} className="bg-black/50">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end"
        >
          <Animated.View style={{ transform: [{ translateY: pan.y }] }}>
            <View className="bg-white rounded-t-3xl overflow-hidden">
              {/* Drag handle area */}
              <View
                className="items-center pt-3 pb-4 bg-white"
                {...panResponder.panHandlers}
              >
                <View className="h-1 w-10 bg-gray-200 rounded-full" />
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
              >
                {/* Header with reviewer identity */}
                <View className="flex-row items-center justify-between px-5 pb-5">
                  <View className="flex-row items-center gap-3">
                    {user?.photo ? (
                      <Image
                        source={{ uri: user.photo }}
                        className="w-10 h-10 rounded-full bg-gray-100"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                        <MaterialIcons
                          name="person"
                          size={22}
                          color="#ee2b8c"
                        />
                      </View>
                    )}
                    <View>
                      <Text
                        variant="h1"
                        className="text-[#181114] text-sm font-semibold"
                      >
                        {user?.username ?? "You"}
                      </Text>
                      <Text className="text-gray-400 text-xs">
                        Posting publicly
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={handleClose}
                    className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
                  >
                    <MaterialIcons name="close" size={18} color="#374151" />
                  </Pressable>
                </View>

                {/* Divider */}
                <View className="h-px bg-gray-100 mx-5 mb-6" />

                {/* Star rating */}
                <View className="items-center px-5 mb-7">
                  <Text
                    variant="h1"
                    className="text-[#181114] text-lg font-bold mb-1"
                  >
                    How was your experience?
                  </Text>
                  <Text className="text-gray-400 text-xs mb-5">
                    Tap a star to rate
                  </Text>

                  <View className="flex-row gap-3 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Pressable
                        key={star}
                        onPress={() => handleStarPress(star)}
                        hitSlop={10}
                      >
                        <Animated.View
                          style={{
                            transform: [{ scale: starScale[star - 1] }],
                          }}
                        >
                          <MaterialIcons
                            name={star <= activeStar ? "star" : "star-outline"}
                            size={44}
                            color={
                              star <= activeStar
                                ? (RATING_COLORS[activeStar] ?? "#ee2b8c")
                                : "#e5e7eb"
                            }
                          />
                        </Animated.View>
                      </Pressable>
                    ))}
                  </View>

                  {/* Rating label pill */}
                  <View
                    className="px-4 py-1.5 rounded-full"
                    style={{
                      backgroundColor: activeStar
                        ? `${RATING_COLORS[activeStar]}18`
                        : "#f3f4f6",
                    }}
                  >
                    <Text
                      variant="h1"
                      className="text-sm font-semibold"
                      style={{
                        color: activeStar
                          ? RATING_COLORS[activeStar]
                          : "#9ca3af",
                      }}
                    >
                      {activeStar ? RATING_LABELS[activeStar] : "Not rated yet"}
                    </Text>
                  </View>

                  {errors.rating && (
                    <Text className="text-red-500 text-xs mt-2">
                      {errors.rating}
                    </Text>
                  )}
                </View>

                {/* Review text */}
                <View className="px-5 mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text
                      variant="h1"
                      className="text-[#181114] text-sm font-semibold"
                    >
                      Your review
                    </Text>
                    <Text
                      className={`text-xs ${charCount > MAX_CHARS * 0.9 ? "text-red-400" : "text-gray-400"}`}
                    >
                      {charCount}/{MAX_CHARS}
                    </Text>
                  </View>
                  <View
                    className={`rounded-2xl border bg-gray-50 ${
                      errors.quote ? "border-red-300" : "border-gray-200"
                    }`}
                  >
                    <TextInput
                      placeholder="What made this vendor stand out? Share details that would help other couples choose…"
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={6}
                      value={quote}
                      onChangeText={(t) => {
                        if (t.length <= MAX_CHARS) {
                          setQuote(t);
                          if (errors.quote && t.trim())
                            setErrors((e) => ({ ...e, quote: undefined }));
                        }
                      }}
                      className="p-4 text-[#181114] text-sm leading-5"
                      textAlignVertical="top"
                      style={{ minHeight: 130 }}
                    />
                  </View>
                  {errors.quote && (
                    <Text className="text-red-500 text-xs mt-1.5">
                      {errors.quote}
                    </Text>
                  )}
                </View>

                {/* Tip card */}
                <View className="mx-5 mb-6 flex-row gap-3 bg-primary/5 rounded-2xl p-4">
                  <MaterialIcons
                    name="lightbulb-outline"
                    size={18}
                    color="#ee2b8c"
                    style={{ marginTop: 1 }}
                  />
                  <Text className="text-xs text-gray-500 flex-1 leading-5">
                    Mention the quality, communication, and value for money.
                    Honest reviews help couples make the best choice for their
                    big day.
                  </Text>
                </View>

                {/* Submit button */}
                <View
                  className="px-5"
                  style={{ paddingBottom: insets.bottom + 12 }}
                >
                  <Pressable
                    onPress={handleSubmit}
                    disabled={saving}
                    className={`w-full rounded-xl py-4 items-center justify-center flex-row gap-2 ${
                      saving ? "bg-primary/60" : "bg-primary"
                    }`}
                  >
                    {saving ? (
                      <Text
                        variant="h1"
                        className="text-white font-semibold text-base"
                      >
                        {isEditMode ? "Updating…" : "Submitting…"}
                      </Text>
                    ) : (
                      <>
                        <Text
                          variant="h1"
                          className="text-white font-semibold text-base"
                        >
                          {isEditMode ? "Update Review" : "Submit Review"}
                        </Text>
                        <MaterialIcons
                          name="arrow-forward"
                          size={18}
                          color="#fff"
                        />
                      </>
                    )}
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}
