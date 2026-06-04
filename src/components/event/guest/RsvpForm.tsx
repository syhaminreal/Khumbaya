import { useSubmitRsvpResponse } from "@/src/features/events/hooks/use-event";
import { Invitation } from "@/src/features/guests/types";
import { useRsvpStore } from "@/src/store/useRsvpStore";
import { _entering, _exiting, _layoutAnimation, openDateOrTimePicker } from "@/src/utils/helper";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CheckSquare, MapPin, Square } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Pressable, Switch, TextInput, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { MaterialIconCompopnent } from "../../ui/MaterialIComponent";
import { Text } from "../../ui/Text";
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const PRIMARY = "#ee2b8c";



interface RSVPFormValues {
  status: Invitation["status"];
  isAccomodation: boolean;
  userId: number;
  familyId: number | null | undefined;
  isArrivalPickupRequired: boolean;
  isDeparturePickupRequired: boolean;
  arrivalDatetime: Date | null;
  departureDatetime: Date | null;
  arrivalLocation: string | null;
  departureLocation: string | null;
  notes: string | null;
}

const ATTENDANCE_OPTIONS = [
  { label: "yes", value: "accepted" },
  { label: "no", value: "rejected" },
] as const;

type RSVPFormContentProps = Omit<Invitation,
  "role" |
  "category" |
  "arrivalInfo" |
  "departureInfo" |
  "createdAt" |
  "updatedAt" |
  "organizerNote" |
  "respondedAt" |
  "invitedBy" |
  "assignedRoom" |
  "hasCheckedIn" |
  "unInvitedSubevent" |
  "hasCheckedOut" |
  "id" |
  "respondedBy"
> & { onSuccess?: (data: any, payload: any) => void };

export const RSVPFormContent = (content: RSVPFormContentProps) => {
  const router = useRouter();
  const { mutate: submitRsvp, isPending } = useSubmitRsvpResponse(content.eventId);
  const { control, handleSubmit, watch, setValue } = useForm<RSVPFormValues>({

    defaultValues: {
      status: content.status === "accepted" ? "accepted" : "rejected",
      isAccomodation: content.isAccomodation ?? false,
      userId: content.userId,
      familyId: content.familyId ?? null,
      isArrivalPickupRequired: content.isArrivalPickupRequired ?? false,
      isDeparturePickupRequired: content.isDeparturePickupRequired ?? false,
      arrivalDatetime: content.arrivalDatetime
        ? new Date(content.arrivalDatetime)
        : null,
      departureDatetime: content.departureDatetime
        ? new Date(content.departureDatetime)
        : null,
      arrivalLocation: content.arrivalLocation ?? "",
      departureLocation: content.departureLocation ?? "",
      notes: content.notes ?? "",
    },
  });
  // Helper Function 


  const status = watch("status");
  const arrivalPickup = watch("isArrivalPickupRequired");
  const departureDrop = watch("isDeparturePickupRequired");
  const arrivalDatetime = watch("arrivalDatetime");
  const departureDatetime = watch("departureDatetime");

  const handleDateTimeChange = (
    field: "arrivalDatetime" | "departureDatetime",
    mode: "date" | "time",
    currentValue: Date | null
  ) =>
    (event: { type?: string }, selectedDate?: Date) => {
      if (event?.type === "dismissed") return;

      const baseValue = currentValue ?? new Date();
      const pickedValue = selectedDate ?? baseValue;

      let nextValue = pickedValue;
      if (mode === "date" && baseValue) {
        nextValue = new Date(baseValue);
        nextValue.setFullYear(
          pickedValue.getFullYear(),
          pickedValue.getMonth(),
          pickedValue.getDate()
        );
      }
      if (mode === "time" && baseValue) {
        nextValue = new Date(baseValue);
        nextValue.setHours(
          pickedValue.getHours(),
          pickedValue.getMinutes(),
          pickedValue.getSeconds(),
          pickedValue.getMilliseconds()
        );
      }

      setValue(field, nextValue, { shouldDirty: true });
    };


  const onSubmit = (payload: RSVPFormValues) => {
    const cleanedPayload = {
      ...payload,
      arrivalDatetime: payload.isArrivalPickupRequired
        ? payload.arrivalDatetime
        : null,
      departureDatetime: payload.isDeparturePickupRequired
        ? payload.departureDatetime
        : null,
      arrivalLocation: payload.isArrivalPickupRequired
        ? payload.arrivalLocation
        : "",
      departureLocation: payload.isDeparturePickupRequired
        ? payload.departureLocation
        : "",
    };

    submitRsvp(cleanedPayload, {
      onSuccess: (data) => {
        const draftMembers = useRsvpStore.getState().draftMembers;
        if (draftMembers) {
          const updatedMembers = draftMembers.map((m) =>
            m.user.id === payload.userId
              ? {
                ...m,
                eventGuest: {
                  ...m.eventGuest,
                  ...data?.data,
                  ...cleanedPayload,
                },
              }
              : m
          );
          useRsvpStore.getState().setDraftMembers(updatedMembers);
        }
        if (content.onSuccess) {
          content.onSuccess(data, cleanedPayload);
        } else {
          router.back();
        }
      },
    });
  };

  return (
    <View className="px-5 py-4 gap-8">
      {/* Attendance */}
      <View>
        <View className="flex-row items-center gap-2 mb-4">
          <MaterialIconCompopnent name="event_available" />
          <Text variant="h1" className="text-slate-800">
            Will you attend?
          </Text>
        </View>
        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <View className="flex-row bg-pink-100 p-2 rounded-md">
              {ATTENDANCE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => onChange(option.value)}
                  className={`flex-1 py-2.5 rounded-sm ${value === option.value ? "bg-[#ee2b8c]" : ""
                    }`}
                  style={value === option.value ? { backgroundColor: PRIMARY } : {}}
                >
                  <Text
                    variant="h2"
                    className={`text-center text-sm capitalize ${value === option.value ? "text-white" : "text-slate-600"
                      }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </View>

      {/* Declined message
        layout transition on appear from the right and on dissapear on the right
    */}
      {status === "rejected" && (
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
      {status === "accepted" && (
        <Animated.View className="flex-row items-center justify-between p-4 bg-pink-50 rounded-md border border-pink-100"
          layout={_layoutAnimation}
          entering={_entering}
          exiting={_exiting}
        >
          <Animated.View className="flex-row items-center gap-3"
          >
            <MaterialIconCompopnent name="hotel" />
            <View>
              <Text variant="h1" className="text-sm text-slate-900">
                Accommodation Required?
              </Text>
              <Text className="text-xs text-slate-500">
                Do you need a room booked?
              </Text>
            </View>
          </Animated.View>
          <Controller
            control={control}
            name="isAccomodation"
            render={({ field: { onChange, value } }) => (
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: "#e2e8f0", true: PRIMARY }}
                thumbColor="#ffffff"
              />
            )}
          />
        </Animated.View>
      )}

      {/* Transportation + conditional Travel Details */}
      {status === "accepted" && (
        <Animated.View className="gap-4"
          layout={_layoutAnimation}
          entering={_entering}
          exiting={_exiting}
        >
          <View className="flex-row items-center gap-2">
            <MaterialIconCompopnent name="directions_car" />
            <Text variant="h1" className="text-slate-800">
              Transportation Needed?
            </Text>
          </View>
          <View className="flex-row gap-3">
            <Controller
              control={control}
              name="isArrivalPickupRequired"
              render={({ field: { onChange, value } }) => (
                <Pressable
                  onPress={() => onChange(!value)}
                  className={`flex-1 flex-row items-center gap-3 p-3 bg-slate-50 rounded-md border-2 ${value ? "border-pink-200" : "border-transparent"
                    }`}
                >
                  {value ? (
                    <CheckSquare size={20} color={PRIMARY} />
                  ) : (
                    <Square size={20} color="#cbd5e1" />
                  )}
                  <Text variant="h2" className="text-sm text-slate-900">
                    Arrival Pickup
                  </Text>
                </Pressable>
              )}
            />
            <Controller
              control={control}
              name="isDeparturePickupRequired"
              render={({ field: { onChange, value } }) => (
                <Pressable
                  onPress={() => onChange(!value)}
                  className={`flex-1 flex-row items-center gap-3 p-3 bg-slate-50 rounded-md border-2 ${value ? "border-pink-200" : "border-transparent"
                    }`}
                >
                  {value ? (
                    <CheckSquare size={20} color={PRIMARY} />
                  ) : (
                    <Square size={20} color="#cbd5e1" />
                  )}
                  <Text variant="h2" className="text-sm text-slate-900">
                    Departure Drop
                  </Text>
                </Pressable>
              )}
            />
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
                <MaterialIconCompopnent name="flight_land" />
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
                    onPress={() =>
                      openDateOrTimePicker(
                        "arrivalDatetime",
                        arrivalDatetime,
                        "date",
                        handleDateTimeChange(
                          "arrivalDatetime",
                          "date",
                          arrivalDatetime
                        )
                      )
                    }
                    className="bg-white border border-pink-100 rounded-md px-4 py-3"
                  >
                    <Text className="text-sm font-semibold text-slate-900">
                      {arrivalDatetime
                        ? new Date(arrivalDatetime).toLocaleDateString("en-US", {
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
                    onPress={() => {
                      openDateOrTimePicker(
                        "arrivalDatetime",
                        arrivalDatetime,
                        "time",
                        handleDateTimeChange(
                          "arrivalDatetime",
                          "time",
                          arrivalDatetime
                        )
                      );
                    }}
                    className="bg-white border border-pink-100 rounded-md px-4 py-3"
                  >
                    <Text className="text-sm font-semibold text-slate-900">
                      {arrivalDatetime
                        ? new Date(arrivalDatetime).toLocaleTimeString("en-US", {
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
                <Controller
                  control={control}
                  name="arrivalLocation"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value ?? ""}
                      onChangeText={onChange}
                      placeholder="e.g. Kathmandu International Airport, Gate 3"
                      placeholderTextColor="#94a3b8"
                      className="bg-white rounded-md px-4 py-3 text-sm text-slate-900 border border-pink-100"
                    />
                  )}
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
                <MaterialIconCompopnent name="flight_takeoff" />
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
                    onPress={() => {
                      openDateOrTimePicker(
                        "departureDatetime",
                        departureDatetime,
                        "date",
                        handleDateTimeChange(
                          "departureDatetime",
                          "date",
                          departureDatetime
                        )
                      );
                    }}
                    className="bg-white border border-pink-100 rounded-md px-4 py-3"
                  >
                    <Text className="text-sm font-semibold text-slate-900">
                      {departureDatetime
                        ? new Date(departureDatetime).toLocaleDateString("en-US", {
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
                    onPress={() => {
                      openDateOrTimePicker(
                        "departureDatetime",
                        departureDatetime,
                        "time",
                        handleDateTimeChange(
                          "departureDatetime",
                          "time",
                          departureDatetime
                        )
                      );
                    }}
                    className="bg-white border border-pink-100 rounded-md px-4 py-3"
                  >
                    <Text className="text-sm font-semibold text-slate-900">
                      {departureDatetime
                        ? new Date(departureDatetime).toLocaleTimeString("en-US", {
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
                <Controller
                  control={control}
                  name="departureLocation"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value ?? ""}
                      onChangeText={onChange}
                      placeholder="e.g. Tribhuvan International Airport, Terminal 1"
                      placeholderTextColor="#94a3b8"
                      className="bg-white rounded-md px-4 py-3 text-sm text-slate-900 border border-pink-100"
                    />
                  )}
                />
              </View>
            </Animated.View>
          )}
        </Animated.View>
      )}
      {/* Notes  */}
      <Animated.View
        layout={_layoutAnimation}
      >
        <View className="flex-row items-center gap-2 mb-3">
          <MaterialIconCompopnent name="restaurant_menu" />
          <Text variant="h1" className="text-slate-800">
            Special Notes
          </Text>
        </View>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value } }) => (
            <TextInput
              multiline
              numberOfLines={4}
              placeholder="Dietary restrictions, allergies, or any other requests..."
              value={value ?? ""}
              onChangeText={onChange}
              className="w-full bg-slate-50 rounded-md p-4 text-sm text-slate-900"
              placeholderTextColor="#94a3b8"
              textAlignVertical="top"
            />
          )}
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
