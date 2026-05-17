import { Text } from "@/src/components/ui/Text";
import { usegetUpcomingEvents } from "@/src/features/events/hooks/use-event";
import { useImportGuestlist } from "@/src/features/guests/api/use-guests";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import {
  FlatList,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ImportGuestListScreen() {
  const params = useLocalSearchParams();
  const { data: events } = usegetUpcomingEvents();
  const targetEventId = Number(params.eventId);
  const { mutateAsync } = useImportGuestlist();
  
  const clikHandler = useCallback((eventId: number) => {
    mutateAsync({
      fromEventId: eventId,
      toEventId: targetEventId
    }).then(() => {
      alert("Success in Importing the guest , Guest List will be shown in the draft section ");
      router.replace({
        pathname: "../",
        
      });

  }).catch((err) => {
      alert(err);
    })

  }, [ targetEventId])

  return (
    <SafeAreaView className="flex-1 px-4 pt-2" edges={[]}>
      
       <Text className="text-slate-500 text-sm mb-3">
         Select an event to import guests from
       </Text>

        <FlatList
          data={events}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => clikHandler(item.id)}
            className="flex-row items-center p-4 mb-2 bg-white border border-slate-200 rounded-xl"
            >
              <View className="flex-1">
                <Text className="font-jakarta-bold text-slate-900">
                  {item.title}
                </Text>

                {!!item.date && (
                  <Text className="text-sm text-slate-500">
                    {item.date}
                  </Text>
                )}
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text className="text-center text-slate-400 mt-10">
              No other events found.
            </Text>
          }
        />
    </SafeAreaView>
  );
}