import { DateTimeRangePicker } from "@/src/components/ui/DateTimeRangePicker";
import { Text } from "@/src/components/ui/Text";
import {
  BACKEND_TO_EVENT_TYPE,
  EVENT_TYPES,
  EVENT_TYPE_TO_BACKEND,
  type Event,
} from "@/src/constants/event";
import {
  useEventById,
  useUpdateEvent,
} from "@/src/features/events/hooks/use-event";
import { useEventStore } from "@/src/features/events/store/useEventStore";
import { formatDate, formatTime, parseDate } from "@/src/utils/helper";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type EditEventForm = {
  title: string;
  eventType: string;
  side: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
  rsvpDeadline: Date;
  city: string;
  venue: string;
  theme: string;
  dressCode: string;
  budget: string;
  isPublic: boolean;
};

//TODO:TYPE mismatch with backend, also some fields are missing, need to confirm with backend team and update accordingly

const buildInitialForm = (draft?: Event | null): EditEventForm => {
  const today = new Date();
  const normalizedType = draft?.type
    ? (BACKEND_TO_EVENT_TYPE[draft.type] ?? draft.type)
    : "";
  return {
    title: draft?.title ?? "",
    eventType: normalizedType ?? "",
    side: "",
    description: draft?.description ?? "",
    startDateTime: parseDate(draft?.startDateTime) ?? today,
    endDateTime: parseDate(draft?.endDateTime) ?? today,
    rsvpDeadline: parseDate(draft?.rsvpDeadline) ?? today,
    city: draft?.location ?? "",
    venue: draft?.venue ?? "",
    theme: draft?.theme ?? "",
    dressCode: draft?.dressCode ?? "",
    budget: typeof draft?.budget === "number" ? String(draft?.budget) : "",
    isPublic: true,
  };
};

const PRIMARY = "#ee2b8c";

type SectionCardProps = {
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
};

function SectionCard({ title, icon, children }: SectionCardProps) {
  return (
    <View className="rounded-md  px-2 shadow-sm border border-slate-100">
      {title && icon && (
        <View className="mb-4 flex-row items-center gap-2">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ee2b8c] to-[#ff5ca1]">
            <Ionicons name={icon} size={18} />
          </View>
          <Text className="text-lg font-bold text-[#181114]">{title}</Text>
        </View>
      )}
      <View className="gap-4">{children}</View>
    </View>
  );
}

type FieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
};

function LabeledField({
  label,
  placeholder,
  value,
  onChangeText,
  multiline,
  numberOfLines,
  keyboardType,
}: FieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold tracking-wide text-[#1a1b3a]">
        {label}
      </Text>
      <TextInput
        className={`w-full rounded-md border border-slate-200 bg-white text-base text-slate-900 ${multiline ? "min-h-[108px] px-3 py-3" : "h-14 px-4"
          }`}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

type ToggleRowProps = {
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

function ToggleRow({ title, description, value, onChange }: ToggleRowProps) {
  return (
    <View className="flex-row items-center justify-between rounded-md border border-[#ee2b8c]/10 bg-[#ee2b8c]/5 p-4">
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-lg bg-[#ee2b8c]/10">
          <MaterialIcons name="visibility" size={18} color={PRIMARY} />
        </View>
        <View>
          <Text className="text-sm font-bold text-[#181114]">{title}</Text>
          <Text className="text-[10px] uppercase tracking-wider text-slate-500">
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#cbd5e1", true: PRIMARY }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

export default function EditEventScreen() {
  const router = useRouter();
  const titleInputRef = useRef<TextInput>(null);
  const { eventDraft } = useEventStore();
  const { eventId } = useLocalSearchParams();
  const { data: fullEvent } = useEventById(Number(eventId));
  const { mutate: updateEvent, isPending: isUpdating } = useUpdateEvent(
    Number(eventId)
  );
  const draft = (fullEvent ?? eventDraft) as Event | null;
  const defaultValues = useMemo(
    () => buildInitialForm(draft),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fullEvent]
  );
  const { control, setValue, watch, reset, handleSubmit } =
    useForm<EditEventForm>({
      defaultValues,
    });

  useEffect(() => {
     if (fullEvent) reset(buildInitialForm(fullEvent as Event));
  }, [fullEvent, reset]);

  const startDateTime = watch("startDateTime");
  const endDateTime = watch("endDateTime");
  const rsvpDeadline = watch("rsvpDeadline");
  const selectedEventType = watch("eventType");
  const currentTitle = watch("title");
  const [isTitlePinned, setIsTitlePinned] = useState(false);
  const [showRsvpPicker, setShowRsvpPicker] = useState(false);
  const [rsvpPickerMode, setRsvpPickerMode] = useState<"date" | "time">(
    "date"
  );

  const handleRangeChange = (range: {
    startDateTime: Date;
    endDateTime: Date;
  }) => {
    setValue("startDateTime", range.startDateTime, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("endDateTime", range.endDateTime, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleRsvpDateChange = (
    event: DateTimePickerEvent,
    pickedDate?: Date
  ) => {
    if (event.type === "dismissed") {
      setShowRsvpPicker(false);
      return;
    }

    if (!pickedDate) return;

    const next = new Date(rsvpDeadline);
    if (rsvpPickerMode === "date") {
      next.setFullYear(
        pickedDate.getFullYear(),
        pickedDate.getMonth(),
        pickedDate.getDate()
      );
    } else {
      next.setHours(
        pickedDate.getHours(),
        pickedDate.getMinutes(),
        pickedDate.getSeconds(),
        0
      );
    }

    setValue("rsvpDeadline", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setShowRsvpPicker(false);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const shouldPinTitle = event.nativeEvent.contentOffset.y > 56;
    if (shouldPinTitle !== isTitlePinned) {
      setIsTitlePinned(shouldPinTitle);
    }
  };

  const handleUpdate = handleSubmit((values) => {
    console.log(eventId);
    if (!eventId) {
      Alert.alert("Error", "Missing event id.");
      return;
    }

    if (values.endDateTime <= values.startDateTime) {
      Alert.alert("Invalid schedule", "End time must be after start time.");
      return;
    }

    if (values.rsvpDeadline > values.startDateTime) {
      Alert.alert(
        "Invalid RSVP deadline",
        "RSVP deadline should be before event start time."
      );
      return;
    }

    const resolvedType =
      EVENT_TYPE_TO_BACKEND[
      values.eventType as keyof typeof EVENT_TYPE_TO_BACKEND
      ];

    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      type: resolvedType as keyof typeof EVENT_TYPE_TO_BACKEND,
      startDateTime: values.startDateTime.toISOString(),
      endDateTime: values.endDateTime.toISOString(),
      location: values.city.trim() || undefined,
      venue: values.venue.trim() || undefined,
      dressCode: values.dressCode || undefined,
      theme: values.theme.trim() || undefined,
      budget: values.budget ? Number(values.budget) : undefined,
      rsvpDeadline: values.rsvpDeadline.toISOString(),
    };
    console.log("This is the payload of the event in the event section", payload);

    updateEvent(payload, {
      onSuccess: () => {
        Alert.alert("Success", "Event updated successfully.");
        router.back();
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update event.";
        Alert.alert("Error", message);
      },
    });
  });

  return (
    <SafeAreaView className="flex-1 bg-[#f8f6f7]" edges={["top", "bottom"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: isTitlePinned
            ? currentTitle?.trim() || "Untitled event"
            : "Edit event",
          headerTitleAlign: "center",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "#f8f6f7" },
          headerTintColor: "#ee2b8c",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center"
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={22} color="#ee2b8c" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={isUpdating}
              activeOpacity={0.8}
              className="px-1"
            >
              <Text className="text-sm font-bold text-[#ee2b8c]">
                {isUpdating ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1 "
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View className="bg-[#f8f6f7] px-4 pt-1 pb-2">
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => Alert.alert("Cover", "Open image picker here.")}
                className="relative h-14 w-14 overflow-hidden rounded-full border border-slate-200 bg-slate-100"
                activeOpacity={0.85}
              >
                <Image
                  source={{
                    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOAnlcfOm-SbS8PZH_0v8eUP911cDeJ61o8WbBJAuIO9sHibeTvP7X8AmuAdoqjRH5H5lxVhH8QPcv3xssrkbNU4ebTPiF95SZrTOI_8iSYf67CtzoUpaJUP1BUw-RPzE1bsPZ6LNFe44iGEPcqpU2aHrZqux1E7HkSrdhWUHIs6U62w8DV_c_vNWmt1lkRU_uygfRbFoGRRRgJ8_l6Qt81nqPp2h4h74elXxwOgHx6Tj8hTriCh50fvjBjuTzs07EBBr6iMa6hRU",
                  }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
                <View className="absolute z-30 bottom-0 right-0 h-5 w-5 items-center justify-center rounded-full border border-white bg-[#ee2b8c]">
                  <MaterialIcons name="photo-camera" size={10} color="#ffffff" />
                </View>
              </TouchableOpacity>

              <View className="flex-1">
                <Controller
                  control={control}
                  name="title"
                  render={({ field: { value, onChange } }) => (
                    <View className="flex-row items-center gap-2">
                      <TextInput
                        ref={titleInputRef}
                        className="flex-1 px-0 text-xl font-bold text-[#181114]"
                        placeholder="Enter event title"
                        placeholderTextColor="#94a3b8"
                        value={value}
                        onChangeText={onChange}
                      />
                      <TouchableOpacity
                        onPress={() => titleInputRef.current?.focus()}
                        activeOpacity={0.75}
                        className="h-7 w-7 items-center justify-center rounded-full"
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <MaterialIcons name="edit" size={14} color="#a1a1aa" />
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </View>
            </View>
          </View>

          <View className="mt-4 gap-6 px-4">
            <SectionCard title="Basic Details" icon="information-circle">
              <View className="gap-2">
                <Text className="text-sm font-semibold tracking-wide text-[#1a1b3a]">
                  Event Type
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {EVENT_TYPES.map((type) => {
                    const isSelected = selectedEventType === type;
                    const chipClassName = isSelected
                      ? "px-5 py-2.5 rounded-full bg-[#ee2b8c] border border-[#ee2b8c]"
                      : "px-5 py-2.5 rounded-full bg-white border border-gray-200";
                    const textClassName = isSelected
                      ? "font-plusjakartasans-medium text-sm text-white"
                      : "font-plusjakartasans-medium text-sm text-gray-600";

                    return (
                      <TouchableOpacity
                        key={type}
                        onPress={() => setValue("eventType", type)}
                        className={chipClassName}
                      >
                        <Text className={textClassName}>{type}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              <Controller
                control={control}
                name="description"
                render={({ field: { value, onChange } }) => (
                  <LabeledField
                    label="Description"
                    placeholder="Give guests a quick overview"
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={4}
                  />
                )}
              />
            </SectionCard>

            <SectionCard title="Event Schedule" icon="calendar">
              <View className="gap-2">
                <DateTimeRangePicker
                  value={{ startDateTime, endDateTime }}
                  onChange={handleRangeChange}
                  startLabel="Start"
                  endLabel="End"
                />
              </View>
            </SectionCard>
            <SectionCard title="RSVP Deadline" icon="time">
              <View className="gap-2">
                <View className="flex-row gap-4">
                  <View className="flex-1 gap-2">
                    <Text className="text-md font-semibold uppercase tracking-wide text-zinc-500">
                      Date
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setRsvpPickerMode("date");
                        setShowRsvpPicker(true);
                      }}
                      className="rounded-md border border-zinc-300 bg-white px-4 py-3"
                    >
                      <Text className="text-md font-semibold text-black">
                        {formatDate(rsvpDeadline.toISOString())}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className="flex-1 gap-2">
                    <Text className="text-md font-semibold uppercase tracking-wide text-zinc-500">
                      Time
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setRsvpPickerMode("time");
                        setShowRsvpPicker(true);
                      }}
                      className="rounded-md border border-zinc-300 bg-white px-4 py-3"
                    >
                      <Text className="text-md font-semibold text-black">
                        {formatTime(rsvpDeadline.toISOString())}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </SectionCard>


            {showRsvpPicker && (
              <DateTimePicker
                value={rsvpDeadline}
                mode={rsvpPickerMode}
                is24Hour={false}
                onChange={handleRsvpDateChange}
              />
            )}

            <SectionCard title="Location" icon="location">
              <Controller
                control={control}
                name="city"
                render={({ field: { value, onChange } }) => (
                  <LabeledField
                    label="City / Area"
                    placeholder="Udaipur, Rajasthan"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="venue"
                render={({ field: { value, onChange } }) => (
                  <LabeledField
                    label="Venue Name"
                    placeholder="The Leela Palace"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </SectionCard>
            {/* <View className="h-28 w-full overflow-hidden rounded-md border border-slate-200">
                <Image
                  source={{
                    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBsXGKMRLJ35_GbMDcozUWmZ04ZsCUF4hqolXbTjKxMZs4J2_16cNLqghLwwNSosYlDIt01M37Rog9lXSuwinI8iypxPY9Rx2z5Yuy6QOquSaBC_Wb9QgABYz6Mt6I2-PIbrlunei6pFyC_JxcTuGkwrZWJ-aVBQPMILrz8pIKNsA32urrRE8mh16zLRg-aL0JgxW4_aHQs-ns-P7eAEM9HUTcnZGOJiZJ3M4LgNr5lY_SQ5ognJpCZ9_taZa7KMpbjoK_3qfMJvgc",
                  }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              </View> */}

            <SectionCard>
              <View className="flex-row gap-4">
                <View className="flex-1 gap-4">
                  <Controller
                    control={control}
                    name="theme"
                    render={({ field: { value, onChange } }) => (
                      <LabeledField
                        label="Event Theme"
                        placeholder="Royal Vintage"
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="dressCode"
                    render={({ field: { value, onChange } }) => (
                      <LabeledField
                        label="Dress Code"
                        placeholder="classical"
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </View>
                <View className="gap-2">
                  <Text className="text-sm font-semibold tracking-wide text-[#1a1b3a]">
                    Estimated Budget (INR)
                  </Text>
                  <View className="flex-row items-center rounded-md border border-slate-200  px-4 h-14">
                    <Text className="text-base font-semibold text-slate-400">
                      ₹
                    </Text>
                    <Controller
                      control={control}
                      name="budget"
                      render={({ field: { value, onChange } }) => (
                        <TextInput
                          className="flex-1 px-3 text-base font-semibold text-slate-900"
                          placeholder="1500000"
                          placeholderTextColor="#94a3b8"
                          value={value}
                          onChangeText={onChange}
                          keyboardType="numeric"
                        />
                      )}
                    />
                  </View>
                </View>
              </View>
              <ToggleRow
                title="Public Visibility"
                description="Visible to all invited guests"
                value={watch("isPublic")}
                onChange={(value) => setValue("isPublic", value)}
              />
            </SectionCard>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
