import MemberCard from "@/src/components/guest/family/MemberCard";
import { Text } from "@/src/components/ui/Text";
import { useGetInvitationsForEvent } from "@/src/features/guests/api/use-guests";
import { useGuestDetailStore } from "@/src/features/guests/store/useGuestDetailStore";
import { GuestDetailInterface } from "@/src/features/guests/types";
import { useThrottledRouter } from "@/src/hooks/useThrottledRouter";
import { mapToMemberRsvpProp, MemberRsvpCardProp } from "@/src/utils/type/rsvp";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GuestFamilyMember() {
  const { push } = useThrottledRouter();
  const { eventId, familyId, familyName } = useLocalSearchParams<{
    eventId: string;
    familyId: string;
    familyName?: string;
  }>();

  const parsedFamilyId = familyId ? Number(familyId) : null;
  const setGuestDetail = useGuestDetailStore((state) => state.setGuestDetail);

  // Live data from API — auto-updates when useSubmitRsvpResponse invalidates ["event-invitations", eventId]
  const { data: invitations } = useGetInvitationsForEvent(Number(eventId));
console.log('This is te  invitations for the event ' , invitations) ;
  const liveFamilyMembers = useMemo(() => {
    if (!invitations || parsedFamilyId == null) return [];
    return invitations.filter(
      (inv: any) => inv.eventGuest?.familyId === parsedFamilyId
    );
  }, [invitations, parsedFamilyId]);

  const members: MemberRsvpCardProp[] = useMemo(
    () => liveFamilyMembers.map(mapToMemberRsvpProp),
    [liveFamilyMembers]
  );

  const handleOpenMember = (member: MemberRsvpCardProp) => {
    if (familyId == null || !eventId) return;

    const guest = liveFamilyMembers.find(
      (item:any) => item.user.id === member.user.id
    );

    if (!guest) return;
    setGuestDetail(guest);
    console.log('Opening the guest with the guest detail ', guest)
    push({
      pathname: "./[guestDetailId]",
      params: { guestDetailId: guest.eventGuest?.id },
    });
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
          {familyName} Members
        </Text>

        {members.length ? (
          members.map((member) => (
            <MemberCard
              key={member.user.id}
              member={member}
              isOrganizerView={true}
              onPressRsvp={() => handleOpenMember(member)}
            />
          ))
        ) : (
          <View className="rounded-xl bg-white p-4">
            <Text className="text-slate-500">No family members found.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
