import api from "@/src/api/axios";
import { RoomData } from "@/src/features/hotel/types/hotel.types";

export interface InviteGuestPayload {
  fullName: string;
  invitation_name: string;
  numberOfGuests?: number;
  isDraft: boolean;
  phone: string;
  isFamily: boolean;
  role: string;
  category: string;
  status: string;
  isAccomodation: boolean;
}

export interface GuestCategoryOption {
  label: string;
  value: string;
}

export interface CreateGuestCategoryPayload {
  category_title: string;
  priority: 1 | 2 | 3;
}

interface EventGuestCategoryRecord {
  id: number;
  category_title: string;
  eventId: number;
  priority: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export const inviteGuest = async (
  eventId: number,
  payload: InviteGuestPayload
) => {
  const response = await api.post(`/event/${eventId}/invite`, payload);
  return response.data;
};

export const getEventGuest = async (eventId: number) => {
  const response = await api.get(`/event/guest/${eventId}`);
  return response.data.data;
};

export const getEventGuestCategories = async (
  eventId: number
): Promise<GuestCategoryOption[]> => {
  const response = await api.get(`/event/${eventId}/guest-category`);
  const categories = (response.data?.data ?? []) as EventGuestCategoryRecord[];

  return categories.map((item) => ({
    label: item.category_title,
    value: item.category_title,
  }));
};

export const createEventGuestCategory = async (
  eventId: number,
  payload: CreateGuestCategoryPayload
) => {
  const response = await api.post(`/event/${eventId}/guest-category`, payload);
  return response.data;
};

export const getInvitation = async (eventId: number) => {
  const response = await api.get(`/event/${eventId}/invitation`);
  return response.data.data;
};
export const getGuestRoom = async (eventId: number): Promise<RoomData[]> => {
  const response = await api.get(`event/${eventId}/hotel-management`);
  return response.data.data ?? response.data;
};
export const removeInvitation = async (eventId: number, guestId: number) => {
  const response = await api.delete(`/event/${eventId}/invitation`, {
    data: { userId: guestId },
  });
  return response.data.data;
};

export const moveToDraft = async (eventId: number, guestId: number) => {
  const response = await api.patch(`/event/${eventId}/invitation/draft`, {
    userId: guestId,
  });
  return response.data.data;
};

export const importGuestlist = async (
  fromEventId: number,
  toEventId: number
) => {
  const response = await api.post(`/invitation/import-guest`, {
    fromEventId,
    toEventId
  });
  return response.data.data ?? response.data;
};
