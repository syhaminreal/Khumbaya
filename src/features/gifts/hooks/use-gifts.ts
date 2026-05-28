import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    CreateGiftCategoryPayload,
    CreateGiftPayload,
    UpdateGiftCategoryPayload,
    UpdateGiftPayload,
} from "../api/gifts.service";
import {
    createGiftApi,
    createGiftCategoryApi,
    deleteGiftCategoryApi,
    getGiftByIdApi,
    getGiftCategoriesByEventApi,
    getGiftCategoriesWithGiftsApi,
    listGiftsByEventApi,
    updateGiftApi,
    updateGiftCategoryApi,
} from "../api/gifts.service";

export const useGiftCategoriesByEvent = (eventId: number | string) => {
  return useQuery({
    queryKey: ["gift-categories", "event", eventId],
    queryFn: () => getGiftCategoriesByEventApi(eventId),
    enabled: !isNaN(Number(eventId)),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGiftCategoriesWithGifts = (eventId: number | string) => {
  return useQuery({
    queryKey: ["gift-categories-with-gifts", "event", eventId],
    queryFn: () => getGiftCategoriesWithGiftsApi(eventId),
    enabled: !isNaN(Number(eventId)),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGiftsByEvent = (eventId: number | string) => {
  return useQuery({
    queryKey: ["gifts", "event", eventId],
    queryFn: () => listGiftsByEventApi(eventId),
    enabled: !isNaN(Number(eventId)),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGiftById = (giftId?: number | string | null) => {
  return useQuery({
    queryKey: ["gift", giftId],
    queryFn: () => getGiftByIdApi(giftId as number | string),
    enabled: giftId != null,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateGiftCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: number | string;
      payload: CreateGiftCategoryPayload;
    }) => createGiftCategoryApi(eventId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["gift-categories", "event", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["gift-categories-with-gifts", "event", variables.eventId],
      });
    },
  });
};

export const useUpdateGiftCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      eventId,
      payload,
    }: {
      categoryId: number | string;
      eventId: number | string;
      payload: UpdateGiftCategoryPayload;
    }) => updateGiftCategoryApi(categoryId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["gift-categories", "event", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["gift-categories-with-gifts", "event", variables.eventId],
      });
    },
  });
};

export const useDeleteGiftCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      eventId,
    }: {
      categoryId: number | string;
      eventId: number | string;
    }) => deleteGiftCategoryApi(categoryId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["gift-categories", "event", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["gift-categories-with-gifts", "event", variables.eventId],
      });
    },
  });
};

export const useCreateGift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: number | string;
      payload: CreateGiftPayload;
    }) => createGiftApi(eventId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["gifts", "event", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["gift-categories-with-gifts", "event", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["gift-categories", "event", variables.eventId],
      });
    },
  });
};

export const useUpdateGift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      giftId,
      eventId,
      payload,
    }: {
      giftId: number | string;
      eventId: number | string;
      payload: UpdateGiftPayload;
    }) => updateGiftApi(giftId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gift", variables.giftId] });
      queryClient.invalidateQueries({
        queryKey: ["gifts", "event", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["gift-categories-with-gifts", "event", variables.eventId],
      });
    },
  });
};
