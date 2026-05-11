import { Text } from "@/src/components/ui/Text";
import {
  useEventResponseWithUser,
  useSubmitRsvpResponse,
} from "@/src/features/events/hooks/use-event";
import { _layoutAnimation, _entering, _exiting } from "@/src/utils/helper";
import { useAuthStore } from "@/src/store/AuthStore";
import { useRsvpStore } from "@/src/store/useRsvpStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckSquare, MapPin, Square } from "lucide-react-native";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Animated, { FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRIMARY = "#ee2b8c";

type AttendanceValue = "yes" | "no";

interface RSVPFormValues {
  attendance: AttendanceValue;
  accommodation: boolean;
  arrivalDateTime?: Date;
  departureDateTime?: Date;
  arrivalLocation: string;
  departureLocation: string;
  isArrivalPickupRequired: boolean;
  isDeparturePickupRequired: boolean;
  notes: string;
}

const Icon = ({
  name,
  size = 20,
}: {
  name: string;
  color?: string;
  size?: number;
}) => (
  <MaterialIcons
    name={name.replace(/_/g, "-") as keyof typeof MaterialIcons.glyphMap}
    className="!text-primary"
    size={size}
  />
);

export const RSVPFormContent = ({
  userId,
  eventId,
  familyId,
  initialAttendance = "yes",
  initialAccommodation = false,
  initialArrival,
  initialDeparture,
  initialNotes = "",
  initialIsDeparturePickupRequired = false,
  initialIsArrivalPickupRequired = false,
  initialArrivalLocation = "",
  initialDepartureLocation = "",

}: {
  userId: number;
  eventId: number;
  familyId?: number;
  memberName?: string;
  initialAttendance?: string;
  initialAccommodation?: boolean;
  initialArrival?: Date;
  initialDeparture?: Date;
  initialNotes?: string;
  initialIsArrivalPickupRequired?: boolean;
  initialIsDeparturePickupRequired?: boolean;
  initialArrivalInfo?: string;
  initialArrivalLocation?: string;
  initialDepartureLocation?: string;
  initialDepartureInfo?: string;
}) => {
  const router = useRouter();
  const clearDraft = useRsvpStore((s) => s.clearDraft);
  const { mutate: submitRsvp, isPending } = useSubmitRsvpResponse(eventId);
  const familyIdValue = familyId ?? useAuthStore((s) => s.user?.familyId);
  const { control, handleSubmit, watch, setValue } = useForm<RSVPFormValues>({
    defaultValues: {
      attendance: initialAttendance === "no" ? "no" : "yes",
      accommodation: initialAccommodation,
      arrivalDateTime: initialArrival,
      departureDateTime: initialDeparture,
      arrivalLocation: initialArrivalLocation,
      departureLocation: initialDepartureLocation,
      isArrivalPickupRequired: initialIsArrivalPickupRequired,
      isDeparturePickupRequired: initialIsDeparturePickupRequired,
      notes: initialNotes,
    },
  });

  const openArrivalDatePicker = () => {
    const value = arrivalDateTime ?? new Date();
    DateTimePickerAndroid.open({
      value,
      onChange: (event, date) => {
        if (event.type === 'dismissed') return;
        if (!date) return;
        setValue('arrivalDateTime', date, { shouldDirty: true });
      },
      mode: 'date',
    });
  };

  const openArrivalTimePicker = () => {
    const value = arrivalDateTime ?? new Date();
    DateTimePickerAndroid.open({
      value,
      onChange: (event, date) => {
        if (event.type === 'dismissed') return;
        if (!date) return;
        setValue('arrivalDateTime', date, { shouldDirty: true });
      },
      mode: 'time',
    });
  };

  const openDepartureDatePicker = () => {
    const value = departureDateTime ?? new Date();
    DateTimePickerAndroid.open({
      value,
      onChange: (event, date) => {
        if (event.type === 'dismissed') return;
        if (!date) return;
        setValue('departureDateTime', date, { shouldDirty: true });
      },
      mode: 'date',
    });
  };

  const openDepartureTimePicker = () => {
    const value = departureDateTime ?? new Date();
    DateTimePickerAndroid.open({
      value,
      onChange: (event, date) => {
        if (event.type === 'dismissed') return;
        if (!date) return;
        setValue('departureDateTime', date, { shouldDirty: true });
      },
      mode: 'time',
    });
  };

  const attendance = watch("attendance");
  const accommodation = watch("accommodation");
  const arrivalPickup = watch("isArrivalPickupRequired");
  const departureDrop = watch("isDeparturePickupRequired");
  const notes = watch("notes");
  const arrivalDateTime = watch("arrivalDateTime");
  const departureDateTime = watch("departureDateTime");
  const arrivalLocation = watch("arrivalLocation");
  const departureLocation = watch("departureLocation");
  const _damping = 8;

  const onSubmit = (values: RSVPFormValues) => {
    submitRsvp(
      {
        userId,
        familyId: familyIdValue,
        notes: values.notes.trim(),
        arrivalDatetime: values.arrivalDateTime,
        departureDatetime: values.departureDateTime,
        isAccomodation: values.accommodation,
        isArrivalPickupRequired: values.isArrivalPickupRequired,
        isDeparturePickupRequired: values.isDeparturePickupRequired,
        arrivalLocation: values.arrivalLocation.trim() || null,
        departureLocation: values.departureLocation.trim() || null,
        status: values.attendance === "yes" ? "accepted" : "rejected",
      },
      {
        onSuccess: (data) => {
          const draft = useRsvpStore.getState().draft;
          if (draft && draft.familyMembers) {
            const updatedMembers = draft.familyMembers.map((m) =>
              m.user.id === userId
                ? {
                  ...m,
                  eventGuest: {
                    ...m.eventGuest,
                    ...data?.data,
                    status: values.attendance === "yes" ? "accepted" : "rejected",
                    arrivalDatetime: values.arrivalDateTime,
                    departureDatetime: values.departureDateTime,
                    isAccomodation: values.accommodation,
                    isArrivalPickupRequired: values.isArrivalPickupRequired,
                    isDeparturePickupRequired: values.isDeparturePickupRequired,
                    notes: values.notes.trim(),
                    arrivalLocation: values.arrivalLocation.trim() || null,
                    departureLocation: values.departureLocation.trim() || null,
                  },
                }
                : m
            );
            useRsvpStore.getState().setDraft({
              ...draft,
              familyMembers: updatedMembers,
            });
          }
          router.back();
        },
      }
    );
  };

  return (
    <View className="px-5 py-4 gap-8">
      {/* Attendance */}
      <View>
        <View className="flex-row items-center gap-2 mb-4">
          <Icon name="event_available" />
          <Text variant="h1" className="text-slate-800">
            Will you attend?
          </Text>
        </View>
        <View className="flex-row bg-pink-100 p-2 rounded-md">
          {["yes", "no"].map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() =>
                setValue("attendance", option as AttendanceValue, {
                  shouldDirty: true,
                })
              }
              className={`flex-1 py-2.5 rounded-sm ${attendance === option ? "bg-[#ee2b8c]" : ""
                }`}
              style={attendance === option ? { backgroundColor: PRIMARY } : {}}
            >
              <Text
                variant="h2"
                className={`text-center text-sm capitalize ${attendance === option ? "text-white" : "text-slate-600"
                  }`}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Declined message
        layout transition on appear from the right and on dissapear on the right
    */}
      {attendance === "no" && (
        <Animated.View
          layout={_layoutAnimation}
          className="items-center gap-3 py-8 px-6 rounded-xl border border-slate-200"
          style={{ backgroundColor: "#f8fafc" }}

        >
          <MaterialIcons name="sentiment-dissatisfied" size={40} color="#94a3b8" />
          <Text variant="h1" className="text-slate-600 text-center">
            Sorry you can't make it!
          </Text>
          <Text className="text-sm text-slate-400 text-center">
            Your response will be saved. You can always update your RSVP later.
          </Text>
        </Animated.View>
      )}

      {/* Accommodation , opposite from the animation fone in that */}
      {attendance === "yes" && (
        <Animated.View className="flex-row items-center justify-between p-4 bg-pink-50 rounded-md border border-pink-100"
          layout={_layoutAnimation}
          entering={_entering}
          exiting={_exiting}
        >
          <Animated.View className="flex-row items-center gap-3"
          >
            <Icon name="hotel" />
            <View>
              <Text variant="h1" className="text-sm text-slate-900">
                Accommodation Required?
              </Text>
              <Text className="text-xs text-slate-500">
                Do you need a room booked?
              </Text>
            </View>
          </Animated.View>
          <Switch
            value={accommodation}
            onValueChange={(value) =>
              setValue("accommodation", value, { shouldDirty: true })
            }
            trackColor={{ false: "#e2e8f0", true: PRIMARY }}
            thumbColor="#ffffff"
          />
        </Animated.View>
      )}

      {/* Transportation + conditional Travel Details */}
      {attendance === "yes" && (
        <Animated.View className="gap-4"
          layout={_layoutAnimation}
          entering={_entering}
          exiting={_exiting}
        >
          <View className="flex-row items-center gap-2">
            <Icon name="directions_car" />
            <Text variant="h1" className="text-slate-800">
              Transportation Needed?
            </Text>
          </View>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() =>
                setValue("isArrivalPickupRequired", !arrivalPickup, {
                  shouldDirty: true,
                })
              }
              className={`flex-1 flex-row items-center gap-3 p-3 bg-slate-50 rounded-md border-2 ${arrivalPickup ? "border-pink-200" : "border-transparent"
                }`}
            >
              {arrivalPickup ? (
                <CheckSquare size={20} color={PRIMARY} />
              ) : (
                <Square size={20} color="#cbd5e1" />
              )}
              <Text variant="h2" className="text-sm text-slate-900">
                Arrival Pickup
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                setValue("isDeparturePickupRequired", !departureDrop, {
                  shouldDirty: true,
                })
              }
              className={`flex-1 flex-row items-center gap-3 p-3 bg-slate-50 rounded-md border-2 ${departureDrop ? "border-pink-200" : "border-transparent"
                }`}
            >
              {departureDrop ? (
                <CheckSquare size={20} color={PRIMARY} />
              ) : (
                <Square size={20} color="#cbd5e1" />
              )}
              <Text variant="h2" className="text-sm text-slate-900">
                Departure Drop
              </Text>
            </Pressable>
          </View>

          {/* Arrival details — revealed when Arrival Pickup is ticked 
            Arrival animation an the layout transition in this arrival from the top to down 
          */}

          {arrivalPickup && (
            <Animated.View className="gap-4"
              entering={_entering}
              exiting={_exiting}
              layout={_layoutAnimation}
            >

              <View className="flex-row items-center gap-2">
                <Icon name="flight_land" />
                <Text variant="h1" className="text-slate-800">
                  Arrival Details
                </Text>
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1 gap-1.5">
                  <Text className="text-xs uppercase tracking-wider text-slate-500 ml-1">
                    Date
                  </Text>
                  <TouchableOpacity
                    onPress={openArrivalDatePicker}
                    className="bg-white border border-pink-100 rounded-md px-4 py-3"
                  >
                    <Text className="text-sm font-semibold text-slate-900">
                      {arrivalDateTime
                        ? new Date(arrivalDateTime).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                        : "Select"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-1 gap-1.5">
                  <Text className="text-xs uppercase tracking-wider text-slate-500 ml-1">
                    Time
                  </Text>
                  <TouchableOpacity
                    onPress={openArrivalTimePicker}
                    className="bg-white border border-pink-100 rounded-md px-4 py-3"
                  >
                    <Text className="text-sm font-semibold text-slate-900">
                      {arrivalDateTime
                        ? new Date(arrivalDateTime).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })
                        : "Select"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View className="gap-1.5">
                <View className="flex-row items-center gap-1.5 ml-1">
                  <MapPin size={13} color="#94a3b8" />
                  <Text className="text-xs uppercase tracking-wider text-slate-500">
                    Location
                  </Text>
                </View>
                <TextInput
                  value={arrivalLocation}
                  onChangeText={(val) =>
                    setValue("arrivalLocation", val, { shouldDirty: true })
                  }
                  placeholder="e.g. Kathmandu International Airport, Gate 3"
                  placeholderTextColor="#94a3b8"
                  className="bg-white rounded-md px-4 py-3 text-sm text-slate-900 border border-pink-100"
                />
              </View>
            </Animated.View>
          )}

          {/* Departure details — revealed when Departure Drop is ticked */}
          {departureDrop && (

            <Animated.View className="gap-4"
              layout={_layoutAnimation}
            >
              <View className="flex-row items-center gap-2">
                <Icon name="flight_takeoff" />
                <Text variant="h1" className="text-slate-800">
                  Departure Details
                </Text>
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1 gap-1.5">
                  <Text className="text-xs uppercase tracking-wider text-slate-500 ml-1">
                    Date
                  </Text>
                  <TouchableOpacity
                    onPress={openDepartureDatePicker}
                    className="bg-white border border-pink-100 rounded-md px-4 py-3"
                  >
                    <Text className="text-sm font-semibold text-slate-900">
                      {departureDateTime
                        ? new Date(departureDateTime).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                        : "Select"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-1 gap-1.5">
                  <Text className="text-xs uppercase tracking-wider text-slate-500 ml-1">
                    Time
                  </Text>
                  <TouchableOpacity
                    onPress={openDepartureTimePicker}
                    className="bg-white border border-pink-100 rounded-md px-4 py-3"
                  >
                    <Text className="text-sm font-semibold text-slate-900">
                      {departureDateTime
                        ? new Date(departureDateTime).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })
                        : "Select"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View className="gap-1.5">
                <View className="flex-row items-center gap-1.5 ml-1">
                  <MapPin size={13} color="#94a3b8" />
                  <Text className="text-xs uppercase tracking-wider text-slate-500">
                    Location
                  </Text>
                </View>
                <TextInput
                  value={departureLocation}
                  onChangeText={(val) =>
                    setValue("departureLocation", val, { shouldDirty: true })
                  }
                  placeholder="e.g. Tribhuvan International Airport, Terminal 1"
                  placeholderTextColor="#94a3b8"
                  className="bg-white rounded-md px-4 py-3 text-sm text-slate-900 border border-pink-100"
                />
              </View>
            </Animated.View>
          )}
        </Animated.View>
      )}

      {/* Dietary Notes */}
      <Animated.View
        layout={_layoutAnimation}
      >
        <View className="flex-row items-center gap-2 mb-3">
          <Icon name="restaurant_menu" />
          <Text variant="h1" className="text-slate-800">
            Special Notes
          </Text>
        </View>
        <TextInput
          multiline
          numberOfLines={4}
          placeholder="Dietary restrictions, allergies, or any other requests..."
          value={notes}
          onChangeText={(value) =>
            setValue("notes", value, { shouldDirty: true })
          }
          className="w-full bg-slate-50 rounded-md p-4 text-sm text-slate-900"
          placeholderTextColor="#94a3b8"
          textAlignVertical="top"
        />
      </Animated.View>

      {/* Submit */}
      <AnimatedPressable
        layout={_layoutAnimation}
        className="w-full py-4 rounded-md items-center justify-center mb-4"
        style={{ backgroundColor: PRIMARY }}
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
      >
        {isPending ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text variant="h1" className="text-white text-base">
            Save RSVP
          </Text>
        )}
      </AnimatedPressable>
    </View>
  );
};

const RSVPForm = () => {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { user } = useAuthStore();
  const draft = useRsvpStore((s) => s.draft);
  const { data: eventResponse } = useEventResponseWithUser(Number(eventId));

  const selectedUserId = Number(draft?.user?.id) || Number(user?.id);
  const selectedResponse = (eventResponse?.responses ?? []).find(
    (r: any) => r?.user?.id === selectedUserId
  );
  const fallbackEventGuest =
    draft?.eventGuest ?? selectedResponse?.eventGuest ?? null;

  const userId = selectedUserId;
  const familyId = draft?.familyId ?? fallbackEventGuest?.familyId;
  const memberName = draft?.user?.username;

  const initialAttendance =
    fallbackEventGuest?.status === "accepted"
      ? "yes"
      : fallbackEventGuest?.status === "rejected"
        ? "no"
        : "yes";

  const initialArrival = fallbackEventGuest?.arrivalDatetime
    ? new Date(fallbackEventGuest?.arrivalDatetime)
    : undefined;
  const initialDeparture = fallbackEventGuest?.departureDatetime
    ? new Date(fallbackEventGuest?.departureDatetime)
    : undefined;
  const initialArrivalLocation = fallbackEventGuest?.arrivalLocation ?? "";
  const initialDepartureLocation = fallbackEventGuest?.departureLocation ?? "";
  const initialAccommodation = fallbackEventGuest?.isAccomodation === true;
  const initialIsArrivalPickupRequired =
    fallbackEventGuest?.isArrivalPickupRequired === true;
  const initialIsDeparturePickupRequired =
    fallbackEventGuest?.isDeparturePickupRequired === true;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
    >
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 35,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={240}
        scrollEnabled={true}
      >
        <ScrollView showsHorizontalScrollIndicator={false}>
          {memberName && (
            <View
              className="mx-5 mt-4 mb-0 px-4 py-3 rounded-lg flex-row items-center gap-3"
              style={{
                backgroundColor: "#fdf2f8",
                borderWidth: 1,
                borderColor: "#f9a8d4",
              }}
            >
              <MaterialIcons
                name="person"
                size={18}
                className="!text-primary"
              />
              <Text variant="h2" className="text-sm text-pink-700 flex-1">
                Filling RSVP for {memberName}
              </Text>
            </View>
          )}
          <RSVPFormContent
            userId={userId}
            eventId={Number(eventId)}
            familyId={familyId}
            memberName={memberName}
            initialAttendance={initialAttendance}
            initialAccommodation={initialAccommodation}
            initialArrival={initialArrival}
            initialDeparture={initialDeparture}
            initialNotes={fallbackEventGuest?.notes ?? ""}
            initialIsArrivalPickupRequired={initialIsArrivalPickupRequired}
            initialIsDeparturePickupRequired={initialIsDeparturePickupRequired}
            initialArrivalLocation={initialArrivalLocation}
            initialDepartureLocation={initialDepartureLocation}

          />
        </ScrollView>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
};

export default RSVPForm;
