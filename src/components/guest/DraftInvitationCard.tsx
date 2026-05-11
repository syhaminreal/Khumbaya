import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { GuestDetailInterface } from "../../features/guests/types";

interface DraftInvitationCardProps {
  guest: GuestDetailInterface;
  onMoveToPending: () => void;
  onDeleteDraft: () => void;
  isMoving: boolean;
  style?: any;
  isDeleting: boolean;
}

export default function DraftInvitationCard({
  guest,
  onMoveToPending,
  style,
  onDeleteDraft,
  isMoving,
  isDeleting,
}: DraftInvitationCardProps) {
  const initials = guest.user.username
    ? guest.user.username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "GU";

  const displayName =
    guest.user.username?.trim() || guest.user.email || "Guest";
  const relation = guest.user.relation?.trim();
  const phone = guest.user.phone?.trim();

  return (
    <View className="mb-3 rounded-2xl border border-[#EE2B8C]/20 bg-white"
      style={style}
    >
      <View className="min-h-[86px] flex-row items-center gap-3 px-4 py-3">
        {guest.user.photo ? (
          <Image
            source={{ uri: guest.user.photo }}
            className="h-12 w-12 rounded-full"
          />
        ) : (
          <View className="h-12 w-12 items-center justify-center rounded-full bg-[#EE2B8C]">
            <Text className="text-base font-semibold text-white">{initials}</Text>
          </View>
        )}

        <View className="flex-1">
          <Text numberOfLines={1} className="text-base font-semibold text-gray-900">
            {displayName}
          </Text>

          {relation ? (
            <Text numberOfLines={1} className="mt-0.5 text-xs text-gray-500">
              {relation}
            </Text>
          ) : null}

          {phone ? (
            <Text numberOfLines={1} className="mt-0.5 text-xs text-gray-500">
              {phone}
            </Text>
          ) : null}
        </View>

        <View className="flex-row items-center rounded-full bg-[#EE2B8C]/10 px-3 py-1.5">
          <Ionicons name="flag-outline" size={12} color="#EE2B8C" />
          <Text className="ml-1 text-[11px] font-semibold uppercase tracking-wide text-[#EE2B8C]">
            Draft
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2 px-4 pb-3">
        <Pressable
          onPress={onMoveToPending}
          disabled={isMoving || isDeleting}
          className="h-10 flex-1 flex-row items-center justify-center rounded-xl border border-[#EE2B8C] bg-[#EE2B8C]/10"
          style={{ opacity: isDeleting ? 0.7 : 1 }}
        >
          {isMoving ? (
            <ActivityIndicator size="small" color="#EE2B8C" />
          ) : (
            <>
              <Ionicons name="paper-plane-outline" size={16} color="#EE2B8C" />
              <Text className="ml-2 text-sm font-semibold text-[#EE2B8C]">
                Send Invitation
              </Text>
            </>
          )}
        </Pressable>

        <Pressable
          onPress={onDeleteDraft}
          disabled={isMoving || isDeleting}
          className="h-10 w-11 items-center justify-center rounded-xl border border-red-300 bg-red-50"
          style={{ opacity: isMoving ? 0.7 : 1 }}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          )}
        </Pressable>
      </View>
    </View>
  );
}
