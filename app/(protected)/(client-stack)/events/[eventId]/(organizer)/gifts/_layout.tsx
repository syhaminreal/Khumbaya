import { Stack } from "expo-router";

export default function OrganizerGiftLayout() {
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
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="add" options={{ title: "Create Gift" }} />
      <Stack.Screen name="[giftId]" options={{ title: "Edit Gift" }} />
      <Stack.Screen name="add-category" options={{ title: "Create Gift Category" }} />
      <Stack.Screen name="categories/[categoryId]" options={{ title: "Edit Gift Category" }} />
    </Stack>
  );
}
