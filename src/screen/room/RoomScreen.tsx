import {
  useDeleteRoomById,
  useDuplicateRoom,
  useGetRooms,
} from "@/src/features/rooms/hooks/use-room";
import { useGetGuestRoom } from "@/src/features/guests/api/use-guests";
import {
  MenuAction,
  ThreeDotButton,
  BottomActionMenu,
} from "@/src/components/event/guest/threedot";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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

  const deleteRoom = useDeleteRoomById(id);
  const duplicateRoom = useDuplicateRoom(id);

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
      pathname:
        "/(protected)/(client-stack)/events/[eventId]/(shared)/room/add",
      params: { eventId },
    });
  }, [eventId, router]);

  const navigateToEditRoom = useCallback(
    (roomId: number) => {
      if (!id) return;

      router.push({
        pathname:
          "/(protected)/(client-stack)/events/[eventId]/(shared)/room/add",
        params: { eventId: String(id), roomId: String(roomId) },
      });
    },
    [id, router]
  );

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<{
    id: number;
    roomNumber: string;
  } | null>(null);

  const closeRoomMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

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

  const handleManageRoom = useCallback(
    (roomId: number, roomNumber: string) => {
      router.push({
        pathname:
          "/(protected)/(client-stack)/events/[eventId]/(shared)/hotel",
        params: { eventId: String(id) },
      });
    },
    [id, router]
  );

  const roomMenuItems = useMemo<MenuAction[]>(() => {
    if (!selectedRoom) return [];

    return [
      {
        label: "Edit",
        icon: "create-outline",
        onPress: () => navigateToEditRoom(selectedRoom.id),
      },
      {
        label: "Duplicate",
        icon: "copy-outline",
        onPress: () =>
          handleDuplicate(selectedRoom.id, selectedRoom.roomNumber),
        loading: duplicateRoom.isPending,
      },
      {
        label: "Delete",
        icon: "trash-outline",
        color: "#EF4444",
        iconBgClassName: "bg-red-100",
        onPress: () => handleDelete(selectedRoom.id, selectedRoom.roomNumber),
        loading: deleteRoom.isPending,
      },
    ];
  }, [
    selectedRoom,
    navigateToEditRoom,
    handleDuplicate,
    handleDelete,
    duplicateRoom.isPending,
    deleteRoom.isPending,
  ]);

  const openRoomMenu = useCallback((roomId: number, roomNumber: string) => {
    setSelectedRoom({ id: roomId, roomNumber });
    setMenuVisible(true);
  }, []);

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

                <ThreeDotButton
                  onPress={() => openRoomMenu(item.id!, item.roomNumber)}
                />
              </View>
            </View>

            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">
                👥 Capacity: {item.capacity}
              </Text>
              <Text className="text-sm font-medium text-primary">
                {guestCountByRoom[item.roomNumber] || 0} / {item.capacity}{" "}
                guests assigned
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => handleManageRoom(item.id!, item.roomNumber)}
              className="flex-row items-center gap-1.5 bg-primary/8 px-3 py-1.5 rounded-full self-start"
            >
              <Text className="font-jakarta-bold text-[10px] text-primary">
                Manage Guests
              </Text>
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
        items={roomMenuItems}
      />
    </View>
  );
}

export function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}
