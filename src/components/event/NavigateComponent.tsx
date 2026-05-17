import { useThrottledRouter } from "@/src/hooks/useThrottledRouter";
import { Ionicons } from "@expo/vector-icons";
import { RelativePathString } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface QuickServiceButtonProps {
  id: string;
  name: string;
  icon?: string;
  color: string;
  route: RelativePathString;
  isGuest?: boolean;
  isSubEventView?: boolean;
  className?: string;
}
export default function NavigateComponent({
  id,
  name,
  icon,
  isGuest = false,
  isSubEventView,
  color,
  className,
  route,
}: QuickServiceButtonProps) {
  const { push } = useThrottledRouter();
  return (
    <TouchableOpacity
      className={` flex items-center gap-2 px-4 py-3 bg-white  justify-center dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 h-[100px] ${className}`}
      onPress={() => push({
        pathname: route,
        params: {
          isGuest: isGuest ? "true" : "false",
          isSubEvent: isSubEventView ? "true" : "false"
        },
      })}
      activeOpacity={0.8}
      style={{ width: "47%" }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: color }}
      >
        {icon && <Ionicons name={icon as any} size={20} color="white" />}
      </View>
      <Text className="font-semibold text-xs text-gray-900">{name}</Text>
    </TouchableOpacity>
  );
}
