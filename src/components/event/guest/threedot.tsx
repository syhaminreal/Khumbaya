import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type MenuAction = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  iconBgClassName?: string;
  disabled?: boolean;
  loading?: boolean;
};

type BottomActionMenuProps = {
  visible: boolean;
  onClose: () => void;
  items: MenuAction[];
};

type ThreeDotButtonProps = {
  onPress: () => void;
  vertical?: boolean;
  color?: string;
};

export function ThreeDotButton({
  onPress,
  vertical = false,
  color = "#ee2b8c",
}: ThreeDotButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20"
      hitSlop={6}
    >
      <Ionicons
        name={vertical ? "ellipsis-vertical" : "ellipsis-horizontal"}
        size={16}
        color={color}
      />
    </Pressable>
  );
}

export function BottomActionMenu({
  visible,
  onClose,
  items,
}: BottomActionMenuProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/20 justify-end" onPress={onClose}>
        <Pressable className="bg-white rounded-2xl p-4 mx-4 mb-6">
          {items.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              disabled={item.disabled || item.loading}
              className="flex-row items-center gap-3 py-3"
            >
              <View
                className={`h-8 w-8 rounded-full items-center justify-center ${
                  item.iconBgClassName ?? "bg-primary/10"
                }`}
              >
                {item.loading ? (
                  <ActivityIndicator size="small" color={item.color ?? "#ee2b8c"} />
                ) : (
                  <Ionicons
                    name={item.icon}
                    size={16}
                    color={item.color ?? "#ee2b8c"}
                  />
                )}
              </View>
              <Text
                className={`text-base ${
                  item.disabled || item.loading ? "text-gray-400" : "text-gray-900"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={onClose}
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
  );
}
