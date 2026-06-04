import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";

export default function BusinessDetailedLayout() {
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#ffffff" },
        headerTitleStyle: { fontSize: 18, fontWeight: "800", color: "#181114" },
        headerShadowVisible: true,
        headerLeft: () => (
          <Pressable onPress={() => router.back()} style={{ marginLeft: 12 }}>
            <MaterialIcons name="arrow-back" size={24} color="#181114" />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="detailed" options={{ title: "Business Details" }} />
      <Stack.Screen name="reviews" options={{ title: "Business Reviews" }} />
      <Stack.Screen name="edit" options={{ title: "Business Details" }} />
      <Stack.Screen name="venue/create" options={{ headerShown: false }} />
      <Stack.Screen
        name="venue/[venueId]/update"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
