import { MaterialIcons } from "@expo/vector-icons";
import { useGetBusinessByEventId } from "@/src/features/business/hooks/use-business";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type VendorEventStatus =
  | "Confirmed"
  | "Pending"
  | "New"
  | "Request"
  | "Completed";
type VendorEventTab = "Upcoming" | "Requests" | "Completed";

interface VendorEvent {
  id: string;
  month: string;
  day: string;
  title: string;
  couple: string;
  location: string;
  category: string;
  status: VendorEventStatus;
  section: "This Month" | "Next Year";
}

const VENDOR_AVATAR_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA00Hs8VhRrrpBnJhbiFmtCHPy-0GRUdkAhXCdIgim1CrXK4EeXlbQera8jpP9eqJMXftmmD010atQVIcwCokiygOfiQf2n4xFknXGPdJlzAsijaeR72HJqUCXMCV2dI1LMbOtIPEdWXGOtGPvghtZruL_wPrDusl7GN5kEm4nyCGmw7-WPJPtAAFXhq2Dd3A7gJxmC6YSFwpLQvpGJfWL3LWYaUwAr88L_wBwwUWR593u11gRbyeXI68PIBdqYplmnBv2hbW_RcdA";

const statusStyles: Record<
  VendorEventStatus,
  { badge: string; text: string; ring: string }
> = {
  Confirmed: {
    badge: "bg-green-50",
    text: "text-green-700",
    ring: "ring-green-600/20",
  },
  Pending: {
    badge: "bg-yellow-50",
    text: "text-yellow-800",
    ring: "ring-yellow-600/20",
  },
  Request: {
    badge: "bg-purple-50",
    text: "text-purple-700",
    ring: "ring-purple-600/20",
  },
  New: {
    badge: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-700/10",
  },
  Completed: {
    badge: "bg-gray-100",
    text: "text-gray-600",
    ring: "ring-gray-300",
  },
};

const tabs: VendorEventTab[] = ["Upcoming", "Requests", "Completed"];

export default function EventvendorScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const [activeTab, setActiveTab] = useState<VendorEventTab>("Upcoming");
  const {
    data: businesses = [],
    isLoading,
    isError,
  } = useGetBusinessByEventId(eventId);

  const events = useMemo<VendorEvent[]>(() => {
    const now = new Date();

    return businesses.map((business: any) => {
      const createdAtDate = business?.createdAt
        ? new Date(business.createdAt)
        : undefined;
      const isValidDate =
        !!createdAtDate && !Number.isNaN(createdAtDate.getTime());

      const rawStatus = String(business?.status ?? "").toLowerCase();

      const status: VendorEventStatus = rawStatus.includes("completed")
        ? "Completed"
        : rawStatus.includes("request")
          ? "Request"
          : rawStatus.includes("new")
            ? "New"
            : rawStatus.includes("pending")
              ? "Pending"
              : business?.isVerified
                ? "Confirmed"
                : "Pending";

      const section: VendorEvent["section"] =
        isValidDate && createdAtDate.getFullYear() > now.getFullYear()
          ? "Next Year"
          : "This Month";

      return {
        id: String(business?.id ?? ""),
        month: isValidDate
          ? createdAtDate.toLocaleString("en-US", { month: "short" })
          : "--",
        day: isValidDate
          ? String(createdAtDate.getDate()).padStart(2, "0")
          : "--",
        title: business?.businessName ?? "Unnamed Business",
        couple: business?.description ?? "Vendor Partner",
        location: business?.location ?? "Location unavailable",
        category: business?.category ?? "General",
        status,
        section,
      };
    });
  }, [businesses]);

  const filteredEvents = useMemo(() => {
    if (activeTab === "Requests") {
      return events.filter(
        (event) =>
          event.status === "Pending" ||
          event.status === "Request" ||
          event.status === "New"
      );
    }

    if (activeTab === "Completed") {
      return events.filter((event) => event.status === "Completed");
    }

    return events.filter((event) => event.status !== "Completed");
  }, [activeTab, events]);

  const sections = useMemo(() => {
    const grouped = filteredEvents.reduce<Record<string, VendorEvent[]>>(
      (acc, event) => {
        if (!acc[event.section]) {
          acc[event.section] = [];
        }
        acc[event.section].push(event);
        return acc;
      },
      {}
    );

    return Object.entries(grouped);
  }, [filteredEvents]);

  return (
    // NOTE: dark: classes are intentionally omitted from className per request.
    <SafeAreaView className="flex-1 bg-background-light">
      <View className="flex-1">
        {/* Top App Bar */}
        {/* NOTE: dark:bg-background-dark/95 and dark:border-white/5 omitted. */}
        <View className="flex-row items-center justify-between border-b border-gray-100 bg-background-light/95 px-4 pb-2 pt-4">
          <View className="h-10 w-10 items-center justify-center">
            <Image
              source={{ uri: VENDOR_AVATAR_URL }}
              accessibilityLabel="Profile avatar of the vendor"
              className="h-10 w-10 rounded-full"
            />
          </View>
          {/* NOTE: dark:text-white omitted. */}
          <Text className="flex-1 pl-2 text-center font-display text-lg font-bold text-[#181114]">
            My Events
          </Text>
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full"
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <MaterialIcons name="notifications" size={24} color="#181114" />
          </TouchableOpacity>
        </View>

        {/* Segmented Control / Tabs */}
        {/* NOTE: dark:bg-background-dark and dark:bg-white/5 omitted. */}
        <View className="px-4 py-3">
          <View className="h-11 flex-row items-center justify-center rounded-xl bg-[#f4f0f2] p-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  className="relative h-full flex-1 items-center justify-center overflow-hidden rounded-lg px-2 "
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  <View
                    className={`absolute inset-0 rounded-lg shadow-sm ${
                      isActive ? "bg-white" : "bg-transparent"
                    }`}
                  />
                  {/* NOTE: dark:text-gray-400 and dark:peer-checked:text-white omitted. */}
                  <Text
                    className={`relative z-10 text-sm font-bold ${
                      isActive ? "text-primary" : "text-[#896175]"
                    }`}
                  >
                    {tab}
                  </Text>
                  {tab === "Requests" ? (
                    <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Event List */}
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 px-4 pb-24 pt-2"
          showsVerticalScrollIndicator={false}
        >
          {!eventId ? (
            <View className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <Text className="text-sm font-medium text-amber-800">
                Event ID is missing. Open this screen with an eventId to load
                event businesses.
              </Text>
            </View>
          ) : null}

          {isError ? (
            <View className="rounded-xl border border-red-200 bg-red-50 p-3">
              <Text className="text-sm font-medium text-red-700">
                Couldn&apos;t load businesses for this event.
              </Text>
            </View>
          ) : null}

          {sections.map(([sectionTitle, sectionEvents]) => (
            <View key={sectionTitle} className="gap-4">
              {/* NOTE: dark:text-gray-400 omitted. */}
              <Text className="px-1 text-xs font-bold uppercase tracking-wider text-[#896175]">
                {sectionTitle}
              </Text>

              {sectionEvents.map((event) => {
                const status = statusStyles[event.status];
                return (
                  <TouchableOpacity
                    key={event.id}
                    className="gap-3 rounded-xl border border-white bg-white p-4 shadow shadow-slate-400"
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${event.title}`}
                    onPress={() => {
                      const vendorId = event.id;
                      router.push(`/events/vendors/${vendorId}` as any);
                    }}
                  >
                    <View className="flex-row items-start gap-4">
                      {/* Date Block */}
                      {/* NOTE: dark:bg-primary/20 and dark:text-primary-300 omitted. */}
                      <View
                        className={`h-[70px] w-[70px] items-center  justify-center  rounded-xl ${
                          event.status === "Confirmed"
                            ? "bg-primary/10"
                            : "border border-gray-100 bg-background-light"
                        }`}
                      >
                        <Text className="text-xs font-bold uppercase tracking-wide text-[#896175]">
                          {event.month}
                        </Text>
                        {/* NOTE: dark:text-white omitted. */}
                        <Text className="text-2xl font-bold leading-none text-[#181114]">
                          {event.day}
                        </Text>
                      </View>

                      {/* Content */}
                      <View className="min-w-0 flex-1 justify-center ">
                        {/* NOTE: dark:text-white omitted. */}
                        <Text
                          className="text-base font-bold leading-tight text-[#181114]"
                          numberOfLines={1}
                        >
                          {event.title}
                        </Text>
                        <Text
                          className="mt-0.5 text-sm font-medium text-primary"
                          numberOfLines={1}
                        >
                          {event.couple}
                        </Text>
                        {/* NOTE: dark:text-gray-400 omitted. */}
                        <View className="mt-1 flex-row items-center gap-1">
                          <MaterialIcons
                            name="location-on"
                            size={16}
                            color="#896175"
                          />
                          <Text
                            className="text-xs font-medium text-[#896175]"
                            numberOfLines={1}
                          >
                            {event.location}
                          </Text>
                          <Text className="mx-1 text-xs text-[#896175]">•</Text>
                          <Text
                            className="text-xs font-medium text-[#896175]"
                            numberOfLines={1}
                          >
                            {event.category}
                          </Text>
                        </View>
                      </View>

                      {/* Status Badge */}
                      <View className="shrink-0">
                        {/* NOTE: dark:bg-*/}
                        <View
                          className={`rounded-md px-2 py-1 ring-1 ring-inset ${status.badge} ${status.ring}`}
                        >
                          <Text
                            className={`text-xs font-medium ${status.text}`}
                          >
                            {event.status}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {event.status === "New" ? (
                      <View className="mt-1 flex-row items-center justify-end gap-2 border-t border-gray-50 pt-2">
                        {/* NOTE: dark:text-gray-300 and dark:hover:bg-white/10 omitted. */}
                        <TouchableOpacity
                          className="rounded-lg px-3 py-1.5"
                          accessibilityRole="button"
                          accessibilityLabel={`Decline ${event.title}`}
                        >
                          <Text className="text-xs font-bold text-[#896175]">
                            Decline
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="rounded-lg bg-primary px-4 py-1.5"
                          accessibilityRole="button"
                          accessibilityLabel={`Review request for ${event.title}`}
                        >
                          <Text className="text-xs font-bold text-white">
                            Review Request
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {!isLoading && !!eventId && !isError && events.length === 0 ? (
            <View className="items-center justify-center rounded-xl border border-gray-200 bg-white py-8">
              <Text className="text-sm font-medium text-gray-500">
                No businesses are linked to this event yet.
              </Text>
            </View>
          ) : null}

          {/* Loading State / Empty Space filler */}
          {isLoading ? (
            <View className="items-center justify-center py-6 opacity-50">
              {/* NOTE: dark:text-gray-500 omitted. */}
              <View className="flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-primary/40" />
                <View className="h-2 w-2 rounded-full bg-primary/40" />
                <View className="h-2 w-2 rounded-full bg-primary/40" />
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
