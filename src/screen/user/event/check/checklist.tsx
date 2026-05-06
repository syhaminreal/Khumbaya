import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";

import { TODO_ALL_CATEGORY, type TodoCategoryFilter } from "@/src/constants/todo";
import { useBulkUpdateTodoStatus, useDeleteTodo, useTodosByEventId } from "@/src/features/todo/hooks/useTodo";
import { useTodoDraftStore, useTodoListStore } from "@/src/features/todo/store";
import type { TodoColumn } from "@/src/features/todo/type";
import { useAuthStore } from "@/src/store/AuthStore";
import { useChecklistDraftStore } from "@/src/store/useChecklistDraftStore";
import { filterTaskByDueDate, type DueDateFilter } from "@/src/utils/dateFilters";
import { useDebounce } from "@/src/utils/helper";
import ChecklistTaskItem from "./ChecklistTaskItem";
import { DueDateFilterModal } from "./DueDateFilterModal";

export type ChecklistTask = TodoColumn;


export default function ChecklistScreen() {
  const router = useRouter();
  const { eventId, isGuestview, isGuest } = useLocalSearchParams<{ eventId?: string | string[]; isGuestview?: string; isGuest?: string }>();
  const [selectedCategory, setSelectedCategory] = useState<TodoCategoryFilter>(TODO_ALL_CATEGORY);
  const [selectedDueDate, setSelectedDueDate] = useState<DueDateFilter>(null);
  const [showAssignedToMe, setShowAssignedToMe] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const isGuestView = isGuestview === "true" || isGuest === "true";

  const { user } = useAuthStore();
  const { clearDraft } = useChecklistDraftStore();
  const { clearTodoDetail, setTodoDetail } = useTodoDraftStore();
  const { todos, setTodos, toggleTodoStatus } = useTodoListStore();

  const parsedEventId = eventId ? Number(eventId) : null;

  if (parsedEventId && isNaN(parsedEventId)) {
    throw new Error("Invalid eventId");
  }
  const { data: todosList, refetch, isLoading , isFetching  } = useTodosByEventId(parsedEventId);
  const { mutate: deleteTodo, isPending: isDeletingTodo } = useDeleteTodo();
  const { mutateAsync: bulkAsync } = useBulkUpdateTodoStatus();

// ✅ Sync store whenever fetched data changes (including empty array)


  const debouncedTodos = useDebounce(todos, 1000);

  useEffect(() => {
    if (debouncedTodos.length === 0) return;
    const updates = debouncedTodos
      .filter((t) => {
        const original = todosList?.find((o: ChecklistTask) => o.id === t.id);
        return original && Boolean(original.isDone) !== Boolean(t.isDone);
      })
      .map((t) => ({
        todoId: t.id as number,
        isDone: Boolean(t.isDone),
        status: t.isDone ? "completed" : "pending",
      }));

    if (updates.length > 0) {
      bulkAsync(updates)
    }
  }, [debouncedTodos, bulkAsync, todosList]);

  const handleToggleComplete = useCallback(
    (task: ChecklistTask) => {
      if (typeof task.id !== "number") return;
      toggleTodoStatus(task.id);
    },
    [toggleTodoStatus]
  );

  const handleDeleteTask = useCallback(
    (task: ChecklistTask) => {
      if (typeof task.id !== "number") return;
      const todoId = task.id;

      Alert.alert("Delete task", "Are you sure you want to delete this task?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteTodo({ id: todoId, eventId: parsedEventId });
          },
        },
      ]);
    },
    [deleteTodo, parsedEventId]
  );

  useEffect(() => {
    clearDraft();
    clearTodoDetail();
  }, [clearDraft, clearTodoDetail]);


  const filteredTodos = useMemo(() => {
    return todosList?.filter((todo:any) => {
      // Filter by category
      if (selectedCategory !== TODO_ALL_CATEGORY && todo.category !== selectedCategory) {
        return false;
      }

      // Filter by due date
      if (!filterTaskByDueDate(todo.dueDate, selectedDueDate)) {
        return false;
      }

      // Filter by assigned to me
      if (showAssignedToMe && user?.id && todo.assignedTo !== user.id) {
        return false;
      }

      return true;
    });
  }, [selectedCategory, selectedDueDate, showAssignedToMe, todos, user?.id]);

  const handleCreateTask = useCallback(() => {
    if (parsedEventId && !isGuestView) {
      clearTodoDetail();
      clearDraft();
      router.push({
        pathname: "../tasklist/detail",
        params: { eventId: parsedEventId },
      });
    }
  }, [clearDraft, clearTodoDetail, parsedEventId, router, isGuestView]);

  if (isLoading || isFetching  ) {
    return (

      <View className="gap-4 px-4 mt-2">
        {/* Header skeleton */}
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
  return (<>
    <Stack.Screen
      options={{
        title: "Checklist",
        headerRight: () => (
          <View className="flex-row items-center gap-2 -right-1 top-1">
            <Pressable
              onPress={() => setShowFilterModal(true)}
              className="flex-row items-center justify-center gap-1 bg-secondary px-2 py-2 rounded-md"
            >
              <MaterialIcons name="tune" size={16} color="white" />
              {(selectedDueDate || showAssignedToMe) && (
                <View className="w-2 h-2 rounded-full bg-white" />
              )}
            </Pressable>
            {/* TODO:Review */}
            {!isGuestView && (
              <Pressable
                onPress={handleCreateTask}
                className="flex-row items-center justify-center gap-1 bg-primary px-2 py-2 rounded-md"
              >
                <MaterialIcons name="add" size={16} color="white" />
                <Text className="text-white font-semibold text-sm">Add Task</Text>
              </Pressable>
            )}
          </View>
        ),
      }}
    />
    <ScrollView
      showsVerticalScrollIndicator={true}
      className="flex-1 p-1"
    >
      <View className=" gap-4 px-4 mt-2">

        {filteredTodos?.length === 0 ? (
          <View className="bg-white rounded-xl p-6 items-center border border-border">
            <MaterialIcons name="playlist-add-check-circle" size={40} color="#cbd5e1" />
            <Text className="text-base font-semibold text-text-secondary mt-3">
              {selectedCategory === TODO_ALL_CATEGORY
                ? "No tasks yet"
                : `No tasks in ${selectedCategory}`}
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
          filteredTodos?.map((task: any) => (
            <ChecklistTaskItem
              key={task.id}
              task={task}
              isDeleting={isDeletingTodo}
              onToggleComplete={() => {
                if (isGuestView) return;
                handleToggleComplete(task);
              }}
              onDeletePress={() => {
                if (isGuestView) return;
                handleDeleteTask(task);
              }}
              onEditPress={() => {
                if (!parsedEventId) {
                  return;
                }
                if (task) {
                  console.log('Setting todo detail for task:', task);
                  setTodoDetail(task);
                }
                router.push({
                  pathname: "../tasklist/detail",
                  params: { eventId: parsedEventId, taskId: task.id, isGuestview: isGuestView ? "true" : undefined },
                });
              }}
            />
          ))
        )}
      </View>
    </ScrollView>

    <Modal
      visible={showFilterModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <Pressable
        style={{ flex: 1 }}
        onPress={() => setShowFilterModal(false)}
      />
      <DueDateFilterModal
        selectedFilter={selectedDueDate}
        onSelectFilter={setSelectedDueDate}
        showAssignedToMe={showAssignedToMe}
        onToggleAssignedToMe={() => setShowAssignedToMe(!showAssignedToMe)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onClose={() => setShowFilterModal(false)}
      />
    </Modal>
  </>
  );
}
