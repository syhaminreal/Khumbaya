import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addEventVendorApi,
  AddEventVendorPayload,
  createBusinessApi,
  createBusinessVenueApi,
  deleteBusinessApi,
  getBusinessByIdApi,
  getBusinessListApi,
  getEventBusinessApi,
  getEventOfBusiness,
  getEventVendorApi,
  getVendorEventsForMemberApi,
  getMyBusiness,
  getUserBusiness,
  ReviewPayload,
  submitVendorReviewApi,
  updateBusinessApi,
  updateBusinessServiceApi,
  updateBusinessVenueApi,
} from "../api";
import {
  CreateBusinessPayload,
  CreateBusinessVenuePayload,
  UpdateBusinessPayload,
  UpdateBusinessServicePayload,
  UpdateBusinessVenuePayload,
} from "../types";

export const useGetBusinessList = (userId?: number) => {
  return useQuery({
    queryKey: ["business/list", userId],
    queryFn: () => getBusinessListApi(userId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
export const useGetMyBusiness = () => {
  return useQuery({
    queryKey: ["business/me",],
    queryFn: () => getMyBusiness(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,

  })
}

export const useGetBusinessById = (id: string) => {
  return useQuery({
    queryKey: ["business", id],
    queryFn: () => getBusinessByIdApi(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useCreateBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBusinessPayload) => createBusinessApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business/me"] });
    },
  });
};

export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateBusinessPayload;
    }) => updateBusinessApi(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["business/list"] });
      queryClient.invalidateQueries({ queryKey: ["business", id] });
    },
  });
};

export const useDeleteBusiness = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBusinessApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business/list"] });
    },
  });
};

export const useUpdateBusinessService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceId,
      payload,
      businessId,
    }: {
      serviceId: number | string;
      payload: UpdateBusinessServicePayload;
      businessId?: string | number;
    }) => updateBusinessServiceApi(serviceId, payload),
    onSuccess: (data, variables) => {
      const resolvedBusinessId =
        data?.businessInformation?.id ?? variables.businessId;

      queryClient.invalidateQueries({ queryKey: ["business/list"] });

      if (resolvedBusinessId) {
        queryClient.invalidateQueries({
          queryKey: ["business", String(resolvedBusinessId)],
        });
      }
    },
  });
};

export const useUpdateBusinessVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      venueId,
      payload,
      businessId,
    }: {
      venueId: number | string;
      payload: UpdateBusinessVenuePayload;
      businessId?: string | number;
    }) => updateBusinessVenueApi(venueId, payload),
    onSuccess: (data, variables) => {
      const resolvedBusinessId =
        data?.businessInformation?.id ?? variables.businessId;

      queryClient.invalidateQueries({ queryKey: ["business/list"] });

      if (resolvedBusinessId) {
        queryClient.invalidateQueries({
          queryKey: ["business", String(resolvedBusinessId)],
        });
      }
    },
  });
};

export const useCreateBusinessVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBusinessVenuePayload) =>
      createBusinessVenueApi(payload),
    onSuccess: (data, variables) => {
      const resolvedBusinessId =
        data?.businessInformation?.id ?? variables.businessId;

      queryClient.invalidateQueries({ queryKey: ["business/list"] });

      if (resolvedBusinessId) {
        queryClient.invalidateQueries({
          queryKey: ["business", String(resolvedBusinessId)],
        });
      }
    },
  });
};

export const useAddEventVendor = (userId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: string | number;
      payload: AddEventVendorPayload;
    }) => addEventVendorApi(eventId, payload),
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["event-business", eventId] });
      queryClient.invalidateQueries({ queryKey: ["business-event", userId] });
    },
  });
};

export const useGetEventBusiness = (eventId: string | number) => {
  return useGetBusinessByEventId(eventId);
};

export const useGetBusinessByEventId = (
  eventId: string | number | null | undefined
) => {
  const hasValidEventId =
    (typeof eventId === "number" && !Number.isNaN(eventId)) ||
    (typeof eventId === "string" && eventId.trim().length > 0);

  return useQuery({
    queryKey: ["event-business", eventId],
    queryFn: () => getEventBusinessApi(eventId as string | number),
    enabled: hasValidEventId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useGetEventOfBusiness = (
  businessIds: number[],
  userId: number
) => {
  return useQuery({
    queryKey: ["business-event", userId],
    queryFn: () => getEventOfBusiness(businessIds),
    enabled: businessIds.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useGetEventVendor = (eventId: string | number, vendorId: string | number) => {
  return useQuery({
    queryKey: ["event-vendor", eventId, vendorId],
    queryFn: () => getEventVendorApi(eventId, vendorId),
    enabled: !!eventId && !!vendorId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useGetVendorEventsForMember = (vendorId: string | number) => {
  return useQuery({
    queryKey: ["vendor-events-for-member", vendorId],
    queryFn: () => getVendorEventsForMemberApi(vendorId),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useGetVendorEventInvitations = (businessIds: number[]) => {
  return useQuery({
    queryKey: ["vendor-event-invitations", businessIds],
    queryFn: () => getEventOfBusiness(businessIds),
    enabled: businessIds.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useGetUserBusiness = (userId: number) => {
  return useQuery({
    queryKey: ["user-business", userId],
    queryFn: () => getUserBusiness(),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useSubmitVendorReview = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (review: ReviewPayload) => submitVendorReviewApi(businessId, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business", businessId] });
    },
  });
};
