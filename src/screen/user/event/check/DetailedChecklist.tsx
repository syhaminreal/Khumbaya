import { Text } from "@/src/components/ui/Text";
import { TODO_CATEGORY_OPTIONS, type TodoCategory } from "@/src/constants/todo";
import { useGetEventOwner } from "@/src/features/events/hooks/use-event";
import { useCreateTodo, useDeleteTodo, useUpdateTodo } from "@/src/features/todo/hooks/useTodo";
import { useTodoDraftStore } from "@/src/features/todo/store";
import { todoValidationSchema } from "@/src/features/todo/type";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView, TextInput, TouchableOpacity, View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

type TodoFormValues = {
  title: string;
  task: string;
  category: TodoCategory | "";
  dueDate: Date | null;
  assignedTo: number | null;
};

type ScreenMode = "view" | "edit" | "create";

const EMPTY_FORM: TodoFormValues = {
  title: "",
  task: "",
  category: "",
  dueDate: null,
  assignedTo: null,
};

export default function DetailedChecklist() {
  const router = useRouter();
  const { eventId, taskId, isGuestview, isGuest } = useLocalSearchParams<{
    eventId: string;
    taskId?: string;
    isGuestview?: string;
    isGuest?: string;
  }>();

  const draft = useTodoDraftStore((state) => state.todoDraft);
  const parsedTaskId = taskId ? Number(taskId) : null;

  // ── derive mode once, everything else flows from this ──────────────────
  const mode: ScreenMode =
    isGuestview === "true" || isGuest === "true" ? "view"
      : parsedTaskId ? "edit"
        : "create";

  const isReadOnly = mode === "view";

  // ── edit mode guard — throw early so the rest of the component can ──────
  // ── assume draft exists. this means a missing draft is a real bug, ──────
  // ── not a silent failure. ───────────────────────────────────────────────
  if (mode === "edit" && !draft) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <MaterialIcons name="error-outline" size={44} color="#ef4444" />
        <Text className="mt-4 text-lg font-jakarta-bold text-text-primary text-center">
          Missing task draft
        </Text>
        <Text className="mt-2 text-sm text-text-tertiary text-center">
          Navigate here from the task list so the draft is set.
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 px-6 py-3 bg-primary rounded-xl">
          <Text className="text-white font-jakarta-bold">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── defaultValues — draft is guaranteed to exist in edit/view mode here ─
  // ── RHF reads defaultValues once at mount, store is already set ─────────
  // ── by the time router.push fires, so no useEffect reset needed ──────────
  const defaultValues: TodoFormValues =
    draft
      ? {
        title: draft.title ?? "",
        task: draft.task ?? "",
        category: (draft.category as TodoCategory) ?? "",
        dueDate: draft.dueDate ? new Date(draft.dueDate) : null,
        assignedTo: draft.assignedTo ?? null,
      }
      : EMPTY_FORM;

  return (
    <DetailedChecklistForm
      mode={mode}
      isReadOnly={isReadOnly}
      defaultValues={defaultValues}
      parsedTaskId={parsedTaskId}
      eventId={eventId}
    />
  );
}

// ── Separate the form into its own component so useForm always ───────────
// ── receives stable, fully-resolved defaultValues on first render ─────────
function DetailedChecklistForm({
  mode,
  isReadOnly,
  defaultValues,
  parsedTaskId,
  eventId,
}: {
  mode: ScreenMode;
  isReadOnly: boolean;
  defaultValues: TodoFormValues;
  parsedTaskId: number | null;
  eventId: string;
}) {
  const router = useRouter();
  const { mutate: createTodo, isPending: isCreating } = useCreateTodo();
  const { mutate: updateTodo, isPending: isUpdating } = useUpdateTodo();
  const { mutate: deleteTodo, isPending: isDeleting } = useDeleteTodo();
  const { data: eventOwners } = useGetEventOwner(eventId);

  const { control, handleSubmit, setValue } = useForm<TodoFormValues>({ defaultValues });

  const dueDate = useWatch({ control, name: "dueDate" });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");

  const isBusy = isCreating || isUpdating || isDeleting;

  const handleSave = handleSubmit((data) => {
    if (!data.title.trim()) {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    const payload = {
      eventId: Number(eventId),
      title: data.title.trim(),
      task: data.task.trim(),
      category: data.category || undefined,
      dueDate: data.dueDate,
      assignedTo: data.assignedTo ?? null,
      isDone: false,
      status: "pending",
      assignedUser: null,
      parentId: null,
    };

    if (mode === "create") {
      const validation = todoValidationSchema.safeParse(payload);
      if (!validation.success) {
        const message = validation.error.issues
          .map((issue) => issue.message)
          .join("\n");
        Alert.alert("Validation error", message || "Please check your inputs and try again.");
        return;
      }
    }

    if (mode === "edit" && parsedTaskId) {
      updateTodo(
        { id: parsedTaskId, payload, eventId },
        {
          onSuccess: () => router.back(),
          onError: () => Alert.alert("Error", "Failed to update task"),
        }
      );
    } else {
      createTodo(payload, {
        onSuccess: () => router.back(),
        onError: () => Alert.alert("Error", "Failed to create task"),
      });
    }
  });

  const handleDelete = () => {
    if (!parsedTaskId) return;
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteTodo(
            { id: parsedTaskId, eventId },
            { onSuccess: () => router.back() }
          ),
      },
    ]);
  };

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
          <View className="mb-8">
            <Text className="text-3xl font-jakarta-bold text-text-primary">
              {mode === "create" ? "New Task" : "Task Details"}
            </Text>
            <Text className="text-text-tertiary mt-2">
              {mode === "create"
                ? "Create a new task for your event."
                : mode === "edit"
                  ? "Update your task details below."
                  : "Viewing task details."}
            </Text>
          </View>

          <View className="bg-white rounded-md p-6 shadow-sm border border-border gap-6 mb-8">
            <View className="gap-2">
              <Text className="text-sm font-jakarta-semibold text-text-secondary ml-1">Task Title</Text>
              <Controller
                control={control}
                name="title"
                rules={{ required: "Title is required" }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <>
                    <TextInput
                      className="w-full h-14 bg-surface-secondary px-4 rounded-md text-text-primary border border-border focus:border-primary"
                      placeholder="e.g., Book the caterer"
                      placeholderTextColor="#94a3b8"
                      value={value}
                      onChangeText={onChange}
                      editable={!isReadOnly}
                    />
                    {error && <Text className="text-xs text-red-500 ml-1">{error.message}</Text>}
                  </>
                )}
              />
            </View>

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
                    value={value ?? ""}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!isReadOnly}
                  />
                )}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-jakarta-semibold text-text-secondary ml-1">Category</Text>
              <Controller
                control={control}
                name="category"
                render={({ field: { onChange, value } }) => (
                  <Dropdown
                    style={{ height: 56, backgroundColor: "#f8fafc", borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: "#e2e8f0" }}
                    placeholderStyle={{ color: "#94a3b8", fontSize: 14 }}
                    selectedTextStyle={{ color: "#1e293b", fontSize: 14, fontWeight: "600" }}
                    data={TODO_CATEGORY_OPTIONS}
                    labelField="label"
                    valueField="value"
                    placeholder="Select category"
                    value={value || null}
                    onChange={(item: { value: TodoCategory }) => onChange(item.value)}
                    disable={isReadOnly}
                    renderLeftIcon={() => (
                      <MaterialIcons name="label-outline" size={20} color="#64748b" style={{ marginRight: 8 }} />
                    )}
                  />
                )}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-jakarta-semibold text-text-secondary ml-1">Assigned To</Text>
              <Controller
                control={control}
                name="assignedTo"
                render={({ field: { onChange, value } }) => (
                  <Dropdown
                    style={{ height: 56, backgroundColor: "#f8fafc", borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: "#e2e8f0" }}
                    placeholderStyle={{ color: "#94a3b8", fontSize: 14 }}
                    selectedTextStyle={{ color: "#1e293b", fontSize: 14, fontWeight: "600" }}
                    data={assigneeData}
                    labelField="label"
                    valueField="value"
                    placeholder="Select an assignee"
                    value={value}
                    onChange={(item: { value: number }) => onChange(item.value)}
                    disable={isReadOnly}
                    renderLeftIcon={() => (
                      <MaterialIcons name="person-outline" size={20} color="#64748b" style={{ marginRight: 8 }} />
                    )}
                  />
                )}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-jakarta-semibold text-text-secondary ml-1">Due Date & Time</Text>
              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() => { if (!isReadOnly) { setPickerMode("date"); setShowDatePicker(true); } }}
                  disabled={isReadOnly}
                  className={`flex-1 h-14 bg-surface-secondary px-4 rounded-md border border-border flex-row items-center ${isReadOnly ? "opacity-60" : ""}`}
                >
                  <MaterialIcons name="calendar-today" size={20} color="#64748b" />
                  <Text className="ml-3 text-text-primary font-jakarta-semibold">
                    {dueDate ? new Date(dueDate).toLocaleDateString() : "Set date"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => { if (!isReadOnly) { setPickerMode("time"); setShowDatePicker(true); } }}
                  disabled={isReadOnly}
                  className={`flex-1 h-14 bg-surface-secondary px-4 rounded-md border border-border flex-row items-center ${isReadOnly ? "opacity-60" : ""}`}
                >
                  <MaterialIcons name="access-time" size={20} color="#64748b" />
                  <Text className="ml-3 text-text-primary font-jakarta-semibold">
                    {dueDate
                      ? new Date(dueDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "Set time"}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={dueDate ? new Date(dueDate) : new Date()}
                  mode={pickerMode}
                  is24Hour={false}
                  onChange={(_event, date) => {
                    setShowDatePicker(false);
                    if (!date) return;
                    const base = dueDate ? new Date(dueDate) : new Date();
                    if (pickerMode === "date") {
                      base.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                    } else {
                      base.setHours(date.getHours(), date.getMinutes());
                    }
                    setValue("dueDate", base, { shouldDirty: true });
                  }}
                  minimumDate={new Date()}
                />
              )}
            </View>
          </View>

          {/* Actions — hidden in view mode */}
          {!isReadOnly && (
            <View className="gap-4">
              <TouchableOpacity
                onPress={handleSave}
                disabled={isBusy}
                className="h-14 bg-primary rounded-xl flex-row items-center justify-center shadow-lg shadow-primary/25"
                activeOpacity={0.8}
              >
                {isCreating || isUpdating
                  ? <ActivityIndicator color="white" />
                  : (
                    <>
                      <MaterialIcons name="check" size={20} color="white" style={{ marginRight: 8 }} />
                      <Text className="text-white font-jakarta-bold text-base">
                        {mode === "edit" ? "Update Task" : "Create Task"}
                      </Text>
                    </>
                  )}
              </TouchableOpacity>

              {mode === "edit" && (
                <TouchableOpacity
                  onPress={handleDelete}
                  disabled={isBusy}
                  className="h-14 border border-red-100 bg-red-50 rounded-xl flex-row items-center justify-center"
                  activeOpacity={0.8}
                >
                  {isDeleting
                    ? <ActivityIndicator color="#ef4444" />
                    : (
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
