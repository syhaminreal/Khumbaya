import { Text } from "@/src/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { Modal, TouchableOpacity, View } from "react-native";

type CategoryOption = {
  value: string;
  label: string;
  count: number;
};

type CategoryModalProps = {
  isVisible: boolean;
  onClose: () => void;
  options: CategoryOption[];
  selectedCategory: string;
  onSelectCategory: (value: string) => void;
};

export function CategoryModal({
  isVisible,
  onClose,
  options,
  selectedCategory,
  onSelectCategory,
}: CategoryModalProps) {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 justify-end">
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="absolute inset-0"
        />
        <View className="bg-white rounded-t-3xl px-5 pt-3 pb-8">
          <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-4" />
          <View className="flex-row items-center justify-between mb-5">
            <View>
              <Text className="font-jakarta-bold text-base text-[#181114]">
                Filter by Category
              </Text>
              <Text className="font-jakarta text-[11px] text-gray-400 mt-0.5">
                Select a group to view
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="close" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View className="gap-2">
            {options.map((option) => {
              const isActive = selectedCategory === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    onSelectCategory(option.value);
                    onClose();
                  }}
                  className={`flex-row items-center justify-between px-4 py-3.5 rounded-xl border ${isActive ? "border-primary bg-primary/8" : "border-gray-100 bg-gray-50"}`}
                >
                  <Text
                    className={`font-jakarta-semibold text-sm ${isActive ? "text-primary" : "text-[#181114]"}`}
                  >
                    {option.label}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`px-2.5 py-0.5 rounded-full ${isActive ? "bg-primary/15" : "bg-gray-200"}`}
                    >
                      <Text
                        className={`font-jakarta-bold text-[10px] ${isActive ? "text-primary" : "text-gray-500"}`}
                      >
                        {option.count}
                      </Text>
                    </View>
                    {isActive && (
                      <Ionicons name="checkmark-circle" size={18} color="#ee2b8c" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}