export enum BusinessCategory {
  Venue = "Venue",
  PhotographerVideographer = "Photographers & Videographer",
  MakeupArtist = "Makeup Artist",
  BridalGrooming = "Bridal Grooming",
  MehendiArtist = "Mehendi Artist",
  WeddingPlannersDecorator = "Wedding Planners & Decorator",
  MusicEntertainment = "Music & Entertainment",
  InvitesGift = "Invites & Gift",
  FoodCatering = "Food & Catering",
  PreWeddingShoot = "Pre Wedding Shoot",
  BridalWear = "Bridal Wear",
  JewelryAccessories = "Jewelry & Accessories",
  SecurityGuard = "Security Guard",
  Baraat = "Baraat"
}

export interface CreateBusinessPayload {
  businessName: string;
  category: BusinessCategory;
  description?: string;
  city?: string;
  country?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  cover?: string;
  categoryDetails?: Record<string, string | boolean>;
  contactPhone?: string;
  email?: string;
  websiteUrl?: string;
  whatsappNumber?: string;
  contactPersonName?: string;
}

export type  UpdateBusinessPayload = Partial<Omit<Business , "id" | "ownerId" | "createdAt" | "updatedAt">>;

export type UpdateBusinessServicePayload = Partial<
  Omit<OtherServiceAttribute, "id" | "businessId" | "createdAt" | "updatedAt">
>;

export type UpdateBusinessVenuePayload = Partial<
  Omit<VenueAttribute, "id" | "businessId" | "createdAt" | "updatedAt">
>;

export type CreateBusinessVenuePayload = {
  businessId: number | string;
} & UpdateBusinessVenuePayload;



export interface BusinessService {
  id: string;
  title: string;
  price: string;
  description: string;
  iconName: string;
}

export interface BusinessRequest {
  id: string;
  clientName: string;
  clientAvatarUrl: string;
  date: string;
  eventType: string;
  status: "pending" | "confirmed" | "rejected";
}

export interface BusinessReview {
  id: string;
  reviewerName: string;
  reviewerAvatarUrl: string;
  rating: number;
  quote: string;
  date: string;
}
 
export interface VenueAttribute {
  venueId: number;
  businessId: number;
  venueName: string | null;
  venueType: string | null;
  capacity: number | null;
  areaSqft: number | null;
  minBookinghours: number | null;
  maxBookinghours: number | null;
  hasCatering: boolean;
  hasAvequipment: boolean;
  isOutDoor: boolean;
  pricePerhour: number | null;
  parking: boolean;
  roomsAvailable: number | null;
  valetAvailable: boolean;
  alcoholAllowed: boolean;
  soundLimitdb: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface OtherServiceAttribute {
  id: number;
  businessId: number;
  artistType: string | null;
  stylesSpecialized: string | null;
  maxBookingsPerDay: number | null;
  advanceAmount: number | null;
  usesOwnMaterial: boolean;
  travelCharges: number | null;
  portfolioLink: string | null;
  availableForDestination: boolean;
  customizationAvailable: boolean;
  servicesVeg: boolean;
  minOrder: number | null;
  createdAt: Date | null ;
  updatedAt: Date | null ;
}

export interface Business {
  id: number;
  businessName: string;
  category?: string | null;
  avatar?: string | null;
  cover?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  email?: string | null;
  city?: string | null;
  country?: string | null;
  legalDocument?: string | null;
  isVerified?: boolean | null;
  ownerId: number;
  description?: string | null;
  priceStartingFrom?: number | null;
  yearsOfExperience?: number | null;
  teamSize?: number | null;
  serviceArea?: string | null;
  contactPersonname?: string | null;
  contactPersonName?: string | null;
  contactPhone?: string | null;
  websiteUrl?: string | null;
  instagramUrl?: string | null;
  whatsappNumber?: string | null;
  providesHomeService?: boolean | null;
  travelPolicy?: string | null;
  cancellationPolicy?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  // Stats - potentially derived or to be added to backend
  totalBookings?: number | null;
  upcomingEvents?: number | null;
  profileViews?: number | null;
}

export interface BusinessWithAttribute {
  businessInformation: Business,
  venueInformation: VenueAttribute[],
  vendorServicesinformation: OtherServiceAttribute[]
}

export interface VendorEventInvitation {
  id: number;
  eventId: number;
  vendorBusinessId: number;
  eventTitle: string;
  eventLocation: string;
  eventStartDateTime: string;
  eventEndDateTime: string;
  eventImage: string;
  businessName: string;
}
