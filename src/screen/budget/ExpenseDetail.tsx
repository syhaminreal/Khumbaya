import { BudgetStatsGrid } from "@/src/components/budget";
import { Text } from "@/src/components/ui/Text";
import {
  useDeleteExpenseMutation,
  useDeletePaymentMutation,
  useExpenseById,
} from "@/src/features/budget/hooks/use-budget";
import { useSubEventsOfEvent } from "@/src/features/events/hooks/use-event";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";


type Payment = {
  id: number;
  expenseId: number;
  name: string;
  amount: number;
  paidOn: string;
  mode: string;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export default function ExpenseDetailScreen() {
  const router = useRouter();
  const { eventId, categoryId, expenseId } = useLocalSearchParams();
  const { data, isLoading } = useExpenseById(Number(expenseId));
  const { data: subEventDetail } = useSubEventsOfEvent(Number(eventId));
  const [menuVisible, setMenuVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const deleteMutation = useDeleteExpenseMutation(
    Number(expenseId || 0),
    Number(categoryId || 0),
    Number(eventId || 0)
  );
  const deletePaymentMutation = useDeletePaymentMutation(
    selectedPayment?.id || 0,
    Number(expenseId),
    Number(categoryId),
    Number(eventId)
  );

  let remainingBalance,
    percentPaid = null;
  if (!isLoading) {
    remainingBalance = data.balance;
    percentPaid = Math.round((data.spent / data.allocatedAmount) * 100);
  }

  const handleAddPaymentPress = () => {
    router.push(
      `/(protected)/(client-stack)/events/${eventId}/(organizer)/budget/${categoryId}/${expenseId}/add-payment`
    );
  };

  const handlePaymentPress = (payment: Payment) => {
    setSelectedPayment(payment);
    setPaymentModalVisible(true);
  };

  const handleEditPayment = () => {
    if (!selectedPayment) return;
    setPaymentModalVisible(false);
    router.push({
      pathname:
        `/(protected)/(client-stack)/events/${eventId}/(organizer)/budget/${categoryId}/${expenseId}/add-payment` as any,
      params: {
        paymentId: selectedPayment.id.toString(),
      },
    });
  };

  const handleDeletePayment = () => {
    if (!selectedPayment) return;
    Alert.alert(
      "Delete Payment",
      "Are you sure you want to delete this payment? This action cannot be undone.",
      [
        {
          text: "Cancel",
          onPress: () => { },
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deletePaymentMutation.mutateAsync();
              setPaymentModalVisible(false);
              Alert.alert("Success", "Payment deleted successfully!");
            } catch (error: any) {
              const errorMessage =
                error?.message || "Failed to delete payment. Please try again.";
              Alert.alert("Error", errorMessage);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleEditExpense = () => {
    setMenuVisible(false);
    router.push({
      pathname:
        `/(protected)/(client-stack)/events/[eventId]/(organizer)/budget/[categoryId]/edit-expense`,
      params: {
        expenseId: expenseId?.toString(),
        categoryId: categoryId?.toString(),
        eventId: eventId?.toString(),
      },
    });
  };

  const handleViewCatering = () => {
    if (!data?.cateringId) return;
    router.push({
      pathname:
        `/(protected)/(client-stack)/events/[eventId]/(shared)/catering/[cateringId]`,
      params: {
        eventId: eventId?.toString(),
        cateringId: data.cateringId.toString(),
      },
    });
  };

  const handleDeleteExpense = () => {
    setMenuVisible(false);
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense? This action cannot be undone.",
      [
        {
          text: "Cancel",
          onPress: () => { },
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync();
              Alert.alert("Success", "Expense deleted successfully!", [
                {
                  text: "OK",
                  onPress: () => {
                    router.back();
                  },
                },
              ]);
            } catch (error: any) {
              const errorMessage =
                error?.message || "Failed to delete expense. Please try again.";
              Alert.alert("Error", errorMessage);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#ee2b8c" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f8f6f7]">
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              className="pr-4"
              activeOpacity={0.7}
            >
              <MaterialIcons name="more-vert" size={24} color="#181114" />
            </TouchableOpacity>
          ),
        }}
      />
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setMenuVisible(false)}
        >
          <View className="absolute bottom-0 bg-white shadow-lg w-full pb-4">
            <TouchableOpacity
              onPress={handleEditExpense}
              className="flex-row items-center gap-3 px-5 py-4 border-b border-gray-100"
            >
              <MaterialIcons name="edit" size={20} color="#181114" />
              <Text className="text-[#181114]" variant="h2">
                Edit Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteExpense}
              className="flex-row items-center gap-3 px-5 py-4"
            >
              <MaterialIcons name="delete" size={20} color="#ee2b8c" />
              <Text className="text-[#ee2b8c]" variant="h2">
                Delete Expense
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={paymentModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setPaymentModalVisible(false)}
        >
          <View className="flex-1 items-center justify-center px-6">
            <Pressable
              className="bg-white rounded-3xl p-6 w-full"
              onPress={() => { }}
            >
              <Text className="text-[#181114] text-lg mb-4" variant="h1">
                {selectedPayment?.name}
              </Text>

              <View className="gap-4 mb-6 bg-gray-50 p-4 rounded-2xl">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600" variant="h2">
                    Amount
                  </Text>
                  <Text className="text-[#181114] " variant="h2">
                    Rs. {selectedPayment?.amount?.toLocaleString()}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600" variant="h2">
                    Paid On
                  </Text>
                  <Text className="text-[#181114]" variant="h2">
                    {selectedPayment?.paidOn
                      ? new Date(selectedPayment.paidOn).toLocaleDateString()
                      : "N/A"}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600" variant="h2">
                    Mode
                  </Text>
                  <Text className="text-[#181114]" variant="h2">
                    {selectedPayment?.mode === "bank_transfer"
                      ? "Bank Transfer"
                      : selectedPayment?.mode?.replace(/_/g, " ")}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-600" variant="h2">
                    Status
                  </Text>
                  <View className="bg-emerald-100 px-3 py-1 rounded-md">
                    <Text className="text-emerald-700 text-xs" variant="h2">
                      {selectedPayment?.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {selectedPayment?.notes && (
                  <View>
                    <Text className="text-gray-600 mb-1" variant="h2">
                      Notes
                    </Text>
                    <Text className="text-[#181114]" variant="h2">
                      {selectedPayment.notes}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleEditPayment}
                  className="flex-1 h-12 bg-[#ee2b8c] rounded-md items-center justify-center flex-row gap-2"
                >
                  <MaterialIcons name="edit" size={20} color="white" />
                  <Text className="text-white" variant="h2">
                    Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeletePayment}
                  className="flex-1 h-12 bg-red-500 rounded-md items-center justify-center flex-row gap-2"
                >
                  <MaterialIcons name="delete" size={20} color="white" />
                  <Text className="text-white" variant="h2">
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-24"
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-5 mt-5 bg-white rounded-md p-6 shadow-sm border border-gray-100 overflow-hidden">
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1">
              <Text variant="h1" className="text-[#181114] mb-2 text-2xl">
                {data.name}
              </Text>
              {data.cateringId ? (
                <TouchableOpacity
                  onPress={handleViewCatering}
                  activeOpacity={0.7}
                  className="self-start rounded-full border border-pink-200 bg-pink-50 px-3 py-1"
                >
                  <Text className="text-[11px] font-semibold text-[#9d1759]">
                    View Catering
                  </Text>
                </TouchableOpacity>
              ) : null}
              <View className="gap-3">
                {data.businessId && (
                  <View className="flex-row items-center gap-2">
                    <Text variant="caption" className="text-base">
                      {data.businessId}
                    </Text>
                  </View>
                )}
                {data.subEventid && (() => {
                  const subEvent = (subEventDetail || []).find((s: any) => s.id === data.subEventid);
                  return subEvent ? (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      className="self-start bg-pink-50 px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border border-pink-200"
                      onPress={() => {
                        router.push({
                          pathname: `/(protected)/(client-stack)/events/[eventId]/(shared)/(subevent)/[subEventId]/sub-event-detail`,
                          params: { eventId: eventId?.toString(), subEventId: subEvent.id.toString() },
                        });
                      }}
                    >
                      <MaterialIcons name="local-activity" size={14} color="#ee2b8c" />
                      <Text className="text-xs text-[#ee2b8c] font-semibold" variant="h2">
                        {subEvent.title ?? subEvent.name ?? "Untitled sub-event"}
                      </Text>
                    </TouchableOpacity>
                  ) : null;
                })()}
              </View>
            </View>
          </View>

          <View className="bg-[#ee2b8c]/10 rounded-md p-6 flex-row items-center gap-4 border border-[#ee2b8c]/70">
            <View>
              <Text
                variant="h2"
                className="text-[#9d1759] uppercase tracking-wider mb-1 text-xs"
              >
                Remaining Balance
              </Text>
              <Text variant="h1" className="text-[#ee2b8c] text-xl">
                Rs. {remainingBalance?.toLocaleString()}
              </Text>
            </View>

            <View className="h-10 w-px bg-[#ee2b8c]/20" />

            <View className="flex-1 items-center gap-1">
              <View className="h-2 w-24 bg-gray-200 rounded-md overflow-hidden">
                <View
                  className="h-full bg-[#ee2b8c]"
                  style={{ width: `${percentPaid ?? 0}%` }}
                />
              </View>
              <Text variant="h2" className="text-gray-500">
                {percentPaid ?? 0}% Spent
              </Text>
            </View>
          </View>

          <BudgetStatsGrid
            stats={[
              { label: "Allocated", value: data.allocatedAmount },
              { label: "Spent", value: data.spent },
              { label: "Balance", value: remainingBalance },
            ]}
            variant="expense"
          />
        </View>

        <View className="mx-5 mt-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text variant="h2" className="text-[#181114] text-lg">
              Payment History
            </Text>
            <View className="bg-gray-100 px-3 py-1 rounded-full">
              <Text variant="h2" className="text-gray-600">
                {data.payments.length} Payments
              </Text>
            </View>
          </View>

          {data.payments.length > 0 ? (
            <View className="gap-3">
              {data.payments.map((payment: Payment) => (
                <TouchableOpacity
                  key={payment.id}
                  activeOpacity={0.7}
                  className="bg-white rounded-md p-5 shadow-sm border border-gray-100"
                  onPress={() => handlePaymentPress(payment)}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-4 flex-1">
                      {/* Details */}
                      <View className="flex-1">
                        <Text variant="h2" className="text-[#181114] mb-1">
                          {payment.name}
                        </Text>
                        <View className="flex-row items-center gap-2">
                          <Text
                            variant="h2"
                            className="text-on-surface-variant"
                          >
                            {new Date(payment.paidOn).toLocaleDateString()}
                          </Text>
                          <Text variant="h2" className="text-gray-300">
                            •
                          </Text>
                          <View className="flex-row items-center gap-1">
                            <Text variant="h2" className="text-gray-500">
                              {payment.mode === "bank_transfer"
                                ? "Bank Transfer"
                                : payment.mode.replace(/_/g, " ")}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text variant="h2" className="text-[#181114] mb-2">
                        Rs. {payment?.amount?.toLocaleString()}
                      </Text>
                      <View className="bg-emerald-100 px-2 py-0.5 rounded-lg">
                        <Text
                          variant="h2"
                          className="text-emerald-700 uppercase text-xs"
                        >
                          {payment.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-3xl p-8 items-center gap-3 border border-dashed border-gray-200">
              <MaterialIcons name="add-card" size={40} color="#d1d5db" />
              <Text variant="h2" className="text-gray-500 text-center">
                No payments yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute right-5 bottom-8 flex-row items-center gap-2 px-6 py-3 rounded-full bg-[#ee2b8c] shadow-lg active:opacity-80"
        activeOpacity={0.8}
        onPress={handleAddPaymentPress}
      >
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text className="text-white text-xs  tracking-tight" variant="h2">
          Add Payment
        </Text>
      </TouchableOpacity>
    </View>
  );
}
