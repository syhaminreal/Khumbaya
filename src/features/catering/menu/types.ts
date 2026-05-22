// ─── Menu Types ────────────────────────────────────────────────────────────────

export interface MenuItemColumn {
  id: number;
  name: string;
  description: string;
  cateringId: number;
  guestCount?:number ; 
  note?: string;
  type: string;
  menuType: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MenuListResponse {
  items: MenuItemColumn[];
  page: number;
  totalItems: number;
  totalPages: number;
}

export interface CreateMenuPayload {
  name: string;
  description: string;
  guestCount?: number
  note?: string;
  type: string;
}

export interface UpdateMenuPayload {
  name?: string;
  description?: string;
  type?: string;
  menuType?: string;
}

export interface CreateMenuResponse extends MenuItemColumn { }

export interface UpdateMenuResponse extends MenuItemColumn { }
