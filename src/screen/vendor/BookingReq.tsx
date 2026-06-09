import { Button } from "@/src/components/ui/Button";
import { Text } from "@/src/components/ui/Text";
import { Event as AppEvent } from "@/src/constants/event";
import { useAddEventVendor } from "@/src/features/business/hooks/use-business";
import { usegetUpcomingEvents } from "@/src/features/events/hooks/use-event";
import { useAuthStore } from "@/src/store/AuthStore";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  Alert,
  Animated,
  Dimensions,
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

interface BookingReqModalProps {
  visible?: boolean;
  onClose?: () => void;
  onSubmit?: (formData: FormData) => void;
  asRoute?: boolean; // When true, skips Modal wrapper (for Expo Router transparentModal)
  vendorId?: number;
  fromEventId?: number;
}

interface FormData {
  eventId: string;
  budget: string;
  guests: string;
  notes: string;
}

const { height: screenHeight } = Dimensions.get("window");
const DISMISS_THRESHOLD = 100;

export default function BookingReqModal({
  visible = true,
  onClose,
  onSubmit,
  asRoute = false,
  vendorId,
  fromEventId,
}: BookingReqModalProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const { data: events = [] as AppEvent[], isLoading: eventsLoading } =
    usegetUpcomingEvents();
  const { user } = useAuthStore();
  const { mutateAsync: addEventVendor } = useAddEventVendor(user!.id);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: { eventId: "", budget: "", guests: "", notes: "" },
  });

  const [showEventDropdown, setShowEventDropdown] = useState(false);

  const selectedEventId = watch("eventId");
  const selectedEvent = events.find((e: AppEvent) => e.id === selectedEventId);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  // Create PanResponder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          Animated.event([null, { dy: pan.y }], { useNativeDriver: false })(
            evt,
            gestureState
          );
          const opacityValue = Math.max(
            0,
            1 - gestureState.dy / (screenHeight * 0.5)
          );
          opacity.setValue(opacityValue);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > DISMISS_THRESHOLD || gestureState.vy > 0.5) {
          if (asRoute) {
            handleClose();
          } else {
            Animated.parallel([
              Animated.timing(pan.y, {
                toValue: screenHeight,
                duration: 250,
                useNativeDriver: false,
              }),
              Animated.timing(opacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false,
              }),
            ]).start(() => {
              pan.setValue({ x: 0, y: 0 });
              opacity.setValue(1);
              handleClose();
            });
          }
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

  // Reset animation when modal hides
  useEffect(() => {
    if (!visible) {
      pan.setValue({ x: 0, y: 0 });
      opacity.setValue(1);
    }
  }, [visible]);

  // Pre-select event when navigating from an event context
  useEffect(() => {
    if (fromEventId) {
      setValue("eventId", String(fromEventId), { shouldValidate: true });
    }
  }, [fromEventId]);

  const onFormSubmit: SubmitHandler<FormData> = async (data) => {
    if (!vendorId) {
      Alert.alert("Error", "Vendor not found. Please try again.");
      return;
    }

    try {
      await addEventVendor({
        eventId: data.eventId,
        payload: {
          vendorId,
          budget: data.budget,
          status: "draft",
          estimatedGuest: data.guests ? Number(data.guests) : undefined,
          notes: data.notes,
        },
      });
      onSubmit?.(data);
      reset();
      Alert.alert(
        "Enquiry Sent!",
        "Your enquiry has been sent successfully.",
        [{ text: "OK", onPress: handleClose }]
      );
    } catch (error: any) {
      console.error("Error submitting booking request:", error);
      const message =
        error?.message || "Failed to send enquiry. Please try again.";
      Alert.alert("Error", message);
    }
  };

  const modalContent = (
    <Animated.View style={{ opacity }} className="flex-1 bg-black/40">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-1 justify-end">
          {/* Modal Container with Swipe Gesture */}
          <Animated.View
            style={{ transform: [{ translateY: pan.y }] }}
            {...panResponder.panHandlers}
          >
            <View className="bg-white rounded-t-3xl min-h-[85%]">
              {/* Handle Bar */}
              <View className="items-center pt-3 pb-2">
                <View className="h-1 w-12 bg-gray-300 rounded-full" />
              </View>

              {/* Header */}
              <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
                <Pressable
                  onPress={handleClose}
                  className="h-10 w-10 items-center justify-center rounded-full active:bg-gray-100"
                >
                  <MaterialIcons name="close" size={24} color="#111827" />
                </Pressable>
                <Text variant="h2" className="text-text-primary">
                  Request Quote
                </Text>
                <View className="w-10" />
              </View>

              {/* Scrollable Content */}
              <ScrollView
                className="flex-1 px-6 py-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
                scrollEnabled={true}
              >
                {/* Section Brief */}
                <View className="mb-8">
                  <Text
                    variant="h1"
                    className="text-text-primary mb-2 text-xl font-semibold"
                  >
                    Let the vendor know what you're planning.
                  </Text>
                  <Text
                    variant="caption"
                    className="text-text-secondary text-sm"
                  >
                    Providing specific details helps vendors give you the most
                    accurate pricing.
                  </Text>
                </View>

                {/* Event Selection */}
                <Controller
                  control={control}
                  name="eventId"
                  rules={{ required: "Please select an event" }}
                  render={() => (
                    <View className="mb-6">
                      <Text className="text-text-primary text-sm font-semibold mb-2">
                        Which event is this for?
                      </Text>

                      {fromEventId ? (
                        <View className="h-14 bg-gray-50 border border-gray-200 rounded-lg px-4 flex-row items-center gap-2">
                          <MaterialIcons name="event" size={18} color="#ee2b8c" />
                          <Text className="text-text-primary text-base flex-1">
                            {selectedEvent?.title ?? `Event #${fromEventId}`}
                          </Text>
                          <MaterialIcons name="lock-outline" size={16} color="#9CA3AF" />
                        </View>
                      ) : (
                        <>
                          <Pressable
                            onPress={() => setShowEventDropdown(!showEventDropdown)}
                            className={`h-14 bg-white border rounded-lg px-4 flex-row items-center justify-between ${
                              errors.eventId ? "border-red-400" : "border-gray-200"
                            }`}
                          >
                            <Text
                              className={`text-base ${
                                selectedEvent
                                  ? "text-text-primary"
                                  : "text-gray-400"
                              }`}
                            >
                              {selectedEvent?.title || "Select an Event"}
                            </Text>
                            <MaterialIcons
                              name={
                                showEventDropdown ? "expand-less" : "expand-more"
                              }
                              size={24}
                              color="#111827"
                            />
                          </Pressable>

                          {errors.eventId && (
                            <Text className="text-red-500 text-xs mt-1">
                              {errors.eventId.message}
                            </Text>
                          )}

                          {/* Dropdown Menu */}
                          {showEventDropdown && (
                            <View className="absolute top-24 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                              {eventsLoading ? (
                                <View className="px-4 py-3">
                                  <Text className="text-gray-400">
                                    Loading events...
                                  </Text>
                                </View>
                              ) : events.length === 0 ? (
                                <View className="px-4 py-3">
                                  <Text className="text-gray-400">
                                    No events found
                                  </Text>
                                </View>
                              ) : (
                                events.map((event: AppEvent) => (
                                  <Pressable
                                    key={event.id}
                                    onPress={() => {
                                      setValue("eventId", event.id, {
                                        shouldValidate: true,
                                      });
                                      setShowEventDropdown(false);
                                    }}
                                    className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                                  >
                                    <Text className="text-text-primary">
                                      {event.title}
                                    </Text>
                                  </Pressable>
                                ))
                              )}
                            </View>
                          )}

                          <Pressable className="mt-3 flex-row items-center gap-1">
                            <MaterialIcons
                              name="add-circle"
                              size={18}
                              color="#ee2b8c"
                            />
                            <Text className="text-primary text-sm font-medium">
                              I haven't created one yet
                            </Text>
                          </Pressable>
                        </>
                      )}
                    </View>
                  )}
                />

                {/* Budget & Guests Row */}
                <View className="flex-row gap-4 mb-6">
                  {/* Budget */}
                  <View className="flex-1">
                    <Text className="text-text-primary text-sm font-semibold mb-2">
                      Estimated Budget
                    </Text>
                    <Controller
                      control={control}
                      name="budget"
                      rules={{ required: "Required" }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <>
                          <View
                            className={`h-14 bg-white border rounded-lg px-4 flex-row items-center ${
                              errors.budget
                                ? "border-red-400"
                                : "border-gray-200"
                            }`}
                          >
                            <Text className="text-amber-600 font-semibold mr-1">
                              $
                            </Text>
                            <TextInput
                              placeholder="0.00"
                              placeholderTextColor="#9CA3AF"
                              keyboardType="decimal-pad"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              className="flex-1 text-text-primary text-base"
                            />
                          </View>
                          {errors.budget && (
                            <Text className="text-red-500 text-xs mt-1">
                              {errors.budget.message}
                            </Text>
                          )}
                        </>
                      )}
                    />
                  </View>

                  {/* Guests */}
                  <View className="flex-1">
                    <Text className="text-text-primary text-sm font-semibold mb-2">
                      Expected Guests
                    </Text>
                    <Controller
                      control={control}
                      name="guests"
                      rules={{ required: "Required" }}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <>
                          <TextInput
                            placeholder="0"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="number-pad"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            className={`h-14 bg-white border rounded-lg px-4 text-text-primary text-base ${
                              errors.guests
                                ? "border-red-400"
                                : "border-gray-200"
                            }`}
                          />
                          {errors.guests && (
                            <Text className="text-red-500 text-xs mt-1">
                              {errors.guests.message}
                            </Text>
                          )}
                        </>
                      )}
                    />
                  </View>
                </View>

                {/* Additional Notes */}
                <View className="mb-6">
                  <View className="flex-row justify-between items-end mb-2">
                    <Text className="text-text-primary text-sm font-semibold">
                      Additional Info / Notes
                    </Text>
                    <Text className="text-xs text-gray-400 uppercase tracking-wider">
                      Optional
                    </Text>
                  </View>
                  <Controller
                    control={control}
                    name="notes"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        placeholder="Share specific details, dietary requirements, or special requests..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={4}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        className="bg-white border border-gray-200 rounded-lg p-4 text-text-primary text-base"
                        textAlignVertical="top"
                      />
                    )}
                  />
                </View>

                {/* Terms/Privacy Snippet */}
                <Text className="text-xs text-gray-500 text-center leading-relaxed px-2">
                  By sending this request, you agree to our terms of service.
                  The vendor will be notified immediately and usually responds
                  within 24 hours.
                </Text>
              </ScrollView>

              {/* Sticky Footer */}
              <View
                className="px-4 py-4 border-t border-gray-100 bg-white"
                style={{ paddingBottom: insets.bottom + 16 }}
              >
                <Button
                  onPress={handleSubmit(onFormSubmit)}
                  disabled={isSubmitting}
                  className="flex-row items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Text className="text-white">Sending...</Text>
                  ) : (
                    <>
                      <Text className="text-white">Send Request</Text>
                      <MaterialIcons name="send" size={18} color="#ffffff" />
                    </>
                  )}
                </Button>
              </View>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );

  if (asRoute) {
    return modalContent;
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      {modalContent}
    </Modal>
  );
}
