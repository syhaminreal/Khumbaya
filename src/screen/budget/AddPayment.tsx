import { Text } from "@/src/components/ui/Text";
import {
  usePaymentById,
  usePaymentMutation,
  useUpdatePaymentMutation,
} from "@/src/features/budget/hooks/use-budget";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

type PaymentStatus = "cleared" | "pending" | "failed";
type PaymentMode = "bank_transfer" | "cash" | "card" | "check" | "other";

type PaymentFormData = {
  amount: string;
  paymentName: string;
  paidOn: Date;
  paymentMode: PaymentMode;
  status: PaymentStatus;
  notes: string;
};

interface AddPaymentScreenProps {
  editMode?: boolean;
}

export default function AddPaymentScreen({
  editMode = false,
}: AddPaymentScreenProps) {
  const router = useRouter();
  const { eventId, categoryId, expenseId, paymentId } = useLocalSearchParams();
  const isEditMode = editMode || !!paymentId;

  const { data: paymentData, isLoading: isPaymentLoading } = usePaymentById(
    Number(paymentId || 0),
    { enabled: isEditMode && !!paymentId }
  );

  const { control, handleSubmit, setValue, reset } = useForm<PaymentFormData>({
    defaultValues: {
      amount: "",
      paymentName: "",
      paidOn: new Date(),
      paymentMode: "bank_transfer",
      status: "cleared",
      notes: "",
    },
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { mutate: createPayment, isPending } = usePaymentMutation(
    Number(expenseId),
    Number(categoryId),
    Number(eventId)
  );

  const updateMutation = useUpdatePaymentMutation(
    Number(paymentId || 0),
    Number(expenseId),
    Number(categoryId),
    Number(eventId)
  );

  useEffect(() => {
    if (isEditMode && paymentData) {
      setValue("amount", paymentData.amount?.toString() || "");
      setValue("paymentName", paymentData.name || "");
      setValue("paymentMode", paymentData.mode || "bank_transfer");
      setValue("status", paymentData.status || "cleared");
      setValue("notes", paymentData.notes || "");
      if (paymentData.paidOn) {
        const date = new Date(paymentData.paidOn);
        setSelectedDate(date);
        setValue("paidOn", date);
      }
    }
  }, [isEditMode, paymentData, setValue]);

  const paymentModes = [
    { label: "Bank Transfer", value: "bank_transfer" },
    { label: "Cash", value: "cash" },
    { label: "Card", value: "card" },
    { label: "Check", value: "check" },
    { label: "Other", value: "other" },
  ];

  const formatDateToISO = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    date?: Date
  ) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    if (!date || isPending) return;

    setSelectedDate(date);
    setValue("paidOn", date);
    setShowDatePicker(false);
  };

  const handleSavePayment = (data: PaymentFormData) => {
    if (!data.amount || !data.paymentName || !data.paymentMode) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }

    const paymentPayload = {
      name: data.paymentName,
      amount: parseFloat(data.amount),
      paidOn: formatDateToISO(selectedDate),
      mode: data.paymentMode,
      status: data.status,
      notes: data.notes || undefined,
    };

    if (isEditMode) {
      updateMutation.mutate(paymentPayload, {
        onSuccess: () => {
          Alert.alert("Success", "Payment updated successfully");
          reset();
          router.back();
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message ||
            "Failed to update payment. Please try again.";
          Alert.alert("Error", errorMessage);
        },
      });
    } else {
      createPayment(paymentPayload, {
        onSuccess: () => {
          Alert.alert("Success", "Payment recorded successfully");
          reset();
          router.back();
        },
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message ||
            "Failed to record payment. Please try again.";
          Alert.alert("Error", errorMessage);
        },
      });
    }
  };

  if (isEditMode && isPaymentLoading) {
    return (
      <View className="flex-1 bg-[#f8f6f7] items-center justify-center">
        <ActivityIndicator size="large" color="#ee2b8c" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#f8f6f7]"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-3 px-5 pt-4 pb-6">
          <View className="flex-1">
            <Text variant="h1" className="text-[#181114] text-2xl">
              {isEditMode ? "Update Payment" : "Record Payment"}
            </Text>
            <Text variant="caption" className="text-gray-500">
              {isEditMode
                ? "Make changes to your payment details."
                : "Log a new transaction for your expenses."}
            </Text>
          </View>
        </View>

        <View className="mx-5">
          <View className="bg-white rounded-md p-6 shadow-sm border border-gray-100">
            {/* Total Amount */}
            <View className="mb-8 items-center py-4">
              <Text variant="caption" className="text-gray-400 uppercase mb-2">
                Amount
              </Text>
              <View className="flex-row items-center justify-center gap-2">
                <Text variant="h1" className="text-3xl text-[#ee2b8c]">
                  ₹
                </Text>
                <Controller
                  control={control}
                  name="amount"
                  rules={{ required: "Amount is required" }}
                  render={({ field: { value, onChange } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      className="text-4xl text-[#181114] bg-transparent text-center w-48"
                      placeholderTextColor="#e5e7eb"
                      editable={!isPending}
                    />
                  )}
                />
              </View>
            </View>

            <View className="mb-5">
              <Text variant="h2" className="text-[#181114] mb-2 text-sm">
                Payment Name
              </Text>
              <Controller
                control={control}
                name="paymentName"
                rules={{ required: "Payment name is required" }}
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="e.g., Booking Advance"
                    maxLength={255}
                    className="px-4 py-3 bg-gray-50 rounded-md border border-gray-100 text-[#181114]"
                    placeholderTextColor="#a1a5ab"
                    editable={!isPending}
                  />
                )}
              />
            </View>

            {/* Paid On - Native Date Picker */}
            <View className="mb-5">
              <Text variant="h2" className="text-[#181114] mb-2 text-sm">
                Paid On
              </Text>
              <Controller
                control={control}
                name="paidOn"
                rules={{ required: "Payment date is required" }}
                render={() => (
                  <>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(true)}
                      disabled={isPending}
                      className="flex-row items-center justify-between px-4 py-3 bg-gray-50 rounded-md border border-gray-100"
                      activeOpacity={0.8}
                    >
                      <Text className="text-[#181114] text-sm">
                        {selectedDate.toLocaleDateString()}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        Tap to change
                      </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                      <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        is24Hour={false}
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                      />
                    )}
                  </>
                )}
              />
            </View>

            {/* Payment Mode - Dropdown */}
            <View className="mb-5">
              <Text variant="h2" className="text-[#181114] mb-2 text-sm">
                Payment Mode
              </Text>
              <Controller
                control={control}
                name="paymentMode"
                rules={{ required: "Payment mode is required" }}
                render={({ field: { value, onChange } }) => (
                  <Dropdown
                    style={{
                      height: 50,
                      borderWidth: 1,
                      borderColor: "#e5e7eb",
                      borderRadius: 4,
                      paddingHorizontal: 12,
                      backgroundColor: "#f9fafb",
                      opacity: isPending ? 0.5 : 1,
                    }}
                    placeholderStyle={{ color: "#9CA3AF" }}
                    selectedTextStyle={{ color: "#181114", fontSize: 14 }}
                    data={paymentModes}
                    labelField="label"
                    valueField="value"
                    placeholder="Select mode"
                    value={value}
                    onChange={(item: any) => onChange(item.value)}
                    disable={isPending}
                  />
                )}
              />
            </View>

            {/* Status */}
            <View className="mb-5">
              <Text variant="h2" className="text-[#181114] mb-3 text-sm">
                Status
              </Text>
              <Controller
                control={control}
                name="status"
                render={({ field: { value, onChange } }) => (
                  <View className="flex-row gap-3">
                    {(
                      [
                        { label: "Cleared", value: "cleared" },
                        { label: "Pending", value: "pending" },
                        { label: "Failed", value: "failed" },
                      ] as const
                    ).map((statusOption) => (
                      <TouchableOpacity
                        key={statusOption.value}
                        onPress={() => onChange(statusOption.value)}
                        disabled={isPending}
                        className={`flex-1 py-3 px-2 rounded-md border-2 items-center ${
                          value === statusOption.value
                            ? statusOption.value === "cleared"
                              ? "bg-emerald-50 border-emerald-500"
                              : statusOption.value === "pending"
                                ? "bg-amber-50 border-amber-500"
                                : "bg-red-50 border-red-500"
                            : "bg-gray-50 border-gray-100"
                        } ${isPending ? "opacity-50" : ""}`}
                      >
                        <Text
                          variant="caption"
                          className={`text-xs ${
                            value === statusOption.value
                              ? statusOption.value === "cleared"
                                ? "text-emerald-700"
                                : statusOption.value === "pending"
                                  ? "text-amber-700"
                                  : "text-red-700"
                              : "text-gray-500"
                          }`}
                        >
                          {statusOption.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>

            {/* Notes */}
            <View className="mb-2">
              <Text variant="h2" className="text-[#181114] mb-2 text-sm">
                Notes (Optional)
              </Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Add any extra details here..."
                    maxLength={300}
                    multiline
                    numberOfLines={3}
                    className="px-4 py-3 bg-gray-50 rounded-md border border-gray-100 text-[#181114]"
                    placeholderTextColor="#a1a5ab"
                    editable={!isPending}
                  />
                )}
              />
            </View>
          </View>

          <View className="gap-3 mt-8">
            <TouchableOpacity
              onPress={handleSubmit(handleSavePayment)}
              disabled={isPending}
              className={`flex-row items-center justify-center gap-2 py-4 rounded-md ${
                isPending ? "bg-gray-300" : "bg-[#ee2b8c]"
              }`}
            >
              {isPending && <ActivityIndicator size="small" color="#fff" />}
              <Text variant="h2" className="text-white text-base">
                {isPending ? "Saving..." : "Save Payment"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              disabled={isPending}
              className={`border-2 border-gray-200 py-4 rounded-md items-center active:bg-gray-50 ${
                isPending ? "opacity-50" : ""
              }`}
            >
              <Text variant="h2" className="text-gray-500 text-base">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
