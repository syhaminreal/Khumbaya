import { HeroSection } from "@/src/components/business/[businessId]/Hero";
import { LatestReviewSection } from "@/src/components/business/[businessId]/LatestReview";
import ServiceDetailsSection from "@/src/components/business/[businessId]/ServiceDetailsScreen";
import VenueDetailsSection from "@/src/components/business/[businessId]/VenueDetailsSection";
import { Text } from "@/src/components/ui/Text";
import { useDeleteBusiness, useGetBusinessById } from "@/src/features/business";
import { PackageList } from "@/src/features/packages";
import { useBusinessDraftStore } from "@/src/features/business/store/useBusiness";
import {
  BusinessRequest,
  OtherServiceAttribute,
  VenueAttribute
} from "@/src/features/business/types";
import { shadowStyle } from "@/src/utils/helper";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// ─── Hero ────────────────────────────────────────────────────────────────────

// ─── Active Requests ──────────────────────────────────────────────────────────

// function RequestCard({ request }: { request: BusinessRequest }) {
//   const isPending = request.status === "pending";

//   return (
//     <View className="px-4 py-3 border-b border-gray-50">
//       <View className="flex-row items-center gap-3">
//         <Image
//           source={{ uri: request.clientAvatarUrl }}
//           className="w-10 h-10 rounded-full bg-gray-100"
//           resizeMode="cover"
//         />
//         <View className="flex-1">
//           <Text variant="h1" className="text-sm text-[#181114]">
//             {request.clientName}
//           </Text>
//           <Text className="text-xs text-[#594048]">{request.eventType}</Text>
//           <View className="flex-row items-center gap-1 mt-0.5">
//             <MaterialIcons name="calendar-today" size={11} color="#9ca3af" />
//             <Text className="text-[11px] text-gray-400">{request.date}</Text>
//           </View>
//         </View>
//         {isPending ? (
//           <View className="flex-row gap-2">
//             <TouchableOpacity
//               activeOpacity={0.85}
//               className="bg-primary rounded-lg px-3 py-1.5"
//             >
//               <Text variant="h1" className="text-white text-xs">Accept</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               activeOpacity={0.85}
//               className="bg-gray-100 rounded-lg px-3 py-1.5"
//             >
//               <Text variant="h1" className="text-gray-500 text-xs">Reject</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <View className="bg-emerald-100 rounded-full px-3 py-1">
//             <Text variant="h1" className="text-emerald-600 text-xs">
//               Confirmed
//             </Text>
//           </View>
//         )}
//       </View>
//     </View>
//   );
// }

// function ActiveRequestsSection({ requests }: { requests: BusinessRequest[] }) {
//   return (
//     <View
//       className="bg-white rounded-md border border-gray-100 overflow-hidden"
//       style={shadowStyle}
//     >
//       <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
//         <Text variant="h1" className="text-base text-[#181114]">
//           Active Requests
//         </Text>
//         <TouchableOpacity activeOpacity={0.7}>
//           <Text variant="h1" className="text-xs text-primary">View All</Text>
//         </TouchableOpacity>
//       </View>
//       {requests.length === 0 ? (
//         <View className="py-8 items-center">
//           <MaterialIcons name="inbox" size={32} color="#d1d5db" />
//           <Text className="text-gray-400 text-sm mt-2">
//             No pending requests
//           </Text>
//         </View>
//       ) : (
//         requests.map((req) => <RequestCard key={req.id} request={req} />)
//       )}
//     </View>
//   );
// }

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function AvailabilityCalendar({
  dates,
}: {
  dates?: { booked: number[]; pending: number[] };
}) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthName = now.toLocaleString("default", { month: "long" });

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) =>
    cells.slice(i * 7, i * 7 + 7)
  );

  return (
    <View
      className="bg-white rounded-md border border-gray-100 p-4"
      style={shadowStyle}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text variant="h1" className="text-base text-[#181114]">Availability</Text>
        <Text variant="h2" className="text-xs text-[#594048]">
          {monthName} {year}
        </Text>
      </View>

      {/* Day labels */}
      <View className="flex-row mb-1">
        {DAY_LABELS.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: "center" }}>
            <Text variant="h1" className="text-[10px] text-gray-400">{d}</Text>
          </View>
        ))}
      </View>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <View key={wi} className="flex-row mb-1">
          {week.map((day, di) => {
            if (day === null) return <View key={di} style={{ flex: 1 }} />;
            const isBooked = dates?.booked.includes(day);
            const isPending = dates?.pending.includes(day);
            return (
              <View key={di} style={{ flex: 1, alignItems: "center" }}>
                <View
                  className={`w-7 h-7 rounded-full items-center justify-center ${isBooked
                    ? "bg-primary"
                    : isPending
                      ? "bg-amber-400"
                      : "bg-transparent"
                    }`}
                >
                  <Text
                    variant="h2"
                    className={`text-xs ${isBooked || isPending ? "text-white" : "text-[#181114]"
                      }`}
                  >
                    {day}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View className="flex-row gap-4 mt-2 pt-2 border-t border-gray-100">
        <View className="flex-row items-center gap-1.5">
          <View className="w-3 h-3 rounded-full bg-primary" />
          <Text className="text-xs text-[#594048]">Booked</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="w-3 h-3 rounded-full bg-amber-400" />
          <Text className="text-xs text-[#594048]">Pending</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="w-3 h-3 rounded-full bg-gray-200" />
          <Text className="text-xs text-[#594048]">Available</Text>
        </View>
      </View>
    </View>
  );
}




export default function BusinessDetailsScreen() {
  const router = useRouter();
  const { businessId } = useLocalSearchParams<{ businessId: string }>();
  const { data: businessWithAttribute, isLoading } = useGetBusinessById(businessId ?? "");
  const deleteBusiness = useDeleteBusiness();
  const setBusinessDraft = useBusinessDraftStore((state) => state.setBusiness);
  const clearBusinessDraft = useBusinessDraftStore((state) => state.clearBusiness);

  useEffect(() => {
    clearBusinessDraft();
  }, [clearBusinessDraft]);

  const handleEditPress = () => {
    if (!businessWithAttribute?.businessInformation) return;
    setBusinessDraft(businessWithAttribute.businessInformation);
    router.push({
      pathname: "/(protected)/(client-tabs)/business/[businessId]/edit",
      params: {
        businessId: String(businessWithAttribute.businessInformation.id),
      },
    });
  };

  const handleDelete = useCallback(() => {
    if (!businessWithAttribute) return;
    Alert.alert(
      "Delete Business",
      `Are you sure you want to delete "${businessWithAttribute.businessInformation.businessName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteBusiness.mutate(businessId!, {
              onSuccess: () => {
                Alert.alert("Deleted", "Business deleted successfully.", [
                  { text: "OK", onPress: () => router.back() },
                ]);
              },
              onError: () => {
                Alert.alert("Error", "Failed to delete business. Please try again.");
              },
            });
          },
        },
      ]
    );
  }, [businessId, businessWithAttribute, deleteBusiness, router]);

  const handleEditVenuePress = useCallback((venue: VenueAttribute) => {
    if (!businessWithAttribute?.businessInformation?.id || !venue?.venueId) {
      return;
    }
    router.push({
      pathname: "/business/[businessId]/venue/[venueId]/update",
      params: {
        businessId: String(businessWithAttribute.businessInformation.id),
        venueId: String(venue.venueId),
        mode: "edit",
      },
    });
  }, [businessWithAttribute, router]);

  const handleAddVenuePress = useCallback(() => {
    if (!businessWithAttribute?.businessInformation?.id) return;
    router.push({
      pathname: `/business/[businessId]/venue/create`,
      params: {
        businessId: String(businessWithAttribute.businessInformation.id),
        mode: "create",

      }
    }
    );
  }, [businessWithAttribute, router]);

  const handleEditServicePress = useCallback((service: OtherServiceAttribute) => {
    if (!businessWithAttribute?.businessInformation?.id || !service?.id) {
      return;
    }

    router.push({
      pathname: "/business/[businessId]/service/[serviceId]/update",
      params: {
        businessId: String(businessWithAttribute.businessInformation.id),
        serviceId: String(service.id),
        mode: "edit",
      },
    });
  }, [businessWithAttribute, router]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#f8f6f7] items-center justify-center">
        <ActivityIndicator color="#ee2b8c" />
      </SafeAreaView>
    );
  }

  if (!businessWithAttribute) {
    return (
      <SafeAreaView className="flex-1 bg-[#f8f6f7] items-center justify-center">
        <MaterialIcons name="storefront" size={48} color="#d1d5db" />
        <Text variant="h2" className="text-[#594048] mt-3 text-base">
          Business not found
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-[#f8f6f7]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <HeroSection
          onEditPress={handleEditPress}
          business={businessWithAttribute.businessInformation}
        />

        <View className="px-4 gap-4 mt-4">
          {/* <ActiveRequestsSection requests={[]} /> */}

          {/* Category-specific details (from constants) */}
          {businessWithAttribute.businessInformation.category === "Venue" && (
            <VenueDetailsSection
              venues={businessWithAttribute.venueInformation}
              onEditVenue={handleEditVenuePress}
              onAddVenue={handleAddVenuePress}
            />
          )}
          {businessWithAttribute.vendorServicesinformation && businessWithAttribute.businessInformation.category !== "Venue" && businessWithAttribute.businessInformation.category != null && (
            <ServiceDetailsSection
              service={
                businessWithAttribute.vendorServicesinformation?.[0]}
              onEdit={
                businessWithAttribute.vendorServicesinformation?.[0]
                  ? () => handleEditServicePress(businessWithAttribute.vendorServicesinformation[0])
                  : undefined
              }
            />
          )}

          {/* Package List */}
          {businessWithAttribute?.businessInformation?.id && (
            <PackageList
              businessId={businessWithAttribute.businessInformation.id}
            />
          )}

          <AvailabilityCalendar dates={undefined} />
          <LatestReviewSection reviews={[]} />

          <View className="flex-row items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4">
            <View>
              <Text variant="h1" className="text-sm text-red-600">
                Delete Business
              </Text>
              <Text className="text-[11px] text-red-400">
                This action cannot be undone.
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleDelete}
              activeOpacity={0.8}
              className="rounded-lg px-4 py-2"
            >
              <Text variant="h1" className="text-xs uppercase tracking-widest text-red-600">
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Dropdown menu overlay */}

    </View>
  );
}