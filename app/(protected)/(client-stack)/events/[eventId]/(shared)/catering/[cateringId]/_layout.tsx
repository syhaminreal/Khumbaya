import { Stack } from "expo-router";

export default function CateringDetailsLayout() {
  return (
    <Stack
     
    >
      <Stack.Screen name="index"  />
      <Stack.Screen name="add-menu" />
      <Stack.Screen name="edit" options={{ title: "Edit Catering" }} />
    </Stack>
  );
}
