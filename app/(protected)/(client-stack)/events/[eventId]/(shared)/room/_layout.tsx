import { Stack } from "expo-router";

export default function RoomLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="add" />
      <Stack.Screen name="edit/[roomNumber]" />
    </Stack>
  );
}
