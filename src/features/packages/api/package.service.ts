import api from "@/src/api/axios";

export interface PackageItems {
  title: string,
  group: string |undefined,
  quantity: string,
  rate: string,
  amount: string,
  remark: string | undefined 
}
export interface UpdatePackageItem {
  group?: string | undefined,
  title: string | undefined,
  quantity: string | undefined,
  rate: string | undefined,
  amount?: string | undefined,
  remark?: string | undefined

}

export interface CreatePackagePayload {
  businessId: number,
  title: string,
  totalAmount: string,
  currency: string,
  items: PackageItems[]

}
export const createPackage = async (payload: CreatePackagePayload) => {
  const result = await api.post(
    '/package',
    payload
  );
  return result.data.data ?? result.data;

}

export const udpatePackage = async (payload: Partial<Omit<CreatePackagePayload, "businessId">>) => {
  const result = await api.patch(
    '/package',
    payload
  )
  return result.data.data ?? result.data;
}

export const updatePackageItem = async (payload: UpdatePackageItem, packageItemId: number) => {
  const result = await api.patch(
    '/package-item/:id'
  )
  return result.data.data ?? result;
}

export interface GetPackageParams {
  page?: number;
  limit?: number;
}

export const getPackage = async (
  businessId: number,
  { page = 1, limit = 20 }: GetPackageParams = {}
) => {
  const result = await api.get(`/package/${businessId}/business`, {
    params: { page, limit },
  });
  console.log('This is the result from service of package ' , result.data)
  return result.data.data ?? result.data;
}

export const getPackageItem = async (pacakgeId: number) => {
  const result = await api.get(`/package/package/${pacakgeId}`);
  return result.data.data ?? result.data;
}
