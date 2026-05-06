import { Event, SubEvent } from "@/src/constants/event";
import { useSubeventDraftStore } from "@/src/features/events/store/useEventStore";
import { useThrottledRouter } from "@/src/hooks/useThrottledRouter";
import { formatDate, formatTimeRange, shadowStyle } from "@/src/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";

type SubEventCardProps = {
  item: SubEvent;
  event: Event;
};

const getDerivedStatus = (item: SubEvent) => {
  const start = item.startDateTime;
  const endRaw = item.endDateTime ?? start;
  if (!start) return "upcoming";

  const now = new Date().getTime();
  const startTime = new Date(start).getTime();
  const endTime = new Date(endRaw).getTime();

  if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
    return item.status || "upcoming";
  }

  if (endTime < now) return "completed";
  if (startTime <= now && now <= endTime) return "ongoing";
  return "upcoming";
};

const getStatusMeta = (status: string) => {
  const normalized = status?.toLowerCase?.() ?? "upcoming";

  if (normalized === "ongoing") {
    return {
      label: "Happening now",
      badgeClassName: "bg-pink-500",
      cardClassName: "border-2 border-pink-500 shadow-sm",
    };
  }
  if (normalized === "completed") {
    return {
      label: "Done",
      badgeClassName: "bg-gray-800",
      cardClassName: "border border-transparent opacity-60",
    };
  }
  if (normalized === "cancelled") {
    return {
      label: "Cancelled",
      badgeClassName: "bg-red-700",
      cardClassName: "border border-red-100 opacity-80",
    };
  }
  return {
    label: "Upcoming",
    badgeClassName: "bg-green-500",
    cardClassName: "border border-[#e6dbe0]",
  };
};

const getDateParts = (dateStr?: string | null) => {
  if (!dateStr) return { month: "—", day: "—" };
  const d = new Date(dateStr);
  if (!Number.isFinite(d.getTime())) return { month: "—", day: "—" };
  return {
    month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: String(d.getDate()),
  };
};

const PILL_HEIGHT = 52;

export default function SubEventCard({
  item,
  event,
}: SubEventCardProps) {
  const { push } = useThrottledRouter();
  const { setSubEventDraft } = useSubeventDraftStore();
  const derivedStatus = getDerivedStatus(item);
  const statusMeta = getStatusMeta(derivedStatus);
  const timeRange = formatTimeRange(item.startDateTime, item.endDateTime);
  const { month, day } = getDateParts(item.startDateTime);

  return (
    <View className="relative flex-row gap-4 pb-5">

      {/* Date pill */}
      <View className="z-10 items-center" style={{ width: 44 }}>
        <View
          className="rounded-xl bg-white border border-[#e6dbe0] items-center justify-center"
          style={{ width: 44, height: PILL_HEIGHT }}
        >
          <Text className="text-[10px] uppercase tracking-wide text-[#896175] font-semibold">
            {month}
          </Text>
          <Text className="text-lg font-bold text-gray-900 leading-tight">
            {day}
          </Text>
        </View>
      </View>

      {/* Card */}
      <Pressable
        style={shadowStyle}
        className={`flex-1 bg-white rounded-xl p-4 ${statusMeta.cardClassName}`}
          onPress={() => {
          setSubEventDraft({ event: item, parentEvent: event  });
          push({
            pathname: "/(protected)/(client-stack)/events/[eventId]/(organizer)",
            params: { eventId: String(item.id), isSubEvent: "true" },
          });
        }}
      >
        {/* Time + status */}
        <View className="flex-row items-start justify-between mb-1">
          <Text className="text-xs font-bold text-primary uppercase tracking-widest flex-1 mr-2">
            {timeRange}
          </Text>
          <View className={`px-2 py-1 rounded-md ${statusMeta.badgeClassName}`}>
            <Text className="text-[10px] font-bold uppercase text-white">
              {statusMeta.label}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text className="text-base font-bold text-gray-900 mb-3">
          {item.title}
        </Text>

        {/* Location row */}
        <View className="flex-row items-center gap-3 mb-3">
          {item.imageUrl ? (
            <View className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200">
              <Image
                source={{ uri: item.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          ) : (
            <View className="w-12 h-12 rounded-xl bg-gray-100 items-center justify-center">
              <Ionicons name="image-outline" size={20} color="#9CA3AF" />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-900">
              {item.location && item.location !== "TBD"
                ? item.location
                : "Location TBD"}
            </Text>
            <Text className="text-xs text-[#896175]">
              {(() => {
                const s = item.startDateTime;
                const e = item.endDateTime;
                if (s && e && e !== s) {
                  return `${formatDate(s)} - ${formatDate(e)}`;
                }
                return formatDate(s || "");
              })()}
            </Text>
          </View>
        </View>

        {/* Theme + budget */}
        <View className="flex-row items-center justify-between">
          {item.theme ? (
            <Text className="text-xs text-gray-500">
              Theme: <Text className="text-gray-700">{item.theme}</Text>
            </Text>
          ) : (
            <View />
          )}
          {item.budget != null ? (
            <Text className="text-sm font-semibold text-primary">
              ₹{item.budget.toLocaleString()}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}
