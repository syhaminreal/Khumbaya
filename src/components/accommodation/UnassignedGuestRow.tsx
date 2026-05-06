import { GuestWithRoom } from "@/src/features/hotel/types/hotel.types";
import { getInitials } from "@/src/screen/user/hotel/HotelManagementScreen";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
export function UnassignedGuestRow({
  guest,
  onAssignRoom,
  onDetailsPress,
  isGuestView
}: {
  guest: GuestWithRoom;
  onAssignRoom: (guest: GuestWithRoom) => void;
  onDetailsPress: (guest: GuestWithRoom) => void;
  isGuestView: boolean;
}) {
  const username = guest.user?.username || "Unknown Guest";
  const category = guest.category?.trim();

  return (
    <TouchableOpacity
      onPress={() => onDetailsPress(guest)}
      className="flex-row items-center rounded-xl px-3.5 py-3 bg-white border border-dashed border-gray-200"
      activeOpacity={0.75}
    >
      <View className="w-9 h-9 rounded-full bg-pink-50 border border-pink-100 items-center justify-center mr-3">
        <Text className="font-jakarta-bold text-[10px] text-primary">
          {getInitials(username)}
        </Text>
      </View>

      <View className="flex-1">
        <Text className="font-jakarta-semibold text-sm text-[#181114]" numberOfLines={1}>
          {username}
        </Text>
        {category ? (
          <Text className="font-jakarta text-[10px] text-gray-400 capitalize mt-0.5">
            {category}
          </Text>
        ) : null}
      </View>

      {!isGuestView && (
        <TouchableOpacity
          onPress={() => onAssignRoom(guest)}
          className="flex-row items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add-circle-outline" size={13} color="#ee2b8c" />
          <Text className="font-jakarta-bold text-[10px] text-primary">Assign</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}