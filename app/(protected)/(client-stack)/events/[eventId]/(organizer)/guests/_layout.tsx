import { Stack } from "expo-router";

export default function EventGuestManagementLayout() {
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
      <Stack.Screen name="index" options={{headerShown: false}} />
      <Stack.Screen name="familymember" options={{ title: "Family Members" }} />
      <Stack.Screen name="addguest" options={{ title: "Add Guest" }} />
      <Stack.Screen name="[guestDetailId]" />
      <Stack.Screen name="contact-review" options={{ headerShown:false }} />
      <Stack.Screen name="excel-review" options={{ headerShown:false }} />
      <Stack.Screen name="import-guests" options={{ title: "Import Guests" }} />
      <Stack.Screen name="gifts-add" options={{ headerShown:false }} />
    </Stack>
  );
}
  