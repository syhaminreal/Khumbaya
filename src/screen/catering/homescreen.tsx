import { Text } from "@/src/components/ui/Text";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { CateringColumn } from "../../features/catering";
import { useCateringList } from "../../features/catering";
import { shadowStyle } from "../../utils/helper";

const CateringCard = ({
  catering,
  onPress,
}: {
  catering: CateringColumn;
  onPress: () => void;
}) => {
  const startTime = new Date(catering.startDateTime).toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );
  const endTime = new Date(catering.endDateTime).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const getMealIcon = (
    mealType: string
  ): keyof typeof MaterialIcons.glyphMap => {
    const mealIconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
      Breakfast: "breakfast-dining",
      Lunch: "lunch-dining",
      "High Tea": "local-cafe",
      Dinner: "dinner-dining",
      "Late Night": "nightlife",
    };
    return mealIconMap[mealType] || "restaurant";
  };

  const getMealColor = (mealType: string): string => {
    const mealColorMap: Record<string, string> = {
      Breakfast: "#f59e0b",
      Lunch: "#10b981",
      "High Tea": "#8b5cf6",
      Dinner: "#ee2b8c",
      "Late Night": "#6366f1",
    };
    return mealColorMap[mealType] || "#896175";
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-4 border border-outline-variant/30"
      activeOpacity={0.7}
      style={shadowStyle}
    >
      <View className="flex-row justify-between items-center mb-3">
        <View className="bg-surface-container-high px-2.5 py-1 rounded-lg">
          <Text className="text-[11px] font-bold text-on-surface-variant">
            {startTime} – {endTime}
          </Text>
        </View>
        {catering.vendorId && (
          <View className="flex-row items-center gap-1 px-2 py-0.5 bg-green-50 rounded-md">
            <MaterialIcons name="check" size={12} color="#15803d" />
            <Text className="text-[10px] font-black text-green-700 uppercase">
              Assigned
            </Text>
          </View>
        )}
      </View>

      <Text className="text-[16px] font-bold mb-3 text-on-surface">
        {catering.name}
      </Text>

      <View className="flex-row items-center justify-between border-t border-outline-variant/30 pt-3">
        <View className="flex-row items-center gap-4 flex-1">
          <View className="flex-row items-center gap-1.5">
            <View
              className="w-6 h-6 rounded-md items-center justify-center"
              style={{
                backgroundColor: getMealColor(catering.mealType) + "20",
              }}
            >
              <MaterialIcons
                name={getMealIcon(catering.mealType)}
                size={14}
                color={getMealColor(catering.mealType)}
              />
            </View>
            <Text className="text-[12px] font-medium text-muted-light">
              {catering.mealType}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <MaterialIcons name="attach-money" size={14} color="#896175" />
            <Text className="text-[12px] font-bold text-on-surface">
              ${catering.perPlateprice}/plate
            </Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={18} color="#896175" />
      </View>
    </TouchableOpacity>
  );
};

export default function CateringListScreen() {
  const router = useRouter();
  const { eventId, isGuest } = useLocalSearchParams();
  const isGuestView = isGuest === "true";

  const [page, setPage] = useState(1);

  const {
    data: cateringData,
    isLoading,
    error,
    refetch,
  } = useCateringList(page, 10, Number(eventId), {
    enabled: !!Number(eventId),
  });

  const handleAddClick = () => {
    if (!eventId || isGuestView) return;
    router.push({
      pathname:
        "../catering/add",
      params: { eventId: String(eventId) },
    });
  };

  const handleCateringPress = (cateringId: number) => {
    if (!eventId) return;
    router.push({
      pathname:
        "../catering/[cateringId]",
      params: { eventId: String(eventId), cateringId: String(cateringId) },
    });
  };

    
  

  if (isLoading && !cateringData) {
    return (
      <SafeAreaView className="flex-1 bg-background-light items-center justify-center">
        <ActivityIndicator size="large" color="#ee2b8c" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-background-light px-4 items-center justify-center">
        <MaterialIcons name="error" size={48} color="#ee2b8c" />
        <Text className="text-center text-on-surface font-bold text-lg mt-4">
          Failed to load catering
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="mt-4 px-6 py-3 bg-primary rounded-md"
        >
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background-light"
      edges={["top", "bottom"]}
    >
      <StatusBar barStyle="dark-content" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => refetch()}
            tintColor="#ee2b8c"
          />
        }
      >
        {/* ── Content ── */}
        <View className="px-4 pt-6 pb-10">
          {/* Section Header with Item Count */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[14px] font-bold text-muted-light uppercase tracking-widest">
              Upcoming Plans
            </Text>
            {cateringData?.items && (
              <View className="bg-primary/10 px-2.5 py-1 rounded-full">
                <Text className="text-[12px] font-bold text-primary">
                  {cateringData.items.length} Plans
                </Text>
              </View>
            )}
          </View>

          {/* Catering Cards */}
          {cateringData?.items && cateringData.items.length > 0 ? (
            cateringData.items.map((catering) => (
              <CateringCard
                key={catering.id}
                catering={catering}
                onPress={() => (!isGuestView) ?  handleCateringPress(catering.id) : null}/>
            ))
          ) : (
            <View className="items-center justify-center py-12">
              <MaterialIcons
                name="event-note"
                size={48}
                color="#896175"
                style={{ opacity: 0.3 }}
              />
              <Text className="text-center text-muted-light font-medium mt-4 text-lg">
                No catering plans yet
              </Text>
              <Text className="text-center text-muted-light text-sm mt-2">
                Add your first catering plan to get started
              </Text>
              {!isGuestView && (
                <TouchableOpacity
                  onPress={handleAddClick}
                  className="mt-6 bg-primary px-6 py-3 rounded-md"
                  style={shadowStyle}
                >
                  <Text className="text-white font-bold">Create First Plan</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Pagination (if applicable) */}
          {cateringData && cateringData.totalPages > 1 && (
            <View className="flex-row items-center justify-center gap-4 my-6">
              <TouchableOpacity
                onPress={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-md ${page === 1
                    ? "bg-surface-container opacity-50"
                    : "bg-surface-container"
                  }`}
              >
                <Text
                  className={
                    page === 1
                      ? "text-muted-light font-bold"
                      : "text-on-surface font-bold"
                  }
                >
                  Previous
                </Text>
              </TouchableOpacity>

              <Text className="text-sm font-bold text-muted-light">
                {page} / {cateringData.totalPages}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setPage(Math.min(cateringData.totalPages, page + 1))
                }
                disabled={page === cateringData.totalPages}
                className={`px-4 py-2 rounded-md ${page === cateringData.totalPages
                    ? "bg-surface-container opacity-50"
                    : "bg-surface-container"
                  }`}
              >
                <Text
                  className={
                    page === cateringData.totalPages
                      ? "text-muted-light font-bold"
                      : "text-on-surface font-bold"
                  }
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
