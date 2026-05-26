import NavigateComponent from "@/src/components/event/NavigateComponent";
import Row from "@/src/components/ui/RowComponent";
import { Event } from "@/src/constants/event";
import {
  useEventById,
  useGetEventWithRole,
} from "@/src/features/events/hooks/use-event";
import { useEventStore, useSubeventDraftStore } from "@/src/features/events/store/useEventStore";
import { useThrottledRouter } from "@/src/hooks/useThrottledRouter";
import { Ionicons } from "@expo/vector-icons";
import { RelativePathString, router, Stack, useLocalSearchParams } from "expo-router";
import { Settings } from "lucide-react-native";

import { shadowStyle } from "@/src/utils/helper";
import { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import EventDetailHero from "./EventDetailHero";

const EventDetail = () => {
  const { eventId, isSubEvent } = useLocalSearchParams() as unknown as {
    eventId: string;
    isSubEvent?: string;
  };
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const { push } = useThrottledRouter();
  const { clearEventDraft, setEventDraft } = useEventStore();
  const { eventDraft: subEventDraft, ParentEventId: parentEvent } =
    useSubeventDraftStore();
  const { data: found } = useGetEventWithRole();
  //If the sub event then see the draft from the sub event draft else see the main event draft

  const isSubEventView = isSubEvent === "true";
  const { data: fullEvent } = useEventById(Number(eventId), {
    enabled: !isSubEventView && !!eventId,
  });
  const foundEvent = found?.find(
    (e: Event) => String(e.id) === String(eventId)
  );
  if (isSubEventView) {
    if (!subEventDraft || !parentEvent) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">No event found</Text>
        </View>
      );
    }
  }

  const event = isSubEventView
    ? (subEventDraft as Event)
    : fullEvent ?? foundEvent ?? {
      id: eventId ?? "0",
      title: "Event Details",
      location: "—",
      venue: "",
      imageUrl: "",
      role: "Organizer" as const,
      status: "upcoming" as const,
      time: "",
      startDateTime: "",
      endDateTime: "",
    };

  useEffect(() => {
    if (!isSubEventView) { setEventDraft(event); }
    //Cleanup when there is anotehr stack flow
    //  return () => {
    //   clearEventDraft();
    //  }
  }, [clearEventDraft, eventId]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [120, 160],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const headerTranslate = scrollY.interpolate({
    inputRange: [120, 160],
    outputRange: [6, 0],
    extrapolate: "clamp",
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false } // navigation.setOptions updates are not native-driven
  );
console.log('thiis is the navigation context in the event detail page to be deleted in the futur😂futur😂futur😂futur😂futur😂futur😂futur😂futur😂e' , eventId , isSubEvent , isSubEventView)
  const manageActions = [
    { id: "subevents", name: "Sub Events", icon: "layers-outline", color: "#F97316", route: "./(subevent)" as RelativePathString, isVisiblity: isSubEvent === "true" ? false : true },
    { id: "guests", name: "Guest Management", icon: "people", color: "#8B5CF6", route: "./guests" as RelativePathString, isVisiblity: true  , isSubEventView },
    { id: "budget", name: "Budget", icon: "wallet", color: "#10B981", route: "./budget" as RelativePathString, isVisiblity: true, isSubEventView },
    { id: "checklist", name: "Checklist", icon: "checkmark-circle-outline", color: "#EC4899", route: "./tasklist" as RelativePathString, isVisiblity: true },
    { id: "catering", name: "Catering", icon: "restaurant", color: "#F43F5E", route: "./catering" as RelativePathString, isVisiblity: true, isSubEventView },
    { id: "hotel-management", name: "Hotel Management", icon: "bed-outline", color: "#F59E0B", route: "./hotel" as RelativePathString, isVisiblity: true, isSubEventView },
    { id: "logistics", name: "Logistics", icon: "cube-outline", color: "#10B981", route: "./(logistics)" as RelativePathString, isVisiblity: true, isSubEventView },
    { id: "vendors", name: "Vendors", icon: "business", color: "#3B82F6", route: "./vendor" as RelativePathString, isVisiblity: true, isSubEventView },
  ];

  return (
    <SafeAreaView className="flex-1 relative" edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 88,
          ...shadowStyle,
          opacity: headerOpacity,
          zIndex: 10,
        }}
      />
      <Animated.Text
        pointerEvents="none"
        style={{
          position: "absolute",
          top: insets.top + 12,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslate }],
          fontWeight: "800",
          fontSize: 16,
          color: "#111827",
          zIndex: 11,
        }}
      >
        {event.title}
      </Animated.Text>
      {/* //Left Icon  */}
      <View
        style={{
          position: "absolute",
          left: 16,
          top: insets.top + 8,
          zIndex: 20
          ,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          className="bg-white rounded-full p-2 shadow"
        >
          <Ionicons name="chevron-back" size={22} color="#ee2b8c" />
        </TouchableOpacity>
      </View>
      {/* //Rright Icon  */}
      <View
        style={{
          position: "absolute",
          right: 16,
          top: insets.top + 8,
          zIndex: 20
          ,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            push("./settings" as RelativePathString);
          }}
          activeOpacity={0.8}
          className="bg-white rounded-full p-2 shadow"
        >
          <Settings size={22} color="#ee2b8c" />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        className="flex-1 "
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        <EventDetailHero
          imageUrl={event.imageUrl}
          status={event.status}
          title={event.title}
          startDateTime={event.startDateTime}
          endDateTime={event.endDateTime}
          location={event.location}
          venue={event.venue}
        />

        {isSubEventView && parentEvent && (
          <View className="mt-4 px-4">
            {/* <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(protected)/(client-stack)/events/[eventId]/(organizer)",
                  params: { eventId: String(parentEvent.id) },
                })
              }
              activeOpacity={0.85}
              className="flex-row items-center justify-between rounded-xl border border-pink-100 bg-pink-50 px-4 py-3"
            >
              <View>
                <Text className="text-xs font-semibold text-pink-600 uppercase tracking-wide">
                  Parent Event
                </Text>
                <Text className="text-sm font-bold text-gray-900">
                  {parentEvent.title}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#ee2b8c" />
            </TouchableOpacity> */}
          </View>
        )}

        <View className="mt-6 px-4 pb-4">
          <Text className="text-lg font-bold mb-3">Manage Event</Text>

          <View className="flex-row flex-wrap gap-3 justify-center">
            {manageActions.map((action) => (
              action.isVisiblity && <NavigateComponent key={action.id} {...action} />
            ))}

            <Row
              title="Gallery"
              description="Upload & Share Photos"
              iconstring="images"
              onPress={() => push("./gallery" as RelativePathString)}
            />

            <Row
              title="Event Details"
              description="Complete Event Information"
              iconstring="create"
              onPress={() => {
                setEventDraft(event as Event);
                push("./edit-event" as RelativePathString);
              }}
            />

            <Row
              title="Planning Committee"
              description="Add Event Organizers and Collaborators"
              iconstring="person"
              onPress={() => {
                push("./settings/transfer-ownership" as RelativePathString);
              }}
            />
          </View>
        </View>

        <View className="h-24" />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default EventDetail;
