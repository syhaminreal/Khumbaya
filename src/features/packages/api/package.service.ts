import api from "@/src/api/axios";

export interface PackageItems { 
    title:string , 
    group:string , 
    quantity:string , 
    rate:string , 
    amount:string , 
    remark:string
}
export interface UpdatePackageItem {
    group:string| undefined  , 
    title : string | undefined, 
    quantity:string | undefined , 
    rate:string   | undefined, 
    amount:string | undefined , 
    remark:string| undefined 

}

export interface CreatePackagePayload { 
    businessId:number  , 
    title:string , 
    totalAmount:string , 
    currency:string , 
    items:PackageItems

}
export const createPackage = async(payload:CreatePackagePayload)=>{
    const result = await api.post(
        '/package' , 
        payload
    ) ; 
    return result.data.data ?? result.data ; 

}

export const udpatePackage = async(payload:Partial<Omit<CreatePackagePayload ,"businessId">> )=>{
    const result = await api.patch(
        '/package' , 
        payload
    )
    return result.data.data ?? result.data ; 
}

export const updatePackageItem  = async(payload:UpdatePackageItem  ,packageItemId:number)=>{
    const result = await api.patch(
        '/package-item/:id'
    )
    return result.data.data ?? result;
}

export const getPackage = async(businessId:number) => {
    const result = await api.get(`/package/business/${businessId}` ) ; 
    return result.data.data ?? result.data ; 
}

export const getPackageItem = async(pacakgeId:number)=>{
    const result = await api.get(`/package/package/${pacakgeId}`) ;
    return result.data.data ?? result.data ;
}