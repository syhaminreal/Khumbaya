import api from "@/src/api/axios";
import { Business } from "@/src/features/business/types";

export const getFavouritesApi = async (): Promise<Business[]> => {
  const response = await api.get("/favourites");
  return response.data.data ?? [];
};

export const addFavouriteApi = async (businessId: number): Promise<void> => {
  await api.post(`/favourites/${businessId}`);
};

export const removeFavouriteApi = async (businessId: number): Promise<void> => {
  await api.delete(`/favourites/${businessId}`);
};
