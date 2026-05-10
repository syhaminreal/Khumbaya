import { User } from "@/src/store/AuthStore";

export interface Invitation {
  id: number;
  userId: number | null;
  hasCheckedIn: boolean | null;
  hasCheckedOut: boolean | null;
  eventId: number;
  familyId: number | null;
  respondedBy: number | null;
  respondedAt: Date | null;
  invitedBy: number;
  role: string;
  status: string | null;
  notes: string | null;
  category: string;
  unInvitedSubevent: number[];
  isArrivalPickupRequired: boolean | null;
  isDeparturePickupRequired: boolean | null;
  organizerNote: string | null;
  isAccomodation: boolean | null;
  assignedRoom: string | null;
  arrivalDatetime: Date | null;
  arrivalLocation: string | null;
  departureDatetime: Date | null;
  departureLocation: string | null;
  arrivalInfo: string | null;
  departureInfo: string | null;
  createdAt: Date;
  updatedAt: Date;

}


export interface GuestDetailInterface {
  user: User;
  eventGuest: Invitation;
  familyName: string | null;
}

export interface FamilyGroup {
  type: "family";
  familyId: number;
  family_name: string;
  members: GuestDetailInterface[];
  primaryMember: GuestDetailInterface;
  memberCount: number;
}

export interface IndividualGuest {
  type: "individual";
  data: GuestDetailInterface;
}

export type GroupedInvitation = FamilyGroup | IndividualGuest;

export function groupInvitationsByFamily(
  invitations: GuestDetailInterface[]
): GroupedInvitation[] {
  const familyMap = new Map<number, GuestDetailInterface[]>();
  const individuals: GuestDetailInterface[] = [];

  invitations.forEach((invitation) => {
    if (invitation.eventGuest.familyId !== null) {
      const familyId = invitation.eventGuest.familyId;
      if (!familyMap.has(familyId)) {
        familyMap.set(familyId, []);
      }
      familyMap.get(familyId)!.push(invitation);
    } else {
      individuals.push(invitation);
    }
  });

  const grouped: GroupedInvitation[] = [];

  familyMap.forEach((members, familyId) => {
    grouped.push({
      type: "family",
      familyId,
      family_name: members[0].familyName || "Family",
      members,
      primaryMember: members[0],
      memberCount: members.length,
    });
  });

  individuals.forEach((guest) => {
    grouped.push({
      type: "individual",
      data: guest,
    });
  });

  return grouped;
}
