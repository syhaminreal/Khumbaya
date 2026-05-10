import { Stack } from "expo-router";

export default function LogisticsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="add-logistics" />
      <Stack.Screen name="index" />
      <Stack.Screen name="manage-logistics" />
    </Stack>

  );
}
