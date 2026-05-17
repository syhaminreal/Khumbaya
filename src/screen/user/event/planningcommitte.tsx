import { Text } from "@/src/components/ui/Text";
import { useGetEventOwner, useRemoveEventMember } from "@/src/features/events/hooks/use-event";
import { useEventStore } from "@/src/features/events/store/useEventStore";
import { Ionicons } from "@expo/vector-icons";
import {
  router as expoRouter,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

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
  } = useGetEventOwner(eventId);
  const { mutate, isPending } = useRemoveEventMember(Number(eventId));
  const [menuMember, setMenuMember] = useState<unknown | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const eventDraft = useEventStore((state) => state.eventDraft);
  const organizerId =  eventDraft?.organizer 

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

  const handleDeleteMember = (member: any) => {
    const user = member.user 
    const userId =user?.id 
      
    if (!userId) {
      Alert.alert("Remove failed", "User id not found for this member.");
      return;
    }

    if (organizerId && userId === organizerId) {
      Alert.alert("Not allowed", "Organizer cannot be removed.");
      return;
    }

    setDeletingId(userId);
    mutate(
      { userId },
      {
        onSuccess: () => {
          setMenuMember(null);
          refetchEventMembers() ;
        },
        onError: (error: any) => {
          Alert.alert(
            "Remove failed",
            error?.message || "Unable to remove member. Please try again."
          );
        },
        onSettled: () => {
          setDeletingId(null);
        },
      }
    );
  };

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
                const user = (member)?.user;
                const name = user?.username ;
                const phoneValue = user?.phone ; 
                const role = member.role ; 
                const memberUserId = user?.id 
                const isOrganizer = memberUserId === organizerId;

                return (
                  <View
                    key={String(
                      (member as { id?: number | string })?.id ?? index
                    )}
                    className="flex-row items-center p-4 bg-slate-50 rounded-md border border-slate-200"
                  >
                    
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
                    {!isOrganizer && (
                      <TouchableOpacity
                        onPress={() => setMenuMember(member)}
                        className="ml-2 p-2"
                      >
                        <Ionicons
                          name="ellipsis-vertical"
                          size={18}
                          color="#64748b"
                        />
                      </TouchableOpacity>
                    )}
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

      <Modal
        visible={!!menuMember}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuMember(null)}
      >
        <Pressable
          className="flex-1 bg-black/20 justify-end"
          onPress={() => setMenuMember(null)}
        >
          <Pressable className="bg-white rounded-2xl p-4 mx-4 mb-6">
            <TouchableOpacity
              onPress={() => menuMember && handleDeleteMember(menuMember)}
              disabled={isPending || deletingId !== null}
              className="flex-row items-center gap-3 py-3"
            >
              <View className="h-8 w-8 rounded-full bg-red-50 items-center justify-center">
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
              </View>
              <Text className="text-base text-gray-900">
                {isPending || deletingId !== null ? "Removing..." : "Remove"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMenuMember(null)}
              className="flex-row items-center gap-3 py-3"
            >
              <View className="h-8 w-8 rounded-full bg-gray-100 items-center justify-center">
                <Ionicons name="close" size={16} color="#9CA3AF" />
              </View>
              <Text className="text-base text-gray-500">Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Sticky Bottom CTA */}
    </View>
  );
}
