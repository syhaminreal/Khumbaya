export interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  priceLevel?: string;
  location: string;
  image: string;
  city?: string;
}
