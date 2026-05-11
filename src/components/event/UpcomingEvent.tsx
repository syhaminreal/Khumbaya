import { Event } from "@/src/constants/event";
import { usegetUpcomingEvents } from "@/src/features/events/hooks/use-event";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { Text } from "../ui/Text";
import { Event_WITH_ROLE } from "./EventwithRole";
import Animated from "react-native-reanimated";
import { _entering, _exiting, _layoutAnimation } from "@/src/utils/helper";

interface UpcomingEventsTabProps {
  isActive: boolean;
}

export const UpcomingEventsTab = ({ isActive }: UpcomingEventsTabProps) => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const {
    data: eventsData = [],
    isLoading,
    isError,
    refetch,
  } = usegetUpcomingEvents({ enabled: isActive });

  const events = (eventsData as Event[]).filter((event) => {
    if (event.status === "upcoming") return true;
    const endDate = event.endDateTime ? new Date(event.endDateTime) : undefined;
    return !endDate || Number.isNaN(endDate.getTime()) || endDate >= new Date();
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  useEffect(() => {
    setMounted(true);
  });
  if (!isActive && !mounted) {
    return <>Loading</>;
  }
  return (
    <ScrollView
      className="flex-1 px-4"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {isLoading ? (
        <View className="items-center justify-center mt-24">
          <Text className="text-gray-400 text-base font-medium mt-4">
            Loading events...
          </Text>
        </View>
      ) : isError ? (
        <View className="items-center justify-center mt-24">
          <Text className="text-gray-400 text-base font-medium mt-4">
            Failed to load events
          </Text>
        </View>
      ) : events.length > 0 ? (
        events.map((event, index) => (
          <Event_WITH_ROLE
            key={`${event.id}-${index}`}
            event={event}
            onPress={() => { }}
            asGuest={event.role === "Guest"}
          />
        ))
      ) : (
        <View className="items-center justify-center mt-24">
          <Ionicons name="calendar-outline" size={52} color="#d1d5db" />
          <Text className="text-gray-400 text-base font-medium mt-4">
            No events found
          </Text>
          <Text className="text-gray-400 text-sm mt-1 text-center px-8">
            Create your first event to get started
          </Text>
        </View>
      )}
    </ScrollView>
  );
};
