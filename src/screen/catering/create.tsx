import { Text } from "@/src/components/ui/Text";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { CheckSquare, Square } from "lucide-react-native";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { useEventById, useSubEventsOfEvent } from "@/src/features/events/hooks/use-event";
import { useEventStore } from "@/src/features/events/store/useEventStore";
import { _entering, _exiting, _layoutAnimation } from "@/src/utils/helper";
import { Dropdown } from "react-native-element-dropdown";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { DateTimeRangePicker } from "../../components/ui/DateTimeRangePicker";
import type { SubEvent } from "../../constants/event";
import { useBudgetSummary } from "../../features/budget/hooks/use-budget";
import {
  useAddExpenseToCateringMutation,
  useCateringById,
  useCreateCateringMutation,
  useUpdateCateringMutation,
} from "../../features/catering";

interface CateringFormData {
  name: string;
  mealType: string;
  perPlatePrice: number;
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

export default function CreateCateringScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { eventDraft } = useEventStore();

  const eventId = parseInt(params.eventId as string, 10);
  const cateringId = Number(params.cateringId);
  const isEdit = params.isEdit === "true" || (Number.isFinite(cateringId) && cateringId > 0);
  const isSubEvent = params.isSubEvent === "true";

  const parentEventId = useMemo(
    () => (isSubEvent ? Number(eventDraft?.id ?? eventId) : eventId),
    [eventDraft?.id, eventId, isSubEvent]
  );

  const budgetEventId = parentEventId;

  const [showSubEvent, setShowSubEvent] = useState(false);
  const [selectedSubEventId, setSelectedSubEventId] = useState<number | null>(null);
  const [budgetWarningVisible, setBudgetWarningVisible] = useState(false);
  const [navigateAfterBudgetModal, setNavigateAfterBudgetModal] = useState(false);

  const { data: subEventsResponse, isLoading: isLoadingSubEvents } =
    useSubEventsOfEvent(parentEventId);

  const subEvents = (subEventsResponse ?? []) as SubEvent[];
  const sortedSubEvents = useMemo(
    () =>
      [...subEvents].sort(
        (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
      ),
    [subEvents]
  );

  const effectiveEventId =
    showSubEvent && selectedSubEventId ? selectedSubEventId : parentEventId;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CateringFormData>({
    defaultValues: {
      name: "",
      mealType: undefined,
      perPlatePrice: undefined,
      noOfPax: "",
      startDateTime: new Date(),
      endDateTime: new Date(Date.now() + 3600000),
    },
  });
// FAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa
  const navigation = useNavigation();
  const createCateringMutation = useCreateCateringMutation(effectiveEventId);
  const updateCateringMutation = useUpdateCateringMutation(cateringId);
  const addExpenseToCateringMutation = useAddExpenseToCateringMutation();

  const { data: budgetEvent } = useEventById(Number(budgetEventId), {
    enabled: !!budgetEventId,
  });
  const hasBudget = budgetEvent?.budget && budgetEvent.budget > 0;
  const { data: budgetData } = useBudgetSummary(Number(budgetEventId), {
    enabled: !!hasBudget,
  });

  const { data: cateringDetail, isLoading: isLoadingCatering } = useCateringById(
    cateringId,
    { enabled: isEdit && cateringId > 0 }
  );

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

      const createPayload = {
        name: data.name,
        perPlateprice: Number(data.perPlatePrice),
        noOfpax: Number(data.noOfPax),
        startDateTime: data.startDateTime.toISOString(),
        endDateTime: data.endDateTime.toISOString(),
        mealType: data.mealType,
      };

      const perPlate = Number(data.perPlatePrice);
      const pax = Number(data.noOfPax);
      const estimatedTotal = perPlate * pax;
      const remainingBudget = budgetData?.summary?.remaining;

      if (
        hasBudget &&
        Number.isFinite(estimatedTotal) &&
        typeof remainingBudget === "number" &&
        estimatedTotal > remainingBudget
      ) {
        const overBy = estimatedTotal - remainingBudget;
        Alert.alert(
          "Budget limit exceeded",
          `This catering plan is estimated at Rs. ${estimatedTotal.toLocaleString()} which is Rs. ${overBy.toLocaleString()} over the remaining budget.`,
          [
            { text: "Cancel", style: "cancel" },
            { text: "View Budget", onPress: handleViewBudget },
          ]
        );
        return;
      }

      const updatePayload = {
        name: data.name,
        perPlateprice: Number(data.perPlatePrice),
        noOfpax: Number(data.noOfPax),
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        mealType: data.mealType,
      };

      if (isEdit) {
        await updateCateringMutation.mutateAsync(updatePayload);
        Alert.alert("Success", "Catering plan updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        const created = await createCateringMutation.mutateAsync(createPayload);
        const expenseSubEventId =
          showSubEvent && selectedSubEventId ? selectedSubEventId : parentEventId;

        try {
          await addExpenseToCateringMutation.mutateAsync({
            cateringId: created.id,
            eventId: budgetEventId,
            subEventId: Number(eventDraft?.id) != Number(eventId) ? Number(eventDraft?.id) : expenseSubEventId,
          });
        } catch (expenseError: any) {
          if (
            expenseError?.message?.includes(
              "Allocated budget exceeds remaining budget"
            )
          ) {
            setNavigateAfterBudgetModal(true);
            setBudgetWarningVisible(true);
            return;
          }

          Alert.alert(
            "Budget expense failed",
            "Catering was created, but the budget expense could not be added. Please try again from Budget."
          );
        }

        Alert.alert("Success", "Catering plan created successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      if (error?.message?.includes("Allocated budget exceeds remaining budget")) {
        setBudgetWarningVisible(true);
        return;
      }

      Alert.alert(
        "Error",
        isEdit
          ? "Failed to update catering plan. Please try again."
          : "Failed to create catering plan. Please try again."
      );
    }
     
  };

  const handleViewBudget = () => {
    setBudgetWarningVisible(false);
    router.push({
      pathname: "/(protected)/(client-stack)/events/[eventId]/(organizer)/budget",
      params: { eventId: String(parentEventId) },
    });
  };

  const handleSkipBudgetExpense = () => {
    setBudgetWarningVisible(false);
    if (navigateAfterBudgetModal) {
      setNavigateAfterBudgetModal(false);
      router.back();
    }
  };

  const handleToggleSubEvent = () => {
    setShowSubEvent((prev) => {
      const next = !prev;
      if (!next) setSelectedSubEventId(null);
      return next;
    });
  };

  useLayoutEffect(() => {
    const isPending = isEdit
      ? updateCateringMutation.isPending
      : createCateringMutation.isPending;

    navigation.setOptions({
      title: isEdit ? "Edit Catering" : "New Catering",
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          style={{
            backgroundColor: "#ee2b8c",
            paddingHorizontal: 16,
            paddingVertical: 6,
            borderRadius: 20,
            opacity: isPending ? 0.6 : 1,
          }}
        >
          <Text className="text-white font-bold text-sm">
            {isPending ? "Saving..." : isEdit ? "Update" : "Save"}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [
    navigation,
    handleSubmit,
    onSubmit,
    createCateringMutation.isPending,
    isEdit,
    updateCateringMutation.isPending,
  ]);

  useEffect(() => {
    if (!isEdit || !cateringDetail) return;

    setValue("name", cateringDetail.name ?? "");
    setValue("mealType", cateringDetail.mealType ?? undefined);
    setValue("perPlatePrice", cateringDetail.perPlateprice ?? undefined);
    setValue(
      "noOfPax",
      cateringDetail.noOfpax !== null && cateringDetail.noOfpax !== undefined
        ? String(cateringDetail.noOfpax)
        : ""
    );
    setValue("startDateTime", new Date(cateringDetail.startDateTime));
    setValue("endDateTime", new Date(cateringDetail.endDateTime));

    const detailEventId = Number(cateringDetail.eventId);
    if (Number.isFinite(detailEventId) && detailEventId !== budgetEventId) {
      setShowSubEvent(true);
      setSelectedSubEventId(detailEventId);
    } else {
      setShowSubEvent(false);
      setSelectedSubEventId(null);
    }
  }, [cateringDetail, isEdit, budgetEventId, setValue]);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
    >
      <SafeAreaView className="flex-1 border-surface-container" edges={["bottom"]}>
        <StatusBar barStyle="dark-content" />
        <Stack.Screen options={{ title: isEdit ? "Edit Catering" : "New Catering" }} />

        {isEdit && isLoadingCatering ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-sm text-on-surface-variant">Loading catering…</Text>
          </View>
        ) : (
          <>
            <Modal
          visible={budgetWarningVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setBudgetWarningVisible(false)}
            >
              <Pressable
                className="flex-1 items-center justify-center bg-black/50 px-6"
                onPress={() => setBudgetWarningVisible(false)}
              >
                <Pressable onPress={(e) => e.stopPropagation()}>
                  <Animated.View
                    entering={ZoomIn.duration(220).withInitialValues({ transform: [{ scale: 0.8 }] })}
                    exiting={ZoomOut.duration(160)}
                    className="w-full max-w-[340px] rounded-3xl bg-white px-5 py-6"
                    style={{ elevation: 8 }}
                  >
                    <View className="items-center">
                      <View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Text className="text-lg font-bold text-primary">!</Text>
                      </View>

                      <Text className="text-center text-lg font-bold text-on-surface">
                        Budget limit reached
                      </Text>

                      <Text className="mt-2 text-center text-sm leading-6 text-on-surface-variant">
                        Your catering plan is higher than the event&apos;s allocated budget.
                        Would you like to update the budget first, or keep this catering
                        item out of the budget expense?
                      </Text>
                    </View>

                    <View className="mt-6 gap-3">
                      <TouchableOpacity
                        onPress={handleViewBudget}
                        className="h-12 items-center justify-center rounded-xl bg-primary px-4"
                      >
                        <Text className="text-sm font-bold text-white">
                          View Budget
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleSkipBudgetExpense}
                        className="h-12 items-center justify-center rounded-xl border border-surface-container bg-white px-4"
                      >
                        <Text className="text-sm font-semibold text-on-surface text-center">
                          Don&apos;t Include in Budget
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                </Pressable>
              </Pressable>
            </Modal>

            <KeyboardAwareScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          enableAutomaticScroll
            >
          <View className="space-y-6 gap-4">
            <View className="pl-1">
              <Text className="mb-2 text-sm font-semibold text-on-surface">Plan Name</Text>
              <Controller
                control={control}
                name="name"
                rules={{ required: "Required" }}
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    placeholder="e.g., Wedding Dinner"
                    className="h-14 rounded-md border border-surface-container-high bg-white p-3 pl-4 text-base text-on-surface"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.name && <Text className="mt-1 text-xs text-red-500">{errors.name.message}</Text>}
            </View>

            <View className="pl-1">
              <Text className="mb-2 text-sm font-semibold text-on-surface">Meal Type</Text>
              <Controller
                control={control}
                name="mealType"
                render={({ field: { value, onChange } }) => (
                  <Dropdown
                    style={{
                      height: 48,
                      borderWidth: 1,
                      borderColor: "#e5e7eb",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      backgroundColor: "#ffffff",
                    }}
                    data={MEAL_TYPE_OPTIONS}
                    labelField="label"
                    valueField="value"
                    value={value}
                    onChange={(item) => onChange(item.value)}
                    selectedTextStyle={{ color: "#181114", fontSize: 16 }}
                    itemTextStyle={{ color: "#181114", fontSize: 16 }}
                    activeColor="#fdf2f8"
                  />
                )}
              />
            </View>

            <View className="flex-row gap-5">
              <View className="flex-1 pl-1">
                <Text className="mb-2 text-sm font-semibold text-on-surface">Guests (Pax)</Text>
                <Controller
                  control={control}
                  name="noOfPax"
                  rules={{ required: "Required" }}
                  render={({ field: { value, onChange } }) => (
                    <View className="h-14 flex-row items-center rounded-lg border border-surface-container bg-white px-3">
                      <MaterialIcons name="groups" size={20} color="#9CA3AF" />
                      <TextInput
                        placeholder="0"
                        className="flex-1 ml-2 text-base text-on-surface"
                        value={value}
                        onChangeText={onChange}
                        keyboardType="number-pad"
                      />
                    </View>
                  )}
                />
                {errors.noOfPax && <Text className="mt-1 text-xs text-red-500">{errors.noOfPax.message}</Text>}
              </View>

              <View className="flex-1 pl-1">
                <Text className="mb-2 text-sm font-semibold text-on-surface">Price/Plate</Text>
                <Controller
                  control={control}
                  name="perPlatePrice"
                  rules={{ required: "Required" }}
                  render={({ field: { value, onChange } }) => (
                    <View className="h-14 flex-row items-center rounded-lg border border-surface-container bg-white px-3">
                      <MaterialIcons name="attach-money" size={20} color="#9CA3AF" />
                      <TextInput
                        keyboardType="number-pad"
                        placeholder="0.00"
                        className="flex-1 ml-2 text-base text-on-surface"
                        value={value !== undefined ? String(value) : ""}
                        onChangeText={onChange}
                      />
                    </View>
                  )}
                />
                {errors.perPlatePrice && <Text className="mt-1 text-xs text-red-500">{errors.perPlatePrice.message}</Text>}
              </View>
            </View>

            <View className="pl-1">
              <Text className="mb-2 text-sm font-semibold text-on-surface">Schedule</Text>
              <DateTimeRangePicker
                value={{ startDateTime, endDateTime }}
                onChange={({ startDateTime: start, endDateTime: end }) => {
                  setValue("startDateTime", start, { shouldDirty: true });
                  setValue("endDateTime", end, { shouldDirty: true });
                }}
                startLabel="Start"
                endLabel="End"
              />
            </View>
            {showSubEvent && (
                  <Animated.View
                  layout={_layoutAnimation}
                  entering={_entering}
                  exiting={_exiting}
                   className="mt-4 pt-4 border-t border-surface-container">
                    <Text className="mb-2 text-sm font-semibold text-on-surface">
                      Select Target Sub-Event
                    </Text>
                    <Dropdown
                      style={{
                        height: 48,
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        backgroundColor: "#ffffff",
                      }}
                      data={sortedSubEvents.map((item) => ({
                        label: item.title ?? "Untitled",
                        value: String(item.id),
                      }))}
                      labelField="label"
                      valueField="value"
                      placeholder="Choose sub-event"
                      value={selectedSubEventId ? String(selectedSubEventId) : null}
                      onChange={(item) => setSelectedSubEventId(Number(item.value))}
                      selectedTextStyle={{ color: "#181114", fontSize: 16 }}
                      placeholderStyle={{ color: "#9CA3AF", fontSize: 16 }}
                      itemTextStyle={{ color: "#181114", fontSize: 16 }}
                      activeColor="#fdf2f8"
                      disable={isLoadingSubEvents || sortedSubEvents.length === 0}
                    />
                    {sortedSubEvents.length === 0 && !isLoadingSubEvents && (
                      <Text className="mt-2 text-xs text-red-500">
                        No sub-events found for this event.
                      </Text>
                    )}
                  </Animated.View>
              )}
            <Animated.View className="mt-6"
            layout={_layoutAnimation}
            entering={_entering}
            exiting={_exiting}
            >
                <Pressable
                  onPress={handleToggleSubEvent}
                  className={`flex-row items-start gap-3 rounded-md p-2 ${showSubEvent ? "bg-pink-50" : "bg-white"}`}
                >
              <View className=" rounded-xl p-4">
                  

                  <View className="flex-row flex-1 justify-between items-center ">
                    <Text className="text-sm font-bold text-on-surface">
                      Link to Sub-Event
                    </Text>
                      <View className="mt-0.5">
                        {showSubEvent ? (
                          <CheckSquare size={24} color="#ee2b8c" />
                        ) : (
                          <Square size={24} color="#cbd5e1" />
                        )}
                      </View>
                  
                  </View>
                    <Text className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                      By default, this catering plan applies to the entire event.
                      Turn this on to link it to a specific sub-event.
                    </Text>

              
              </View>
                </Pressable>
            </Animated.View>
          </View>
            </KeyboardAwareScrollView>
          </>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
