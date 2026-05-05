import { Stack } from "expo-router";

export default function CateringDetailsLayout() {
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
      <Stack.Screen name="index" options={{ title: "Catering Details" }} />
      <Stack.Screen name="add-menu" options={{ title: "Add Menu Item" }} />
    </Stack>
  );
}
