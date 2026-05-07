import { Text } from "@/src/components/ui/Text";
import { VenueAttribute } from "@/src/features/business";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { VenueDetailModal } from "./VenueDetailModal";

const FALLBACK_HEADER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCkAYir1uyaMJpHYxd3cTDm5UEx_lcVJTxtNY2aX-7SjfphxWwmRyzcN_I9jAgIIpqkB_WoA3q32x9izN6Kr_lfZk_2h8e2QgTa8ySCVzEuaPyt5iGLXvBLYh3Zmyzj9cd9ehQAy-8AIflmKb745Ui3-jn0RoRfgnaTlQuf-Ma27foOExZUSdI-ngacDOkkK56JuW_U6PfIPZug2LybUCfyo33uKUW6vcSNo2nbtsj91MFuVaVvo5d1GpzvmPpd9hv1643KT_ec4KM";

const VENUE_BADGE_MAP: Record<string, string> = {
  "Banquet Hall": "PREMIER VENUE",
  "Lawn / Garden": "GARDEN EXPERIENCE",
  "Rooftop Terrace": "ROOFTOP SUITE",
  "Garden Terrace": "BOUTIQUE EXPERIENCE",
  "Conference Room": "CORPORATE SUITE",
};
const VENUE_BADGE_DEFAULTS = ["PREMIER VENUE", "BOUTIQUE EXPERIENCE", "SIGNATURE SPACE", "EXCLUSIVE HALL"];

function getVenueBadgeLabel(venueType: string | null, index: number) {
  return (venueType && VENUE_BADGE_MAP[venueType]) ?? VENUE_BADGE_DEFAULTS[index % VENUE_BADGE_DEFAULTS.length];
}

type AmenityItem = { key: keyof VenueAttribute; label: string; icon: string };

const AMENITIES: AmenityItem[] = [
  { key: "hasCatering", label: "Catering", icon: "restaurant" },
  { key: "parking", label: "Parking", icon: "local-parking" },
  { key: "valetAvailable", label: "Valet", icon: "directions-car" },
  { key: "hasAvequipment", label: "AV Equipment", icon: "tv" },
  { key: "alcoholAllowed", label: "Alcohol", icon: "local-bar" },
  { key: "isOutDoor", label: "Outdoor", icon: "park" },
];

export function AvailableSpacesSection({
  venues,
  coverFallback,
  portfolio,
}: {
  venues: VenueAttribute[];
  coverFallback: string | null;
  portfolio: string[];
}) {
  const [selectedVenue, setSelectedVenue] = useState<{ venue: VenueAttribute; image: string } | null>(null);

  return (
    <View className="bg-white mt-2 pb-0">
      <View className="px-4 pt-5 pb-3">
        <Text className="text-xl font-semibold text-[#181114]">Available Spaces</Text>
        <Text className="text-xs text-gray-400 mt-0.5">Select your preferred venue</Text>
      </View>

      {venues.length === 0 ? (
        <View className="items-center py-10">
          <MaterialIcons name="meeting-room" size={40} color="#d1d5db" />
          <Text className="text-gray-400 mt-2 text-sm">No spaces listed yet</Text>
        </View>
      ) : (
        venues.map((venue, index) => {
          const image = portfolio[index] ?? coverFallback ?? FALLBACK_HEADER;
          const badge = getVenueBadgeLabel(venue.venueType, index);
          const activeAmenities = AMENITIES.filter((a) => venue[a.key] === true);

          return (
            <Pressable
              key={venue.venueId}
              className="mx-4 mb-5 rounded-md overflow-hidden bg-white"
              onPress={() => setSelectedVenue({ venue, image })}
            >
              {/* Venue image with overlays */}
              <View style={{ height: 100 }}>
                <Image
                  source={{ uri: image.length > 0 ? image : FALLBACK_HEADER }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
                <View className="absolute top-3 left-3 bg-primary px-3 py-1 rounded-full">
                  <Text className="text-white text-[10px] font-semibold tracking-widest">{badge}</Text>
                </View>
                <View className="absolute top-3 right-3 bg-black/40 px-3 py-1 rounded-full">
                  <Text className="text-white text-[10px] font-semibold uppercase tracking-wide">
                    {venue.isOutDoor ? "Outdoor" : "Indoor"}
                  </Text>
                </View>
                <View className="absolute bottom-3 left-4 right-4">
                  <Text className="text-white text-lg font-semibold leading-tight">
                    {venue.venueType ?? "Venue Space"}
                  </Text>
                  <View className="flex-row gap-4 mt-1">
                    {venue.capacity != null && (
                      <View className="flex-row items-center gap-1">
                        <MaterialIcons name="group" size={13} color="rgba(255,255,255,0.8)" />
                        <Text className="text-white/80 text-xs">{venue.capacity} guests</Text>
                      </View>
                    )}
                    {venue.areaSqft != null && (
                      <View className="flex-row items-center gap-1">
                        <MaterialIcons name="straighten" size={13} color="rgba(255,255,255,0.8)" />
                        <Text className="text-white/80 text-xs">{venue.areaSqft} sqft</Text>
                      </View>
                    )}
                    {venue.pricePerhour != null && (
                      <View className="flex-row items-center gap-1">
                        <MaterialIcons name="attach-money" size={13} color="rgba(255,255,255,0.8)" />
                        <Text className="text-white/80 text-xs">₹{venue.pricePerhour}/hr</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Amenity chips */}
              {activeAmenities.length > 0 && (
                <View className="px-4 pt-3 pb-4">
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: "row", gap: 8, paddingBottom: 4 }}>
                    {activeAmenities.map((a) => (
                      <View key={a.key} className="flex-row items-center gap-1 bg-primary/10 rounded-full px-3 py-1">
                        <MaterialIcons name={a.icon as any} size={12} color="#ee2b8c" />
                        <Text className="text-primary text-[11px] font-semibold">{a.label}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </Pressable>
          );
        })
      )}

      <VenueDetailModal
        venue={selectedVenue?.venue ?? null}
        image={selectedVenue?.image ?? ""}
        visible={selectedVenue !== null}
        onClose={() => setSelectedVenue(null)}
      />
    </View>
  );
}
