import { Stack } from "expo-router";
export default function EventStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(organizer)" options={{ headerShown: false }} />
      <Stack.Screen name="(guest)" options={{ headerShown: false }} />
      <Stack.Screen name="(shared)" options={{ headerShown: false }} />
    </Stack>
  );
}
