import { CategoryChip } from "@/src/components/onboarding/CategoryChip";
import { FloatLoginBanner } from "@/src/components/onboarding/FloatLoginBanner";
import { HeaderExploreVendor } from "@/src/components/onboarding/HeaderExploreVendor";
import { VendorCard } from "@/src/components/onboarding/VendorCard";
import { useGetBusinessList } from "@/src/features/business/hooks/use-business";
import { BusinessCategory } from "@/src/features/business/types";
import { useAuthStore } from "@/src/store/AuthStore";
import type { Vendor } from "@/src/utils/type/vendor";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// FAAAAAAAAAAAHHHHHHH
const CATEGORIES = Object.values(BusinessCategory);
const CATEGORY_LABELS: Record<BusinessCategory, string> = {
  [BusinessCategory.Venue]: "Venue",
  [BusinessCategory.PhotographerVideographer]: "Video Photographer",
  [BusinessCategory.MakeupArtist]: "Makeup Artist",
  [BusinessCategory.BridalGrooming]: "Bridal Grooming",
  [BusinessCategory.MehendiArtist]: "Mehendi Artist",
  [BusinessCategory.WeddingPlannersDecorator]: "Wedding Planners & Decorator",
  [BusinessCategory.MusicEntertainment]: "Music & Entertainment",
  [BusinessCategory.InvitesGift]: "Invites & Gift",
  [BusinessCategory.FoodCatering]: "Food & Catering",
  [BusinessCategory.PreWeddingShoot]: "Pre Wedding Shoot",
  [BusinessCategory.BridalWear]: "Bridal Wear",
  [BusinessCategory.JewelryAccessories]: "Jewelry & Accessories",
  [BusinessCategory.SecurityGuard]: "Security Guard",
  [BusinessCategory.Baraat]: "Baraat",
};

const DEFAULT_VENDOR_IMAGE =
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80";

export default function ExploreVendors() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const { user } = useAuthStore();
  const { data: businesses = [] } = useGetBusinessList();
  console.log('This is the data in the business get Method in the ui screen ', businesses)

  const vendorsFromQuery = useMemo<Vendor[]>(() => {
    return businesses.map((business) => ({
      id: String(business.id),
      name: business.businessName,
      category: business.category ?? "Other",
      rating: 4,
      reviews: business.totalBookings ?? 0,
      priceLevel:
        business.priceStartingFrom != null
          ? `From रु ${business.priceStartingFrom}`
          : undefined,
      location:
        [business.city, business.country].filter(Boolean).join(", ") ||
        business.location ||
        "Location not specified",
      image: business.cover || business.avatar || DEFAULT_VENDOR_IMAGE,
      city: (business.city ?? business.location?.split(",")[0])?.trim() ?? undefined,
    }));
  }, [businesses]);

  const availableCities = useMemo(() => {
    const cities = businesses
      .map((b) => (b.city ?? b.location?.split(",")[0])?.trim())
      .filter(Boolean) as string[];
    const unique = Array.from(new Set(cities.map((c) => c.toLowerCase()))).sort();
    const titled = unique.map((c) => c.charAt(0).toUpperCase() + c.slice(1));
    return ["All", ...titled];
  }, [businesses]);

  const filteredVendors = vendorsFromQuery.filter((vendor) => {
    const matchesSearch = vendor.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || vendor.category === activeCategory;
    const matchesCity =
      selectedCity === "All" ||
      vendor.city?.toLowerCase() === selectedCity.toLowerCase();
    return matchesSearch && matchesCategory && matchesCity;
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-4">
      <HeaderExploreVendor
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cities={availableCities}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
      />

      <View className="py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 px-4"
          style={{ overflow: "visible" }}
        >
          <CategoryChip
            label="All"
            isActive={activeCategory === "All"}
            onPress={() => setActiveCategory("All")}
          />
          {CATEGORIES.map((category) => (
            <CategoryChip
              key={category}
              label={CATEGORY_LABELS[category]}
              isActive={activeCategory === category}
              onPress={() => setActiveCategory(category)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-2 gap-5 pt-2 pb-32"
        showsVerticalScrollIndicator={false}
      >
        {filteredVendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </ScrollView>

      {!user && <FloatLoginBanner />}
    </SafeAreaView>
  );
}
