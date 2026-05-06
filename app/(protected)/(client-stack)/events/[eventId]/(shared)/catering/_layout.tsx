import { useThrottledRouter } from "@/src/hooks/useThrottledRouter";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Pressable, TouchableOpacity } from "react-native";

const headerBackButton = () => (
  <TouchableOpacity
    onPress={() => router.back()}
    style={{ paddingRight: 8 }}
  >
    <Ionicons name="arrow-back" size={24} color="#111827" />
  </TouchableOpacity>
);

const headerAddButton = (eventId?: string) => {
  const {push}  = useThrottledRouter() ; 
  return (
    <Pressable
      className="p-2"
      onPress={() => {
        if (!eventId) {
          return;
        }
        push({
          pathname:
            "../catering/add",
        });
      }}
    >
      <MaterialIcons name="add" size={24} color="#ee2b8c" />
    </Pressable>
  );
};

export default function CateringManagementLayout() {
  const params = useLocalSearchParams<{ eventId?: string | string[]  , isGuestView?: string }>();
  const eventId = Array.isArray(params.eventId)
    ? params.eventId[0]
    : params.eventId;
  const isGuestView = params.isGuestView === "true";

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
          headerRight: () => isGuestView ? null : headerAddButton(eventId),
        }}
      />
      <Stack.Screen name="add" options={{ title: "Add Catering" }} />
      <Stack.Screen name="[cateringId]" options={{ headerShown: false }} />
    </Stack>
  );
}
