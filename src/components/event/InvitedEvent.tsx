import { VendorEventInvitation } from "@/src/features/business";
import { useGetVendorEventInvitations } from "@/src/features/business/hooks/use-business";
import { useGetInvitedEvents } from "@/src/features/events/hooks/use-event";
import { useAuthStore } from "@/src/store/AuthStore";
import { _entering, _exiting, _layoutAnimation, formatDate, formatTime } from "@/src/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import Card from "../ui/Card";
import { Event_WITH_ROLE } from "./EventwithRole";
import Animated from "react-native-reanimated";

interface InvitedEventsTabProps {
  isActive: boolean;
}


const VendorEventCard = ({
  invitation,
}: {
  invitation: VendorEventInvitation;
}) => {
  return (
    <Card className="my-2">
      <Pressable className="flex-row p-3 rounded-md overflow-hidden">
        <View className="w-20 h-20 rounded-lg overflow-hidden">
          <Image
            source={{ uri: invitation.eventImage }}
            className="w-full h-full"
          />
        </View>
        <View className="flex-1 ml-3 justify-between">
          <Text
            className="font-jakarta-bold text-base text-gray-900 flex-1 mr-2"
            numberOfLines={2}
          >
            {invitation.eventTitle}
          </Text>
          <View>
            <View className="flex-row items-center mt-2">
              <Ionicons name="location" size={14} color="#6B7280" />
              <Text
                className="font-jakarta text-[13px] text-gray-600 ml-1 flex-1"
                numberOfLines={1}
              >
                {invitation.eventLocation}
              </Text>
            </View>
            <View className="flex-row items-center mt-1">
              <Ionicons name="calendar" size={14} color={"#ee2b8c"} />
              <Text className="font-jakarta-semibold text-[13px] text-primary ml-1">
                {formatDate(invitation.eventStartDateTime)} •{" "}
                {formatTime(invitation.eventEndDateTime)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Card>
  );
};
export const InvitedEventsTab = ({ isActive }: InvitedEventsTabProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"vendor" | "guest">("guest");
  const { business: businessIds } = useAuthStore();

  const {
    data: invitedEvents = [],
    isLoading,
    isError,
    refetch,
  } = useGetInvitedEvents();
  console.log('This is the invited events tab with the data 🦓🦓🦓🦓🦓🦓', invitedEvents)
  const {
    data: vendorInvitations = [],
    isLoading: isLoadingVendor,
    isError: isErrorVendor,
    refetch: refetchVendor,
  } = useGetVendorEventInvitations(businessIds);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchVendor()]);
    setRefreshing(false);
  };

  useEffect(() => setMounted(true));

  if (!isActive && !mounted) {
    return null;
  }

  const isLoading_ = isLoading || isLoadingVendor;
  const isError_ = isError || isErrorVendor;
  const hasData = invitedEvents.length > 0 || vendorInvitations.length > 0;

  return (
    <Animated.View className="flex-1"
      entering={_entering}
      exiting={_exiting}
      layout={_layoutAnimation}
    >
      {/* Tab Bar */}
      <View className="flex-row border-b border-border px-4">
        <Pressable
          onPress={() => setActiveTab("guest")}
          className={`flex-1 py-3 px-2 items-center justify-center border-b-2 ${activeTab === "guest" ? "border-primary" : "border-transparent"
            }`}
        >
          <Text
            className={`font-jakarta-semibold text-sm ${activeTab === "guest" ? "text-primary" : "text-gray-600"
              }`}
          >
            Guest ({invitedEvents.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("vendor")}
          className={`flex-1 py-3 px-2 items-center justify-center border-b-2 ${activeTab === "vendor" ? "border-primary" : "border-transparent"
            }`}
        >
          <Text
            className={`font-jakarta-semibold text-sm ${activeTab === "vendor" ? "text-primary" : "text-gray-600"
              }`}
          >
            Vendor ({vendorInvitations.length})
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {isLoading_ ? (
          <View className="items-center justify-center mt-24">
            <Text className="text-gray-400 text-base font-medium mt-4">
              Loading invitations...
            </Text>
          </View>
        ) : isError_ ? (
          <View className="items-center justify-center mt-24">
            <Text className="text-gray-400 text-base font-medium mt-4">
              Failed to load invitations
            </Text>
          </View>
        ) : activeTab === "vendor" ? (
          vendorInvitations.length > 0 ? (
            <>
              <View className="py-4">
                <Text className="text-base font-bold text-gray-900 mb-3">
                  Event Invitations
                </Text>
              </View>
              {vendorInvitations.map((invitation: VendorEventInvitation) => (
                <VendorEventCard key={invitation.id} invitation={invitation} />
              ))}
            </>
          ) : (
            <View className="items-center justify-center mt-24">
              <Ionicons name="mail-open-outline" size={52} color="#d1d5db" />
              <Text className="text-gray-400 text-base font-medium mt-4">
                No vendor invitations
              </Text>
            </View>
          )
        ) : invitedEvents.length > 0 ? (
          <>

            {invitedEvents.map((event) => (
              <Event_WITH_ROLE
                key={event.id}
                event={event}
                onPress={() => { }}
                isRequest
                asGuest={event.role === "Guest"}
              />
            ))}
          </>
        ) : (
          <View className="items-center justify-center mt-24">
            <Ionicons name="mail-open-outline" size={52} color="#d1d5db" />
            <Text className="text-gray-400 text-base font-medium mt-4">
              No guest invitations
            </Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
};
