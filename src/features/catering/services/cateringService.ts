import api from "@/src/api/axios";
import {
  CateringColumn,
  CateringListResponse,
  CreateCateringPayload,
  UpdateCateringPayload,
} from "../types";

export const getCateringList = async (
  page: number = 1,
  limit: number = 10,
  eventId?: number
) => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (eventId) {
    params.append("eventId", eventId.toString());
  }

  const response = await api.get<{ data: CateringListResponse }>(
    `/catering?${params.toString()}`
  );
  return response.data.data;
};

export const getCateringById = async (cateringId: number) => {
  const response = await api.get<{ data: CateringColumn }>(
    `/catering/${cateringId}`
  );
  return response.data.data;
};

export const createCatering = async (
  eventId: number,
  payload: CreateCateringPayload
) => {
  const response = await api.post<{ data: CateringColumn }>(
    `/event/${eventId}/catering`,
    payload
  );
  return response.data.data;
};

export const updateCatering = async (
  cateringId: number,
  payload: UpdateCateringPayload
) => {
  const response = await api.patch<{ data: CateringColumn }>(
    `/catering/${cateringId}`,
    payload
  );
  return response.data.data;
};

export const deleteCatering = async (cateringId: number) => {
  const response = await api.delete<{ data: { success: boolean } }>(
    `/api/catering/${cateringId}`
  );
  return response.data.data;
};


export const addExpenseToCatering = async (cateringId:number , subEventId:number , eventId:number) => {
  const response = await api.post<{ data: { success: boolean } }>(
    `/catering/expense/${cateringId}`,
    { subEventid:subEventId , eventId:eventId }
  );
  return response.data.data ; 
}