import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";

const headerBackButton = () => (
  <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 8 }}>
    <Ionicons name="chevron-back" size={24} color="#ee2b8c" />
  </TouchableOpacity>
);

export default function GuestEventLayout() {
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
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="rsvp/index" options={{ title: "My RSVP" }} />
      <Stack.Screen name="accommodation" options={{ title: "Accommodation" }} />
      <Stack.Screen name="family-rsvp" options={{ title: "Family RSVP" }} />
      <Stack.Screen name="services" options={{ headerShown: false }} />
    </Stack>
  );
}
