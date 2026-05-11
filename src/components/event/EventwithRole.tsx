import { Event, EventRole } from "@/src/constants/event";
import { useThrottledRouter } from "@/src/hooks/useThrottledRouter";
import { _entering, _exiting, _layoutAnimation, shadowStyle } from "@/src/utils/helper";
import { Ionicons } from "@expo/vector-icons";

import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";

const roleConfig: Record<
  EventRole,
  { wrapperClass: string; textClass: string }
> = {
  Organizer: {
    wrapperClass: "bg-purple-100 px-2 py-1 rounded-full",
    textClass: "text-xs font-medium text-purple-700",
  },
  Vendor: {
    wrapperClass: "bg-blue-100 px-2 py-1 rounded-full",
    textClass: "text-xs font-medium text-blue-700",
  },
  Guest: {
    wrapperClass: "bg-green-100 px-2 py-1 rounded-full",
    textClass: "text-xs font-medium text-green-700",
  },
};

const defaultRoleStyle = {
  wrapperClass: "bg-gray-100 px-2 py-1 rounded-full",
  textClass: "text-xs font-medium text-gray-700",
};

export const Event_WITH_ROLE = ({
  event,
  isRequest,
  asGuest,
}: {
  event: Event;
  onPress: () => void;
  isRequest?: boolean;
  asGuest?: boolean;
}) => {
  const { push } = useThrottledRouter();
  const roleStyle = roleConfig[event.role as EventRole] ?? defaultRoleStyle;
  const roleLabel = event.role ?? "Unknown";
  const { wrapperClass, textClass } = roleStyle;

  return (
    <Animated.View
      layout={_layoutAnimation}
      entering={_entering}
      exiting={_exiting}
    >
      <Pressable
        className="flex-row p-3 rounded-md overflow-hidden bg-white my-1"
        onPress={() => {
          if (isRequest && asGuest) {
            push(`/(protected)/(client-stack)/events/${event.id}/(guest)`);
          } else if (isRequest && !asGuest) {
            push(`/(protected)/(client-stack)/events/${event.id}/(vendor)/`);
          } else {
            push(`/(protected)/(client-stack)/events/${event.id}`);
          }
        }}
        style={shadowStyle}

      >
        <View className="w-20 h-20 rounded-lg overflow-hidden">
          <Image source={{ uri: event.imageUrl }} className="w-full h-full" />
        </View>
        <View className="flex-1 ml-3 justify-between">
          <View className="flex-row justify-between items-start">
            <Text
              className="font-jakarta-bold text-base text-text-light flex-1 mr-2"
              numberOfLines={2}
            >
              {event.title}
            </Text>
            <View className={wrapperClass}>
              <Text className={textClass}>{roleLabel}</Text>
            </View>
          </View>
          <View>
            {event.location !== "" && (
              <View className="flex-row items-center mt-2">
                <Ionicons name="location" size={14} color="#6B7280" />
                <Text
                  className="font-jakarta text-[13px] text-text-tertiary ml-1"
                  numberOfLines={1}
                >
                  {event.location}
                </Text>
              </View>
            )}
            <View className="flex-row items-center mt-1">
              <Ionicons name="calendar" size={14} color={"#ee2b8c"} />
              <Text className="font-jakarta-semibold text-[13px] text-primary ml-1">
                {event.date} • {event.time}
              </Text>
            </View>
          </View>
          </View>
      </Pressable>
      {
        isRequest && !asGuest && (
          <View className="border-t border-border mx-3 mt-1 pt-3 pb-2">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="bg-blue-50 p-1.5 rounded-full">
                  <Ionicons name="briefcase-outline" size={14} color="#3B82F6" />
                </View>
                <Text className="font-jakarta-semibold text-xs text-blue-700">
                  Vendor booking request
                </Text>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="bg-primary px-3 py-1.5 rounded-full"
                  onPress={() =>
                    push(
                      `/(protected)/(client-stack)/events/${event.id}/(vendor)/`
                    )
                  }
                >
                  <Text className="font-jakarta-semibold text-xs text-white">
                    Accept
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity className="border border-border px-3 py-1.5 rounded-full">
                  <Text className="font-jakarta-semibold text-xs text-text-secondary">
                    Decline
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )
      }
      {
        isRequest && asGuest && (
          <View className="border-t border-border mx-3 mt-1 pt-3 pb-2">
            <View className="flex-row items-center gap-2">
              <View className="bg-pink-50 p-1.5 rounded-full">
                <Ionicons name="mail-outline" size={14} color="#ee2b8c" />
              </View>
              <Text className="font-jakarta-semibold text-xs text-primary">
                You're invited — tap to RSVP
              </Text>
            </View>
          </View>
        )
      }
    </Animated.View>
  );
};
