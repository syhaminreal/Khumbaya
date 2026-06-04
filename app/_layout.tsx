import { useAuthStore } from "@/src/store/AuthStore";
import { setQueryClient } from "@/src/store/queryClientManager";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "./global.css";

const queryClient = new QueryClient();
setQueryClient(queryClient);

SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const { token, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Keep a ref so the effect can read the latest segments
  // without segments itself being a dependency (prevents infinite loop)
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;

  useEffect(() => {
    // Wait until auth hydration is complete
    if (isLoading) return;

    console.log("User token:", token);

    const inAuthGroup = segmentsRef.current[0] === "(onboarding)";

    // Route based purely on token presence (source of truth)
    if (token && inAuthGroup) {
      // Has token, but in onboarding → redirect to protected
      router.replace("/(protected)/(client-tabs)/home");
    } else if (!token && !inAuthGroup) {
      // No token, but NOT in onboarding → redirect to onboarding
      router.replace("/(onboarding)");
    }
    // Otherwise, we're in the correct group already
  }, [token, isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {token ? (
        <Stack.Screen name="(protected)" />
      ) : (
        <Stack.Screen name="(onboarding)" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans: require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "PlusJakartaSans-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "PlusJakartaSans-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    Montserrat: require("../assets/fonts/Montserrat-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      useAuthStore
        .getState()
        .hydrate()
        .then(() => {
          SplashScreen.hideAsync();
          //function call
        });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded && useAuthStore.getState().isLoading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" backgroundColor={"#ffffff"} />
          <SafeAreaView className="flex-1  " edges={["bottom"]}>
            <RootNavigation />
          </SafeAreaView>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
