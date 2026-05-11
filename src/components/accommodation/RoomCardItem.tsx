import { GuestWithRoom, RoomData } from "@/src/features/hotel/types/hotel.types";
import { getGuestStatus, getInitials } from "@/src/screen/user/hotel/HotelManagementScreen";
import { shadowStyle } from "@/src/utils/helper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
function getShortName(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}

function getFirstName(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts[0] || "Guest";
}

function clampLabel(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}…`;
}
export function RoomCardItem({
  item,
  isPending,
  activeCheckoutUserId,
  onManage,
  isGuestView,
  onCheckout,
}: {
  item: RoomData;
  isPending: boolean;
  isGuestView: boolean;
  activeCheckoutUserId: number | null;
  onManage: (item: RoomData) => void;
  onCheckout: (guest: GuestWithRoom) => void;
}) {
  // Only ONE person is actively checked in — the current room occupant
  const activeOccupant = item.eachuser.find((g) => g.hasCheckedIn && !g.hasCheckedOut) ?? null;
  const isOccupied = !!activeOccupant;

  // Use theme tokens: tertiary = green from config, surface-container-high = soft neutral
  const accentColor = isOccupied ? "bg-tertiary" : "bg-outline";
  const statusLabel = isOccupied ? "Occupied" : "Available";
  const badgeStyles = isOccupied
    ? { badge: "bg-tertiary-container border-success-200", text: "text-on-tertiary-container" }
    : { badge: "bg-outline-variant border-outline", text: "text-on-surface-variant" };

  const occupantName = activeOccupant?.user?.username || "";
  const isCheckingOut = isPending && activeCheckoutUserId === activeOccupant?.user?.id;

  const guestPreviewNames = item.eachuser
    .map((guest) => clampLabel(getFirstName(guest.user?.username || ""), 7))
    .filter(Boolean)
    .slice(0, 2);
  const remainingGuestCount = Math.max(item.eachuser.length - guestPreviewNames.length, 0);
  const guestPreviewLabel =
    guestPreviewNames.join(", ") + (remainingGuestCount > 0 ? ` +${remainingGuestCount}` : "");

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onManage(item)}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={shadowStyle}
    >
      {/* Top accent bar */}
      <View className={`h-1 w-full ${accentColor}`} />

      <View className="px-4 pt-3.5 pb-4">
        {/* Header: room number + guest count + status badge */}
        <View className="flex-row items-center justify-between mb-3.5">
          <View className="flex-row items-center gap-2.5">
            <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
              <Ionicons name="bed-outline" size={18} color="#ee2b8c" />
            </View>
            <View>
              <Text className="font-jakarta-extrabold text-base text-[#181114]">
                Room {item.room}
              </Text>
              <Text className="font-jakarta text-[10px] text-gray-400 mt-0.5">
                {item.eachuser.length} {item.eachuser.length === 1 ? "guest" : "guests"}
              </Text>
            </View>
          </View>

          <View className={`px-2.5 py-1 rounded-full border ${badgeStyles.badge}`}>
            <Text className={`font-jakarta-bold text-[9px] uppercase tracking-wide ${badgeStyles.text}`}>
              {statusLabel}
            </Text>
          </View>
        </View>

        {/* Stacked guest avatars between header and occupant strip */}
        {item.eachuser.length > 0 && (
          <View className="flex-row items-center mb-3">
            {/* Overlapping bubbles — colors drawn from theme tokens */}
            <View className="flex-row items-center">
              {item.eachuser.slice(0, 5).map((guest, idx) => {
                const uname = guest.user?.username || `G${idx + 1}`;
                const s = getGuestStatus(guest);
                // tertiary-container=#dcfce7, success-500=#22C55E, on-tertiary-container=#166534
                // surface-container-high=#f0edee, outline=#e5e7eb, on-surface-variant=#594048
                // primary-container=#fdf2f8, outline-variant=#f3f4f6, on-primary-container=#9d1759
                const bg =
                  s === "checked-in"
                    ? { bg: "#dcfce7", border: "#bbf7d0", textColor: "#166534" }
                    : s === "checked-out"
                      ? { bg: "#f0edee", border: "#e5e7eb", textColor: "#594048" }
                      : { bg: "#fdf2f8", border: "#f3f4f6", textColor: "#9d1759" };
                return (
                  <View
                    key={`${guest.user?.id}-${idx}`}
                    className="w-6 h-6 rounded-full items-center justify-center border-2 border-white"
                    style={{
                      marginLeft: idx === 0 ? 0 : -7,
                      zIndex: 10 - idx,
                      backgroundColor: bg.bg,
                      borderColor: bg.border,
                    }}
                  >
                    <Text
                      style={{ fontSize: 7, fontWeight: "800", color: bg.textColor }}
                    >
                      {getInitials(uname)}
                    </Text>
                  </View>
                );
              })}
              {item.eachuser.length > 5 && (
                <View
                  className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white items-center justify-center"
                  style={{ marginLeft: -7, zIndex: 0 }}
                >
                  <Text style={{ fontSize: 7, fontWeight: "700", color: "#6B7280" }}>
                    +{item.eachuser.length - 5}
                  </Text>
                </View>
              )}
            </View>

            {/* Guest first names preview */}
            {guestPreviewLabel ? (
              <Text
                className="font-jakarta-semibold text-[10px] text-gray-500 ml-2"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ maxWidth: 120 }}
              >
                {guestPreviewLabel}
              </Text>
            ) : null}
          </View>
        )}

        {/* Occupant strip — theme: tertiary-container for active, outline-variant for empty */}
        <View
          className={`flex-row items-center rounded-xl px-2.5 py-2 ${isOccupied
            ? "bg-tertiary-container border border-success-200"
            : "bg-outline-variant border border-dashed border-outline"
            }`}
        >
          {isOccupied && !isGuestView ? (
            <>
              {/* Initials bubble — tertiary theme */}
              <View className="w-7 h-7 rounded-full bg-success-100 border border-success-200 items-center justify-center mr-2">
                <Text className="font-jakarta-extrabold text-[9px] text-on-tertiary-container">
                  {getInitials(occupantName)}
                </Text>
              </View>

              {/* Name hint: "Biswas S." style */}
              <View className="flex-1">
                <Text className="font-jakarta-bold text-xs text-on-surface" numberOfLines={1}>
                  {getShortName(occupantName)}
                </Text>
                <Text className="font-jakarta text-[8px] text-on-tertiary-container mt-0.5">
                  Currently checked in
                </Text>
              </View>

              {/* Inline Check Out */}
              <TouchableOpacity
                disabled={isCheckingOut}
                onPress={(e) => {
                  e.stopPropagation?.();
                  if (activeOccupant) onCheckout(activeOccupant);
                }}
                className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${isCheckingOut ? "bg-gray-200" : "bg-red-400"
                  }`}
              >
                {isCheckingOut ? (
                  <ActivityIndicator size="small" color="#9CA3AF" />
                ) : (
                  <>
                    <Ionicons name="exit-outline" size={10} color="#fff" />
                    <Text className="font-jakarta-bold text-[9px] text-white">Check Out</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center mr-2.5">
                <Ionicons name="person-outline" size={14} color="#9CA3AF" />
              </View>
              <Text className="font-jakarta text-[11px] text-gray-400 flex-1">
                No active occupant
              </Text>
              <View className="flex-row items-center gap-1 bg-primary/8 px-2.5 py-1.5 rounded-full">
                <Text className="font-jakarta-bold text-[10px] text-primary">Manage</Text>
                <Ionicons name="chevron-forward" size={10} color="#ee2b8c" />
              </View>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
