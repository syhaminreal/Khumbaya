import { User } from "@/src/store/AuthStore";

export interface Invitation {
  id: number; // non Changeble by the organizer and the guest 
  userId: number ;  // Non changable at al 
  hasCheckedIn: boolean | null; // By both 
  hasCheckedOut: boolean | null; // By both 
  eventId: number; // Non changable at all
  familyId: number | null; // Can be changed by the organizer 
  respondedBy: number | null; // Not changable
  respondedAt: Date | null; // Only by the guest 
  invitedBy: number; // Not chanable
  role: string; // only by the organizer
  status: string | null; // By the guest but can be overridden by the organizer
  notes: string | null; // By the guest 
  category: string; // By org
  unInvitedSubevent: number[]; // Only by te organiwe 
  isArrivalPickupRequired: boolean | null; // guest
  isDeparturePickupRequired: boolean | null; //guest
  organizerNote: string | null; // Organixer only 
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
