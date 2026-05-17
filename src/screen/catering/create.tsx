import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useLayoutEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { DateTimeRangePicker } from "../../components/ui/DateTimeRangePicker";
import { useCreateCateringMutation } from "../../features/catering";
import { useSubEventsOfEvent } from "../../features/events/hooks/use-event";
import { useEventStore } from "../../features/events/store/useEventStore";
import { cn } from "../../utils/cn";
import type { SubEvent } from "../../constants/event";
import { CheckSquare, Square } from "lucide-react-native";

interface CateringFormData {
  name: string;
  mealType: string;
  perPlatePrice: string;
  noOfPax: string;
  startDateTime: Date;
  endDateTime: Date;
}

const MEAL_TYPE_OPTIONS = [
  { label: "Breakfast", value: "Breakfast" },
  { label: "Lunch", value: "Lunch" },
  { label: "High Tea", value: "High Tea" },
  { label: "Dinner", value: "Dinner" },
  { label: "Late Night", value: "Late Night" },
];

const FormSection = ({
  title,
  subtitle,
  children,
  icon,
  iconColor = "#ee2b8c",
  iconBg = "bg-primary/10",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  iconBg?: string;
}) => (
  <View className="mb-3 mt-2">
    <View className="flex-row items-center mb-5 px-1">
      <View
        className={cn(
          "w-10 h-10 rounded-xl items-center justify-center mr-3",
          iconBg
        )}
      >
        <MaterialIcons name={icon} size={20} color={iconColor} />
      </View>
      <View>
        <Text className="text-lg font-bold text-[#181114] tracking-tight">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-xs font-medium text-gray-500">{subtitle}</Text>
        )}
      </View>
    </View>
    <View className="px-1">{children}</View>
  </View>
);

export default function CreateCateringScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { eventDraft } = useEventStore();

  const eventId = parseInt(params.eventId as string, 10);
  const isSubEvent = params.isSubEvent === "true";

  const parentEventId = useMemo(
    () => (isSubEvent ? Number(eventDraft?.id ?? eventId) : eventId),
    [eventDraft?.id, eventId, isSubEvent]
  );

  const [showSubEvent, setShowSubEvent] = useState(false);
  const [selectedSubEventId, setSelectedSubEventId] = useState<number | null>(
    null
  );

  const { data: subEventsResponse, isLoading: isLoadingSubEvents } =
    useSubEventsOfEvent(parentEventId);

  const subEvents = (subEventsResponse ?? []) as SubEvent[];
  const sortedSubEvents = useMemo(
    () =>
      [...subEvents].sort(
        (a, b) =>
          new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
      ),
    [subEvents]
  );

  const effectiveEventId = showSubEvent && selectedSubEventId
    ? selectedSubEventId
    : parentEventId;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CateringFormData>({
    defaultValues: {
      name: "",
      mealType: "Lunch",
      perPlatePrice: "",
      noOfPax: "",
      startDateTime: new Date(),
      endDateTime: new Date(Date.now() + 3600000),
    },
  });

  const navigation = useNavigation();
  const createCateringMutation = useCreateCateringMutation(effectiveEventId);

  const startDateTime = watch("startDateTime");
  const endDateTime = watch("endDateTime");

  const onSubmit = async (data: CateringFormData) => {
    try {
      if (data.endDateTime <= data.startDateTime) {
        Alert.alert("Error", "End time must be after start time");
        return;
      }

      if (showSubEvent && !selectedSubEventId) {
        Alert.alert("Error", "Please select a sub-event first");
        return;
      }

      await createCateringMutation.mutateAsync({
        name: data.name,
        perPlateprice: data.perPlatePrice,
        noOfpax: Number(data.noOfPax),
        startDateTime: data.startDateTime.toISOString(),
        endDateTime: data.endDateTime.toISOString(),
        mealType: data.mealType,
      });

      Alert.alert("Success", "Catering plan created successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create catering plan";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleToggleSubEvent = () => {
    setShowSubEvent((prev) => {
      const next = !prev;
      if (!next) {
        setSelectedSubEventId(null);
      }
      return next;
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Create Catering",
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={createCateringMutation.isPending}
          style={{
            backgroundColor: "#ee2b8c",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 20,
            marginRight: 12,
            opacity: createCateringMutation.isPending ? 0.6 : 1,
          }}
        >
          <Text className="text-white font-bold text-[15px]">
            {createCateringMutation.isPending ? "Creating..." : "Create"}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleSubmit, onSubmit, createCateringMutation.isPending]);

  return (
    <SafeAreaView className="flex-1 bg-[#f8f6f7]" edges={["bottom"]}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={120}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-4 py-4">
          <FormSection
            title="Plan Details"
            subtitle="Name and meal configuration"
            icon="restaurant-menu"
          >
            <View className="mb-5">
              <Text className="mb-1 ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Plan Name
              </Text>
              <Controller
                control={control}
                name="name"
                rules={{
                  required: "Plan name is required",
                  maxLength: {
                    value: 255,
                    message: "Name must be less than 255 characters",
                  },
                }}
                render={({ field: { value, onChange } }) => (
                  <>
                    <TextInput
                      placeholder="e.g., Wedding Reception Dinner"
                      placeholderTextColor="#9CA3AF"
                      className="h-14 rounded-md border border-gray-200 bg-white px-4 text-base text-[#181114]"
                      value={value}
                      onChangeText={onChange}
                    />
                    {errors.name && (
                      <Text className="mt-1 ml-1 text-xs text-red-500">
                        {errors.name.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>

            <View className="mb-5">
              <Text className="mb-1 ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Meal Type
              </Text>
              <Controller
                control={control}
                name="mealType"
                rules={{ required: "Meal type is required" }}
                render={({ field: { value, onChange } }) => (
                  <>
                    <Dropdown
                      style={{
                        height: 56,
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        borderRadius: 6,
                        paddingHorizontal: 16,
                        backgroundColor: "#ffffff",
                      }}
                      data={MEAL_TYPE_OPTIONS}
                      labelField="label"
                      valueField="value"
                      placeholder="Select meal type"
                      value={value}
                      onChange={(item) => onChange(item.value)}
                      selectedTextStyle={{
                        color: "#ee2b8c",
                        fontSize: 15,
                        fontWeight: "600",
                      }}
                      placeholderStyle={{ color: "#9CA3AF", fontSize: 15 }}
                      itemTextStyle={{ color: "#181114", fontSize: 15 }}
                      activeColor="#fdf2f8"
                      renderItem={(item) => (
                        <View className="flex-row items-center justify-between px-4 py-3">
                          <Text className="text-[15px] font-medium text-[#181114]">
                            {item.label}
                          </Text>
                          {value === item.value && (
                            <MaterialIcons
                              name="check"
                              size={18}
                              color="#ee2b8c"
                            />
                          )}
                        </View>
                      )}
                    />
                    {errors.mealType && (
                      <Text className="mt-1 ml-1 text-xs text-red-500">
                        {errors.mealType.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>
          </FormSection>

          <FormSection
            title="Sub-event Target"
            subtitle="Create this catering under a specific sub-event"
            icon="layers"
            iconColor="#7c3aed"
            iconBg="bg-purple-50"
          >
            <View className="gap-4">
              <TouchableOpacity
                onPress={handleToggleSubEvent}
                className={`flex-row items-center gap-3 p-3 rounded-md border-2 ${showSubEvent ? "border-pink-200 bg-pink-50" : "border-transparent bg-slate-50"}`}
                activeOpacity={0.8}
              >
                {showSubEvent ? (
                  <CheckSquare size={20} color="#ee2b8c" />
                ) : (
                  <Square size={20} color="#cbd5e1" />
                )}
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900">
                    Use a sub-event instead of the parent event
                  </Text>
                  <Text className="text-xs text-muted-light mt-0.5">
                    When selected, the event ID will switch to the sub-event ID.
                  </Text>
                </View>
              </TouchableOpacity>

              {showSubEvent && (
                <View className="gap-2">
                  <Text className="mb-1 ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Select Sub-event
                  </Text>
                  <Dropdown
                    style={{
                      height: 56,
                      borderWidth: 1,
                      borderColor: "#e5e7eb",
                      borderRadius: 6,
                      paddingHorizontal: 16,
                      backgroundColor: "#ffffff",
                    }}
                    data={sortedSubEvents.map((item) => ({
                      label: item.title ?? "Untitled sub-event",
                      value: String(item.id),
                    }))}
                    labelField="label"
                    valueField="value"
                    placeholder={isLoadingSubEvents ? "Loading..." : "Choose sub-event"}
                    value={selectedSubEventId ? String(selectedSubEventId) : null}
                    onChange={(item) => setSelectedSubEventId(Number(item.value))}
                    selectedTextStyle={{
                      color: "#ee2b8c",
                      fontSize: 15,
                      fontWeight: "600",
                    }}
                    placeholderStyle={{ color: "#9CA3AF", fontSize: 15 }}
                    itemTextStyle={{ color: "#181114", fontSize: 15 }}
                    activeColor="#fdf2f8"
                    disable={isLoadingSubEvents || sortedSubEvents.length === 0}
                  />

                  {sortedSubEvents.length === 0 && !isLoadingSubEvents && (
                    <Text className="text-xs text-muted-light ml-1">
                      No sub-events found for this event.
                    </Text>
                  )}

                  {selectedSubEventId && (
                    <Text className="text-xs text-muted-light ml-1">
                      Creating for sub-event ID {selectedSubEventId}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </FormSection>

          <FormSection
            title="Guest Count"
            subtitle="Number of pax expected"
            icon="groups"
            iconColor="#0369a1"
            iconBg="bg-blue-50"
          >
            <View className="mb-5">
              <Text className="mb-1 ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Number of Pax
              </Text>
              <Controller
                control={control}
                name="noOfPax"
                rules={{
                  required: "Number of pax is required",
                  pattern: {
                    value: /^\d+$/,
                    message: "Please enter a whole number",
                  },
                  validate: (value) =>
                    Number(value) > 0 || "Number of pax must be greater than 0",
                }}
                render={({ field: { value, onChange } }) => (
                  <>
                    <View className="h-14 flex-row items-center rounded-md border border-gray-200 bg-white px-4">
                      <MaterialIcons name="groups" size={20} color="#9CA3AF" />
                      <TextInput
                        placeholder="e.g., 120"
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 ml-2 text-base text-[#181114]"
                        value={value}
                        onChangeText={onChange}
                        keyboardType="number-pad"
                      />
                    </View>
                    {errors.noOfPax && (
                      <Text className="mt-1 ml-1 text-xs text-red-500">
                        {errors.noOfPax.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>
          </FormSection>

          <FormSection
            title="Pricing"
            subtitle="Per guest cost estimate"
            icon="payments"
            iconColor="#a23665"
            iconBg="bg-secondary-container/20"
          >
            <View className="mb-5">
              <Text className="mb-1 ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Per Plate Price
              </Text>
              <Controller
                control={control}
                name="perPlatePrice"
                rules={{
                  required: "Price is required",
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message: "Invalid price format (e.g., 50 or 50.99)",
                  },
                }}
                render={({ field: { value, onChange } }) => (
                  <>
                    <View className="h-14 flex-row items-center rounded-md border border-gray-200 bg-white px-4">
                      <MaterialIcons
                        name="attach-money"
                        size={20}
                        color="#9CA3AF"
                      />
                      <TextInput
                        placeholder="0.00"
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 ml-1 text-base text-[#181114]"
                        value={value}
                        onChangeText={onChange}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    {errors.perPlatePrice && (
                      <Text className="mt-1 ml-1 text-xs text-red-500">
                        {errors.perPlatePrice.message}
                      </Text>
                    )}
                  </>
                )}
              />
            </View>
          </FormSection>

          <FormSection
            title="Service Window"
            subtitle="Meal start and end time"
            icon="schedule"
            iconColor="#046c00"
            iconBg="bg-tertiary-container"
          >
            <DateTimeRangePicker
              value={{
                startDateTime,
                endDateTime,
              }}
              onChange={({ startDateTime: start, endDateTime: end }) => {
                setValue("startDateTime", start, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setValue("endDateTime", end, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              startLabel="Start"
              endLabel="End"
            />
            {errors.endDateTime && (
              <Text className="mt-2 ml-1 text-xs text-red-500">
                {errors.endDateTime.message}
              </Text>
            )}
          </FormSection>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}