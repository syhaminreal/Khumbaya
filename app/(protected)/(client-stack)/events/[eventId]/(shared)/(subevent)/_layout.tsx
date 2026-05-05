import { Stack } from "expo-router";

export default function SubEventLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="[subEventId]/sub-event-detail"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="[subEventId]/edit-sub-event"
        options={{ title: "Edit Sub Event" }}
      />
      <Stack.Screen name="index" options={{ title: "Sub Event" }} />
    </Stack>
  );
}
