import MemberCard from "@/src/components/guest/family/MemberCard";
import { Text } from "@/src/components/ui/Text";
import { useEventResponseWithUser } from "@/src/features/events/hooks/use-event";
import { GuestDetailInterface } from "@/src/features/guests/types";
import { useRsvpStore } from "@/src/store/useRsvpStore";
import { MemberRsvpCardProp, mapToMemberRsvp } from "@/src/utils/type/rsvp";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function deriveMemberStatus(status: string | null): MemberRsvpCardProp["status"] {
  if (status === "accepted") return "attending";
  if (status === "rejected") return "declined";
  return "pending";
}

function formatDateRange(arrival: Date | null, departure: Date | null): string | undefined {
  if (!arrival && !departure) return undefined;
  const fmt = (d: Date) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (arrival && departure) return `${fmt(arrival)} – ${fmt(departure)}`;
  if (arrival) return `From ${fmt(arrival)}`;
  return `Until ${fmt(departure!)}`;
}

export default function FamilyRsvpManagementScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const setDraft = useRsvpStore((s) => s.setDraft);
  const draftFamilyMembers = useRsvpStore((s) => s.draft?.familyMembers);
  const { data: eventResponses, isLoading } = useEventResponseWithUser(
    Number(eventId)
  );

  const fallbackMembers: MemberRsvpCardProp[] = (eventResponses?.responses ?? []).map(
    (item: GuestDetailInterface) => mapToMemberRsvp(item)
  );

  const members: MemberRsvpCardProp[] = draftFamilyMembers?.length
    ? draftFamilyMembers.map((member) => {
      const eg = member.eventGuest;
      return {
        id: member.user.id,
        familyId: member.familyId ?? 0,
        name: member.user.username,
        avatarUrl: member.user.photo ?? undefined,
        status: deriveMemberStatus(eg?.status ?? null),
        dateRange: formatDateRange(eg?.arrivalDatetime ?? null, eg?.departureDatetime ?? null),
        roomNeeded:
          eg?.isAccomodation != null
            ? eg.isAccomodation
              ? "Yes"
              : "No"
            : undefined,
        email: member.user.email,
        phone: member.user.phone ?? "",
        assignedRoom: eg?.assignedRoom ?? undefined,
        notes: eg?.notes ?? undefined,
        rawStatus: eg?.status ?? null,
        rawArrival: eg?.arrivalDatetime ?? null,

        rawDeparture: eg?.departureDatetime ?? null,
        rawAccommodation: eg?.isAccomodation ?? null,
        rawIsArrivalPickupRequired: eg?.isArrivalPickupRequired ?? null,
        rawIsDeparturePickupRequired: eg?.isDeparturePickupRequired ?? null,
        rawAssignedRoom: eg?.assignedRoom ?? null,
        rawArrivalInfo: eg?.arrivalInfo ?? null,
        rawDepartureInfo: eg?.departureInfo ?? null,
      };
    })
    : fallbackMembers;
  if (isLoading && !draftFamilyMembers?.length) {
    return (
      <SafeAreaView
        className="flex-1 bg-background-light items-center justify-center"
        edges={["bottom"]}
      >
        <ActivityIndicator size="large" color="#ee2b8c" />
      </SafeAreaView>
    );
  }

  // this will set the member previous rsvp if any
  const handleMemberRsvp = (member: MemberRsvpCardProp) => {
    const selectedFamilyMember = draftFamilyMembers?.find(
      (item) => item.user.id === member.id
    );

    setDraft({
      user: selectedFamilyMember?.user ?? {
        id: member.id,
        username: member.name,
        photo: member.avatarUrl ?? null,
        email: member.email ?? "",
        phone: member.phone,
        relation: null,
        familyId: member.familyId,
      },
      familyId: member.familyId,
      eventGuest: selectedFamilyMember?.eventGuest ?? {
        familyId: member.familyId,
        status: member.rawStatus,
        arrivalDatetime: member.rawArrival,
        departureDatetime: member.rawDeparture,
        isAccomodation: member.rawAccommodation,
        isArrivalPickupRequired: member.rawIsArrivalPickupRequired,
        isDeparturePickupRequired: member.rawIsDeparturePickupRequired,
        notes: member.notes ?? null,
        assignedRoom: member.rawAssignedRoom,
        arrivalInfo: member.rawArrivalInfo,
        departureInfo: member.rawDepartureInfo,
      },
      familyMembers: draftFamilyMembers,
    });
    router.push(`/(protected)/(client-stack)/events/${eventId}/(guest)/rsvp`);
  };

  const handleMemberDetails = (member: MemberRsvpCardProp) => {
    const selectedFamilyMember = draftFamilyMembers?.find(
      (item) => item.user.id === member.id
    );

    setDraft({
      user: selectedFamilyMember?.user ?? {
        id: member.id,
        username: member.name,
        photo: member.avatarUrl ?? null,
        email: member.email ?? "",
        phone: member.phone,
        relation: null,
        familyId: member.familyId,
      },
      familyId: member.familyId,
      eventGuest: selectedFamilyMember?.eventGuest ?? {
        familyId: member.familyId,
        status: member.rawStatus,
        arrivalDatetime: member.rawArrival,
        departureDatetime: member.rawDeparture,
        isAccomodation: member.rawAccommodation,
        isArrivalPickupRequired: member.rawIsArrivalPickupRequired,
        isDeparturePickupRequired: member.rawIsDeparturePickupRequired,
        notes: member.notes ?? null,
        assignedRoom: member.rawAssignedRoom,
        arrivalInfo: member.rawArrivalInfo,
        departureInfo: member.rawDepartureInfo,
      },
      familyMembers: draftFamilyMembers,
    });
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
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onPressRsvp={() => handleMemberRsvp(member)}
            onPressDetails={() => handleMemberDetails(member)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
