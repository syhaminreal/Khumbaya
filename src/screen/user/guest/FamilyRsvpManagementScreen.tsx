import MemberCard from "@/src/components/guest/family/MemberCard";
import { Text } from "@/src/components/ui/Text";
import { useEventResponseWithUser } from "@/src/features/events/hooks/use-event";
import { GuestDetailInterface } from "@/src/features/guests/types";
import { useRsvpStore } from "@/src/store/useRsvpStore";
import { MemberRsvpCardProp, mapToMemberRsvpProp } from "@/src/utils/type/rsvp";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";





export default function FamilyRsvpManagementScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const setDraftMembers = useRsvpStore((s) => s.setDraftMembers);
  const setSelectedUserId = useRsvpStore((s) => s.setSelectedUserId);
  const draftMembers = useRsvpStore((s) => s.draftMembers);

  const { data: eventResponses, isLoading } = useEventResponseWithUser(
    Number(eventId)
  );

  const fallbackMembers: MemberRsvpCardProp[] = (eventResponses?.responses ?? []).map(
    (item: GuestDetailInterface) => mapToMemberRsvpProp(item)
  );

  const members: MemberRsvpCardProp[] = draftMembers?.length
    ? draftMembers.map((m) => mapToMemberRsvpProp(m))
    : fallbackMembers;

  if (isLoading && !draftMembers?.length) {
    return (
      <SafeAreaView
        className="flex-1 bg-background-light items-center justify-center"
        edges={["bottom"]}
      >
        <ActivityIndicator size="large" color="#ee2b8c" />
      </SafeAreaView>
    );
  }

  const handleMemberRsvp = (member: MemberRsvpCardProp) => {
    if (!draftMembers) {
      setDraftMembers(eventResponses?.responses as GuestDetailInterface[]);
    }
    setSelectedUserId(member.user.id);
    router.push(`/(protected)/(client-stack)/events/${eventId}/(guest)/rsvp`);
  };

  const handleMemberDetails = (member: MemberRsvpCardProp) => {
    if (!draftMembers) {
      setDraftMembers(eventResponses?.responses as GuestDetailInterface[]);
    }
    setSelectedUserId(member.user.id);
    router.push(`/(protected)/(client-stack)/events/${eventId}/(guest)/[guestDetail]`);
  };



  return (
    <SafeAreaView className="flex-1 bg-background-tertairy" edges={["bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}
      >
        <Text
          variant="h2"
          className="text-xs uppercase tracking-widest text-slate-400 px-1 mb-1"
        >
          Family Members
        </Text>
        {members.map((member, index) => (
          <MemberCard
            key={`${member.eventGuest.id}_${index}`}
            member={member}
            onPressRsvp={() => handleMemberRsvp(member)}
            onPressDetails={() => handleMemberDetails(member)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
