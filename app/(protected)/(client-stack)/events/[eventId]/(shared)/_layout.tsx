import { Stack } from "expo-router";
export default function SharedStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
     <Stack.Screen name="(subevent)" options={{ headerShown: false }} />
     <Stack.Screen name="tasklist" options={{ headerShown: false }} />
     <Stack.Screen name="(logistics)" options={{ headerShown:false }}/>
     <Stack.Screen name="catering" options={{ headerShown: false }} />
     <Stack.Screen name="hotel" options={{ headerShown: false }} />
    </Stack>
  );
}
