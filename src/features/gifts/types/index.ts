export interface GiftColumn {
  id: number;
  title: string;
  description?: string | null;
  categoryId: number | null;
  category?: string | null;
  price: number | null;
  currency?: string | null;
  recipientId?: number | null;
  recipientName?: string | null;
  businessId?: number | null;
  maxPerGuest?: number | null;
  totalStock?: number | null;
  eventId: number;
  createdBy: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface GiftCategoryColumn {
  id: number;
  name: string;
  description?: string | null;
  eventId: number;
  createdBy: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface GiftCategoryWithGifts extends GiftCategoryColumn {
  gifts: Partial<GiftColumn>[];
}

export interface GiftCategoryLookupOption {
  value: number;
  label: string;
}

export interface GiftLookupOption {
  value: number;
  label: string;
  categoryId: number | null;
}
