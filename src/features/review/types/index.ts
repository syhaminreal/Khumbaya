export type ReviewResponse = {
  id: number;
  businessId: number;
  userId: number;
  rating: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  businessName?: string;
  businessAvatar?: string | null;
  reviewerAvatar?: string | null;
  reviewerName?: string;
  username?: string | null;
  user?: {
    id?: number;
    username?: string | null;
    name?: string | null;
    photo?: string | null;
  } | null;
};

export type ReviewListResponse = {
  items: ReviewResponse[];
  page: number;
  totalItems: number;
  totalPages: number;
};

export type ReviewQueryParams = {
  businessId?: number;
  userId?: number;
  page?: number;
  limit?: number;
};

export type CreateReviewPayload = {
  businessId: number;
  rating: number;
  description?: string | null;
};

export type CreateReviewForBusinessPayload = {
  rating: number;
  description?: string | null;
};

export type UpdateReviewPayload = {
  rating?: number;
  description?: string | null;
};
