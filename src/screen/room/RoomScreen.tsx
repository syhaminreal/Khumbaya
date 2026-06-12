import {
    // useAssignGuestToRoom,
    useDeleteRoomById,
    useDuplicateRoom,
    // useEditGuestRoom,
    useGetRooms,
    useRemoveGuestFromRoom,
} from "@/src/features/rooms/hooks/use-room";
import { useGetGuestRoom, useGetInvitationsForEvent } from "@/src/features/guests/api/use-guests";
import { ThreeDotButton, BottomActionMenu } from "@/src/components/event/guest/threedot";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    // Modal,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RoomScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const id = Number(eventId);

  const {
    data: rooms,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetRooms(id);

  const { data: guestRooms = [] } = useGetGuestRoom(id);
  const { data: invitations = [] } = useGetInvitationsForEvent(id);

  const acceptedInvitations = useMemo(() => {
    return invitations.filter((inv: any) => {
      const status = inv.eventGuest?.status ?? inv.status;
      return status === "accepted";
    });
  }, [invitations]);

  const deleteRoom = useDeleteRoomById(id);
  const duplicateRoom = useDuplicateRoom(id);
  // const assignGuestToRoom = useAssignGuestToRoom(id);
  /* const editGuestRoom = useEditGuestRoom(id); */
  const removeGuestFromRoom = useRemoveGuestFromRoom(id);

  const guestCountByRoom = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!Array.isArray(guestRooms)) return counts;
    for (const rd of guestRooms) {
      counts[rd.room] = (counts[rd.room] || 0) + (rd.eachuser?.length || 0);
    }
    return counts;
  }, [guestRooms]);

  const navigateToAddRoom = useCallback(() => {
    if (!eventId) return;

    router.push({
      pathname: "/(protected)/(client-stack)/events/[eventId]/(shared)/room/add",
      params: { eventId },
    });
  }, [eventId, router]);

  const navigateToEditRoom = useCallback(
    (roomId: number) => {
      if (!eventId) return;

      router.push({
        pathname:
          "/(protected)/(client-stack)/events/[eventId]/(shared)/room/add",
        params: { eventId, roomId: String(roomId) },
      });
    },
    [eventId, router]
  );

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedRoom] = useState<{ id?: number; roomNumber: string } | null>(null);

  /*
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState("");

  const openAssignModal = useCallback((roomId: number, roomNumber: string) => {
    setSelectedRoomNumber(roomNumber);
    setSelectedRoom({ id: roomId, roomNumber });
    setAssignModalVisible(true);
  }, []);

  const closeAssignModal = useCallback(() => {
    setAssignModalVisible(false);
    setSelectedRoomNumber("");
  }, []);
  */

  const closeRoomMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  //const handleAssignGuest = useCallback(
    //(invitationId: number, roomNumber: string, roomId?: number) => {
      //assignGuestToRoom.mutate(
        //{ invitationId, payload: { roomId: roomNumber } },
        //{
          //onSuccess: () => {
            //Alert.alert("Success", `Guest assigned to room ${roomNumber} successfully.`);
            //closeAssignModal();
          //},
          //onError: () => {
            //Alert.alert("Error", "Could not assign guest to room.");
          //},
       // }
      //);
    //},
    //[assignGuestToRoom, closeAssignModal]
 // );

  /*
  const handleEditGuestRoom = useCallback(
    (invitationId: number, roomNumber: string) => {
      editGuestRoom.mutate(
        { invitationId, payload: { roomId: roomNumber } },
        {
          onSuccess: () => {
            Alert.alert("Success", `Guest room updated to ${roomNumber} successfully.`);
            closeAssignModal();
          },
          onError: () => {
            Alert.alert("Error", "Could not update guest room.");
          },
        }
      );
    },
    [editGuestRoom, closeAssignModal]
  );
  */

  const handleRemoveGuestFromRoom = useCallback(
    (invitationId: number) => {
      Alert.alert(
        "Remove Guest",
        "Remove this guest from their assigned room?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              removeGuestFromRoom.mutate(invitationId, {
                onSuccess: () => {
                  Alert.alert("Success", "Guest removed from room successfully.");
                },
                onError: () => {
                  Alert.alert("Error", "Could not remove guest from room.");
                },
              });
            },
          },
        ]
      );
    },
    [removeGuestFromRoom]
  );

  const handleDelete = useCallback(
    (roomId: number, roomNumber: string) => {
      closeRoomMenu();
      Alert.alert("Delete Room", `Delete room ${roomNumber}?`, [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRoom.mutateAsync(roomId);
            } catch {
              Alert.alert("Error", "Could not delete room.");
            }
          },
        },
      ]);
    },
    [deleteRoom, closeRoomMenu]
  );

  const handleDuplicate = useCallback(
    async (roomId: number, roomNumber: string) => {
      closeRoomMenu();
      try {
        await duplicateRoom.mutateAsync(roomId);
      } catch {
        Alert.alert("Error", "Could not duplicate room.");
      }
    },
    [duplicateRoom, closeRoomMenu]
  );

  /*
  const handleGuestPress = useCallback(
    (inv: any) => {
      const guestId = inv.eventGuest?.id ?? inv.id;
      const alreadyAssigned = guestRooms.find(
        (rd) => rd.room === selectedRoomNumber && rd.eachuser.some((g) => g.invitationId === guestId)
      );
      if (alreadyAssigned) {
        handleEditGuestRoom(guestId, selectedRoomNumber);
      } else {
        const roomId = selectedRoom?.id;
        const currentGuests = guestCountByRoom[selectedRoomNumber] || 0;
        const selectedRoomData = rooms?.find((r) => r.id === roomId);
        const capacity = selectedRoomData?.capacity || 0;
        if (selectedRoomData && currentGuests >= capacity) {
          Alert.alert(
            "Room Full",
            `Room ${selectedRoomNumber} has reached its maximum capacity of ${capacity} guests.`
          );
          return;
        }
        //handleAssignGuest(guestId, selectedRoomNumber, roomId);
      }
    },
    [
      selectedRoomNumber,
      guestRooms,
      handleEditGuestRoom,
     // handleAssignGuest,
      guestCountByRoom,
      rooms,
      selectedRoom,
    ]
  );
  */

  const handleManageRoom = useCallback(
    (roomId: number, roomNumber: string) => {
      router.push({
        pathname: "/(protected)/(client-stack)/events/[eventId]/(shared)/room/manage",
        params: { eventId: String(id), roomId: String(roomId), roomNumber },
      });
    },
    [eventId, id, router]
  );

  // Loading State
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" />
        <Text className="mt-3 text-gray-500">Loading rooms...</Text>
      </View>
    );
  }

  // Error State
  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 px-6">
        <Text className="text-base text-red-700">Failed to load rooms.</Text>

        <TouchableOpacity
          onPress={() => refetch()}
          className="mt-4 rounded-lg border border-gray-300 px-5 py-2.5"
        >
          <Text className="text-gray-700">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty State
  if (!rooms || rooms.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 px-6">
        <Text className="text-gray-500">No rooms yet.</Text>

        <TouchableOpacity
          className="mt-4 rounded-xl bg-pink-500 px-6 py-4"
          onPress={navigateToAddRoom}
        >
          <Text className="font-medium text-white">+ Add Room</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function openRoomMenu(arg0: number, roomNumber: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <View className="flex-1 bg-gray-100">
      <FlatList
        data={rooms}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 24,
        }}
        renderItem={({ item }) => (
          <View className="mb-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <View className="mb-3 flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  {item.name}
                </Text>

                <Text className="mt-1 text-sm text-gray-500">
                  Room No: {item.roomNumber}
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <View className="rounded-lg bg-lime-100 px-3 py-1.5">
                  <Text className="font-medium text-lime-800">
                    NPR {item.costPerRoom.toLocaleString()}
                  </Text>
                </View>

                <ThreeDotButton onPress={() => openRoomMenu(item.id!, item.roomNumber)} />
              </View>
            </View>

            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">
                👥 Capacity: {item.capacity}
              </Text>
              <Text className="text-sm font-medium text-primary">
                {guestCountByRoom[item.roomNumber] || 0} / {item.capacity} guests assigned
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => handleManageRoom(item.id!, item.roomNumber)}
              className="flex-row items-center gap-1.5 bg-primary/8 px-3 py-1.5 rounded-full self-start"
            >
              <Text className="font-jakarta-bold text-[10px] text-primary">Manage Guests</Text>
              <Ionicons name="chevron-forward" size={10} color="#ee2b8c" />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity
            className="mt-2 items-center rounded-xl bg-pink-500 py-4"
            onPress={navigateToAddRoom}
          >
            <Text className="text-base font-semibold text-white">
              + Add Room
            </Text>
          </TouchableOpacity>
        }
      />
      <BottomActionMenu
        visible={menuVisible}
        onClose={closeRoomMenu}
        items={
            selectedRoom
              ? acceptedInvitations.length > 0
                ? [
                    {
                      label: "Edit",
                      icon: "create-outline",
                      onPress: () => selectedRoom && navigateToEditRoom(selectedRoom.id!),
                    },
                    {
                      label: "Duplicate",
                      icon: "copy-outline",
                      onPress: () =>
                        selectedRoom && handleDuplicate(selectedRoom.id!, selectedRoom.roomNumber),
                      loading: duplicateRoom.isPending,
                    },
                    {
                      label: "Delete",
                      icon: "trash-outline",
                      color: "#EF4444",
                      iconBgClassName: "bg-red-100",
                      onPress: () =>
                        selectedRoom && handleDelete(selectedRoom.id!, selectedRoom.roomNumber),
                      loading: deleteRoom.isPending,
                    },
                  ]
                : [
                    {
                      label: "Edit",
                      icon: "create-outline",
                      onPress: () => selectedRoom && navigateToEditRoom(selectedRoom.id!),
                    },
                    {
                      label: "Duplicate",
                      icon: "copy-outline",
                      onPress: () =>
                        selectedRoom && handleDuplicate(selectedRoom.id!, selectedRoom.roomNumber),
                      loading: duplicateRoom.isPending,
                    },
                    {
                      label: "Delete",
                      icon: "trash-outline",
                      color: "#EF4444",
                      iconBgClassName: "bg-red-100",
                      onPress: () =>
                        selectedRoom && handleDelete(selectedRoom.id!, selectedRoom.roomNumber),
                      loading: deleteRoom.isPending,
                    },
                  ]
              : []
          }
      />

      {/*
      <Modal
        visible={assignModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeAssignModal}
      >
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeAssignModal}
            className="absolute inset-0"
          />
          <View className="bg-white rounded-3xl p-5 w-full max-w-md shadow-xl max-h-[75vh]">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="font-jakarta-bold text-base text-[#181114]">
                  Assign to Room {selectedRoomNumber}
                </Text>
                <Text className="font-jakarta text-[11px] text-gray-400 mt-0.5">
                  Tap a guest to assign them to this room
                </Text>
              </View>
              <TouchableOpacity
                onPress={closeAssignModal}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {isLoadingGuests ? (
              <View className="items-center justify-center py-10">
                <ActivityIndicator size="large" color="#ee2b8c" />
                <Text className="mt-3 text-sm text-gray-500">Loading guests…</Text>
              </View>
            ) : (
              <FlatList
                data={acceptedInvitations}
                keyExtractor={(item: any) => String(item.eventGuest?.id ?? item.id)}
                renderItem={({ item: inv }: { item: any }) => {
                  const invitationId = inv.eventGuest?.id ?? inv.id;
                  const assignedRoom = inv.eventGuest?.assignedRoom || null;
                  const isCurrentlyInThisRoom = assignedRoom === selectedRoomNumber;
                  const username = inv.user?.username || "Unknown Guest";

                  return (
                    <TouchableOpacity
                      onPress={() => handleGuestPress(inv)}
                      disabled={assignGuestToRoom.isPending || editGuestRoom.isPending}
                      className={`flex-row items-center p-3.5 rounded-xl mb-2 border ${
                        isCurrentlyInThisRoom
                          ? "bg-primary/10 border-primary/30"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <View className="w-10 h-10 rounded-full bg-pink-50 border border-pink-100 items-center justify-center mr-3">
                        <Text className="font-jakarta-bold text-[10px] text-primary">
                          {getInitials(username)}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-jakarta-semibold text-sm text-[#181114]">
                          {username}
                        </Text>
                        <Text className="font-jakarta text-[10px] text-gray-400 capitalize">
                          {isCurrentlyInThisRoom
                            ? `Assigned to Room ${selectedRoomNumber}`
                            : assignedRoom
                              ? `Assigned to Room ${assignedRoom}`
                              : "Not assigned"}
                        </Text>
                      </View>
                      {isCurrentlyInThisRoom && (
                        <Ionicons name="checkmark-circle" size={20} color="#ee2b8c" />
                      )}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <Text className="text-sm text-gray-400 text-center py-8">
                    No guests available for this event.
                  </Text>
                }
              />
            )}

            <TouchableOpacity
              onPress={closeAssignModal}
              className="rounded-xl py-3 items-center border border-gray-200 mt-3"
            >
              <Text className="font-jakarta-semibold text-sm text-gray-500">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      */}
    </View>
  );
}

export function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
}
