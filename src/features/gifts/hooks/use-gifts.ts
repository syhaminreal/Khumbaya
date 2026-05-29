import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateGiftCategoryPayload,
  CreateGiftPayload,
  CreateOrganizerGiftPayload,
  UpdateGiftCategoryPayload,
  UpdateGiftPayload,
} from "../api/gifts.service";
import {
  createGiftApi,
  createGiftCategoryApi,
  createOrganizerToGuestGiftApi,
  deleteGiftApi,
  deleteGiftCategoryApi,
  getGiftByIdApi,
  getGiftCategoriesByEventApi,
  getGiftCategoriesWithGiftsApi,
  listGiftsByEventApi,
  updateGiftApi,
  updateGiftCategoryApi,
} from "../api/gifts.service";

export const useGiftCategoriesByEvent = (eventId: number | string) => {
  const normalizedEventId = String(eventId);

  return useQuery({
    queryKey: ["gift-categories", "event", normalizedEventId],
    queryFn: () => getGiftCategoriesByEventApi(normalizedEventId),
    enabled: Number(normalizedEventId) > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGiftCategoriesWithGifts = (eventId: number | string) => {
  const normalizedEventId = String(eventId);

  return useQuery({
    queryKey: ["gift-categories-with-gifts", "event", normalizedEventId],
    queryFn: () => getGiftCategoriesWithGiftsApi(normalizedEventId),
    enabled: Number(normalizedEventId) > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGiftsByEvent = (eventId: number | string) => {
  const normalizedEventId = String(eventId);

  return useQuery({
    queryKey: ["gifts", "event", normalizedEventId],
    queryFn: () => listGiftsByEventApi(normalizedEventId),
    enabled: Number(normalizedEventId) > 0,
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
      const eventId = String(variables.eventId);

      queryClient.invalidateQueries({
        queryKey: ["gift-categories", "event", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["gift-categories-with-gifts", "event", eventId],
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
      const eventId = String(variables.eventId);

      queryClient.invalidateQueries({
        queryKey: ["gift-categories", "event", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["gift-categories-with-gifts", "event", eventId],
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
      const eventId = String(variables.eventId);

      queryClient.invalidateQueries({
        queryKey: ["gift-categories", "event", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["gift-categories-with-gifts", "event", eventId],
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
      const eventId = String(variables.eventId);

      queryClient.invalidateQueries({
        queryKey: ["gifts", "event", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["gift-categories-with-gifts", "event", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["gift-categories", "event", eventId],
      });
    },
  });
};

export const useCreateOrganizerToGuestGift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: number | string;
      payload: CreateOrganizerGiftPayload;
    }) => createOrganizerToGuestGiftApi(eventId, payload),
    onSuccess: (_data, variables) => {
      const eventId = String(variables.eventId);

      queryClient.invalidateQueries({
        queryKey: ["gifts", "event", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["gift-categories-with-gifts", "event", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["gift-categories", "event", eventId],
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
      const eventId = String(variables.eventId);

      queryClient.invalidateQueries({ queryKey: ["gift", variables.giftId] });
      queryClient.invalidateQueries({
        queryKey: ["gifts", "event", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["gift-categories-with-gifts", "event", eventId],
      });
    },
  });
};

export const useDeleteGift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      giftId,
      eventId,
    }: {
      giftId: number | string;
      eventId: number | string;
    }) => deleteGiftApi(giftId),
    onSuccess: (_data, variables) => {
      const eventId = String(variables.eventId);

      queryClient.invalidateQueries({
        queryKey: ["gifts", "event", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["gift-categories-with-gifts", "event", eventId],
      });
    },
  });
};
