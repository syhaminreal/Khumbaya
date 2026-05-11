import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { FamilyGroup } from "../../features/guests/types";
import Animated from "react-native-reanimated";

interface FamilyCardProps {
  family: FamilyGroup;
  onPress?: () => void;
  onDelete?: () => void;
  style?: any
}

const getFamilyEffectiveStatus = (
  members: { eventGuest: { status?: string | null } }[]
): string => {
  const hasAccepted = members.some(
    (m) => m.eventGuest.status?.toLowerCase() === "accepted"
  );
  if (hasAccepted) return "accepted";

  const hasPendingOrInvited = members.some((m) => {
    const status = m.eventGuest.status?.toLowerCase() ?? "";
    return status === "pending" || status === "invited";
  });
  if (hasPendingOrInvited) return "pending";

  return "declined";
};

export default function FamilyCard({
  family,
  style,
  onPress,
  onDelete,
}: FamilyCardProps) {
  const members = family.members;
  const primaryMember = members[0];
  const effectiveStatus = getFamilyEffectiveStatus(members);
  const displayStatus =
    effectiveStatus.charAt(0).toUpperCase() + effectiveStatus.slice(1);

  const getStatusColor = () => {
    switch (displayStatus.toLowerCase()) {
      case "accepted":
      case "going":
        return "#10B981";
      case "pending":
      case "invited":
        return "#F59E0B";
      case "declined":
      case "not going":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusBgColor = () => {
    switch (displayStatus.toLowerCase()) {
      case "accepted":
      case "going":
        return "rgba(16, 185, 129, 0.1)";
      case "pending":
      case "invited":
        return "rgba(245, 158, 11, 0.1)";
      case "declined":
      case "not going":
        return "rgba(239, 68, 68, 0.1)";
      default:
        return "rgba(107, 114, 128, 0.1)";
    }
  };

  const initials = family.family_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Animated.View className="mb-3 rounded-2xl bg-white" style={style}>
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
        className="rounded-2xl"
      >
        <View className="min-h-[86px] flex-row items-center gap-3 px-4 py-3">
          {/* Avatar with member count badge */}
          <View className="relative">
            {primaryMember.user.photo ? (
              <Image
                source={{ uri: primaryMember.user.photo }}
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <View className="h-12 w-12 items-center justify-center rounded-full bg-[#EE2B8C]">
                <Text className="text-base font-semibold text-white">
                  {initials}
                </Text>
              </View>
            )}

            {/* Badge showing member count */}
            {family.memberCount > 1 && (
              <View className="absolute -bottom-1 -right-1 h-5 w-5 items-center justify-center rounded-full bg-[#EE2B8C]">
                <Text className="text-[10px] font-bold text-white">
                  +{family.memberCount - 1}
                </Text>
              </View>
            )}
          </View>

          {/* Family info */}
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="text-base font-semibold text-gray-900"
            >
              {family.family_name}
            </Text>

            <Text numberOfLines={1} className="mt-0.5 text-xs text-gray-500">
              {family.memberCount} member{family.memberCount !== 1 ? "s" : ""}
            </Text>
          </View>

          <View className="items-end justify-center gap-2">
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                backgroundColor: getStatusBgColor(),
                maxWidth: 120,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: getStatusColor(),
                }}
              >
                {displayStatus}
              </Text>
            </View>

            {onDelete ? (
              <TouchableOpacity
                onPress={onDelete}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
