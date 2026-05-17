export type RSVPStatus = "Attending" | "Declined" | "Pending";
import { GuestDetailInterface, Invitation } from "@/src/features/guests/types";



export interface MemberRsvpCardProp extends GuestDetailInterface {
  status: RSVPStatus;
}

function deriveStatus(event_guest: Invitation | null): RSVPStatus {
  if (!event_guest) return "Pending";
  if (event_guest.status === "rejected") return "Declined";
  if (event_guest.status === "accepted") return "Attending";
  return "Pending";
}

export function mapToMemberRsvpProp(
  item: GuestDetailInterface
): MemberRsvpCardProp {
  const status = deriveStatus(item.eventGuest);
  return {
    ...item,
    status,
  };
}

