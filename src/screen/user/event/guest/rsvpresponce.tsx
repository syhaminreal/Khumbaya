import { RSVPFormContent } from "@/src/components/event/guest/RsvpForm";
import { Text } from "@/src/components/ui/Text";
import { useRsvpStore } from "@/src/store/useRsvpStore";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { useLocalSearchParams } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";



const RsvpResponcePage = () => {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  const draftMembers = useRsvpStore((s) => s.draftMembers);
  const selectedUserIdFromStore = useRsvpStore((s) => s.selectedUserId);

  const activeMember = draftMembers?.find(
    (m) => m.user.id === selectedUserIdFromStore
  );

  const userId = activeMember?.user.id;
  const fallbackEventGuest = activeMember?.eventGuest;
  const familyId = fallbackEventGuest?.familyId;
  const memberName = activeMember?.user?.username;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
    >
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 35,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={240}
        scrollEnabled={true}
      >
        <ScrollView showsHorizontalScrollIndicator={false}>
          {memberName && (
            <View
              className="mx-5 mt-4 mb-0 px-4 py-3 rounded-lg flex-row items-center gap-3"
              style={{
                backgroundColor: "#fdf2f8",
                borderWidth: 1,
                borderColor: "#f9a8d4",
              }}
            >
              <MaterialIcons
                name="person"
                size={18}
                className="!text-primary"
              />
              <Text variant="h2" className="text-sm text-pink-700 flex-1">
                Filling RSVP for {memberName}
              </Text>
            </View>
          )}
          <RSVPFormContent
            userId={userId!}
            eventId={Number(eventId)}
            familyId={familyId ?? null}
            status={fallbackEventGuest?.status ?? "accepted"}
            isAccomodation={fallbackEventGuest?.isAccomodation ?? false}
            notes={fallbackEventGuest?.notes ?? ""}
            isArrivalPickupRequired={fallbackEventGuest?.isArrivalPickupRequired ?? false}
            isDeparturePickupRequired={fallbackEventGuest?.isDeparturePickupRequired ?? false}
            arrivalLocation={fallbackEventGuest?.arrivalLocation ?? ""}
            departureLocation={fallbackEventGuest?.departureLocation ?? ""}
            arrivalDatetime={fallbackEventGuest?.arrivalDatetime ?? null}
            departureDatetime={fallbackEventGuest?.departureDatetime ?? null}

          />
        </ScrollView>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
};

export default RsvpResponcePage;
