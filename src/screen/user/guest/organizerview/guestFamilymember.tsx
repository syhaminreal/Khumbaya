import MemberCard from "@/src/components/guest/family/MemberCard";
import { Text } from "@/src/components/ui/Text";
import { useGetInvitationsForEvent } from "@/src/features/guests/api/use-guests";
import {
  useFamilyGuestStore,
  useGuestDetailStore,
} from "@/src/features/guests/store/useGuestDetailStore";
import { FamilyGroup, GuestDetailInterface } from "@/src/features/guests/types";
import { useThrottledRouter } from "@/src/hooks/useThrottledRouter";
import { mapToMemberRsvp, MemberRsvpCardProp } from "@/src/utils/type/rsvp";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GuestFamilyMember() {
  const { push } = useThrottledRouter();
  const { eventId, family } = useLocalSearchParams<{
    eventId: string;
    family?: string;
  }>();

  const familyGroupFromStore = useFamilyGuestStore(
    (state) => state.familyGroup
  );
  const setGuestDetail = useGuestDetailStore((state) => state.setGuestDetail);

  // Resolve familyId and family_name from store or route param (no stale snapshots)
  const { familyId, familyName } = useMemo(() => {
    if (familyGroupFromStore) {
      return {
        familyId: familyGroupFromStore.familyId,
        familyName: familyGroupFromStore.family_name,
      };
    }
    if (!family) return { familyId: null, familyName: "Family" };
    try {
      const parsed = JSON.parse(family) as FamilyGroup;
      return { familyId: parsed.familyId, familyName: parsed.family_name };
    } catch {
      return { familyId: null, familyName: "Family" };
    }
  }, [familyGroupFromStore, family]);

  // Live data from API — auto-updates when useSubmitRsvpResponse invalidates ["event-invitations", eventId]
  const { data: invitations } = useGetInvitationsForEvent(Number(eventId));

  const liveFamilyMembers = useMemo(() => {
    if (!invitations || familyId == null) return [];
    return (invitations as GuestDetailInterface[]).filter(
      (inv) => inv.eventGuest.familyId === familyId
    );
  }, [invitations, familyId]);

  const members: MemberRsvpCardProp[] = useMemo(
    () => liveFamilyMembers.map(mapToMemberRsvp),
    [liveFamilyMembers]
  );

  const handleOpenMember = (member: MemberRsvpCardProp) => {
    if (familyId == null || !eventId) return;

    const guest = liveFamilyMembers.find(
      (item) => item.user.id === member.id
    );

    if (!guest) return;
    setGuestDetail(guest);
    console.log('Opening the guest with the guest detail ', guest)
    push({
      pathname: "./[guestDetailId]",
      params: { guestDetailId: guest.eventGuest.id },
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
              key={member.id}
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
