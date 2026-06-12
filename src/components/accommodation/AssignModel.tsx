import { Text } from "@/src/components/ui/Text";
import { GuestWithRoom } from "@/src/features/hotel/types/hotel.types";
import { Ionicons } from "@expo/vector-icons";
import { Dispatch, SetStateAction } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    TouchableOpacity,
    View,
} from "react-native";

type AvailableRoom = {
  roomNumber: string;
  capacity: number;
  occupied: number;
};

type RoomAssignmentState = {
  visible: boolean;
  guest: GuestWithRoom | null;
};

type AssignRoomModalProps = {
  roomAssignmentModal: RoomAssignmentState;
  setRoomAssignmentModal: Dispatch<SetStateAction<RoomAssignmentState>>;
  availableRooms: AvailableRoom[];
  selectedRoomNumber: string;
  setSelectedRoomNumber: Dispatch<SetStateAction<string>>;
  isPending: boolean;
  getInitials: (name: string) => string;
  onConfirmAssignment: () => void;
};

export function AssignRoomModal({
  roomAssignmentModal,
  setRoomAssignmentModal,
  availableRooms,
  selectedRoomNumber,
  setSelectedRoomNumber,
  isPending,
  getInitials,
  onConfirmAssignment,
}: AssignRoomModalProps) {
  const availableRoomsList = availableRooms.filter(
    (room) => room.occupied < room.capacity
  );

  const handleRoomSelect = (roomNumber: string) => {
    setSelectedRoomNumber(roomNumber);
  };

  return (
    <Modal
      visible={roomAssignmentModal.visible}
      transparent
      animationType="slide"
      onRequestClose={() => setRoomAssignmentModal({ visible: false, guest: null })}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-black/40 justify-end">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setRoomAssignmentModal({ visible: false, guest: null })}
            className="absolute inset-0"
          />
          <View className="bg-white rounded-t-3xl px-5 pt-3 pb-10 max-h-[70%]">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-4" />

            <View className="flex-row items-center justify-between mb-5">
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-primary/10 items-center justify-center">
                  <Ionicons name="bed-outline" size={16} color="#ee2b8c" />
                </View>
                <View>
                  <Text className="font-jakarta-bold text-base text-[#181114]">Assign Room</Text>
                  <Text className="font-jakarta text-[11px] text-gray-400">
                    Select an available room for this guest
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setRoomAssignmentModal({ visible: false, guest: null })}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {roomAssignmentModal.guest && (
              <>
                <View className="flex-row items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100 mb-5">
                  <View className="w-10 h-10 rounded-full bg-pink-50 border border-pink-100 items-center justify-center">
                    <Text className="font-jakarta-bold text-[11px] text-primary">
                      {getInitials(roomAssignmentModal.guest.user?.username || "?")}
                    </Text>
                  </View>
                  <View>
                    <Text className="font-jakarta-semibold text-sm text-[#181114]">
                      {roomAssignmentModal.guest.user?.username || "Unknown Guest"}
                    </Text>
                    {roomAssignmentModal.guest.category && (
                      <Text className="font-jakarta text-[10px] text-gray-400 capitalize mt-0.5">
                        {roomAssignmentModal.guest.category}
                      </Text>
                    )}
                  </View>
                </View>

                <View className="mb-5">
                  <Text className="font-jakarta-semibold text-xs text-gray-600 mb-2">
                    Available Rooms
                  </Text>
                  {availableRoomsList.length === 0 ? (
                    <View className="py-8 items-center">
                      <Ionicons name="alert-circle-outline" size={32} color="#9CA3AF" />
                      <Text className="font-jakarta text-xs text-gray-400 mt-2">
                        No rooms available
                      </Text>
                    </View>
                  ) : (
                    <View className="gap-2 max-h-[200px]">
                      {availableRoomsList.map((room) => (
                        <TouchableOpacity
                          key={room.roomNumber}
                          onPress={() => handleRoomSelect(room.roomNumber)}
                          className={`flex-row items-center justify-between p-3.5 rounded-xl border ${
                            selectedRoomNumber === room.roomNumber
                              ? "bg-primary/10 border-primary"
                              : "bg-white border-gray-200"
                          }`}
                          activeOpacity={0.7}
                        >
                          <View className="flex-row items-center gap-3">
                            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                              <Ionicons name="bed-outline" size={16} color="#ee2b8c" />
                            </View>
                            <Text className="font-jakarta-semibold text-sm text-[#181114]">
                              Room {room.roomNumber}
                            </Text>
                          </View>
                          <Text className="font-jakarta text-xs text-gray-500">
                            {room.occupied}/{room.capacity} guests
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View className="gap-2.5">
                  <TouchableOpacity
                    disabled={!selectedRoomNumber || isPending || availableRoomsList.length === 0}
                    onPress={onConfirmAssignment}
                    className={`rounded-xl py-3.5 items-center flex-row justify-center gap-2 ${
                      !selectedRoomNumber || isPending || availableRoomsList.length === 0
                        ? "bg-primary/40"
                        : "bg-primary"
                    }`}
                  >
                    {isPending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                        <Text className="font-jakarta-bold text-sm text-white">
                          Confirm Assignment
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setRoomAssignmentModal({ visible: false, guest: null });
                      setSelectedRoomNumber("");
                    }}
                    className="rounded-xl py-3.5 items-center border border-gray-200"
                  >
                    <Text className="font-jakarta-semibold text-sm text-gray-500">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}