import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function OrganizerEventDetailLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Event Detail", animation: "slide_from_left" }} />
      <Stack.Screen name="budget" options={{ headerShown: false }} />
      <Stack.Screen name="gallery" options={{ title: "Gallery" }} />
      <Stack.Screen name="guests" options={{ headerShown: false }} />
      <Stack.Screen name="vendor" options={{ title: "Vendors" }} />
      <Stack.Screen name="vendor-detail/[vendorId]" options={{ headerShown: true }} />
      <Stack.Screen name="edit-event" options={{ headerShown: false }} />
      <Stack.Screen
        name="addeventmember"
        options={{
          title: "Add Event Member",
          presentation: Platform.OS === "ios" ? "formSheet" : "modal",
          animation: "fade_from_bottom",
          headerRight: () => null,
        }}
      />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen
        name="contactpicker"
        options={{
          title: "Select Contact",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
