import api from "@/src/api/axios";
import type {
    GiftCategoryColumn,
    GiftCategoryWithGifts,
    GiftColumn,
} from "../types";

export interface CreateGiftCategoryPayload {
	name: string;
}

export interface UpdateGiftCategoryPayload {
	name?: string;
}

export interface CreateGiftPayload {
	name: string;
	category: string;
	value?: number;
}

export interface UpdateGiftPayload {
	name?: string;
	category?: string;
	value?: number;
}

export const getGiftCategoriesByEventApi = async (
	eventId: number | string
): Promise<GiftCategoryColumn[]> => {
	const response = await api.get(`/gift-categories/event/${eventId}`);
	return response.data?.data ?? response.data;
};

export const getGiftCategoriesWithGiftsApi = async (
	eventId: number | string
): Promise<GiftCategoryWithGifts[]> => {
	const response = await api.get(
		`/gift-categories/event/${eventId}/gifts`
	);
	return response.data?.data ?? response.data;
};

export const listGiftsByEventApi = async (
	eventId: number | string
): Promise<GiftColumn[]> => {
	const response = await api.get(`/gift/event/${eventId}`);
	return response.data?.data ?? response.data;
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
	const response = await api.post(
		`/gift-categories/event/${eventId}`,
		payload
	);
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
	const response = await api.post(`/gift/event/${eventId}`, payload);
	return response.data?.data ?? response.data;
};

export const updateGiftApi = async (
	giftId: number | string,
	payload: UpdateGiftPayload
) => {
	const response = await api.patch(`/gift/${giftId}`, payload);
	return response.data?.data ?? response.data;
};
