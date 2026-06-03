import api from "@/src/api/axios";
import { Event } from "@/src/constants/event";
import { formatDate, formatTime } from "@/src/utils/helper";
import { Invitation } from "../../guests/types";
export interface CREATEEVENT {
  title: string;
  description?: string;
  type?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  budget?: number;
  theme?: string;
  parentId?: number;
  location?: string;
  venue?: string;
  venueId?: number | null;
  role?: string;
  imageUrl?: string;
  imageFile?: {
    uri: string;
    name: string;
    type: string;
  };
  rsvpDeadline?: string;
}
export interface MakeEventMemberType {
  userId: number;
  role: string;
}
export interface EVENT {
  id: number;
  title: string;
  description?: string;
  type?: string;
  startDateTime?: string;
  endDateTime?: string;
  budget?: number;
  theme?: string;
  parentId?: number;
  location?: string;
  venue?: string | null;
  venueId?: number | null;
  role?: string;
  status?: string;
  organizer?: number;
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string;
  eventMembershipId?: number;
  rsvpDeadline?: string;
}

interface InvitationRecord {
  id?: number;
  eventId?: number;
  status?: string;
}

interface InvitationEventRecord {
  id?: number;
  eventId?: number;
  title?: string;
  startDate?: string;
  startDateTime?: string;
  startTime?: string | null;
  endDate?: string;
  endDateTime?: string;
  location?: string;
  venue?: string | null;
  imageUrl?: string;
}

interface InvitationItem {
  id?: number;
  invitation_status?: string;
  status?: string;
  invitation?: InvitationRecord;
  event?: InvitationEventRecord;
  event_detail?: InvitationEventRecord;
}

interface GetEventsParams {
  page?: number;
  limit?: number;
}
//TODO: update this shit  this is shit literal shit

const mapInvitationToEvent = (item: InvitationItem): Event => {
  const detail = item.event_detail ?? item.event ?? {};
  const invitation = item.invitation ?? {};

  const invitationStatus = (
    item.invitation_status ??
    item.status ??
    invitation.status ??
    ""
  ).toLowerCase();

  const startDateTime = detail.startDateTime ?? detail.startDate ?? "";
  const endDateTimeValue = detail.endDateTime ?? detail.endDate ?? "";

  const now = Date.now();
  const endDateTime = endDateTimeValue
    ? new Date(endDateTimeValue).getTime()
    : undefined;

  const status =
    invitationStatus === "pending"
      ? "invited"
      : typeof endDateTime === "number" && endDateTime < now
        ? "completed"
        : "upcoming";

  const resolvedEventId =
    detail.eventId ??
    detail.id ??
    invitation.eventId ??
    item.id ??
    invitation.id;
  const resolvedInvitationId = item.id ?? invitation.id;

  return {
    id: String(resolvedEventId ?? ""),
    invitationId: resolvedInvitationId,
    title: detail.title ?? "Untitled Event",
    startDateTime,
    endDateTime: endDateTimeValue,
    date: formatDate(startDateTime),
    time: formatTime(startDateTime, detail.startTime),
    location: detail.location ?? "",
    venue: detail.venue ?? detail.location ?? "",
    imageUrl: detail.imageUrl ?? "",
    role: "Guest",
    status,
  };
};

export const createEventApi = async (data: CREATEEVENT) => {
  if (data.imageFile) {
    const { imageFile, ...payload } = data;
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    formData.append("file", imageFile as any);

    const response = await api.post("/event", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  const response = await api.post("/event", data);
  return response.data;
};

export const getUpcomingEventsApi = async ({
  page = 1,
  limit = 20,
}: GetEventsParams = {}) => {
  const response = await api.get("/event", {
    params: { page, limit },
  });
  const payload = response.data?.data;
  //TODO: FIX THIS SHIT
  if (Array.isArray(payload?.items)) {
    return payload.items.map((item: any, index: number) => {
      // Merge properties from the indexed key (e.g., payload["0"]) if it exists
      const extraData = payload[index.toString()] || {};
      const mergedItem = {
        ...extraData, // Take properties from indexed key first as it seems more complete
        ...item, // Then overwrite with item properties if any
      };

      const startDateTime = mergedItem.startDateTime || mergedItem.startDate;
      const location = mergedItem.location ?? "";
      const venue = mergedItem.venue ?? "";

      return {
        ...mergedItem,
        id: String(mergedItem.id),
        date: formatDate(startDateTime),
        time: formatTime(startDateTime),
        location,
        venue,
        role: mergedItem.role || "Guest",
        dressCode: mergedItem.dressCode ?? mergedItem.dress_code ?? null,
      } as Event;
    });
  }
  return [];
};

export const getInvitedEvent = async () => {
  const response = await api.get("/rsvp/invitations");
  const payload = response.data?.data;

  if (Array.isArray(payload?.items)) {
    const mapped: Event[] = payload.items
      .map(mapInvitationToEvent)
      .filter((event: Event) => Boolean(event.id));
    return mapped;
  }

  return [] as Event[];
};

export const getCompletedEventsApi = async ({
  page = 1,
  limit = 20,
}: GetEventsParams = {}) => {
  const events = await getUpcomingEventsApi({ page, limit });
  const now = new Date();
  return events.filter((event: Event) => {
    const dateStr = event.endDateTime || event.startDateTime;
    const date = dateStr ? new Date(dateStr) : null;
    return !!date && !Number.isNaN(date.getTime()) && date < now;
  });
};

export const acceptRsvpInvitationApi = async (invitationId: number) => {
  const response = await api.post(`/rsvp/accept/${invitationId}`);
  return response.data;
};
export const updateEventApi = async (id: number, data: Partial<Event>) => {
  const response = await api.patch(`/event/${id}`, data);
  return response.data;
};
export const deleteEventApi = async (id: number) => {
  const response = await api.delete(`/event/${id}`);
  return response.data;
};
export const duplicateEventApi = async (eventId: string | number) => {
  const response = await api.post(`/event/${eventId}/duplicate`);
  return response.data;
};
export const getEventGuest = async (id: number) => {
  const response = await api.get(`/event/${id}/guests`);
  return response.data;
};
export const getEventById = async (id: number): Promise<Event> => {
  const response = await api.get(`/event/${id}`);
  return response.data.data;
};

export const getResponsesWithUser = async (eventId: number) => {
  const response = await api.get(`/invitation/event-responses/${eventId}`);
  return response.data.data;
};

export const submitRsvpResponseApi = async (
  eventId: number,
  payload: Partial<Invitation>
) => {
  console.log(  'This is the event ervice p🤒p🤒p🤒p🤒p🤒p🤒p🤒p🤒ayload' , payload);
  const response = await api.post(`/invitation/responce/${eventId}`, payload);
  return response.data;
};

export const getSubEventOfEvent = async (eventId: number) => {
  const response = await api.get(`/event/${eventId}/sub-events`);
  return response.data.data;
};

export const getEventGallery = async (eventId: string) => {
  const response = await api.get(`/gallery/event/${eventId}`);
  return response.data?.data ?? [];
};

export const uploadEventGalleryImage = async (
  eventId: string,
  file: {
    uri: string;
    name: string;
    type: string;
  }
) => {
  const data = new FormData();
  data.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  const response = await api.post(`/gallery/event/${eventId}/upload`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteEventGalleryImage = async (
  eventId: string,
  imageId: string
) => {
  const response = await api.delete(`/gallery/event/${eventId}/${imageId}`);
  return response.data;
};

export const makeEventMember = async (
  eventId: number | string,
  data: MakeEventMemberType
) => {
  const response = await api.post(`/event/${eventId}/member`, data);
  return response.data;
};
export const removeEventMember = async (eventId: number, userId: number) => {
  const response = await api.delete(`/event/${eventId}/member/${userId}`);
  return response.data;
};
export const getEventCategory = async () => {
  const responce = await api.get("/general-category");
  return responce;
};
export const getEventOwners = async (eventId: string) => {
  const response = await api.get(`/event/${eventId}/users`);
  return response.data.data;
};
