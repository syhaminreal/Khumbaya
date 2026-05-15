import { useGetBusinessByEventId } from "@/src/features/business/hooks/use-business";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, type RelativePathString } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Vendor {
  id: string;
  name: string;
  category: string;
  status: "booked" | "pending";
  contact?: string;
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

const statusBadgeClass: Record<Vendor["status"], string> = {
  booked: "bg-green-100",
  pending: "bg-orange-100",
};

const statusTextClass: Record<Vendor["status"], string> = {
  booked: "text-green-700",
  pending: "text-orange-600",
};

const VendorCard = ({ vendor, eventId }: { vendor: Vendor; eventId?: string }) => (
  <TouchableOpacity
    className="bg-white rounded-2xl overflow-hidden flex-row items-center shadow-sm"
    style={{ elevation: 3 }}
    onPress={() =>
      router.push({ pathname: "/(shared)/explore/[vendorId]" as RelativePathString, params: { vendorId: vendor.id, fromEventId: eventId, eventVendorStatus: vendor.status } })
    }
    activeOpacity={0.8}
  >
    <View className="w-[80px] h-[80px] relative">
      {vendor.imageUrl ? (
        <Image
          source={{ uri: vendor.imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-full bg-gray-100 items-center justify-center">
          <Ionicons name="storefront" size={32} color="#9CA3AF" />
        </View>
      )}
      <View className={`absolute top-2 left-2 px-2 py-1 rounded-xl ${statusBadgeClass[vendor.status]}`}>
        <Text className={`text-[10px] font-semibold capitalize ${statusTextClass[vendor.status]}`}>
          {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
        </Text>
      </View>
    </View>

    <View className="flex-1 px-3 py-2">
      <Text className="text-base font-semibold text-[#181114]">{vendor.name}</Text>
      <Text className="text-xs text-gray-500 mt-0.5">{vendor.category}</Text>

      <View className="flex-row items-center gap-3 mt-1.5">
        {vendor.rating && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text className="text-xs font-medium text-amber-500">{vendor.rating}</Text>
          </View>
        )}
        {vendor.price && (
          <Text className="text-xs font-semibold text-emerald-500">{vendor.price}</Text>
        )}
      </View>
    </View>

    <View className="pr-3">
      <TouchableOpacity
        className="p-2"
        onPress={() =>
          router.push({ pathname: "/(shared)/explore/[vendorId]" as RelativePathString, params: { vendorId: vendor.id, fromEventId: eventId, eventVendorStatus: vendor.status } })
        }
      >
        <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export default function EventVendorsPage() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const [activeTab, setActiveTab] = useState<"all" | "booked" | "pending">("all");

  const {
    data: eventBusinesses = [],
    isLoading,
    isError,
  } = useGetBusinessByEventId(eventId);

  const vendorsData = useMemo<Vendor[]>(() => {
    return eventBusinesses.map((business: any) => ({
      id: String(business?.id ?? ""),
      name: business?.businessName ?? "Unnamed Vendor",
      category: business?.category ?? "General",
      status: mapBusinessStatusToVendorStatus(business?.status),
      contact: business?.contactPhone ?? business?.whatsappNumber ?? undefined,
      price:
        typeof business?.priceStartingFrom === "number"
          ? `₹${business.priceStartingFrom}`
          : undefined,
      rating:
        typeof business?.rating === "number" ? business.rating : undefined,
      imageUrl: business?.avatar ?? business?.cover ?? undefined,
    }));
  }, [eventBusinesses]);

  const bookedCount = vendorsData.filter((v) => v.status === "booked").length;
  const pendingCount = vendorsData.filter((v) => v.status === "pending").length;

  const filteredVendors = vendorsData.filter((vendor) => {
    if (activeTab === "all") return true;
    return vendor.status === activeTab;
  });

  return (
    <SafeAreaView className="flex-1 bg-[#f8f6f7]" edges={["bottom"]}>
      {/* Tabs */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row gap-3">
        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-full items-center justify-center ${activeTab === "all" ? "bg-[#ee2b8c]" : "bg-gray-100"}`}
          onPress={() => setActiveTab("all")}
        >
          <Text className={`text-sm font-semibold ${activeTab === "all" ? "text-white" : "text-gray-500"}`}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-full flex-row items-center justify-center gap-1.5 ${activeTab === "pending" ? "bg-[#ee2b8c]" : "bg-gray-100"}`}
          onPress={() => setActiveTab("pending")}
        >
          <Text className={`text-sm font-semibold ${activeTab === "pending" ? "text-white" : "text-gray-500"}`}>Pending</Text>
          <View className={`w-5 h-5 rounded-full items-center justify-center ${activeTab === "pending" ? "bg-white/30" : "bg-orange-100"}`}>
            <Text className={`text-[11px] font-bold ${activeTab === "pending" ? "text-white" : "text-orange-500"}`}>{pendingCount}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-2.5 rounded-full flex-row items-center justify-center gap-1.5 ${activeTab === "booked" ? "bg-[#ee2b8c]" : "bg-gray-100"}`}
          onPress={() => setActiveTab("booked")}
        >
          <Text className={`text-sm font-semibold ${activeTab === "booked" ? "text-white" : "text-gray-500"}`}>Booked</Text>
          <View className={`w-5 h-5 rounded-full items-center justify-center ${activeTab === "booked" ? "bg-white/30" : "bg-green-100"}`}>
            <Text className={`text-[11px] font-bold ${activeTab === "booked" ? "text-white" : "text-green-600"}`}>{bookedCount}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Vendor List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {!eventId && (
          <View className="items-center justify-center py-16">
            <Ionicons name="warning-outline" size={48} color="#F59E0B" />
            <Text className="text-lg font-semibold text-gray-500 mt-4">Event not found</Text>
            <Text className="text-sm text-gray-400 mt-1">
              Open this page from an event to load vendors.
            </Text>
          </View>
        )}

        {isLoading && !!eventId && (
          <View className="items-center justify-center py-16">
            <Ionicons name="sync-outline" size={48} color="#9CA3AF" />
            <Text className="text-lg font-semibold text-gray-500 mt-4">Loading vendors...</Text>
          </View>
        )}

        {isError && !!eventId && (
          <View className="items-center justify-center py-16">
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text className="text-lg font-semibold text-gray-500 mt-4">Could not load vendors</Text>
            <Text className="text-sm text-gray-400 mt-1">Please try again.</Text>
          </View>
        )}

        {filteredVendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} eventId={eventId} />
        ))}

        {filteredVendors.length === 0 && !!eventId && !isLoading && !isError && (
          <View className="items-center justify-center py-16">
            <Ionicons name="storefront-outline" size={64} color="#D1D5DB" />
            <Text className="text-lg font-semibold text-gray-500 mt-4">No vendors found</Text>
            <Text className="text-sm text-gray-400 mt-1">Try adjusting your filters</Text>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#ee2b8c] items-center justify-center"
        style={{ elevation: 8 }}
        onPress={() => router.push("/(shared)/explore/explore")}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
