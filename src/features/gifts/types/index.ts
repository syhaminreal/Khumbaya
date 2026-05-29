export interface GiftColumn {
  id: number;
  name: string;
  category: string | null;
  eventId: number;
  value: number | null;
  createdBy: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface GiftCategoryColumn {
  id: number;
  name: string;
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
