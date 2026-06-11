import {
  useCreateRoom,
  useGetRoom,
  useUpdateRoomById,
} from "@/src/features/rooms/hooks/use-room";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddRoom() {
  const { eventId, roomId } = useLocalSearchParams<{
    eventId: string;
    roomId?: string;
  }>();
  const router = useRouter();
  const id = Number(eventId);
  const roomIdNum = roomId ? Number(roomId) : undefined;
  const isEditing = Boolean(roomIdNum);

  const [name, setName] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [capacity, setCapacity] = useState("");
  const [costPerRoom, setCostPerRoom] = useState("");

  const createRoom = useCreateRoom(id);
  const updateRoom = useUpdateRoomById(id);
  const { data: roomData, isLoading: isFetchingRoom } = useGetRoom(
    roomIdNum ?? 0
  );
  const isPending = createRoom.isPending || updateRoom.isPending;

  useEffect(() => {
    if (isEditing && roomData) {
      setName(roomData.name ?? "");
      setRoomNo(roomData.roomNumber ?? "");
      setCapacity(String(roomData.capacity ?? ""));
      setCostPerRoom(String(roomData.costPerRoom ?? ""));
    }
  }, [isEditing, roomData]);

  async function handleSubmit() {
    const trimmedName = name.trim();
    const trimmedRoomNo = roomNo.trim();
    const numericCapacity = Number(capacity);
    const numericCost = Number(costPerRoom);

    if (!trimmedName || !trimmedRoomNo || !numericCapacity || !numericCost) {
      Alert.alert("Missing details", "Please fill all room details.");
      return;
    }

    try {
      if (isEditing && roomIdNum) {
        await updateRoom.mutateAsync({
          id: roomIdNum,
          payload: {
            name: trimmedName,
            roomNumber: trimmedRoomNo,
            capacity: numericCapacity,
            costPerRoom: numericCost,
          },
        });
      } else {
        await createRoom.mutateAsync({
          name: trimmedName,
          roomNumber: trimmedRoomNo,
          capacity: numericCapacity,
          costPerRoom: numericCost,
        });
      }

      router.back();
    } catch {
      Alert.alert("Error", `Could not ${isEditing ? "update" : "add"} room.`);
    }
  }

  if (isEditing && isFetchingRoom) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 px-5 py-6">
      <Stack.Screen
        options={{ title: isEditing ? "Edit Room" : "Add Room" }}
      />

      <View className="rounded-2xl border border-gray-200 bg-white p-4">
        <Text className="mb-2 text-sm font-medium text-gray-700">
          Room name
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Deluxe Room"
          className="mb-4 rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
        />

        <Text className="mb-2 text-sm font-medium text-gray-700">
          Room number
        </Text>
        <TextInput
          value={roomNo}
          onChangeText={setRoomNo}
          placeholder="101"
          className="mb-4 rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
        />

        <Text className="mb-2 text-sm font-medium text-gray-700">
          Capacity
        </Text>
        <TextInput
          value={capacity}
          onChangeText={setCapacity}
          placeholder="2"
          keyboardType="numeric"
          className="mb-4 rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
        />

        <Text className="mb-2 text-sm font-medium text-gray-700">
          Cost per room
        </Text>
        <TextInput
          value={costPerRoom}
          onChangeText={setCostPerRoom}
          placeholder="5000"
          keyboardType="numeric"
          className="mb-5 rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
        />

        <TouchableOpacity
          disabled={isPending}
          onPress={handleSubmit}
          className="items-center rounded-xl bg-pink-500 py-4"
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-semibold text-white">
              {isEditing ? "Update Room" : "Add Room"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
