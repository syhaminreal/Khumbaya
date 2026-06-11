import { Text } from "@/src/components/ui/Text";
import type { TodoColumn } from "@/src/features/todo/type";
import { useAuthStore } from "@/src/store/AuthStore";
import { formatDate, getChecklistDueMeta } from "@/src/utils/helper";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  Pressable,
  View
} from "react-native";

export type ChecklistTask = TodoColumn;

type TaskItemProps = {
  task: ChecklistTask;
  onEditPress: () => void;
  onDeletePress: () => void;
  onToggleComplete: () => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
};

const ChecklistTaskItem = ({
  task,
  onEditPress,
  onDeletePress,
  onToggleComplete,
  isUpdating,
  isDeleting,
}: TaskItemProps) => {
  const [showActions, setShowActions] = useState(false);
  const {user} = useAuthStore();
  const taskDueDate = task.dueDate instanceof Date
    ? task.dueDate.toISOString()
    : (task.dueDate as string | null);
const userId = user?.id ?? 0;
  const dueMeta = getChecklistDueMeta(taskDueDate);
  const isUrgent = Boolean(dueMeta);
  const isCompleted = task.doneByuserIds?.includes(userId);

  return (
    <Pressable
      className={`${task.doneByuserIds?.includes(user?.id ?? 0)
        ? "bg-surface-secondary  flex-row items-start p-5 rounded-xl mb-4"
        : "bg-surface  flex-row items-start p-5 rounded-xl mb-4"
        }`}
      onPress={onEditPress}
    >
      <Pressable
        onPress={(event) => {
          event.stopPropagation?.();
          onToggleComplete();
        }}
        className={`mt-0.5 w-8 h-8 rounded-md border-2 flex items-center justify-center mr-4 ${isCompleted
          ? "bg-success-500 border-success-500"
          : "border-primary/20 active:border-primary active:bg-primary/5"
          }`}
        disabled={isUpdating}
      >
        {isCompleted ? (
          <MaterialIcons name="check" size={22} color="white" />
        ) : null}
      </Pressable>

      <View className="flex-1">
        <Text
          className={`font-jakarta-semibold text-base leading-snug mb-3 ${isCompleted
            ? "text-text-tertiary line-through"
            : "text-text-light"
            }`}
        >
          {task.title}
        </Text>

        <View className="flex-row flex-wrap items-center gap-x-4 gap-y-2 mb-4">
          {task.category ? (
            <View
              className={`flex-row items-center px-2.5 py-1 rounded-full border ${task.doneByuserIds?.includes(userId)
                ? "bg-gray-100 border-gray-200"
                : "bg-primary/5 border-primary/20"
                }`}
            >
              <MaterialIcons
                name="label-outline"
                size={14}
                color={task.doneByuserIds?.includes(userId) ? "#94a3b8" : "#ee2b8c"}
              />
              <Text
                className={`text-xs font-jakarta-bold ml-1.5 ${task.doneByuserIds?.includes(user?.id ?? 0)
                  ? "text-text-disabled"
                  : "text-primary"
                  }`}
              >
                {task.category}
              </Text>
            </View>
          ) : null}

          {isUrgent ? (
            <View className="flex-row items-center bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
              <MaterialIcons name="schedule" size={14} color="#ea580c" />
              <Text className="text-xs font-jakarta-bold uppercase tracking-wider text-orange-600 ml-1">
                {dueMeta?.label}
              </Text>
            </View>
          ) : (
            <View className={`flex-row items-center ${isCompleted ? "opacity-50" : ""}`}>
              <MaterialIcons
                name="calendar-month"
                size={16}
                color="#9CA3AF"
              />
              <Text
                className={`text-xs font-jakarta-semibold ml-1.5 ${isCompleted
                  ? "text-text-disabled"
                  : "text-text-tertiary"
                  }`}
              >
                {formatDate(taskDueDate ?? undefined)}
              </Text>
            </View>
          )}

          <View className={`flex-row items-center ${isCompleted ? "opacity-50" : ""}`}>
            <View className="w-5 h-5 rounded-full overflow-hidden border border-white shadow-sm bg-surface-tertiary">
              {task.assignedUser?.photo ? (
                <Image
                  source={{ uri: task.assignedUser.photo }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <MaterialIcons name="person" size={12} color="#ee2b8c" />
                </View>
              )}
            </View>
            <Text className="text-xs font-jakarta-bold text-muted-light ml-2">
              {task.assignedUser?.username ?? "Unassigned"}
            </Text>
          </View>
        </View>

        {showActions ? (
          <View className="flex-row flex-wrap items-center gap-4">
            <Pressable
              onPress={(event) => event.stopPropagation?.()}
              className={`flex-row items-center px-2 py-1 -ml-2 rounded-sm ${task.doneByuserIds?.includes(user?.id ?? 0) ? "opacity-50" : "active:bg-primary/5"
                }`}
              disabled={task.doneByuserIds?.includes(user?.id ?? 0)}
            >
              <MaterialIcons
                name="add"
                size={18}
                color={task.doneByuserIds?.includes(user?.id ?? 0) ? "#9CA3AF" : "#ee2b8c"}
              />
              <Text
                className={`text-xs font-jakarta-bold ml-1.5 ${task.doneByuserIds?.includes(user?.id ?? 0) ? "text-text-disabled" : "text-primary"}`}
              >
                Add sub-task
              </Text>
            </Pressable>

            <Pressable
              onPress={(event) => {
                event.stopPropagation?.();
                onEditPress();
              }}
              className="flex-row items-center px-2 py-1 rounded-sm active:bg-primary/5"
            >
              <MaterialIcons
                name="more-horiz"
                size={16}
                color="#896175"
              />
              <Text className="text-xs font-jakarta-bold text-[#896175] ml-1.5">
                More details
              </Text>
            </Pressable>

            <Pressable
              onPress={(event) => {
                event.stopPropagation?.();
                onToggleComplete();
              }}
              className="flex-row items-center px-2 py-1 rounded-sm active:bg-primary/5"
              disabled={isUpdating}
            >
              <MaterialIcons
                name={task.doneByuserIds?.includes(user?.id ?? 0) ? "radio-button-unchecked" : "check-circle"}
                size={16}
                color="#ee2b8c"
              />
              <Text className="text-xs font-jakarta-bold text-primary ml-1.5">
                {task.doneByuserIds?.includes(user?.id ?? 0) ? "Mark incomplete" : "Mark complete"}
              </Text>
            </Pressable>

            <Pressable
              onPress={(event) => {
                event.stopPropagation?.();
                onDeletePress();
              }}
              className="flex-row items-center px-2 py-1 rounded-sm active:bg-red-50"
              disabled={isDeleting}
            >
              <MaterialIcons name="delete" size={16} color="#ef4444" />
              <Text className="text-xs font-jakarta-bold text-red-500 ml-1.5">
                {isDeleting ? "Deleting..." : "Delete"}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View className="items-center mt-0.5 ml-2">
        <Pressable
          onPress={(event) => {
            event.stopPropagation?.();
            setShowActions((prev) => !prev);
          }}
          className="p-1.5 rounded-md active:bg-primary/5"
        >
          <MaterialIcons
            name={showActions ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={20}
            color="#64748b"
          />
        </Pressable>
      </View>
    </Pressable>
  );
};

export default ChecklistTaskItem;
