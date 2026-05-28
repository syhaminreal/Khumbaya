import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addExpenseToCatering,
  createCatering,
  deleteCatering,
  getCateringById,
  getCateringList,
  updateCatering,
} from "../services/cateringService";
import { CreateCateringPayload, UpdateCateringPayload } from "../types";

export const useCateringList = (
  page: number = 1,
  limit: number = 10,
  eventId?: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["catering-list", page, limit, eventId],
    queryFn: () => getCateringList(page, limit, eventId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled !== false,
  });
};

/**
 * Hook to fetch specific catering plan by ID
 */
export const useCateringById = (
  cateringId: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["catering-detail", cateringId],
    queryFn: () => getCateringById(cateringId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: cateringId > 0 && options?.enabled !== false,
  });
};

/**
 * Hook to create a new catering plan
 */

export const useCreateCateringMutation = (eventId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-catering", eventId],
    mutationFn: (payload: CreateCateringPayload) =>
      createCatering(eventId, payload),
    onSuccess: () => {
      // Refresh catering and budget data after creating
      queryClient.invalidateQueries({
        queryKey: ["catering-list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["catering-list", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["add-budget-category", eventId],
      });
      queryClient.invalidateQueries({ 
        queryKey: ["budget-summary", eventId] 
      });
    },
  });
};
export const useAddExpenseToCateringMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["add-expense-to-catering"],
    mutationFn: (payload: { cateringId: number; subEventId: number , eventId: number }) =>
      addExpenseToCatering(payload.cateringId, payload.subEventId , payload.eventId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["catering-detail", variables.cateringId],
      });
      queryClient.invalidateQueries({
        queryKey: ["sub-event-detail", variables.subEventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["budget-summary", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["category-details"],
      });
    },
  });
}
/**
 * Hook to update catering plan
 */
export const useUpdateCateringMutation = (cateringId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-catering", cateringId],
    mutationFn: (payload: UpdateCateringPayload) =>
      updateCatering(cateringId, payload),
    onSuccess: (data) => {
      // Invalidate catering detail and list queries
      console.log('This is the data in the update of the catering in the hook: 😈😈😈😈😈😈', data);
      queryClient.invalidateQueries({
        queryKey: ["catering-detail", cateringId],
      });
      queryClient.invalidateQueries({
        queryKey: ["catering-list"],
      });
      if (data?.eventId) {
        queryClient.invalidateQueries({
          queryKey: ["catering-list", data.eventId],
        });
        queryClient.invalidateQueries({
          queryKey: ["budget-summary", data.eventId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["category-details"],
      });
      queryClient.invalidateQueries({
        queryKey: ["expense-details"],
      });
    },
  });
};

/**
 * Hook to delete catering plan
 */
export const useDeleteCateringMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-catering"],
    mutationFn: (cateringId: number) => deleteCatering(cateringId),
    onSuccess: (_data, cateringId) => {
      // Invalidate catering detail and list queries
      queryClient.invalidateQueries({
        queryKey: ["catering-detail", cateringId],
      });
      queryClient.invalidateQueries({
        queryKey: ["catering-list"],
      });
    },
  });
};
