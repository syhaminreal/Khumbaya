import { useGetBusinessByEventId } from "@/src/features/business/hooks/use-business";
import { CategoryChip } from "@/src/components/onboarding/CategoryChip";
import { Text } from "@/src/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, type RelativePathString } from "expo-router";
import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Vendor {
  id: string;
  name: string;
  category: string;
  status: "booked" | "pending";
  price?: string;
  rating?: number;
  imageUrl?: string;
}


const mapBusinessStatusToVendorStatus = (status: unknown): Vendor["status"] => {
  const normalized = String(status ?? "").toLowerCase();
  if (
    normalized.includes("confirmed") ||
    normalized.includes("booked") ||
    normalized.includes("completed")
  ) {
    return "booked";
  }
  return "pending";
};

const VendorCard = ({ vendor, eventId }: { vendor: Vendor; eventId?: string }) => (
  <Pressable
    className="bg-white rounded-2xl overflow-hidden flex-row items-center border border-gray-100"
    style={{ elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } }}
    onPress={() =>
      router.push({
        pathname: "/(protected)/(client-stack)/events/[eventId]/(organizer)/vendor-detail/[vendorId]" as RelativePathString,
        params: { eventId, vendorId: vendor.id },
      })
    }
    android_ripple={{ color: "#f3f4f6" }}
  >
    <View className="w-20 h-20 relative">
      {vendor.imageUrl ? (
        <Image source={{ uri: vendor.imageUrl }} className="w-full h-full" resizeMode="cover" />
      ) : (
        <View className="w-full h-full bg-gray-100 items-center justify-center">
          <Ionicons name="storefront" size={28} color="#9CA3AF" />
        </View>
      )}
      <View className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full ${vendor.status === "booked" ? "bg-green-100" : "bg-orange-100"}`}>
        <Text className={`text-[10px] ${vendor.status === "booked" ? "text-green-700" : "text-orange-600"}`}>
          {vendor.status === "booked" ? "Booked" : "Pending"}
        </Text>
      </View>
    </View>

    <View className="flex-1 px-3 py-3 gap-0.5">
      <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>{vendor.name}</Text>
      <Text variant="caption" className="text-xs" numberOfLines={1}>{vendor.category}</Text>
      <View className="flex-row items-center gap-3 mt-1">
        {vendor.rating != null && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text className="text-xs text-amber-500">{vendor.rating}</Text>
          </View>
        )}
        {vendor.price && (
          <Text className="text-xs text-emerald-600">{vendor.price}</Text>
        )}
      </View>
    </View>

    <View className="pr-3">
      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
    </View>
  </Pressable>
);

export default function EventVendorsPage() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: eventBusinesses = [], isLoading, isError } = useGetBusinessByEventId(eventId);

  const vendorsData = useMemo<Vendor[]>(() => {
    return eventBusinesses.map((business: any) => ({
      id: String(business?.id ?? ""),
      name: business?.businessName ?? "Unnamed Vendor",
      category: business?.category ?? "General",
      status: mapBusinessStatusToVendorStatus(business?.status),
      price: typeof business?.priceStartingFrom === "number" ? `₹${business.priceStartingFrom}` : undefined,
      rating: typeof business?.rating === "number" ? business.rating : undefined,
      imageUrl: business?.avatar ?? business?.cover ?? undefined,
    }));
  }, [eventBusinesses]);

  const usedCategories = useMemo(
    () => Array.from(new Set(vendorsData.map((v) => v.category).filter(Boolean))),
    [vendorsData]
  );

  const filteredVendors = useMemo(() => {
    if (activeCategory === "All") return vendorsData;
    return vendorsData.filter((v) => v.category === activeCategory);
  }, [vendorsData, activeCategory]);

  const groupedVendors = useMemo(() => {
    const map = new Map<string, Vendor[]>();
    for (const vendor of filteredVendors) {
      const key = vendor.category || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(vendor);
    }
    return Array.from(map.entries());
  }, [filteredVendors]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <View className="bg-white border-b border-gray-100 py-3">
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
          {usedCategories.map((category) => (
            <CategoryChip
              key={category}
              label={category}
              isActive={activeCategory === category}
              onPress={() => setActiveCategory(category)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Vendor list */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-32 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {!eventId && (
          <View className="items-center justify-center py-16 gap-2">
            <Ionicons name="warning-outline" size={48} color="#F59E0B" />
            <Text className="text-base font-bold text-gray-500">Event not found</Text>
            <Text variant="caption">Open this page from an event to load vendors.</Text>
          </View>
        )}

        {isLoading && !!eventId && (
          <View className="items-center justify-center py-16 gap-2">
            <Ionicons name="sync-outline" size={48} color="#9CA3AF" />
            <Text className="text-base font-bold text-gray-500">Loading vendors...</Text>
          </View>
        )}

        {isError && !!eventId && (
          <View className="items-center justify-center py-16 gap-2">
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text className="text-base font-bold text-gray-500">Could not load vendors</Text>
            <Text variant="caption">Please try again.</Text>
          </View>
        )}

        {groupedVendors.map(([category, vendors]) => (
          <View key={category} className="mt-4">
            <View className="gap-2">
              {vendors.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} eventId={eventId} />
              ))}
            </View>
          </View>
        ))}

        {groupedVendors.length === 0 && !!eventId && !isLoading && !isError && (
          <View className="items-center justify-center py-16 gap-2">
            <Ionicons name="storefront-outline" size={64} color="#D1D5DB" />
            <Text className="text-base font-bold text-gray-500">No vendors found</Text>
            <Text variant="caption">Try a different category</Text>
          </View>
        )}
      </ScrollView>

   
    </SafeAreaView>
  );
}
