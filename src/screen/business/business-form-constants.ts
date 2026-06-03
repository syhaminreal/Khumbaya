import { BusinessCategory } from "@/src/features/business/types";
import { MaterialIcons } from "@expo/vector-icons";

export interface VendorCategory {
  value: BusinessCategory;
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  subtypes?: string[];
}

export const VENDOR_CATEGORIES: VendorCategory[] = [
  {
    value: BusinessCategory.Venue,
    name: "Venue",
    icon: "location-city",
    subtypes: [
      "Banquet Hall",
      "Marriage Garden / Lawns",
      "Wedding Resorts",
      "Small Function / Party Hall",
      "Destination Wedding Venue",
      "Kalyana Mandapam",
      "4 Star & Above Wedding Hotel",
      "Wedding Farmhouse",
    ],
  },
  {
    value: BusinessCategory.PhotographerVideographer,
    name: "Photographer & Videographer",
    icon: "photo-camera",
  },
  {
    value: BusinessCategory.MakeupArtist,
    name: "Makeup Artist",
    icon: "face",
  },
  {
    value: BusinessCategory.WeddingPlannersDecorator,
    name: "Planning & Decor",
    icon: "auto-awesome",
    subtypes: ["Wedding Planners", "Decorators"],
  },
  {
    value: BusinessCategory.MehendiArtist,
    name: "Mehendi Artist",
    icon: "brush",
  },
  {
    value: BusinessCategory.MusicEntertainment,
    name: "Music & Entertainment",
    icon: "music-note",
    subtypes: ["DJs", "Live Bands", "Wedding Entertainment"],
  },
  {
    value: BusinessCategory.InvitesGift,
    name: "Invite & Gift",
    icon: "card-giftcard",
    subtypes: ["Invitations", "Favors", "Gifting Solutions"],
  },
  {
    value: BusinessCategory.FoodCatering,
    name: "Food & Catering",
    icon: "restaurant",
    subtypes: ["Catering Services", "Bakery / Cakes", "Food Stalls"],
  },
  {
    value: BusinessCategory.PreWeddingShoot,
    name: "Pre Wedding Shoot",
    icon: "camera-roll",
  },
  {
    value: BusinessCategory.BridalWear,
    name: "Bridal Wear",
    icon: "checkroom",
    subtypes: ["Lehengas", "Sarees", "Gowns", "Rentals"],
  },
  {
    value: BusinessCategory.JewelryAccessories,
    name: "Jewelry & Accessory",
    icon: "diamond",
    subtypes: ["Jewelry", "Accessory", "Rentals"],
  },
  {
    value: BusinessCategory.BridalGrooming,
    name: "Bridal Grooming",
    icon: "spa",
  },
  {
    value: BusinessCategory.SecurityGuard,
    name: "Security Guard",
    icon: "security",
  },
  {
    value: BusinessCategory.Baraat,
    name: "Baraat",
    icon: "directions-bus",
  },
  {
    value: BusinessCategory.EssentialItems,
    name: "Essential Items",
    icon: "inventory",
  },
];

// ─── Category dropdown options (top-level only) ──────────────────────────────

export const CATEGORY_OPTIONS = VENDOR_CATEGORIES.map((cat) => ({
  label: cat.name,
  value: cat.value,
}));

// ─── Category-specific field definitions ─────────────────────────────────────

export type FieldType = "text" | "number" | "toggle" | "dropdown";

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  unit?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export const CATEGORY_FIELDS: Record<string, FieldConfig[]> = {
  security: [
    { key: "guardsRequired", label: "Number of Guards Required", type: "number", placeholder: "e.g. 5", unit: "guards", icon: "security" },
    { key: "securityFor", label: "Security Required For", type: "dropdown", options: ["VVIP / International Guests", "Politician / Public Figure", "General Event Security"], icon: "security" },
    { key: "guardType", label: "Guard Type", type: "dropdown", options: ["Unarmed", "Armed", "Both Armed & Unarmed"], icon: "security" },
  ],
};


export interface FormState {
  businessName: string;
  description: string;
  city: string;
  country: string;
  vendorType: string;
  vendorCategoryId: BusinessCategory | "";
  categoryDetails: Record<string, string | boolean>;
  email: string;
  contactPhone: string;
  websiteUrl: string;
  whatsappNumber: string;
  contactPersonName: string;
}
