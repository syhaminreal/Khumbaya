import { Text } from "@/src/components/ui/Text";
import { AvailableSpacesSection } from "@/src/components/vendor/AvailableSpacesSection";
import { ServiceInfoSection } from "@/src/components/vendor/ServiceInfoSection";
import { WriteReviewModal } from "@/src/components/vendor/WriteReviewModal";
import { useGetBusinessById, useGetEventVendor } from "@/src/features/business/hooks/use-business";
import { useToggleFavourite } from "@/src/features/favourite/hooks/use-favourite";
import { BusinessCategory, OtherServiceAttribute } from "@/src/features/business/types";
import { useAuthStore } from "@/src/store/AuthStore";
import { shadowStyle } from "@/src/utils/helper";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;
const TILE_SIZE = (SCREEN_WIDTH - 48) / 2;

const FALLBACK_HEADER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCkAYir1uyaMJpHYxd3cTDm5UEx_lcVJTxtNY2aX-7SjfphxWwmRyzcN_I9jAgIIpqkB_WoA3q32x9izN6Kr_lfZk_2h8e2QgTa8ySCVzEuaPyt5iGLXvBLYh3Zmyzj9cd9ehQAy-8AIflmKb745Ui3-jn0RoRfgnaTlQuf-Ma27foOExZUSdI-ngacDOkkK56JuW_U6PfIPZug2LybUCfyo33uKUW6vcSNo2nbtsj91MFuVaVvo5d1GpzvmPpd9hv1643KT_ec4KM";
const FALLBACK_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDIWVyUn7mizRXt-pU0k_RKFdAfNF_d21mLZuL6fE-z88oUHVipXSGUhNmA5WfOISIeb5QApM1WV-MqiArQgJejxYGuerwubu6lcVkwkED06qEDLGBM7Xqz0ISW7b9rPn7S5ZW1hwAZxyVJLtwp0mkKKpGBUzYThC2D9AsRi-INlhoD8olL86wNyceuSQjvSCGLvlkuKEaRRpvGNa3ooDKEzBTa-g2eoD-4QuvwrSjC7f8_Nwv5Gm18EKFeYf5rKFnpg1QNMlLOq18";

const EMPTY_SERVICE_FALLBACK: OtherServiceAttribute = {
  id: 0,
  businessId: 0,
  artistType: null,
  stylesSpecialized: null,
  maxBookingsPerDay: null,
  advanceAmount: null,
  usesOwnMaterial: false,
  travelCharges: null,
  portfolioLink: null,
  availableForDestination: false,
  customizationAvailable: false,
  servicesVeg: false,
  minOrder: null,
  createdAt: null,
  updatedAt: null,
};

function truncateHeaderTitle(title?: string | null, maxLength = 28): string {
  const safe = (title ?? "Vendor Details").trim();
  if (!safe) return "Vendor Details";
  return safe.length <= maxLength ? safe : `${safe.slice(0, maxLength).trimEnd()}...`;
}
// FAAAAAAH
export default function VendorDetailed() {
  const router = useRouter();
  const { vendorId, fromEventId } = useLocalSearchParams<{ vendorId: string; fromEventId?: string }>();
  const resolvedId = Array.isArray(vendorId) ? vendorId[0] : (vendorId ?? "");
  const resolvedEventId = Array.isArray(fromEventId) ? fromEventId[0] : (fromEventId ?? "");

  const [showGallery, setShowGallery] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All Photos");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [locationText, setLocationText] = useState("—");
  const { user } = useAuthStore();

  const { data: businessWithAttribute, isLoading, isError } = useGetBusinessById(resolvedId);
  const { data: eventVendorData } = useGetEventVendor(resolvedEventId, resolvedId);
  const { isFavourite, toggle } = useToggleFavourite(Number(resolvedId));
  const eventStatus = eventVendorData?.status ?? null;

  useEffect(() => {
    const biz = businessWithAttribute?.businessInformation;
    if (!biz) return;
    if (biz.location) {
      setLocationText(biz.location);
    } else if (biz.city && biz.country) {
      setLocationText(`${biz.city}, ${biz.country}`);
    } else {
      setLocationText("—");
    }
  }, [businessWithAttribute]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#ee2b8c" />
      </View>
    );
  }

  if (isError || !businessWithAttribute) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <MaterialIcons name="store-mall-directory" size={48} color="#d1d5db" />
        <Text className="text-lg text-gray-600 mt-3">Vendor not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4 px-6 py-3 bg-primary rounded-lg">
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const biz = businessWithAttribute.businessInformation;
  const portfolio: string[] = [];
  const tags = biz.serviceArea ? [biz.serviceArea] : [];
  const reviews: any[] = [];

  const headerImage = biz.cover ?? biz.avatar ?? FALLBACK_HEADER;
  const avatarImage = biz.avatar ?? FALLBACK_AVATAR;
  // const locationText = biz.city && biz.country ? `${biz.city}, ${biz.country}` : biz.location ?? "—";
  const serviceAttr = businessWithAttribute.vendorServicesinformation?.[0] ?? EMPTY_SERVICE_FALLBACK;

  const galleryImage0 = portfolio[0] ?? biz.cover ?? FALLBACK_HEADER;
  const galleryImage1 = portfolio[1] ?? biz.avatar ?? FALLBACK_HEADER;
  const galleryImage2 = portfolio[2] ?? biz.cover ?? FALLBACK_HEADER;
  const extraCount = Math.max(0, portfolio.length - 3);

  const galleryData = portfolio.map((uri, i) => ({ uri, category: tags[i % Math.max(1, tags.length)] ?? "Photo" }));
  const galleryFilters = ["All Photos", ...tags];

  const handleGoBack = () => {
    if (router.canGoBack()) return router.back();
    router.replace("/(shared)/explore/explore" as any);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: truncateHeaderTitle(biz.businessName),
          headerBackButtonDisplayMode: "minimal",
          headerTitleAlign: "center",
          headerLeft: () => (
            <Pressable onPress={handleGoBack} className="px-2 py-1">
              <MaterialIcons name="arrow-back" size={22} color="#181114" />
            </Pressable>
          ),
        }}
      />

      <ScrollView className="flex-1" contentContainerClassName="pb-8" showsVerticalScrollIndicator={false}>

        {/* Hero image */}
        <View className="relative w-full">
          <ImageBackground source={{ uri: headerImage }} style={{ width: "100%", height: 280 }} resizeMode="cover">
            <View className="flex-row justify-end items-center px-4 pt-12">
              <Pressable onPress={() => toggle()} className="h-10 w-10 items-center justify-center rounded-full bg-black/30">
                <MaterialIcons name={isFavourite ? "favorite" : "favorite-border"} size={20} color="#ffffff" />
              </Pressable>
            </View>
          </ImageBackground>

          {/* Vendor info block */}
          <View className=" px-4 pb-4">
            <View className="flex-row items-end justify-between" style={{ marginTop: -36 }}>
              {/* Avatar */}
              <View style={{ height: 80, width: 80, borderRadius: 40, borderWidth: 3, borderColor: "#ee2b8c", backgroundColor: "#fff", overflow: "hidden", elevation: 4, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }}>
                <Image source={{ uri: avatarImage }} style={{ height: "100%", width: "100%" }} resizeMode="cover" />
              </View>
              {/* Badges */}
              <View className="flex-row gap-2 pb-1">
                
                <Pressable
                  className="flex-row items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100"
                  onPress={() => router.push(`/(shared)/explore/${resolvedId}/vendorcomparision`)}
                >
                  <MaterialIcons name="compare-arrows" size={13} color="#3b82f6" />
                  <Text className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Compare</Text>
                </Pressable>
              </View>
            </View>

            <Text className="text-2xl font-bold text-[#181114] mt-3" style={{ lineHeight: 30 }} numberOfLines={2}>
              {biz.businessName}
            </Text>
            <View className="flex-row items-center gap-1 mt-1">
              <MaterialIcons name="location-on" size={15} color="#ee2b8c" />
              <Text className="text-sm text-gray-500">{locationText}</Text>
            </View>
            <View className="flex-row items-center gap-3 mt-3">
              <View className="flex-row items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                <MaterialIcons name="star" size={14} color="#ee2b8c" />
                <Text className="text-sm font-bold text-[#181114]">N/A</Text>
                <Text className="text-xs text-gray-400">rating</Text>
              </View>
              <View className="h-4 w-px bg-gray-200" />
              <View className="flex-row items-center gap-1.5">
                <MaterialIcons name="event-available" size={14} color="#6b7280" />
                <Text className="text-xs text-gray-500 font-medium">{biz.totalBookings ?? 0} bookings</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tags */}
        {tags.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4 py-3 gap-2">
            {tags.map((tag) => (
              <View key={tag} className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Text className="text-primary text-xs font-semibold">{tag}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* About */}
        {biz.description ? (
          <View className="bg-white px-4 pt-4 pb-5 mt-2">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="h-7 w-7 rounded-lg bg-primary/10 items-center justify-center">
                <MaterialIcons name="info-outline" size={15} color="#ee2b8c" />
              </View>
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">About</Text>
            </View>
            <Text className="text-[#374151] text-sm leading-6">{biz.description}</Text>
          </View>
        ) : null}

        {/* Category section */}
        {biz.category === BusinessCategory.Venue ? (
          <AvailableSpacesSection
            venues={businessWithAttribute.venueInformation}
            coverFallback={biz.cover as any}
            portfolio={portfolio}
          />
        ) : (
          <ServiceInfoSection service={serviceAttr} category={biz.category as BusinessCategory ?? null} />
        )}



        {/* Gallery */}
        <View className="mt-2  px-4 pt-5 pb-4">
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text className="text-lg font-bold text-[#181114]">Gallery</Text>
              <Text className="text-xs text-gray-400">{portfolio.length} photos</Text>
            </View>
            <Pressable onPress={() => setShowGallery(true)} className="flex-row items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
              <MaterialIcons name="photo-library" size={13} color="#ee2b8c" />
              <Text className="text-primary text-xs font-semibold">View All</Text>
            </Pressable>
          </View>
          <View className="gap-2">
            <Pressable onPress={() => setShowGallery(true)} className="w-full rounded-xl overflow-hidden" style={{ aspectRatio: 16 / 9 }}>
              <Image source={{ uri: galleryImage0 }} className="h-full w-full" resizeMode="cover" />
            </Pressable>
            <View className="flex-row gap-2">
              <Pressable onPress={() => setShowGallery(true)} className="flex-1 rounded-xl overflow-hidden" style={{ aspectRatio: 1 }}>
                <Image source={{ uri: galleryImage1 }} className="h-full w-full" resizeMode="cover" />
              </Pressable>
              <Pressable onPress={() => setShowGallery(true)} className="flex-1 rounded-xl overflow-hidden" style={{ aspectRatio: 1 }}>
                <Image source={{ uri: galleryImage2 }} className="h-full w-full" resizeMode="cover" />
                {extraCount > 0 && (
                  <View className="absolute inset-0 items-center justify-center bg-black/50 rounded-xl">
                    <MaterialIcons name="photo-library" size={24} color="#fff" />
                    <Text className="text-white font-bold text-lg mt-1">+{extraCount}</Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        </View>

        {/* Reviews */}
        <View className="mt-2  px-4 pt-5 pb-6">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-lg font-bold text-[#181114]">Reviews</Text>
              <Text className="text-xs text-gray-400">{reviews.length} total</Text>
            </View>
            {user && (
              <Pressable
                onPress={() => setShowReviewModal(true)}
                className="flex-row items-center gap-1.5 bg-primary px-3 py-1.5 rounded-full"
                style={{ elevation: 2, shadowColor: "#ee2b8c", shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}
              >
                <MaterialIcons name="edit" size={12} color="#fff" />
                <Text className="text-white text-xs font-semibold">Write Review</Text>
              </Pressable>
            )}
          </View>

          {reviews.length === 0 ? (
            <View className="items-center py-10 bg-gray-50 rounded-2xl">
              <View className="h-14 w-14 rounded-full bg-gray-100 items-center justify-center mb-3">
                <MaterialIcons name="rate-review" size={28} color="#d1d5db" />
              </View>
              <Text className="text-gray-500 font-semibold text-sm">No reviews yet</Text>
              <Text className="text-gray-400 text-xs mt-1">Be the first to share your experience</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>
              {reviews.map((review) => (
                <View key={review.id} style={[{ width: 300, backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }, shadowStyle]}>
                  <View className="flex-row items-center gap-3 mb-3">
                    <Image source={{ uri: review.reviewerAvatarUrl }} className="h-10 w-10 rounded-full bg-gray-100" resizeMode="cover" />
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-[#181114]">{review.reviewerName}</Text>
                      <Text className="text-[10px] text-gray-400 mt-0.5">{review.date}</Text>
                    </View>
                    <View className="bg-amber-50 px-2 py-1 rounded-lg flex-row items-center gap-0.5">
                      <MaterialIcons name="star" size={13} color="#f59e0b" />
                      <Text className="text-xs font-bold text-amber-600">{review.rating}</Text>
                    </View>
                  </View>
                  <View className="flex-row gap-0.5 mb-2.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <MaterialIcons key={`${review.id}-${i}`} name="star" size={13} color={i < review.rating ? "#f59e0b" : "#e5e7eb"} />
                    ))}
                  </View>
                  <Text className="text-sm text-gray-600 leading-5 italic" numberOfLines={4}>
                    "{review.quote}"
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        
        {/* Enquiry CTA */}
        <View className="px-4 pt-2 pb-6">
          {resolvedEventId && eventStatus ? (
            <Pressable
              className="w-full rounded-2xl border-2 border-primary py-4 items-center justify-center flex-row gap-2"
              onPress={() => setShowEnquiryModal(true)}
            >
              <MaterialIcons
                name={eventStatus === "booked" || eventStatus === "confirmed" ? "check-circle" : "note"}
                size={18}
                color="#ee2b8c"
              />
              <Text className="text-base font-bold text-primary tracking-wide">
                Enquiry Details
              </Text>
            </Pressable>
          ) : (
            <Pressable
              className="w-full rounded-2xl bg-primary py-4 items-center justify-center flex-row gap-2"
              style={{ elevation: 6, shadowColor: "#ee2b8c", shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}
              onPress={() => router.push({ pathname: "/(shared)/explore/[vendorId]/enquiryform", params: { vendorId: resolvedId, businessId: String(biz.id ?? resolvedId), ...(resolvedEventId ? { fromEventId: resolvedEventId } : {}) } })}
            >
              <MaterialIcons name="send" size={18} color="#fff" />
              <Text className="text-base font-bold text-white tracking-wide">Send Enquiry</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      <WriteReviewModal visible={showReviewModal} onClose={() => setShowReviewModal(false)} businessId={resolvedId} />

      {/* Enquiry Details Modal */}
      <Modal visible={showEnquiryModal} animationType="slide" transparent onRequestClose={() => setShowEnquiryModal(false)}>
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setShowEnquiryModal(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="bg-white rounded-t-3xl px-5 pt-5 pb-10">
              {/* Handle */}
              <View className="w-10 h-1 rounded-full bg-gray-200 self-center mb-5" />

              {/* Header */}
              <View className="flex-row items-center justify-between mb-5">
                <Text className="text-lg font-bold text-[#181114]">Enquiry Details</Text>
                <Pressable onPress={() => setShowEnquiryModal(false)} className="h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                  <MaterialIcons name="close" size={18} color="#6b7280" />
                </Pressable>
              </View>

              {/* Status badge */}
              {eventStatus && (
                <View className="flex-row items-center gap-2 mb-5 p-3 rounded-2xl bg-gray-50">
                  <MaterialIcons name="event" size={16} color="#ee2b8c" />
                  <Text className="text-xs text-gray-500 font-medium flex-1">Status</Text>
                  <View style={{
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 20,
                    backgroundColor:
                      eventStatus === "booked" || eventStatus === "confirmed" ? "#DCFCE7"
                      : eventStatus === "pending" || eventStatus === "request" ? "#FFEDD5"
                      : eventStatus === "completed" ? "#EDE9FE"
                      : "#F3F4F6",
                  }}>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color:
                        eventStatus === "booked" || eventStatus === "confirmed" ? "#16A34A"
                        : eventStatus === "pending" || eventStatus === "request" ? "#EA580C"
                        : eventStatus === "completed" ? "#7C3AED"
                        : "#6B7280",
                    }}>
                      {eventStatus.charAt(0).toUpperCase() + eventStatus.slice(1)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Details rows */}
              {[
                { icon: "people" as const, label: "Estimated Guests", value: eventVendorData?.estimatedGuest != null ? String(eventVendorData.estimatedGuest) : "—" },
                { icon: "person" as const, label: "Acquired By", value: eventVendorData?.acquiredBy ?? "—" },
                { icon: "notes" as const, label: "Notes", value: eventVendorData?.notes ?? "—" },
                { icon: "schedule" as const, label: "Submitted", value: eventVendorData?.createdAt ? new Date(eventVendorData.createdAt).toLocaleDateString() : "—" },
                { icon: "update" as const, label: "Last Updated", value: eventVendorData?.updatedAt ? new Date(eventVendorData.updatedAt).toLocaleDateString() : "—" },
              ].map(({ icon, label, value }) => (
                <View key={label} className="flex-row items-start gap-3 py-3 border-b border-gray-50">
                  <View className="h-7 w-7 rounded-lg bg-primary/10 items-center justify-center mt-0.5">
                    <MaterialIcons name={icon} size={14} color="#ee2b8c" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-400 font-medium mb-0.5">{label}</Text>
                    <Text className="text-sm text-[#181114] font-medium">{value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Gallery Modal */}
      <Modal visible={showGallery} animationType="slide" onRequestClose={() => setShowGallery(false)}>
        <SafeAreaView className="flex-1 bg-[#f5f5f5]">
          <View className="flex-row items-center justify-between px-4 py-3">
            <Text className="text-lg font-semibold text-[#181114]">Gallery</Text>
            <Pressable onPress={() => setShowGallery(false)} className="h-8 w-8 items-center justify-center rounded-full bg-gray-200">
              <MaterialIcons name="close" size={20} color="#181114" />
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-grow-0" contentContainerClassName="px-4 pb-3 gap-2 flex-row">
            {galleryFilters.map((filter) => (
              <Pressable
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full border ${activeFilter === filter ? "bg-primary border-primary" : "border-gray-200"}`}
              >
                <Text className={`text-sm font-semibold ${activeFilter === filter ? "text-white" : "text-gray-500"}`}>
                  {filter}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <FlatList
            data={activeFilter === "All Photos" ? galleryData : galleryData.filter((item) => item.category === activeFilter)}
            numColumns={2}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            columnWrapperStyle={{ gap: 8 }}
            renderItem={({ item }) => (
              <Image source={{ uri: item.uri }} style={{ width: TILE_SIZE, height: TILE_SIZE, borderRadius: 8 }} resizeMode="cover" />
            )}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}
