import Card from "@/src/components/ui/Card";
import { Text } from "@/src/components/ui/Text";
import { formatDateTime, shadowStyle } from "@/src/utils/helper";
import { MemberRsvpCardProp, RSVPStatus } from "@/src/utils/type/rsvp";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
const statusConfig: Record<
  RSVPStatus,
  { label: string; wrapperClass: string; textClass: string }
> = {
  Attending: {
    label: "Attending",
    wrapperClass: "bg-green-100 px-2.5 py-0.5 rounded-full",
    textClass: "text-xs text-green-700",
  },
  Declined: {
    label: "Declined",
    wrapperClass: "bg-red-100 px-2.5 py-0.5 rounded-full",
    textClass: "text-xs text-red-600",
  },
  Pending: {
    label: "Not Responded",
    wrapperClass: "bg-slate-100 px-2.5 py-0.5 rounded-full",
    textClass: "text-xs text-slate-500",
  },
};

const MemberCard = ({
  member,
  onPressRsvp,
  onPressDetails,
  isOrganizerView = false,
}: {
  member: MemberRsvpCardProp;
  onPressRsvp: () => void;
  onPressDetails?: () => void;
  isOrganizerView?: boolean;
}) => {
  const { label, wrapperClass, textClass } = statusConfig[member.status];
  const isAttending = member.status === "Attending";
  const isPending = member.status === "Pending";
  const shouldShowEmail =
    !!member.user.email && !member.user.email.toLowerCase().startsWith("guest_");

  return (
    <Card className="p-4 bg-background-secondary">
      <View className="flex-row gap-4 items-start">
        {/* Avatar */}
        <View className="w-16 h-16 rounded-xl overflow-hidden bg-pink-50 shrink-0 items-center justify-center">
          {member.user.photo ? (
            <Image
              source={{ uri: member.user.photo }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={28} color="#ee2b8c" />
          )}
        </View>

        {/* Info */}
        <View className="flex-1 min-w-0">
          <View className="flex-row justify-between items-start">
            <Text
              className="text-lg text-slate-900 flex-1 mr-2"
              variant="h2"
              numberOfLines={1}
            >
              {member.user.username}
            </Text>
            <View className={wrapperClass}>
              <Text variant="h2" className={textClass}>
                {label}
              </Text>
            </View>
          </View>
          <View>
            <View className="mt-2 gap-1">
              {member.user.phone ? (
                <View className="flex-row items-center gap-2">
                  <Ionicons name="call-outline" size={13} color="#64748b" />
                  <Text className="text-sm text-slate-500">
                    {member.user.phone}
                  </Text>
                </View>
              ) : null}

              {shouldShowEmail ? (
                <View className="flex-row items-center gap-2">
                  <Ionicons name="mail-open-outline" size={13} color="#64748b" />
                  <Text className="text-sm text-slate-500">
                    {member.user.email}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {isAttending && (
            <View className="mt-2 gap-1">
              {member.eventGuest.arrivalDatetime && (
                <View className="flex-row items-center gap-2">
                  <Ionicons name="calendar-outline" size={13} color="#64748b" />
                  <Text className="text-sm text-slate-500">
                    {formatDateTime(member.eventGuest.arrivalDatetime.toString())}
                  </Text>
                </View>
              )}
              {member.eventGuest.isAccomodation && (
                <View className="flex-row items-center gap-2">
                  <Ionicons name="bed-outline" size={13} color="#64748b" />
                  <Text className="text-sm text-slate-500">
                    Room:{" "}
                    <Text variant="caption" className="text-slate-800 text-sm">
                      {member.eventGuest.assignedRoom && member.eventGuest.assignedRoom.length > 0
                        ? member.eventGuest.assignedRoom
                        : "Not Assigned"}
                    </Text>
                  </Text>
                </View>
              )}
              {member.eventGuest.notes && (
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name="chatbubble-outline"
                    size={13}
                    color="#64748b"
                  />
                  <Text className="text-sm text-slate-500" numberOfLines={2}>
                    {member.eventGuest.notes}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* CTA */}
      <View className="w-full mt-4 pt-4 border-t border-slate-100 flex flex-row gap-2">
        <TouchableOpacity
          className="flex-1 py-2.5 rounded-md items-center justify-center"
          style={
            shadowStyle &&
            { backgroundColor: "#ee2b8c" }
          }
          activeOpacity={0.85}
          onPress={onPressRsvp}
        >
          <Text variant="h2" className="text-white text-sm">
            {isOrganizerView
              ? "View RSVP Details"
              : isPending
                ? "Complete RSVP"
                : "Edit RSVP"}
          </Text>
        </TouchableOpacity>
        {!isOrganizerView && !isPending && (

          <Pressable
            className="flex-1 py-2.5 bg-white rounded-md items-center justify-center border border-primary "
            style={shadowStyle}
            onPress={onPressDetails}
          >
            <View>
              <Text variant="h2" className="text-primary text-sm">
                RSVP details
              </Text>
            </View>
          </Pressable>
        )}
      </View>
    </Card >
  );
};
export default MemberCard;
