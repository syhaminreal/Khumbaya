import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/src/store/AuthStore";
import { addFavouriteApi, getFavouritesApi, removeFavouriteApi } from "../api/favourite.service";

const QUERY_KEY = ["favourites"];

export const useGetFavourites = () => {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getFavouritesApi,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useToggleFavourite = (businessId: number) => {
  const queryClient = useQueryClient();
  const { data: favourites = [] } = useGetFavourites();
  const isFavourite = favourites.some((b) => b.id === businessId);

  const { mutate: add } = useMutation({
    mutationFn: () => addFavouriteApi(businessId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const { mutate: remove } = useMutation({
    mutationFn: () => removeFavouriteApi(businessId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return { isFavourite, toggle: isFavourite ? remove : add };
};
