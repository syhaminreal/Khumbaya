import api from "@/src/api/axios";
import type {
  GiftCategoryColumn,
  GiftCategoryWithGifts,
  GiftColumn,
} from "../types";

const unwrapList = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === "object") {
    const value = payload as {
      data?: unknown;
      items?: unknown;
      rows?: unknown;
      results?: unknown;
    };

    if (Array.isArray(value.data)) {
      return value.data as T[];
    }
    if (Array.isArray(value.items)) {
      return value.items as T[];
    }
    if (Array.isArray(value.rows)) {
      return value.rows as T[];
    }
    if (Array.isArray(value.results)) {
      return value.results as T[];
    }
  }

  return [];
};

export interface CreateGiftCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdateGiftCategoryPayload {
  name?: string;
  description?: string;
}

export interface CreateGiftPayload {
  title: string;
  description?: string | null;
  categoryId: number;
  price: number;
  currency: string;
  recipientId?: number | null;
  businessId?: number | null;
  maxPerGuest?: number | null;
  totalStock?: number | null;
}

export interface CreateOrganizerGiftPayload {
  title: string;
  description: string;
  categoryId: number;
  price: number;
  currency: string;
  businessId?: number | null;
  recipientId?: number | null;
  maxPerGuest: number;
  totalStock: number;
}

export interface UpdateGiftPayload {
  title?: string;
  categoryId?: number;
  price?: number;
  currency?: string;
  businessId?: number | null;
  recipientId?: number | null;
}

export const getGiftCategoriesByEventApi = async (
  eventId: number | string
): Promise<GiftCategoryColumn[]> => {
  const response = await api.get(`/event/${eventId}/gift-category`);
  return unwrapList<GiftCategoryColumn>(response.data?.data ?? response.data);
};

export const getGiftCategoriesWithGiftsApi = async (
  eventId: number | string
): Promise<GiftCategoryWithGifts[]> => {
  const [categories, gifts] = await Promise.all([
    getGiftCategoriesByEventApi(eventId),
    listGiftsByEventApi(eventId),
  ]);

  return categories.map((category) => ({
    ...category,
    gifts: gifts.filter((gift) => gift.categoryId === category.id),
  }));
};

export const listGiftsByEventApi = async (
  eventId: number | string
): Promise<GiftColumn[]> => {
  const response = await api.get(`/event/${eventId}/gift`);
  return unwrapList<GiftColumn>(response.data?.data ?? response.data);
};

export const getGiftByIdApi = async (
  giftId: number | string
): Promise<GiftColumn> => {
  const response = await api.get(`/gift/${giftId}`);
  return response.data?.data ?? response.data;
};

export const createGiftCategoryApi = async (
  eventId: number | string,
  payload: CreateGiftCategoryPayload
) => {
  const response = await api.post(`/event/${eventId}/gift-category`, payload);
  return response.data?.data ?? response.data;
};

export const updateGiftCategoryApi = async (
  categoryId: number | string,
  payload: UpdateGiftCategoryPayload
) => {
  const response = await api.patch(`/gift-category/${categoryId}`, payload);
  return response.data?.data ?? response.data;
};

export const deleteGiftCategoryApi = async (categoryId: number | string) => {
  const response = await api.delete(`/gift-category/${categoryId}`);
  return response.data?.data ?? response.data;
};

export const createGiftApi = async (
  eventId: number | string,
  payload: CreateGiftPayload
) => {
  const response = await api.post(`/event/${eventId}/gift`, payload);
  return response.data?.data ?? response.data;
};

export const createOrganizerToGuestGiftApi = async (
  eventId: number | string,
  payload: CreateOrganizerGiftPayload
) => {
  const response = await api.post(
    `/event/${eventId}/gift/organizer-to-guest`,
    payload
  );
  return response.data?.data ?? response.data;
};

export const updateGiftApi = async (
  giftId: number | string,
  payload: UpdateGiftPayload
) => {
  const response = await api.patch(`/gift/${giftId}`, payload);
  return response.data?.data ?? response.data;
};

export const deleteGiftApi = async (giftId: number | string) => {
  const response = await api.delete(`/gift/${giftId}`);
  return response.data?.data ?? response.data;
};
