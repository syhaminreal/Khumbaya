import { Ionicons } from "@expo/vector-icons";
import { Stack, router as expoRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

const headerBackButton = () => (
  <TouchableOpacity
    onPress={() => expoRouter.back()}
    style={{ paddingRight: 8 }}
  >
    <Ionicons name="arrow-back" size={24} color="#111827" />
  </TouchableOpacity>
);

export default function BudgetLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        headerShown: true,
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontFamily: "PlusJakartaSans-Bold",
          fontSize: 18,
        },
        headerLeft: headerBackButton,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Budget" }}
      />
      <Stack.Screen
        name="[categoryId]/index"
        options={{ title: "Category Details" }}
      />
      <Stack.Screen
        name="[categoryId]/add-expense"
        options={{ title: "New Expense" }}
      />
      <Stack.Screen
        name="[categoryId]/[expenseId]/index"
        options={{ title: "Expense Details" }}
      />
      <Stack.Screen
        name="[categoryId]/[expenseId]/add-payment"
        options={{ title: "Add Payment" }}
      />
      <Stack.Screen
        name="addBudgetItem"
        options={{ title: "Add Budget Item" }}
      />
      <Stack.Screen
        name="edit-budget-category"
        options={{ title: "Edit Category" }}
      />
      <Stack.Screen
        name="edit-payment"
        options={{ title: "Edit Payment" }}
      />
      <Stack.Screen
        name="edit-expense"
        options={{ title: "Edit Expense" }}
      />
    </Stack>
  );
}
