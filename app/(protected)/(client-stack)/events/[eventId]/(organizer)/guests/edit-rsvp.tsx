import { RSVPFormContent } from "@/src/components/event/guest/RsvpForm";
import { useGuestDetailStore } from "@/src/features/guests/store/useGuestDetailStore";
import { Stack, useRouter } from "expo-router";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditRsvpScreen() {
  const router = useRouter();
  const guestDetail = useGuestDetailStore((state) => state.guestDraft);
  const setGuestDetail = useGuestDetailStore((state) => state.setGuestDetail);

  if (!guestDetail?.eventGuest) return null;

  const eventId = Number(guestDetail.eventGuest.eventId ?? 0);
  const guestName = guestDetail.user?.username?.trim() || "Guest";

  const handleSuccess = (_data: any, cleanedPayload: any) => {
    setGuestDetail({
      ...guestDetail,
      eventGuest: {
        ...guestDetail.eventGuest,
        ...cleanedPayload,
      },
    });
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: `RSVP — ${guestName}`, headerShown: true }} />
      <SafeAreaView className="flex-1 bg-white" edges={[]}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <RSVPFormContent
            userId={guestDetail.user.id}
            eventId={eventId}
            familyId={guestDetail.eventGuest.familyId ?? null}
            status={guestDetail.eventGuest.status ?? "accepted"}
            isAccomodation={guestDetail.eventGuest.isAccomodation ?? false}
            notes={guestDetail.eventGuest.notes ?? ""}
            isArrivalPickupRequired={guestDetail.eventGuest.isArrivalPickupRequired ?? false}
            isDeparturePickupRequired={guestDetail.eventGuest.isDeparturePickupRequired ?? false}
            arrivalLocation={guestDetail.eventGuest.arrivalLocation ?? ""}
            departureLocation={guestDetail.eventGuest.departureLocation ?? ""}
            arrivalDatetime={guestDetail.eventGuest.arrivalDatetime ?? null}
            departureDatetime={guestDetail.eventGuest.departureDatetime ?? null}
            onSuccess={handleSuccess}
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
