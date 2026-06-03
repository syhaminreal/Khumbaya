import { Text } from "@/src/components/ui/Text";
import {
  useExpenseById,
  useExpenseMutation,
  useUpdateExpenseMutation,
} from "@/src/features/budget/hooks/use-budget";
import { expenseFormSchema } from "@/src/features/budget/schema";
import { useGetBusinessByEventId } from "@/src/features/business/hooks/use-business";
import { useSubEventsOfEvent } from "@/src/features/events/hooks/use-event";
import { MaterialIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { z } from "zod";

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface AddExpenseScreenProps {
  editMode?: boolean;
}

export default function AddExpenseScreen({
  editMode = false,
}: AddExpenseScreenProps) {
  const router = useRouter();
  const { categoryId, eventId, expenseId, subEventid } = useLocalSearchParams();

  const parsedEventId = useMemo(() => {
    return eventId ? Number(JSON.parse(eventId.toString())) : 0;
  }, [eventId]);

  const parsedCategoryId = useMemo(() => {
    return categoryId ? Number(JSON.parse(categoryId.toString())) : 0;
  }, [categoryId]);
  const { data: subEvents } = useSubEventsOfEvent(parsedEventId);
  const { data: vendors = [] } = useGetBusinessByEventId(parsedEventId);

  const resolvedSubEventId = useMemo(() => {
    return subEventid ? Number(JSON.parse(subEventid.toString())) : undefined;
  }, [subEventid]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const subEventOptions = useMemo(
    () =>
      (subEvents || []).map(
        (item: { title?: string; name?: string; id: number }) => ({
          label: `${item.title ?? "Untitled sub-event"} `,
          value: String(item.id),
        })
      ),
    [subEvents]
  );

  const vendorOptions = useMemo(
    () =>
      (vendors || []).map((vendor: any) => ({
        label: vendor.businessName ?? "Unnamed vendor",
        value: String(vendor.id),
      })),
    [vendors]
  );

  // Fetch expense data in edit mode
  const { data: expenseData, isLoading: isExpenseLoading } = useExpenseById(
    Number(expenseId || 0),
    { enabled: editMode && !!expenseId }
  );

  const expenseMutation = useExpenseMutation(parsedCategoryId, parsedEventId);

  const updateMutation = useUpdateExpenseMutation(
    Number(expenseId || 0),
    parsedCategoryId,
    parsedEventId
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      name: "",
      allocatedAmount: "",
      nextDueDate: "",
      subEventid: resolvedSubEventId,
      paidTo: undefined,
      notes: "",
    },
  });

  const nextDueDate = watch("nextDueDate");

  useEffect(() => {
    if (editMode && expenseData) {
      setValue("name", expenseData.name);
      setValue(
        "allocatedAmount",
        expenseData.allocatedAmount?.toString() || ""
      );
      setValue("nextDueDate", expenseData.nextDueDate || "");
      setValue("notes", expenseData.notes || "");
      if (typeof expenseData.subEventid === "number") {
        setValue("subEventid", expenseData.subEventid);
      }
      if (typeof expenseData.paidTo === "number") {
        setValue("paidTo", expenseData.paidTo);
      }
    }
  }, [editMode, expenseData, setValue]);

  //Use call back function to get the data

  const handleDateChange = (event: any, date: Date | undefined) => {
    setShowDatePicker(false);
    if (date) {
      const formattedDate = date.toISOString().split("T")[0];
      setValue("nextDueDate", formattedDate);
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      console.log("This is the kdhfkajhdf ", data);
      const payload = {
        name: data.name,
        allocatedAmount: parseFloat(data.allocatedAmount),
        nextDueDate: data.nextDueDate || undefined,
        notes: data.notes || undefined,
        subEventid: data.subEventid ?? resolvedSubEventId,
        paidTo: data.paidTo,
      };

      const mutation = editMode ? updateMutation : expenseMutation;
      await mutation.mutateAsync(payload);

      const action = editMode ? "updated" : "created";
      Alert.alert("Success", `Expense ${action} successfully!`, [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to save expense. Please try again."
      );
    }
  };

  if (editMode && isExpenseLoading) {
    return (
      <View className="flex-1 bg-[#f8f6f7] items-center justify-center">
        <ActivityIndicator size="large" color="#ee2b8c" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 bg-[#f8f6f7]">
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-32"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-3 ">
            {/* Form Card */}
            <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 gap-6 mb-8">
              {/* Expense Name */}
              <View className="gap-2">
                <Text className="text-sm text-gray-600 ml-1" variant="h2">
                  Expense Name
                </Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <TextInput
                        className="w-full h-14 bg-[#f8f6f7] px-4 rounded-md text-[#181114] border border-gray-100 focus:border-[#ee2b8c]"
                        placeholder="e.g. Adobe Creative Cloud"
                        placeholderTextColor="#999"
                        value={value}
                        onChangeText={onChange}
                      />
                      {errors.name && (
                        <Text
                          className="text-xs text-red-500 mt-1"
                          variant="h2"
                        >
                          {errors.name.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>
              <View className="gap-2">
                <Text className="text-sm text-gray-600 ml-1" variant="h2">
                  Sub Event
                </Text>
                <Controller
                  control={control}
                  name="subEventid"
                  render={({ field: { onChange, value } }) => (
                    <Dropdown
                      style={{
                        height: 56,
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        borderRadius: 6,
                        paddingHorizontal: 16,
                        backgroundColor: "#f8f6f7",
                      }}
                      data={subEventOptions}
                      labelField="label"
                      valueField="value"
                      placeholder="Select sub-event"
                      value={typeof value === "number" ? String(value) : null}
                      onChange={(item) => onChange(Number(item.value))}
                      selectedTextStyle={{
                        color: "#181114",
                        fontSize: 15,
                        fontWeight: "600",
                      }}
                      placeholderStyle={{ color: "#9CA3AF", fontSize: 15 }}
                      itemTextStyle={{ color: "#181114", fontSize: 15 }}
                      activeColor="#fdf2f8"
                      disable={subEventOptions.length === 0}
                    />
                  )}
                />
                {subEventOptions.length === 0 && (
                  <Text className="text-xs text-gray-400 ml-1" variant="h2">
                    No sub-events found for this event.
                  </Text>
                )}
              </View>

              <View className="gap-2">
                <Text className="text-sm text-gray-600 ml-1" variant="h2">
                  Paid To (Vendor)
                </Text>
                <Controller
                  control={control}
                  name="paidTo"
                  render={({ field: { onChange, value } }) => (
                    <Dropdown
                      style={{
                        height: 56,
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        borderRadius: 6,
                        paddingHorizontal: 16,
                        backgroundColor: "#f8f6f7",
                      }}
                      data={vendorOptions}
                      labelField="label"
                      valueField="value"
                      placeholder="Select vendor (optional)"
                      value={typeof value === "number" ? String(value) : null}
                      onChange={(item) => onChange(Number(item.value))}
                      selectedTextStyle={{
                        color: "#181114",
                        fontSize: 15,
                        fontWeight: "600",
                      }}
                      placeholderStyle={{ color: "#9CA3AF", fontSize: 15 }}
                      itemTextStyle={{ color: "#181114", fontSize: 15 }}
                      activeColor="#fdf2f8"
                      disable={vendorOptions.length === 0}
                    />
                  )}
                />
                {vendorOptions.length === 0 && (
                  <Text className="text-xs text-gray-400 ml-1" variant="h2">
                    No vendors found for this event.
                  </Text>
                )}
              </View>

              <View className="gap-6">
                {/* Allocated Amount */}
                <View className="gap-2">
                  <Text className="text-sm text-gray-600 ml-1" variant="h2">
                    Allocated Amount
                  </Text>
                  <Controller
                    control={control}
                    name="allocatedAmount"
                    render={({ field: { onChange, value } }) => (
                      <View>
                        <View className="relative">
                          <Text
                            className="absolute left-4 top-3.5 text-sm text-gray-600"
                            variant="h2"
                          >
                            Rs.
                          </Text>
                          <TextInput
                            className="w-full h-14 bg-[#f8f6f7] pl-12 pr-4 rounded-md text-[#181114] border border-gray-100"
                            placeholder="0.00"
                            placeholderTextColor="#999"
                            keyboardType="decimal-pad"
                            value={value}
                            onChangeText={onChange}
                          />
                        </View>
                        {errors.allocatedAmount && (
                          <Text
                            className="text-xs text-red-500 mt-1"
                            variant="h2"
                          >
                            {errors.allocatedAmount.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                </View>

                {/* Due Date */}
                <View className="gap-2">
                  <View className="flex-row items-center gap-1">
                    <Text className="text-sm text-gray-600 ml-1" variant="h2">
                      Next Due Date
                    </Text>
                    <Text className="text-[10px] text-gray-400" variant="h2">
                      (Optional)
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="h-14 bg-[#f8f6f7] px-4 rounded-md border border-gray-100 flex-row items-center"
                  >
                    <MaterialIcons
                      name="calendar-today"
                      size={20}
                      color="#999"
                    />
                    <Text className="ml-3 text-[#181114]" variant="h2">
                      {nextDueDate ? nextDueDate : "Select date"}
                    </Text>
                  </TouchableOpacity>
                  {errors.nextDueDate && (
                    <Text className="text-xs text-red-500 mt-1" variant="h2">
                      {errors.nextDueDate.message}
                    </Text>
                  )}
                  {showDatePicker && (
                    <DateTimePicker
                      value={nextDueDate ? new Date(nextDueDate) : new Date()}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                    />
                  )}
                </View>
              </View>

              {/* Notes */}
              <View className="gap-2">
                <View className="flex-row items-center gap-1">
                  <Text className="text-sm text-gray-600 ml-1" variant="h2">
                    Notes
                  </Text>
                  <Text className="text-[10px] text-gray-400" variant="h2">
                    (Optional)
                  </Text>
                </View>
                <Controller
                  control={control}
                  name="notes"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <TextInput
                        className="w-full bg-[#f8f6f7] px-4 py-3 rounded-md text-[#181114] border border-gray-100"
                        placeholder="Additional details or terms..."
                        placeholderTextColor="#999"
                        value={value}
                        onChangeText={onChange}
                        multiline
                        numberOfLines={3}
                      />
                      {errors.notes && (
                        <Text
                          className="text-xs text-red-500 mt-1"
                          variant="h2"
                        >
                          {errors.notes.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={expenseMutation.isPending}
                className="h-16 bg-[#ee2b8c] rounded-md flex items-center justify-center mt-2"
                activeOpacity={0.8}
              >
                {expenseMutation.isPending ? (
                  <MaterialIcons
                    name="hourglass-empty"
                    size={24}
                    color="white"
                  />
                ) : (
                  <Text className="text-white text-base" variant="h2">
                    Create Expense
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
