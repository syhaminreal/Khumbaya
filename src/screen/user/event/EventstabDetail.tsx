import { CompletedEventsTab } from "@/src/components/event/CompletedEvent";
import { InvitedEventsTab } from "@/src/components/event/InvitedEvent";
import { UpcomingEventsTab } from "@/src/components/event/UpcomingEvent";
import { EventTab } from "@/src/constants/event";
import { useThrottledRouter } from "@/src/hooks/useThrottledRouter";
import { cn } from "@/src/utils/cn";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.6,
};

const tabs: { label: string; value: EventTab }[] = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Invited", value: "invited" },
  { label: "Completed", value: "completed" },
];

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<EventTab>("upcoming");
  const [mounted, setMounted] = useState(false);
  const [tabContainerWidth, setTabContainerWidth] = useState(0);
  const { push } = useThrottledRouter();

  const activeIndex = tabs.findIndex((t) => t.value === activeTab);
  const tabWidth = tabContainerWidth / tabs.length;

  // translateX drives the sliding pill
  const translateX = useSharedValue(0);

  // Update position whenever active tab or container width changes
  useEffect(() => {
    translateX.value = withSpring(activeIndex * tabWidth, SPRING_CONFIG);
  }, [activeIndex, tabWidth]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: tabWidth,
  }));

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    setTabContainerWidth(e.nativeEvent.layout.width);
  };

  if (!mounted) return null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 mb-3">
        <Text className="text-xl font-bold text-gray-900 ml-4">Your Events</Text>
        <TouchableOpacity
          onPress={() => push("/(protected)/(client-stack)/events/create")}
          className="flex-row items-center gap-1 rounded-sm bg-primary px-3 py-2"
        >
          <Ionicons name="add" size={16} color="white" />
          <Text className="text-xs font-jakarta-semibold text-white">Create Event</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View
        className="flex-row p-1 mb-4 bg-background-tertiary !rounded-md mx-2 relative"
        onLayout={handleContainerLayout}
      >
        {/* Sliding pill — sits behind the labels */}
        <Animated.View
          style={[pillStyle, { position: "absolute", top: 4, bottom: 4, left: 4 }]}
          className="rounded-md bg-white shadow-sm"
        />

        {/* Tab labels */}
        {tabs.map((tab) => (
          <Pressable
            key={tab.value}
            onPress={() => setActiveTab(tab.value)}
            className="flex-1 py-2 rounded-md items-center z-10"
          >
            <Text
              className={cn(
                "text-sm font-jakarta-semibold p-1",
                activeTab === tab.value ? "text-primary" : "text-gray-500"
              )}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Event List */}
      {activeTab === "upcoming" && (
        <View className="flex-1">
          <UpcomingEventsTab isActive={activeTab === "upcoming"} />
        </View>
      )}
      {activeTab === "invited" && (
        <View className="flex-1">
          <InvitedEventsTab isActive={activeTab === "invited"} />
        </View>
      )}
      {activeTab === "completed" && (
        <View className="flex-1">
          <CompletedEventsTab isActive={activeTab === "completed"} />
        </View>
      )}
    </SafeAreaView>
  );
}
