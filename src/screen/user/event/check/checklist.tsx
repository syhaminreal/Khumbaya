
import { TODO_ALL_CATEGORY, type TodoCategoryFilter } from "@/src/constants/todo";
import { useBulkUpdateTodoStatus, useDeleteTodo, useTodosByEventId } from "@/src/features/todo/hooks/useTodo";
import { useTodoDraftStore } from "@/src/features/todo/store";
import type { TodoColumn } from "@/src/features/todo/type";
import { useThrottledRouter } from "@/src/hooks/useThrottledRouter";
import { useAuthStore } from "@/src/store/AuthStore";
import { filterTaskByDueDate, type DueDateFilter } from "@/src/utils/dateFilters";
import { _entering, _exiting, _layoutAnimation, AnimatedModal, useDebounce } from "@/src/utils/helper";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import ChecklistTaskItem from "./ChecklistTaskItem";
import { DueDateFilterModal } from "./DueDateFilterModal";

export type ChecklistTask = TodoColumn;

export default function ChecklistScreen() {
  const { eventId, isGuest } = useLocalSearchParams<{
    eventId?: string
    isGuest?: string;
  }>();

  if (!eventId || Number(eventId) && isNaN(Number(eventId))) {
    throw new Error("Invalid eventId");
  }

  const isGuestView = isGuest === "true";
  const { user } = useAuthStore();
  const { push } = useThrottledRouter();
  const userId = user?.id ?? 0;
  const { clearTodoDetail, setTodoDetail } = useTodoDraftStore();

  const { data: todos = [], isLoading, isFetching } = useTodosByEventId(eventId);
  const { mutate: deleteTodo, isPending: isDeletingTodo } = useDeleteTodo();
  const { mutateAsync: bulkAsync } = useBulkUpdateTodoStatus();

  const [localOverrides, setLocalOverrides] = useState<Record<number, boolean>>({});
  const debouncedOverrides = useDebounce(localOverrides, 1000);

  useEffect(() => {
    const updates = Object.entries(debouncedOverrides).map(([id, isDone]) => ({
      todoId: Number(id),
      isDone,
    }));

    if (updates.length > 0) bulkAsync(updates);
  }, [debouncedOverrides, bulkAsync]);

  const [selectedCategory, setSelectedCategory] = useState<TodoCategoryFilter>(TODO_ALL_CATEGORY);
  const [selectedDueDate, setSelectedDueDate] = useState<DueDateFilter>(null);
  const [showAssignedToMe, setShowAssignedToMe] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const hasActiveFilter = !!selectedDueDate || showAssignedToMe;

  const mergedTodos: ChecklistTask[] = useMemo(
    () => todos.map((t: ChecklistTask) => {
      const taskId = t.id;
      const serverDoneByUserIds = t.doneByuserIds ?? [];
      const hasOverride = typeof taskId === "number" && taskId in localOverrides;
      const overrideValue = hasOverride ? localOverrides[taskId] : undefined;

      let effectiveDoneByUserIds = serverDoneByUserIds;
      if (hasOverride) {
        if (overrideValue) {
          if (!serverDoneByUserIds.includes(userId)) {
            effectiveDoneByUserIds = [...serverDoneByUserIds, userId];
          }
        } else if (serverDoneByUserIds.includes(userId)) {
          effectiveDoneByUserIds = serverDoneByUserIds.filter((id) => id !== userId);
        }
      }

      return {
        ...t,
        doneByuserIds: effectiveDoneByUserIds,
        isDone: effectiveDoneByUserIds.includes(userId),
      };
    }),
    [todos, localOverrides, userId]
  );

  const filteredTodos = useMemo(() => {
    return mergedTodos.filter((todo: ChecklistTask) => {
      if (selectedCategory !== TODO_ALL_CATEGORY && todo.category !== selectedCategory) return false;
      if (!filterTaskByDueDate(todo.dueDate, selectedDueDate)) return false;
      if (showAssignedToMe && userId && todo.assignedTo !== userId) return false;
      return true;
    });
  }, [mergedTodos, selectedCategory, selectedDueDate, showAssignedToMe, userId]);

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleToggleComplete = useCallback((task: ChecklistTask) => {
    const taskId = task.id;
    if (typeof taskId !== "number") return;
    setLocalOverrides((prev) => ({
      ...prev,
      [taskId]: !(taskId in prev ? prev[taskId] : task.doneByuserIds?.includes(userId)),
    }));
  }, [userId]);

  const handleDeleteTask = useCallback(
    (task: ChecklistTask) => {
      if (typeof task.id !== "number") return;
      Alert.alert("Delete task", "Are you sure you want to delete this task?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTodo({ id: task.id as number, eventId: eventId as string }),
        },
      ]);
    },
    [deleteTodo, eventId]
  );

  const handleCreateTask = useCallback(() => {
    if (!eventId || isGuestView) return;
    clearTodoDetail();
    push({ pathname: "../tasklist/detail", params: { eventId } });
  }, [clearTodoDetail, eventId, push, isGuestView]);

  // ── loading skeleton ──────────────────────────────────────────────────────
  if (isLoading || !todos) {
    return (
      <View className="gap-4 px-4 mt-2">
        <View className="rounded-md p-8 bg-white shadow-sm">
          <View className="h-8 w-3/4 bg-surface-container-highest rounded-md mb-3 animate-pulse" />
          <View className="h-4 w-1/2 bg-surface-container-highest rounded mb-6 animate-pulse" />
          <View className="h-3 w-full bg-surface-container-highest rounded-md animate-pulse" />
        </View>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} className="bg-white rounded-md p-4 shadow-sm">
            <View className="flex-row items-center gap-3">
              <View className="w-6 h-6 rounded-md bg-surface-container-highest animate-pulse" />
              <View className="flex-1 h-4 bg-surface-container-highest rounded animate-pulse" />
            </View>
          </View>
        ))}
      </View>
    );
  }

  const hasTodos = todos.length > 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Checklist",
          headerRight: () => (
            <View className="flex-row items-center mr-1 rounded-full overflow-hidden border border-border bg-white">
              {/* Only show filter button when there's something to filter */}
              {hasTodos && (
                <Pressable
                  onPress={() => setShowFilterModal(true)}
                  className="w-20 h-10 items-center justify-center"
                >
                  <MaterialIcons
                    name="tune"
                    size={18}
                    color={hasActiveFilter ? "#C2185B" : "#64748b"}
                  />
                </Pressable>
              )}

              {!isGuestView && (
                <>
                  {hasTodos && <View className="w-px h-5 bg-border" />}
                  <Pressable
                    onPress={handleCreateTask}
                    className="w-12 h-10 items-center justify-center"
                  >
                    <MaterialIcons name="add" size={22} color="#E91E8C" />
                  </Pressable>
                </>
              )}
            </View>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator className="flex-1 p-1">
        <View className="gap-4 px-4 mt-2">
          {filteredTodos.length === 0 ? (
            <View className="bg-white rounded-xl p-6 items-center border border-border">
              <MaterialIcons name="playlist-add-check-circle" size={40} color="#cbd5e1" />
              <Text className="text-base font-semibold text-text-secondary mt-3">
                {selectedCategory === TODO_ALL_CATEGORY ? "No tasks yet" : `No tasks in ${selectedCategory}`}
              </Text>
              <Text className="text-sm text-text-tertiary mt-1 text-center">
                Start by creating your first todo for this event.
              </Text>
              {!isGuestView && (
                <Pressable
                  onPress={handleCreateTask}
                  className="mt-4 flex-row items-center gap-2 bg-primary px-4 py-2.5 rounded-md"
                >
                  <MaterialIcons name="add" size={16} color="white" />
                  <Text className="text-white font-semibold">Create Todo</Text>
                </Pressable>
              )}
            </View>
          ) : (
            filteredTodos.map((task: ChecklistTask) => (
              <ChecklistTaskItem
                key={task.id}
                task={task}
                isDeleting={isDeletingTodo}
                onToggleComplete={() => { handleToggleComplete(task); }}
                onDeletePress={() => { if (!isGuestView) handleDeleteTask(task); }}
                onEditPress={() => {
                  if (!eventId) return;
                  setTodoDetail(task);
                  push({
                    pathname: "../tasklist/detail",
                    params: { eventId, taskId: task.id, isGuestview: isGuestView ? "true" : undefined },
                  });
                }}
              />
            ))
          )}
        </View>
      </ScrollView>
      {isFetching && (
        <View className="items-end">
          <View className=" absolute bottom-8 right-8 flex-row items-center gap-2 bg-[#ee2b8c]/10 border border-[#ee2b8c]/30 px-3 py-2 rounded-full">
            <ActivityIndicator size="small" color="#ee2b8c" />
            <Text className="text-[#ee2b8c] text-xs font-semibold">Loading</Text>
          </View>
        </View>
      )}

      {hasTodos && (
        <Modal
          visible={showFilterModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setShowFilterModal(false)} />
          <DueDateFilterModal
            selectedFilter={selectedDueDate}
            onSelectFilter={setSelectedDueDate}
            showAssignedToMe={showAssignedToMe}
            onToggleAssignedToMe={() => setShowAssignedToMe((v) => !v)}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onClose={() => setShowFilterModal(false)}
          />
        </Modal>
      )}
    </>
  );
}
