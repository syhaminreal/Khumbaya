import { Text } from "@/src/components/ui/Text";
import {
  useGetEventOwner,
  useRemoveEventMember,
} from "@/src/features/events/hooks/use-event";
import { Ionicons } from "@expo/vector-icons";
import {
  router as expoRouter,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useMemo } from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";

export function TransferOwnerShipPage() {
  const params = useLocalSearchParams();
  const eventId = useMemo(() => {
    const raw = Array.isArray(params.eventId)
      ? params.eventId[0]
      : params.eventId;
    return raw ?? "";
  }, [params.eventId]);

  const {
    data: eventMembers,
    isLoading: memberLoading,
    refetch: refetchEventMembers,
  } = useGetEventOwner(String(eventId));
  const { mutate: removeMember, isPending: isRemovingMember } =
    useRemoveEventMember(String(eventId));

  useFocusEffect(
    useCallback(() => {
      refetchEventMembers();
    }, [refetchEventMembers])
  );

  const addMemberButton = (eventId: string) => (
    <TouchableOpacity
      onPress={() =>
        expoRouter.push({
          pathname:
            "/(protected)/(client-stack)/events/[eventId]/(organizer)/addeventmember",
          params: { eventId },
        })
      }
      style={{ paddingLeft: 8 }}
    >
      <Ionicons name="add" size={28} color="#111827" />
    </TouchableOpacity>
  );

  const handleRemoveMember = (member: any) => {
    const user = member?.user ?? member;
    const userId = Number(user?.id ?? member?.userId);

    if (!userId) {
      Alert.alert("Error", "Member id not found.");
      return;
    }

    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${user?.username || "this member"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            removeMember(
              { userId },
              {
                onSuccess: () => {
                  Alert.alert("Success", "Member removed successfully.");
                },
                onError: (error: any) => {
                  const message =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to remove member.";
                  Alert.alert("Error", message);
                },
              }
            );
          },
        },
      ]
    );
  };

  const totalMembers = eventMembers?.length ?? 0;
  const activeRoles = useMemo(() => {
    if (!eventMembers?.length) return 0;
    return new Set(
      eventMembers
        .map((member) => (member as { role?: string })?.role)
        .filter((role): role is string => !!role)
    ).size;
  }, [eventMembers]);

  return (
    <View className="flex-1 ">
      <Stack.Screen
        options={{ headerRight: () => addMemberButton(eventId as string) }}
      />
      <ScrollView
        className="flex-1 px-6 pt-2 pb-36"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
      

       
        <View>
       
        </View>

        <View className="flex gap-2 pb-10">
          {/* <TouchableOpacity
            onPress={openAddMemberModal}
            activeOpacity={0.8}
            className="h-12 px-4 rounded-md bg-primary flex-row items-center justify-center gap-2"
          >
            <Ionicons name="person-add" size={18} color="white" />
            <Text className="text-white font-jakarta-bold text-sm">
              Add Event Member
            </Text>
          </TouchableOpacity>
         
          {/* <Text className="text-sm text-slate-600 mb-3">
            {totalMembers} member(s) managing this event
          </Text> */}
          {memberLoading ? (
            <View className="p-4 rounded-md border border-slate-200 bg-slate-50">
         
              <Text className="text-sm text-slate-600">Loading members...</Text>
            </View>
          ) : !!eventMembers && eventMembers.length ? (
            <View className="gap-3">
               <Text className="text-slate-900 text-sm font-jakarta-bold uppercase mt-3 text-center font-bold">
                Member List
              </Text>
              {eventMembers?.map((member, index) => {
                const user = (member as { user?: any })?.user ?? member;
                const name = user?.username || "Member";
                const phoneValue = user?.phone || user?.phoneNumber || null;
                const role = (member as { role?: string })?.role;

                return (
                  <View
                    key={String(
                      (member as { id?: number | string })?.id ?? index
                    )}
                    className="flex-row items-center p-4 bg-slate-50 rounded-md border border-slate-200"
                  >
                    <TouchableOpacity
                      onPress={() => handleRemoveMember(member)}
                      disabled={isRemovingMember}
                      className="size-10 rounded-full bg-red-50 items-center justify-center mr-3"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#dc2626"
                      />
                    </TouchableOpacity>
                    
                    <View className="size-12 rounded-full bg-slate-200 items-center justify-center mr-4">
                      <Ionicons name="person" size={24} color="#64748b" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-jakarta-bold text-slate-900">
                        {name}
                      </Text>
                      {phoneValue && (
                        <Text className="text-sm text-dark-500">
                          {phoneValue}
                        </Text>
                      )}
                      <Text className="text-sm text-dark-500">
                        {role ? `Role: ${role}` : "Event member"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="p-4 rounded-md border border-slate-200 bg-slate-50">
              <Text className="text-sm text-slate-600">No members yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom CTA */}
    </View>
  );
}
