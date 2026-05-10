import { Text } from "@/src/components/ui/Text";
import { VenueAttribute } from "@/src/features/business";
import { MaterialIcons } from "@expo/vector-icons";
import { Image, Modal, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AmenityItem = { key: keyof VenueAttribute; label: string; icon: string };

const AMENITIES: AmenityItem[] = [
  { key: "hasCatering", label: "Catering", icon: "restaurant" },
  { key: "parking", label: "Parking", icon: "local-parking" },
  { key: "valetAvailable", label: "Valet", icon: "directions-car" },
  { key: "hasAvequipment", label: "AV Equipment", icon: "tv" },
  { key: "alcoholAllowed", label: "Alcohol Allowed", icon: "local-bar" },
  { key: "isOutDoor", label: "Outdoor Space", icon: "park" },
];

const INFO_ROWS = (venue: VenueAttribute) => [
  { icon: "group", label: "Max Capacity", value: venue.capacity ? `${venue.capacity} guests` : "—" },
  { icon: "straighten", label: "Total Area", value: venue.areaSqft ? `${venue.areaSqft} sqft` : "—" },
  { icon: "attach-money", label: "Price / Hour", value: venue.pricePerhour ? `₹${venue.pricePerhour.toLocaleString()}` : "On Request" },
  { icon: "schedule", label: "Min Booking", value: venue.minBookinghours ? `${venue.minBookinghours} hrs` : "Flexible" },
  { icon: "timelapse", label: "Max Booking", value: venue.maxBookinghours ? `${venue.maxBookinghours} hrs` : "Flexible" },
  { icon: "hotel", label: "Rooms Available", value: venue.roomsAvailable ? `${venue.roomsAvailable} rooms` : "N/A" },
  { icon: "volume-up", label: "Sound Limit", value: venue.soundLimitdb ? `${venue.soundLimitdb} dB` : "No Limit" },
];

export function VenueDetailModal({
  venue,
  image,
  visible,
  onClose,
}: {
  venue: VenueAttribute | null;
  image: string;
  visible: boolean;
  onClose: () => void;
}) {
  if (!venue) return null;

  const activeAmenities = AMENITIES.filter((a) => venue[a.key] === true);
  const inactiveAmenities = AMENITIES.filter((a) => !venue[a.key]);
  const infoRows = INFO_ROWS(venue);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-[#f8f8fa]">
        {/* Hero */}
        <View style={{ height: 240 }}>
          <Image source={{ uri: image }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          <Pressable onPress={onClose} className="absolute top-4 left-4 h-10 w-10 items-center justify-center rounded-full bg-black/40">
            <MaterialIcons name="arrow-back" size={20} color="#fff" />
          </Pressable>
          <View className="absolute bottom-4 left-4 bg-primary px-3 py-1 rounded-full">
            <Text className="text-white text-[10px] tracking-widest uppercase">
              {venue.isOutDoor ? "Outdoor" : "Indoor"} · {venue.venueName ?? "Venue"}
            </Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Title */}
          <View className="px-5 pt-5 pb-4 bg-white">
            <Text className="text-2xl text-[#181114]">{venue.venueType ?? "Venue Space"}</Text>
            <Text className="text-sm text-gray-400 mt-1">
              {venue.isOutDoor ? "Outdoor" : "Indoor"} · Venue #{venue.venueId}
            </Text>
          </View>

          {/* Details list */}
          <View className="mx-4 mt-4 rounded-md overflow-hidden border border-gray-100 bg-white" style={{ elevation: 1 }}>
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-4 pt-4 pb-2">
              Venue Details
            </Text>
            {infoRows.map((row, i) => (
              <View key={row.label} className={`flex-row items-center px-4 py-3.5 ${i < infoRows.length - 1 ? "border-b border-gray-50" : ""}`}>
                <View className="h-9 w-9 rounded-md bg-primary/10 items-center justify-center mr-3">
                  <MaterialIcons name={row.icon as any} size={18} color="#ee2b8c" />
                </View>
                <Text className="flex-1 text-sm text-gray-500">{row.label}</Text>
                <Text className="text-sm font-semibold text-[#181114]">{row.value}</Text>
              </View>
            ))}
          </View>

          {/* Amenities */}
          <View className="mx-4 mt-4 rounded-md overflow-hidden border border-gray-100 bg-white" style={{ elevation: 1 }}>
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-4 pt-4 pb-2">
              Amenities
            </Text>
            <View className="px-4 pb-4 pt-2 flex-row flex-wrap gap-2">
              {activeAmenities.map((a) => (
                <View key={a.key} className="flex-row items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
                  <MaterialIcons name={a.icon as any} size={13} color="#ee2b8c" />
                  <Text className="text-primary text-xs font-semibold">{a.label}</Text>
                </View>
              ))}
              {inactiveAmenities.map((a) => (
                <View key={a.key} className="flex-row items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5">
                  <MaterialIcons name={a.icon as any} size={13} color="#9ca3af" />
                  <Text className="text-gray-400 text-xs">{a.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Booking info dark card */}
          <View className="mx-4 mt-4 rounded-md overflow-hidden p-4" style={{ backgroundColor: "#1a1a2e" }}>
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="info-outline" size={18} color="#ee2b8c" />
              <Text className="text-white font-semibold text-sm">Booking Info</Text>
            </View>
            <View className="flex-row gap-4">
              {[
                { label: "Min Hours", value: `${venue.minBookinghours ?? "—"} hrs` },
                { label: "Max Hours", value: `${venue.maxBookinghours ?? "—"} hrs` },
                { label: "Per Hour", value: venue.pricePerhour ? `₹${venue.pricePerhour}` : "—" },
              ].map((item) => (
                <View key={item.label} className="flex-1 bg-white/10 rounded-md p-3">
                  <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }} className="uppercase tracking-widest mb-1">
                    {item.label}
                  </Text>
                  <Text className="text-white font-semibold text-base">{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
