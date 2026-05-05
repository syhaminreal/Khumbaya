import { Ionicons } from "@expo/vector-icons";
import { router as expoRouter, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";

const headerBackButton = () => (
  <TouchableOpacity onPress={() => expoRouter.back()} style={{ paddingRight: 8 }}>
    <Ionicons name="arrow-back" size={24} color="#111827" />
  </TouchableOpacity>
);

export default function TasklistLayout() {
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
      <Stack.Screen name="index" options={{ title: "Checklist" }} />
      <Stack.Screen name="detail" options={{ title: "Task Details" }} />
    </Stack>
  );
}
