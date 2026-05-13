import {
  createReviewApi,
  createReviewForBusinessApi,
  deleteReviewApi,
  getReviewApi,
  getReviewsApi,
  updateReviewApi,
} from "@/src/features/review/api";
import type {
  CreateReviewForBusinessPayload,
  CreateReviewPayload,
  ReviewListResponse,
  ReviewQueryParams,
  ReviewResponse,
  UpdateReviewPayload,
} from "@/src/features/review/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useReviews = (params?: ReviewQueryParams) => {
  return useQuery<ReviewListResponse>({
    queryKey: ["reviews", params],
    queryFn: () => getReviewsApi(params),
    enabled: params !== undefined && Object.keys(params).length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useReview = (id?: number | string | null) => {
  return useQuery<ReviewResponse>({
    queryKey: ["review", id],
    queryFn: () => getReviewApi(id as number | string),
    enabled:
      typeof id === "number" ||
      (typeof id === "string" && id.trim().length > 0),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createReviewApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};

export const useCreateReviewForBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      payload,
    }: {
      businessId: number | string;
      payload: CreateReviewForBusinessPayload;
    }) => createReviewForBusinessApi(businessId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"], exact: false });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: UpdateReviewPayload;
    }) => updateReviewApi(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["review", variables.id],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["reviews"], exact: false });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteReviewApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};
