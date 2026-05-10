import { Text } from "@/src/components/ui/Text";
import { VenueAttribute } from "@/src/features/business";
import { shadowStyle } from "@/src/utils/helper";
import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

function AmenityChip({
  icon,
  label,
  active,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  active: boolean;
}) {
  if (!active) return null;
  return (
    <View className="flex-row items-center gap-1 bg-primary/10 rounded-full px-2.5 py-1">
      <MaterialIcons name={icon} size={12} color="#ee2b8c" />
      <Text className="text-[10px] text-primary">{label}</Text>
    </View>
  );
}

function VenueCard({ venue, onEdit }: { venue: VenueAttribute; onEdit: () => void }) {
  const amenities: Array<{
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    active: boolean;
  }> = [
      { icon: "restaurant", label: "Catering", active: venue.hasCatering },
      { icon: "tv", label: "AV Equipment", active: venue.hasAvequipment },
      { icon: "wb-sunny", label: "Outdoor", active: venue.isOutDoor },
      { icon: "local-parking", label: "Parking", active: venue.parking },
      { icon: "directions-car", label: "Valet", active: venue.valetAvailable },
      { icon: "local-bar", label: "Alcohol Allowed", active: venue.alcoholAllowed },
    ];
  const activeAmenities = amenities.filter((a) => a.active);

  return (
    <View
      className="bg-white rounded-2xl border border-gray-100 p-4 mb-3"
      style={shadowStyle}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2 flex-1">
          <View className="w-9 h-9 rounded-xl bg-primary/10 items-center justify-center">
            <MaterialIcons name="meeting-room" size={18} color="#ee2b8c" />
          </View>
          <View>
            <Text variant="h1" className="text-sm text-[#181114]">
              {venue.venueName ?? "Venue"}
            </Text>
            {venue.capacity != null && (
              <Text className="text-[10px] text-[#594048]">
                Up to {venue.capacity} guests
              </Text>
            )}
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          {venue.pricePerhour != null && (
            <View className="items-end">
              <Text variant="h1" className="text-primary text-base">
                ₹{venue.pricePerhour.toLocaleString()}
              </Text>
              <Text className="text-[10px] text-gray-400">per hour</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={onEdit}
            activeOpacity={0.75}
            className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
          >
            <MaterialIcons name="edit" size={15} color="#594048" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row gap-2 mb-3">
        {venue.areaSqft != null && (
          <View className="flex-1 bg-gray-50 rounded-xl p-2.5 items-center">
            <MaterialIcons name="straighten" size={16} color="#594048" />
            <Text variant="h1" className="text-xs  text-[#181114] mt-1">
              {venue.areaSqft.toLocaleString()} sqft
            </Text>
            <Text className="text-[9px] text-gray-400">Area</Text>
          </View>
        )}

        <View className="flex-1 bg-gray-50 rounded-xl p-2.5 items-center">
          <MaterialIcons name="hotel" size={16} color="#594048" />
          <Text variant="h1" className="text-xs text-[#181114] mt-1">
            {venue.roomsAvailable != null ? venue.roomsAvailable : "—"}
          </Text>
          <Text className="text-[9px] text-gray-400">Rooms</Text>
        </View>


        <View className="flex-1 bg-gray-50 rounded-xl p-2.5 items-center">
          <MaterialIcons name="schedule" size={16} color="#594048" />
          <Text variant="h1" className="text-xs text-[#181114] mt-1">
            {venue.minBookinghours != null ? `${venue.minBookinghours}h` : "4h"} - {venue.maxBookinghours != null ? `${venue.maxBookinghours}h` : "24h"}
          </Text>
          <Text className="text-[9px] text-gray-400">Booking Hrs</Text>
        </View>


        <View className="flex-1 bg-gray-50 rounded-xl p-2.5 items-center">
          <MaterialIcons name="volume-up" size={16} color="#594048" />
          <Text variant="h1" className="text-xs text-[#181114] mt-1">
            {venue.soundLimitdb != null ? `${venue.soundLimitdb} dB` : "N/A"}
          </Text>
          <Text className="text-[9px] text-gray-400">Sound Limit</Text>
        </View>
      </View>

      {activeAmenities.length > 0 && (
        <View className="flex-row flex-wrap gap-1.5 pt-2 border-t border-gray-100">
          {activeAmenities.map((a) => (
            <AmenityChip key={a.label} icon={a.icon} label={a.label} active />
          ))}
        </View>
      )}
    </View>
  );
}

export default function VenueDetailsSection({
  venues,
  onEditVenue,
  onAddVenue,
}: {
  venues: VenueAttribute[];
  onEditVenue: (venue: VenueAttribute) => void;
  onAddVenue: () => void;
}) {
  return (
    <View>
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Text variant="h1" className="text-base text-[#181114]">Venues</Text>
          {venues.length > 0 && (
            <View className="bg-primary/10 rounded-full px-2.5 py-1">
              <Text className="text-[11px] text-primary">{venues.length} listed</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={onAddVenue}
          activeOpacity={0.8}
          className="flex-row items-center gap-1 bg-primary/10 rounded-full px-3 py-1.5"
        >
          <MaterialIcons name="add" size={14} color="#ee2b8c" />
          <Text variant="h1" className="text-primary text-xs">Add Venue</Text>
        </TouchableOpacity>
      </View>

      {venues.length === 0 ? (
        <TouchableOpacity
          onPress={onAddVenue}
          activeOpacity={0.8}
          className="bg-white rounded-2xl border border-dashed border-primary/40 py-10 items-center justify-center gap-2"
        >
          <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
            <MaterialIcons name="add-business" size={24} color="#ee2b8c" />
          </View>
          <Text variant="h1" className="text-sm text-[#181114]">Add your first venue</Text>
          <Text className="text-xs text-gray-400">Tap to add capacity, pricing & amenities</Text>
        </TouchableOpacity>
      ) : (
        venues.map((v, index) => (
          <VenueCard key={index} venue={v} onEdit={() => onEditVenue(v)} />
        ))
      )}
    </View>
  );
}
