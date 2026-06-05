import { useMutation , useQuery, useQueryClient } from "@tanstack/react-query";
import { createPackage, CreatePackagePayload , getPackage , udpatePackage  } from "./package.service";


export const useCreatepackage = (businessId:number | null) => {
    const queryClient = useQueryClient() ; 
    return useMutation({
        mutationFn: async(payload: CreatePackagePayload) => {
            console.log('This is the payload in the use mutation hook ' , payload) ;
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
      console.log('This is the adata from the package from the backend🦮🦮🦮🦮🦮🦮🦮🦮🦮🦮🦮' , data)
      return data;
    },
    enabled: businessId != null,
    // 5 * 60 * 1000
    staleTime:0 ,
    // 30 * 60 * 1000,
    gcTime:0 
  });
};


export const useUpdatePackage = (businessId: number | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payload,
    }: {
      payload: Partial<CreatePackagePayload>;
      packageId: number;
    }) => {
      const result = await udpatePackage(payload);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["packages", businessId],
      });
    },
  });
};