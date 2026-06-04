import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { Fragment, useState } from "react";
import { GuestDetailInterface } from "../../features/guests/types";
import { BottomActionMenu, ThreeDotButton } from "../event/guest/threedot";

interface GuestCardProps {
  guest: GuestDetailInterface;
  onPress?: () => void;
  onDelete?: () => void;
  onDraftPress?: () => void;
  onMoveToDraft?: () => void;
  onEditRsvp?: () => void;
  isMovingToDraft?: boolean;
  isDraftActionLoading?: boolean;
}

export default function GuestCard({
  guest,
  onPress,
  onDelete,
  onDraftPress,
  onMoveToDraft,
  onEditRsvp,
  isMovingToDraft = false,
  isDraftActionLoading = false,
}: GuestCardProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const displayStatus = (guest?.eventGuest?.status || "Pending").trim();
  const isDraft = displayStatus.toLowerCase() === "draft";

  const getStatusColor = () => {
    switch (displayStatus.toLowerCase()) {
      case "accepted":
      case "going":
        return "#10B981";
      case "pending":
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
        return "rgba(245, 158, 11, 0.1)";
      case "declined":
      case "not going":
        return "rgba(239, 68, 68, 0.1)";
      default:
        return "rgba(107, 114, 128, 0.1)";
    }
  };

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
  const category = guest.eventGuest?.category?.trim();

return (
    <Fragment>
      <View className="mb-3 rounded-2xl bg-white">
        <Pressable
          onPress={onPress}
          disabled={!onPress}
          className="rounded-2xl"
        >
          <View className="min-h-[86px] flex-row items-center gap-3 px-4 py-3">
            {guest.user.photo ? (
              <Image
                source={{ uri: guest.user.photo }}
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <View className="h-12 w-12 items-center justify-center rounded-full bg-[#EE2B8C]">
                <Text className="text-base font-semibold text-white">
                  {initials}
                </Text>
              </View>
            )}

            <View className="flex-1">
              <Text
                numberOfLines={1}
                className="text-base font-semibold text-gray-900"
              >
                {displayName}
              </Text>

              {category ? (
                <Text numberOfLines={1} className="mt-0.5 text-xs text-gray-500">
                  {category}
                </Text>
              ) : relation ? (
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
                  className="text-xs font-semibold"
                  style={{ color: getStatusColor() }}
                >
                  {displayStatus}
                </Text>
              </View>

              {(displayStatus.toLowerCase() === "pending" && onMoveToDraft) ||
              onDelete ||
              onEditRsvp ? (
                <ThreeDotButton onPress={() => setMenuVisible(true)} />
              ) : null}
            </View>
          </View>
        </Pressable>

        <BottomActionMenu
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          items={[
            ...(displayStatus.toLowerCase() === "pending" && onMoveToDraft
              ? [
                  {
                    label: isMovingToDraft ? "Moving..." : "Move to Draft",
                    icon: "return-down-back-outline" as const,
                    onPress: () => {
                      setMenuVisible(false);
                      onMoveToDraft?.();
                    },
                    loading: isMovingToDraft,
                    disabled: isMovingToDraft,
                  },
                ]
              : []),
            ...(onEditRsvp
              ? [
                  {
                    label: "Edit RSVP",
                    icon: "create-outline" as const,
                    color: "#EE2B8C",
                    iconBgClassName: "bg-pink-50",
                    onPress: () => {
                      setMenuVisible(false);
                      onEditRsvp();
                    },
                  },
                ]
              : []),
            ...(onDelete
              ? [
                  {
                    label: "Delete",
                    icon: "trash-outline" as const,
                    color: "#EF4444",
                    iconBgClassName: "bg-red-50",
                    onPress: () => {
                      setMenuVisible(false);
                      onDelete();
                    },
                  },
                ]
              : []),
          ]}
        />
      </View>

      {isDraft && onDraftPress ? (
        <View className="px-4 pb-3">
          <Pressable
            onPress={onDraftPress}
            disabled={isDraftActionLoading}
   
            className="h-10 flex-row items-center justify-center rounded-xl border border-[#EE2B8C] bg-[#EE2B8C]/10"
          >
            {isDraftActionLoading ? (
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
        </View>
      ) : null}
    </Fragment>
  );
}
