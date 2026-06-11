import api from "@/src/api/axios";
import { Business, BusinessWithAttribute } from "@/src/features/business/types/index";
import {
  CreateBusinessPayload,
  CreateBusinessVenuePayload,
  UpdateBusinessPayload,
  UpdateBusinessServicePayload,
  UpdateBusinessVenuePayload,
} from "../types";

export const getBusinessListApi = async (
  userId?: number
): Promise<Business[]> => {
  const response = await api.get(
    `/business${userId ? `?userId=${userId}` : ""}`
  );
  const payload = response.data?.data;
  // API returns array directly or paginated with .items
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
};

export const createBusinessApi = async (
  payload: CreateBusinessPayload
): Promise<Business> => {
  const response = await api.post("/business", payload);
  return response.data.data;
};

export const getBusinessByIdApi = async (
  id: number | string  ,
  category?:string 
): Promise<BusinessWithAttribute> => {
  const response = await api.get(`/business/${id}?category=${category}`);
  return response.data.data;
};

export const updateBusinessApi = async (
  id: number | string,
  payload: UpdateBusinessPayload
): Promise<BusinessWithAttribute> => {
  const response = await api.patch(`/business/${id}`, payload);
  return response.data.data;
};

export const sendEnquiry = async (params: any, businessId: number) => {
  const response = await api.patch(`/business/${businessId}`, params);
  return response.data.data ?? response.data;
};
export const updateBusinessServiceApi = async (
  serviceId: number | string,
  params: UpdateBusinessServicePayload
): Promise<BusinessWithAttribute> => {
  const response = await api.patch(`/business/service/${serviceId}`, params);
  return response.data.data;
};

export const updateBusinessVenueApi = async (
  venueId: number | string,
  params: UpdateBusinessVenuePayload
): Promise<BusinessWithAttribute> => {
  const response = await api.patch(`/business/venue/${venueId}`, params);
  return response.data.data;
};

export const createBusinessVenueApi = async (
  params: CreateBusinessVenuePayload
): Promise<BusinessWithAttribute> => {
  const response = await api.post(
    `/business/${params.businessId}/venue`,
    params
  );
  console.log('this ivenue_typevenue_types te apya🍳🍳🍳🍳🍳🍳🍳load to make the new venue in the system of the vendor business with the ingormation , ', params);
  return response.data.data;
};

export const deleteBusinessApi = async (id: number | string): Promise<void> => {
  await api.delete(`/business/${id}`);
};

export interface AddEventVendorPayload {
  vendorId: number;
  budget?: string;
  estimatedGuest?: number;
  notes?: string;
  status?: string;
}

export const addEventVendorApi = async (
  eventId: string | number,
  payload: AddEventVendorPayload
): Promise<any> => {
  const response = await api.post(`/vendor/event/${eventId}`, payload);
  return response.data.data;
};

export const getEventBusinessApi = async (
  eventId: string | number
): Promise<Business[]> => {
  const response = await api.get(`/event/vendor/${eventId}/`);
  const payload = response.data?.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
};
export const getMyBusiness = async (): Promise<Business[]> => {
  const response = await api.get("/business/me");
  return response.data.data ?? response.data;
}

export const getEventOfBusiness = async (
  businessId: number[],
  status?: string
) => {
  if (!businessId || businessId.length === 0) {
    return [];
  }

  const businessIdString = businessId.join(",");
  const response = await api.get(
    `/business/events/${businessIdString}${status ? `?status=${status}` : ""}`
  );
  return response.data.data;
};

export const getUserBusiness = async () => {
  const response = await api.get("/my/businesses");
  return response.data?.data;
};

export interface ReviewPayload {
  rating: number;
  quote: string;
  reviewerName: string;
  reviewerAvatarUrl: string;
  date: string;
}

export const getEventVendorApi = async (
  eventId: string | number,
  vendorId: string | number
): Promise<any> => {
  const response = await api.get(`/event/${eventId}/vendor/${vendorId}`);
  return response.data.data;
};

export const submitVendorReviewApi = async (
  businessId: number | string,
  review: ReviewPayload
): Promise<any> => {
  const response = await api.patch(`/business/${businessId}`, { reviews: [review] });
  return response.data.data;
};

export const getVendorEventsForMemberApi = async (
  vendorId: string | number
): Promise<any[]> => {
  const response = await api.get(`/business/${vendorId}/my-events`);
  const payload = response.data?.data;
  return Array.isArray(payload) ? payload : (payload?.items ?? []);
};
