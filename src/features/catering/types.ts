
export type MealType =
  | "Breakfast"
  | "Lunch"
  | "High Tea"
  | "Dinner"
  | "Late Night";

export interface CateringColumn {
    id: number;
  name: string;
  perPlateprice: number;
  noOfpax :number ; 
  startDateTime: Date;
  endDateTime: Date;
  eventId: number;
  mealType: string;
  isVeg: boolean;
  vendorId: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;

}

export interface CateringDetail extends CateringColumn {}

export interface CateringListResponse {
  items: CateringColumn[];
  page: number;
  totalItems: number;
  totalPages: number;
}

export interface CreateCateringPayload {
  name: string;
  perPlateprice: number;
  noOfpax: number|null ;
  startDateTime: string | Date;
  endDateTime: string | Date;
  mealType: string;
  vendorId?: number | null;
}

export type UpdateCateringPayload = Partial<CateringColumn> ;  
