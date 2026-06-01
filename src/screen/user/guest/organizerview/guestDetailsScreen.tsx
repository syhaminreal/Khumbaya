import GuestDetailsInfo from "@/src/components/guest/GuestDetailsInfo";
import { Text } from "@/src/components/ui/Text";
import { GuestDetailInterface } from "@/src/features/guests/types";
import { useRsvpStore } from "@/src/store/useRsvpStore";
import { toISODateString } from "@/src/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



const toStatusLabel = (status: string | null | undefined) => {
  if (status === "accepted") return "Confirmed";
  if (status === "rejected") return "Declined";
  return "Pending";
};

export default function GuestDetailsScreen({
  guest: propGuest,
}: {
  guest?: GuestDetailInterface | null;
}) {
  const router = useRouter();
  const { guest: guestParam } = useLocalSearchParams<{ guest?: string }>();
  const draft = useRsvpStore((s) => s.draft);

  const guest = useMemo(() => {
    if (propGuest) {
      return {
        id: propGuest.user.id,
        name: propGuest.user.username,
        status: toStatusLabel(propGuest.eventGuest?.status),
        avatar: propGuest.user.photo,
        phone: propGuest.user.phone,
        email: propGuest.user.email,
        roomAllocation: propGuest.eventGuest?.assignedRoom,
        arrivalDate: toISODateString(propGuest.eventGuest?.arrivalDatetime),
        departureDate: toISODateString(propGuest.eventGuest?.departureDatetime),
        arrivalLocation: propGuest.eventGuest?.arrivalLocation,
        departureLocation: propGuest.eventGuest?.departureLocation,
        notes: propGuest.eventGuest?.notes,
        totalGuests: 1,
        relation: propGuest.user.relation,
        category: propGuest.eventGuest?.category,
      };
    }

    if (draft) {
      const selectedFamilyMember = draft.familyMembers?.find(
        (member) => member.user.id === draft.user.id
      );

      return {
        id: draft.user.id,
        name: draft.user.username || "Guest",
        status: toStatusLabel(draft.eventGuest?.status),
        avatar: draft.user.photo,
        phone: draft.user.phone,
        email: draft.user.email,
        roomAllocation: draft.eventGuest?.assignedRoom,
        arrivalDate: toISODateString(draft.eventGuest?.arrivalDatetime),
        departureDate: toISODateString(draft.eventGuest?.departureDatetime),
        arrivalLocation: draft.eventGuest?.arrivalLocation,
        departureLocation: draft.eventGuest?.departureLocation,
        notes: draft.eventGuest?.notes,
        totalGuests: 1,
        relation: draft.user.relation,
        category: draft.eventGuest?.category ?? selectedFamilyMember?.eventGuest?.category,
      };
    }

    if (guestParam) {
      try {
        return JSON.parse(guestParam);
      } catch (e) {
        console.warn("Failed to parse guest from params", e);
      }
    }

    return null;
  }, [propGuest, draft, guestParam]);

  if (!guest) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center p-8">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-lg text-gray-500 mt-4 mb-6">
            Guest not found
          </Text>
          <TouchableOpacity
            className="bg-pink-600 px-6 py-3 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isConfirmed = guest.status === "Confirmed";

  return (
    <GuestDetailsInfo
      guest={guest}
      isConfirmed={isConfirmed}
      isOrganizer={false}
    />
  );
}
