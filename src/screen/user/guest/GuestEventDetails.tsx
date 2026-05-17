import FamilyRsvpCard from "@/src/components/event/FamilyRsvpCard";
import NavigateComponent from "@/src/components/event/NavigateComponent";
import Row from "@/src/components/ui/RowComponent";
import { Text } from "@/src/components/ui/Text";
import {
  useEventById,
  useEventResponseWithUser
} from "@/src/features/events/hooks/use-event";
import { GuestDetailInterface } from "@/src/features/guests/types";
import { useThrottledRouter } from "@/src/hooks/useThrottledRouter";
import { useRsvpStore } from "@/src/store/useRsvpStore";
import { shadowStyle } from "@/src/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { RelativePathString, useLocalSearchParams, useRouter } from "expo-router";
import { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import EventDetailHero from "../View/EventDetailHero";
// this will be replaced by the timelines or we will be creating the highlight (major subevent api)


export default function GuestEventDetails() {
  const router = useRouter();
  const {push} = useThrottledRouter()
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const setDraftMembers = useRsvpStore((s) => s.setDraftMembers);
  const setSelectedUserId = useRsvpStore((s) => s.setSelectedUserId);
  const clearDraft = useRsvpStore((s) => s.clearDraft);

  const { data: eventDetails, isLoading } = useEventById(Number(eventId));
  const { data: eventResponse, isLoading: responseLoading } =
    useEventResponseWithUser(Number(eventId));


const manageActions = [
  { id: "subevents", name: "Sub Events", icon: "layers-outline", color: "#F97316", route: "./(subevent)" as RelativePathString, params: { isGuest: "true" } , isDisabled: eventDetails?.parentId ? true : false},
  { id: "catering", name: "Catering", icon: "restaurant", color: "#F43F5E", route: "./catering" as RelativePathString, params: { isGuest: "true" } },
  { id: "hotel-management", name: "Assigned Room", icon: "bed-outline", color: "#F59E0B", route: "./hotel" as RelativePathString, params: { isGuest: "true" } },
  { id: "logistics", name: "Assigned Vehicles", icon: "cube-outline", color: "#10B981", route: "./(logistics)" as RelativePathString, params: { isGuest: "true" } },
];



  const scrollY = useRef(new Animated.Value(0)).current;
  const isFamily = eventResponse?.isFamily ?? false;
  const responses = (eventResponse?.responses ?? []) as Array<GuestDetailInterface>;

  const myGuestRecord = !isFamily ? (responses[0]?.eventGuest ?? null) : null;
  const hasRsvped = isFamily ? true : myGuestRecord !== null;

  const familyMembers = responses.map((r) => ({
    id: r.user.id.toString(),
    name: r.user.username,
    avatarUrl: r.user.photo ?? undefined,
  }));

  const confirmedCount = responses.filter(
    (r) => r.eventGuest?.status === "accepted"
  ).length;

  const familyName = responses[0]?.user?.relation ?? "Your Family";

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
  const insets = useSafeAreaInsets();
  const familyDraftMembers = responses;

  if (isLoading || responseLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-background-light items-center justify-center"
        edges={["top"]}
      >
        <ActivityIndicator size="large" color="#ee2b8c" />
      </SafeAreaView>
    );
  }

  const handleIndividualRsvp = () => {
    clearDraft();
    if (responses[0]?.user?.id) {
      setDraftMembers(responses);
      setSelectedUserId(responses[0].user.id);
    }
    router.push(`/(protected)/(client-stack)/events/${eventId}/(guest)/rsvp`);
  };

    const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false } // navigation.setOptions updates are not native-driven
  );


  if (isLoading) {
    return (<View>
      <Text>
        Loading
      </Text>
    </View>)
  }
  if (!eventDetails) {
    return null;
  }
  return (
    <SafeAreaView className="flex-1 bg-background-light" edges={["top"]}>
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
        {eventDetails.title}
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
    

      <Animated.ScrollView
          className="flex-1 "
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        <EventDetailHero
          imageUrl={eventDetails.imageUrl}
          status={eventDetails.status}
          title={eventDetails.title}
          startDateTime={eventDetails.startDateTime}
          endDateTime={eventDetails.endDateTime}
          location={eventDetails.location}
          venue={eventDetails.venue}
        />
        <View className="mt-6 px-4 pb-4">
          <Text className="text-lg font-bold mb-3">Manage Event</Text>
          <View className="flex-row flex-wrap gap-3 justify-center">
            {manageActions.map((action) => (
             !action.isDisabled && (
                <NavigateComponent key={action.id} {...action} isGuest={true} />
              )
            ))}
             <Row
                title="Gallery"
                description="Upload & Share Photos"
                iconstring="images"
                onPress={() => push("./gallery" as RelativePathString)}
              />
                   
          </View>
        </View>
        {/* ── RSVP section ── */}
        {!eventDetails.parentId && (
        <View className="px-5 py-5">
          {isFamily ? (
            <View className="gap-4">
              <FamilyRsvpCard
                familyName={familyName}
                members={familyMembers}
                confirmedCount={confirmedCount}
                onEdit={() => {
                  const first = responses[0];
                  if (first) {
                    setDraftMembers(responses);
                    setSelectedUserId(first.user.id);
                  }

                  router.push(
                    `/(protected)/(client-stack)/events/${eventId}/(guest)/family-rsvp`
                  );
                }}
                onView={() => {
                  const first = responses[0];
                  if (first) {
                    setDraftMembers(responses);
                    setSelectedUserId(first.user.id);

                  }

                  router.push(
                    `/(protected)/(client-stack)/events/${eventId}/(guest)/family-responce`
                  );
                }}
              />
            </View>
          ) : (
            <View className="bg-white rounded-md p-6 border border-slate-100 shadow-sm gap-4">
              <View className="flex-row items-center gap-3">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${hasRsvped ? "bg-green-100" : "bg-pink-100"
                    }`}
                >
                  <Ionicons
                    name={hasRsvped ? "checkmark-circle" : "mail"}
                    size={22}
                    color={hasRsvped ? "#16a34a" : "#ee2b8c"}
                  />
                </View>
                <View>
                  <Text className="text-lg font-extrabold text-slate-900 leading-tight">
                    {hasRsvped ? "Your RSVP" : "Invitation"}
                  </Text>
                  <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {hasRsvped ? "Confirmed" : "Action Required"}
                  </Text>
                </View>
              </View>

              <Text className="text-sm text-slate-500 leading-relaxed">
                {hasRsvped
                  ? "Your response has been recorded. You can update your travel and accommodation details at any time."
                  : "We'd be honored to have you join us for this special occasion. Please confirm your attendance."}
              </Text>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 py-3.5 rounded-md items-center justify-center bg-primary shadow-lg shadow-primary/20 active:scale-[0.98]"
                  activeOpacity={0.8}
                  onPress={handleIndividualRsvp}
                >
                  <Text className="text-white font-bold text-sm">
                    {hasRsvped ? "Edit RSVP" : "Confirm Attendance"}
                  </Text>
                </TouchableOpacity>

                {(responses[0]?.eventGuest?.assignedRoom ||
                  responses[0]?.eventGuest?.isArrivalPickupRequired ||
                  responses[0]?.eventGuest?.isDeparturePickupRequired ||
                  responses[0]?.eventGuest?.notes ||
                  responses[0]?.eventGuest?.arrivalInfo ||
                  responses[0]?.eventGuest?.departureInfo) && (
                    <TouchableOpacity
                      className="flex-1 py-3.5 rounded-md items-center justify-center bg-slate-50 border border-slate-200 active:bg-slate-100 active:scale-[0.98]"
                      activeOpacity={0.8}
                      onPress={handleIndividualRsvp}
                    >
                      <Text className="text-slate-600 font-bold text-sm">
                        View Data
                      </Text>
                    </TouchableOpacity>
                  )}
              </View>
            </View>
          )}
        </View>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
