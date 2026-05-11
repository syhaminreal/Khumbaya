import { Text } from "@/src/components/ui/Text";
import { useEventResponseWithUser } from "@/src/features/events/hooks/use-event";
import { GuestDetailInterface } from "@/src/features/guests/types";
import { formatDate, formatTime, toISODateString } from "@/src/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
}) {
  return (
    <View className="bg-white rounded-3xl border border-slate-100 p-8 items-center">
      <View className="w-12 h-12 rounded-full bg-slate-50 items-center justify-center mb-3">
        <Ionicons name={icon} size={22} color="#cbd5e1" />
      </View>
      <Text className="text-sm font-jakarta-bold text-slate-800 text-center">
        {title}
      </Text>
      <Text className="text-xs text-slate-400 mt-1.5 text-center leading-relaxed">
        {subtitle}
      </Text>
    </View>
  );
}

export default function Logistic() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const numericEventId = eventId ? Number(eventId) : 0;

  const {
    data: eventResponse,
    isLoading: isResponseLoading,
    error,
    refetch,
  } = useEventResponseWithUser(numericEventId);

  const responses = useMemo(() => {
    return (eventResponse?.responses ?? []) as GuestDetailInterface[];
  }, [eventResponse]);

  const isLoading = isResponseLoading;
  const hasTransport = responses.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-20"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#ee2b8c"
          />
        }
      >
        {/* Header */}
        <View className="pt-6 pb-5">
          <View className="flex-row items-center gap-2 mb-1">
            <View className="w-1.5 h-5 rounded-full bg-pink-500" />
            <Text className="text-[11px] uppercase tracking-[2px] text-pink-400 font-jakarta-semibold">
              Logistics
            </Text>
          </View>
          <Text className="text-2xl font-jakarta-bold text-slate-900 mt-1">
            Transport Details
          </Text>
          <Text className="text-sm text-slate-400 mt-1 leading-relaxed">
            Your arrival and departure transportation preferences.
          </Text>
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-20 gap-3">
            <ActivityIndicator size="large" color="#ee2b8c" />
            <Text className="text-xs text-slate-400 tracking-wide">
              Loading transport…
            </Text>
          </View>
        ) : error ? (
          <EmptyState
            icon="alert-circle-outline"
            title="Could not load transport details"
            subtitle="Pull down to refresh or try again later."
          />
        ) : !hasTransport ? (
          <EmptyState
            icon="car-outline"
            title="No transport information"
            subtitle="Your event does not currently have transport details assigned."
          />
        ) : (
          responses.map((response, index) => {
            const eg = response.eventGuest;
            const memberName = response.user?.username ?? `Guest ${index + 1}`;
            const arrivalDate = formatDate(
              toISODateString(eg?.arrivalDatetime)
            );
            const departureDate = formatDate(
              toISODateString(eg?.departureDatetime)
            );
            const arrivalTime = formatTime(
              toISODateString(eg?.arrivalDatetime)
            );
            const departureTime = formatTime(
              toISODateString(eg?.departureDatetime)
            );

            return (
              <View
                key={response.user?.id ?? index}
                className="mb-4 rounded-3xl bg-white border border-slate-100 p-5"
              >
                <View className="flex-row items-center justify-between gap-3">
                  <View>
                    <Text className="text-base font-jakarta-bold text-slate-900">
                      {memberName}
                    </Text>
                    <Text className="text-xs text-slate-500 mt-1">
                      Transport summary
                    </Text>
                  </View>
                  <View className="rounded-full bg-pink-50 px-3 py-1">
                    <Text className="text-xs font-jakarta-semibold text-pink-600">
                      {eg?.isArrivalPickupRequired ||
                      eg?.isDeparturePickupRequired
                        ? "Pickup requested"
                        : "No pickup"}
                    </Text>
                  </View>
                </View>

                <View className="mt-5 flex-row gap-3">
                  <View className="flex-1 rounded-2xl bg-slate-50 p-4">
                    <Text className="text-[10px] uppercase tracking-[1.5px] text-slate-400 font-jakarta-semibold">
                      Arrival
                    </Text>
                    <Text className="text-sm font-jakarta-semibold text-slate-900 mt-1">
                      {arrivalDate}
                    </Text>
                    <Text className="text-xs text-slate-500 mt-0.5">
                      {arrivalTime}
                    </Text>
                    <Text className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {eg?.arrivalInfo || "Not provided"}
                    </Text>
                  </View>

                  <View className="flex-1 rounded-2xl bg-slate-50 p-4">
                    <Text className="text-[10px] uppercase tracking-[1.5px] text-slate-400 font-jakarta-semibold">
                      Departure
                    </Text>
                    <Text className="text-sm font-jakarta-semibold text-slate-900 mt-1">
                      {departureDate}
                    </Text>
                    <Text className="text-xs text-slate-500 mt-0.5">
                      {departureTime}
                    </Text>
                    <Text className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {eg?.departureInfo || "Not provided"}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
