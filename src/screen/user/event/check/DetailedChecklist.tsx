import { Text } from "@/src/components/ui/Text";
import { TODO_CATEGORY_OPTIONS, type TodoCategory } from "@/src/constants/todo";
import { useGetEventOwner } from "@/src/features/events/hooks/use-event";
import { useCreateTodo, useDeleteTodo, useTodoById, useUpdateTodo } from "@/src/features/todo/hooks/useTodo";
import { useTodoDraftStore } from "@/src/features/todo/store";
import { formatDate } from "@/src/utils/helper";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

type TodoFormValues = {
  title: string;
  task: string;
  category: TodoCategory | "";
  dueDate: Date | null;
  assignedTo: number | null;
};

export default function DetailedChecklist() {
  const router = useRouter();
  const { eventId, taskId, isGuestview, isGuest } = useLocalSearchParams<{ eventId: string; taskId?: string; isGuestview?: string; isGuest?: string }>();
  const todoTaskDetailed = useTodoDraftStore((state) => state.todoDraft);
  const hasDraft = Boolean(todoTaskDetailed);
  const parsedEventId = Number(eventId);
  const parsedTaskId = taskId ? Number(taskId) : null;
  const isEditMode = !!parsedTaskId;
  const isGuestView = isGuestview === "true" || isGuest === "true";

  // Hooks
  const { data: todoData, isLoading: isLoadingTodo } = useTodoById(parsedTaskId);
  const { mutate: createTodo, isPending: isCreating } = useCreateTodo();
  const { mutate: updateTodo, isPending: isUpdating } = useUpdateTodo();
  const { mutate: deleteTodo, isPending: isDeleting } = useDeleteTodo();
  const { data: eventOwners } = useGetEventOwner(parsedEventId);



  const { control, handleSubmit, setValue, reset } = useForm<TodoFormValues>({
    defaultValues: todoTaskDetailed as any,
  });

  const dueDate = useWatch({ control, name: "dueDate" });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");

  useEffect(() => {
    if (todoTaskDetailed) {
      reset(todoTaskDetailed as any);
    }
  }, [todoTaskDetailed, reset]);

  // Sync data in edit mode
  useEffect(() => {
    if (isEditMode && todoData) {
      reset(todoData as any);
    }
  }, [isEditMode, todoData, reset]);

  const handleSave = handleSubmit((values) => {
    if (isGuestView) return;
    if (!values.title.trim()) {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    const payload = {
      eventId: parsedEventId,
      title: values.title.trim(),
      task: values.task?.trim() ?? "",
      category: values.category || null,
      dueDate: values.dueDate ? values.dueDate.toISOString() : null,
      assignedTo: values.assignedTo ?? 0,
      isDone: false,
      status: "pending",
      assignedUser: null,
      parentId: null,
    };

    if (isEditMode && parsedTaskId) {
      updateTodo(
        { id: parsedTaskId, payload, eventId: parsedEventId },
        {
          onSuccess: () => {
            router.back();
          },
          onError: () => {
            Alert.alert("Error", "Failed to update task");
          },
        }
      );
    } else {
      createTodo(payload, {
        onSuccess: () => {
          router.back();
        },
        onError: () => {
          Alert.alert("Error", "Failed to create task");
        },
      });
    }
  });

  const handleDelete = () => {
    if (isGuestView) return;
    if (!parsedTaskId) return;

    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteTodo(
            { id: parsedTaskId, eventId: parsedEventId },
            {
              onSuccess: () => {
                router.back();
              },
            }
          );
        },
      },
    ]);
  };

  if (isEditMode && isLoadingTodo && !hasDraft) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#ee2b8c" />
      </View>
    );
  }

  if (isGuestView) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <MaterialIcons name="construction" size={44} color="#ee2b8c" />
        <Text className="mt-4 text-lg font-jakarta-bold text-text-primary">Coming soon</Text>
        <Text className="mt-2 text-sm text-text-tertiary text-center">
          Guest access to checklist details is on the way.
        </Text>
      </View>
    );
  }

  const assigneeData = (eventOwners || []).map((owner) => ({
    label: owner.user.username,
    value: owner.user.id,
  }));

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
      <View className="flex-1 bg-surface">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pt-8 pb-32"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="mb-8">
            <Text className="text-3xl font-jakarta-bold text-text-primary">
              {isEditMode ? "Task Details" : "New Task"}
            </Text>
            <Text className="text-text-tertiary mt-2">
              {isEditMode ? "View and manage your task details." : "Create a new task for your event."}
            </Text>
          </View>

          {/* Form Card */}
          <View className="bg-white rounded-md p-6 shadow-sm border border-border gap-6 mb-8">
            {/* Title Input */}
            <View className="gap-2">
              <Text className="text-sm font-jakarta-semibold text-text-secondary ml-1">Task Title</Text>
              <Controller
                control={control}
                name="title"
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="w-full h-14 bg-surface-secondary px-4 rounded-md text-text-primary border border-border focus:border-primary"
                    placeholder="e.g., Book the caterer"
                    placeholderTextColor="#94a3b8"
                    value={value}
                    onChangeText={onChange}
                    editable={!isGuestView}
                  />
                )}
              />
            </View>

            {/* Description/Task Details */}
            <View className="gap-2">
              <Text className="text-sm font-jakarta-semibold text-text-secondary ml-1">Description</Text>
              <Controller
                control={control}
                name="task"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="w-full bg-surface-secondary px-4 py-3 rounded-md text-text-primary border border-border focus:border-primary"
                    placeholder="Add more details about this task..."
                    placeholderTextColor="#94a3b8"
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!isGuestView}
                  />
                )}
              />
            </View>

            {/* Category Dropdown */}
            <View className="gap-2">
              <Text className="text-sm font-jakarta-semibold text-text-secondary ml-1">Category</Text>
              <Controller
                control={control}
                name="category"
                render={({ field: { onChange, value } }) => (
                  <Dropdown
                    style={{
                      height: 56,
                      backgroundColor: "#f8fafc",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      borderWidth: 1,
                      borderColor: "#e2e8f0",
                    }}
                    placeholderStyle={{ color: "#94a3b8", fontSize: 14 }}
                    selectedTextStyle={{ color: "#1e293b", fontSize: 14, fontWeight: "600" }}
                    data={TODO_CATEGORY_OPTIONS}
                    labelField="label"
                    valueField="value"
                    placeholder="Select category"
                    value={value || null}
                    onChange={(item: { value: TodoCategory }) => onChange(item.value)}
                    disable={isGuestView}
                    renderLeftIcon={() => (
                      <MaterialIcons name="label-outline" size={20} color="#64748b" style={{ marginRight: 8 }} />
                    )}
                  />
                )}
              />
            </View>

            {/* Assignee Dropdown */}
            <View className="gap-2">
              <Text className="text-sm font-jakarta-semibold text-text-secondary ml-1">Assigned To</Text>
              <Controller
                control={control}
                name="assignedTo"
                render={({ field: { onChange, value } }) => (
                  <Dropdown
                    style={{
                      height: 56,
                      backgroundColor: "#f8fafc",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      borderWidth: 1,
                      borderColor: "#e2e8f0",
                    }}
                    placeholderStyle={{ color: "#94a3b8", fontSize: 14 }}
                    selectedTextStyle={{ color: "#1e293b", fontSize: 14, fontWeight: "600" }}
                    data={assigneeData}
                    labelField="label"
                    valueField="value"
                    placeholder="Select an assignee"
                    value={value}
                    onChange={(item: { value: number }) => onChange(item.value)}
                    disable={isGuestView}
                    renderLeftIcon={() => (
                      <MaterialIcons name="person-outline" size={20} color="#64748b" style={{ marginRight: 8 }} />
                    )}
                  />
                )}
              />
            </View>

            {/* Due Date & Time Picker */}
            <View className="gap-2">
              <Text className="text-sm font-jakarta-semibold text-text-secondary ml-1">Due Date & Time</Text>
              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() => {
                    if (isGuestView) return;
                    setPickerMode("date");
                    setShowDatePicker(true);
                  }}
                  className={`flex-1 h-14 bg-surface-secondary px-4 rounded-md border border-border flex-row items-center justify-between ${isGuestView ? "opacity-60" : ""}`}
                  disabled={isGuestView}
                >
                  <View className="flex-row items-center">
                    <MaterialIcons name="calendar-today" size={20} color="#64748b" />
                    <Text className="ml-3 text-text-primary font-jakarta-semibold">
                        {/* Fix the due date format in the ui  */}
                      {dueDate ? formatDate(dueDate?.toISOString()) : "Set date"}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    if (isGuestView) return;
                    setPickerMode("time");
                    setShowDatePicker(true);
                  }}
                  className={`flex-1 h-14 bg-surface-secondary px-4 rounded-md border border-border flex-row items-center justify-between ${isGuestView ? "opacity-60" : ""}`}
                  disabled={isGuestView}
                >
                  <View className="flex-row items-center">
                    <MaterialIcons name="access-time" size={20} color="#64748b" />
                    <Text className="ml-3 text-text-primary font-jakarta-semibold">
                      {dueDate
                        ? formatDate(dueDate?.toString())
                        : "Set time"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={dueDate || new Date()}
                  mode={pickerMode}
                  is24Hour={false}
                  onChange={(_event, date) => {
                    setShowDatePicker(false);
                    if (date) {
                      if (pickerMode === "date") {
                        const newDate = new Date(dueDate || new Date());
                        newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                        setValue("dueDate", newDate, { shouldDirty: true });
                      } else {
                        const newDate = new Date(dueDate || new Date());
                        newDate.setHours(date.getHours(), date.getMinutes());
                        setValue("dueDate", newDate, { shouldDirty: true });
                      }
                    }
                  }}
                  minimumDate={new Date()}
                />
              )}
            </View>
          </View>

          {!isGuestView && (
            <View className="gap-4">
              <TouchableOpacity
                onPress={handleSave}
                disabled={isCreating || isUpdating || isDeleting}
                className="h-14 bg-primary rounded-xl flex-row items-center justify-center shadow-lg shadow-primary/25"
                activeOpacity={0.8}
              >
                {isCreating || isUpdating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <MaterialIcons name="check" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text className="text-white font-jakarta-bold text-base">
                      {isEditMode ? "Update Task" : "Create Task"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {isEditMode && (
                <TouchableOpacity
                  onPress={handleDelete}
                  disabled={isCreating || isUpdating || isDeleting}
                  className="h-14 border border-red-100 bg-red-50 rounded-xl flex-row items-center justify-center"
                  activeOpacity={0.8}
                >
                  {isDeleting ? (
                    <ActivityIndicator color="#ef4444" />
                  ) : (
                    <>
                      <MaterialIcons name="delete-outline" size={20} color="#ef4444" style={{ marginRight: 8 }} />
                      <Text className="text-red-500 font-jakarta-bold text-base">Delete Task</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}