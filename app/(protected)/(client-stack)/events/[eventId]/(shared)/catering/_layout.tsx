import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router as expoRouter, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, TouchableOpacity } from "react-native";

const headerBackButton = () => (
  <TouchableOpacity
    onPress={() => expoRouter.back()}
    style={{ paddingRight: 8 }}
  >
    <Ionicons name="arrow-back" size={24} color="#111827" />
  </TouchableOpacity>
);

const headerAddButton = (eventId?: string) => {
  return (
    <Pressable
      className="p-2"
      onPress={() => {
        if (!eventId) {
          return;
        }
        expoRouter.push({
          pathname:
            "/(protected)/(client-stack)/events/[eventId]/(organizer)/catering/add",
          params: { eventId },
        });
      }}
    >
      <MaterialIcons name="add" size={24} color="#ee2b8c" />
    </Pressable>
  );
};

export default function CateringManagementLayout() {
  const params = useLocalSearchParams<{ eventId?: string | string[] }>();
  const eventId = Array.isArray(params.eventId)
    ? params.eventId[0]
    : params.eventId;

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
      <Stack.Screen
        name="index"
        options={{
          title: "Catering Management",
          headerRight: () => headerAddButton(eventId),
        }}
      />
      <Stack.Screen name="add" options={{ title: "Add Catering" }} />
      <Stack.Screen name="[cateringId]" options={{ headerShown: false }} />
    </Stack>
  );
}
