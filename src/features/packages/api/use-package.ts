import { useMutation , useQuery, useQueryClient } from "@tanstack/react-query";
import { createPackage, CreatePackagePayload , getPackage } from "./package.service";


export const useCreatepackage = (businessId:number | null) => {
    const queryClient = useQueryClient() ; 
    return useMutation({
        mutationFn: async(payload: CreatePackagePayload) => {
            if (businessId == null) null  ; 
            const result  =   await createPackage(payload);
            return result ;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["packages", businessId] });
        },
    });
}

export const useGetPackage = (businessId: number | null) => {
  return useQuery({
    queryKey: ["packages", businessId],
    queryFn: async () => {
      if (businessId == null) return null;
      const data = await getPackage(businessId);
      return data;
    },
    enabled: businessId != null,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};


export const useUpdatePackage = (businessId:number | null) => {

}