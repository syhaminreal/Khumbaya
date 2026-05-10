import SubEventCard from "@/src/components/event/subevent/CardSubevent";
import { SubEvent } from "@/src/constants/event";
import { useSubEventsOfEvent } from "@/src/features/events/hooks/use-event";
import { useEventStore } from "@/src/features/events/store/useEventStore";
import { sortByDateTime } from "@/src/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
//TODO: Helper ma rakhna data
const getCalendarDay = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (!Number.isFinite(d.getTime())) return "";
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

const formatDayHeader = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (!Number.isFinite(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

type ListItem =
  | { type: "header"; label: string; key: string }
  | { type: "card"; item: SubEvent; key: string };

export default function ListSubEvent() {
  const router = useRouter();
  const { isGuest } = useLocalSearchParams<{ isGuest?: string }>();
  const isGuestView = isGuest === "true";
  const { eventId } = useLocalSearchParams();
  const eventDraft = useEventStore((event)=>event.eventDraft)
  console.log('The parent event for the list of the sub event in t⟵⟵⟵⟵⟵⟵⟵⟵⟵⟵⟵⟵he ui is '  , eventDraft)
  const {
    data: subEventsResponse,
    isLoading,
    refetch,
  } = useSubEventsOfEvent(Number(eventId));

  const subEvents = (subEventsResponse ?? []) as SubEvent[];

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const sorted = useMemo(
    () => sortByDateTime(subEvents, (item) => item.startDateTime),
    [subEvents]
  );

  const listData = useMemo((): ListItem[] => {
    const result: ListItem[] = [];
    let lastDay = "";
    const seen = new Set<string>();

    for (const item of sorted) {
      const dayKey = getCalendarDay(item.startDateTime);
      if (dayKey !== lastDay) {
        if (!seen.has(dayKey)) {
          seen.add(dayKey);
          result.push({
            type: "header",
            label: formatDayHeader(item.startDateTime),
            key: `header-${dayKey}`,
          });
        }
        lastDay = dayKey;
      }
      result.push({ type: "card", item, key: String(item.id) });
    }

    return result;
  }, [sorted]);

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 rounded-xl bg-gray-100 items-center justify-center mb-4">
        <Ionicons name="layers-outline" size={40} color="#9CA3AF" />
      </View>
      <Text className="text-lg font-semibold text-gray-900 mb-2">
        No Activities Yet
      </Text>
      <Text className="text-sm text-gray-500 text-center px-8">
        Tap "Add Activity" to create your first sub-event
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#f8f6f7]">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading...</Text>
        </View>
      ) : sorted.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (item.type === "header") return null;
            return (
              <SubEventCard
                item={item.item}
                event={eventDraft!}
              />
            );
          }}
        />
      )}
{/* TODO:Review ai generated code */}
      {!isGuestView && (
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "./subevent-create",
            });
          }}
          className="absolute bottom-6 right-6 flex-row items-center gap-2 bg-primary px-5 py-3 rounded-full shadow-2xl"
        >
          <Ionicons name="add-circle" size={20} color="white" />
          <Text className="text-white font-bold tracking-wide">Add Activity</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}