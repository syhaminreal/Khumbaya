export interface Event {
  id: string;
  invitationId?: number;
  title: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  dressCode?: string | null;
  venue: string;
  venueId?: number | null;
  venueBusinessid?: number | null;
  imageUrl: string;
  role: EventRole;
  status: EventTab;
  date: string;
  time: string;
  description?: string;
  type?: EventType;
  budget?: number;
  theme?: string;
  parentId?: number;
  organizer?: number;
  createdAt?: string;
  updatedAt?: string;
  rsvpDeadline?: string;
}

export type SubEvent = Event;

export type EventRole = "Vendor" | "Organizer" | "Guest";
export type EventTab = "upcoming" | "invited" | "completed";

export type EventType =
  | "Wedding"
  | "Engagement"
  | "Reception"
  | "Nikkah"
  | "Other";

export const EVENT_TYPES: EventType[] = [
  "Wedding",
  "Engagement",
  "Reception",
  "Nikkah",
  "Other",
];

export const EVENT_TYPE_TO_BACKEND: Record<EventType, string> = {
  Wedding: "WEDDING",
  Engagement: "ENGAGEMENT",
  Reception: "RECEPTION",
  Nikkah: "NIKKAH",
  Other: "OTHER",
};

export const BACKEND_TO_EVENT_TYPE: Record<string, EventType> = {
  WEDDING: "Wedding",
  ENGAGEMENT: "Engagement",
  RECEPTION: "Reception",
  NIKKAH: "Nikkah",
  OTHER: "Other",
};
