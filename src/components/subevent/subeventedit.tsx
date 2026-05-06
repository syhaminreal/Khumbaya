import { DateTimeRangePicker } from "@/src/components/ui/DateTimeRangePicker";
import { Text } from "@/src/components/ui/Text";
import type { Event } from "@/src/constants/event";
import {
  useEventById,
  useUpdateEvent,
} from "@/src/features/events/hooks/use-event";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#ee2b8c";

type SubEventEditForm = {
  title: string;
  description: string;
  location: string;
  theme: string;
  budget: string;
  startDateTime: Date;
  endDateTime: Date;
};

const parseDate = (value?: string): Date => {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export default function SubEventEditScreen() {
  const router = useRouter();
  const { subEventId } = useLocalSearchParams<{
    subEventId: string;
  }>();

  const parsedId = Number(subEventId);
  const { data: subEvent, isLoading } = useEventById(parsedId);
  const { mutateAsync: updateEventMutate, isPending: isUpdating } =
    useUpdateEvent(parsedId);
  // const { mutateAsync: deleteEventMutate, isPending: isDeleting } =
  //   useDeleteEvent(parsedId);

  const { control, reset, handleSubmit, setValue } = useForm<SubEventEditForm>({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      theme: "",
      budget: "",
      startDateTime: new Date(),
      endDateTime: new Date(),
    },
  });

  const startDateTime = useWatch({ control, name: "startDateTime" });
  const endDateTime = useWatch({ control, name: "endDateTime" });

  useEffect(() => {
    if (!subEvent) return;

    reset({
      title: subEvent.title ?? "",
      description: subEvent.description ?? "",
      location: subEvent.location ?? "",
      theme: subEvent.theme ?? "",
      budget: subEvent.budget ? String(subEvent.budget) : "",
      startDateTime: parseDate(subEvent.startDateTime),
      endDateTime: parseDate(subEvent.endDateTime),
    });
  }, [subEvent, reset]);

  const handleSave = handleSubmit(async (values) => {
    if (!values.title.trim()) {
      Alert.alert("Error", "Please enter a sub-event name.");
      return;
    }

    const payload: Partial<Event> = {
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      location: values.location.trim() || undefined,
      theme: values.theme.trim() || undefined,
      budget: values.budget ? Number(values.budget) : undefined,
      startDateTime: values.startDateTime.toISOString(),
      endDateTime: values.endDateTime.toISOString(),
    };

    try {
      await updateEventMutate(payload);

      Alert.alert("Success", "Sub-event updated successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error updating sub-event:", error);
      Alert.alert("Error", "Unable to save changes. Please try again.");
    }
  });

  // const handleDelete = () => {
  //   Alert.alert(
  //     "Delete Sub-Event",
  //     "Are you sure you want to delete this sub-event? This action cannot be undone.",
  //     [
  //       { text: "Cancel", style: "cancel" },
  //       {
  //         text: "Delete",
  //         style: "destructive",
  //         onPress: async () => {
  //           try {
  //             await deleteEventMutate();
  //             Alert.alert("Success", "Sub-event deleted successfully.", [
  //               { text: "OK", onPress: () => router.back() },
  //             ]);
  //           } catch (error: any) {
  //             console.error("Error deleting sub-event:", error);
  //             const errorMessage =
  //               error?.response?.data?.message ||
  //               error?.message ||
  //               "Unable to delete. Please try again.";
  //             Alert.alert("Error", errorMessage);
  //           }
  //         },
  //       },
  //     ]
  //   );
  // };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text className="mt-3 text-gray-500">Loading sub-event...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6 py-4"
      >
        <Text variant="h2" className="text-2xl font-bold text-slate-900 mb-4">
          Edit Sub Event
        </Text>

        <View className="space-y-5">
          <View>
            <Text
              variant="caption"
              className="text-gray-500 uppercase tracking-widest mb-2"
            >
              Name
            </Text>
            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Sub-event title"
                  className="bg-white rounded-2xl px-4 py-4 border border-gray-200"
                />
              )}
            />
          </View>

          <View>
            <Text
              variant="caption"
              className="text-gray-500 uppercase tracking-widest mb-2"
            >
              Description
            </Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Describe the sub-event"
                  multiline
                  numberOfLines={4}
                  className="bg-white rounded-2xl px-4 py-4 border border-gray-200 text-base"
                />
              )}
            />
          </View>

          <View>
            <Text
              variant="caption"
              className="text-gray-500 uppercase tracking-widest mb-2"
            >
              Location
            </Text>
            <Controller
              control={control}
              name="location"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Venue or location"
                  className="bg-white rounded-2xl px-4 py-4 border border-gray-200"
                />
              )}
            />
          </View>

          <View>
            <Text
              variant="caption"
              className="text-gray-500 uppercase tracking-widest mb-2"
            >
              Theme
            </Text>
            <Controller
              control={control}
              name="theme"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Theme"
                  className="bg-white rounded-2xl px-4 py-4 border border-gray-200"
                />
              )}
            />
          </View>

          <View>
            <Text
              variant="caption"
              className="text-gray-500 uppercase tracking-widest mb-2"
            >
              Budget
            </Text>
            <Controller
              control={control}
              name="budget"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  placeholder="Budget amount"
                  className="bg-white rounded-2xl px-4 py-4 border border-gray-200"
                />
              )}
            />
          </View>

          <View>
            <DateTimeRangePicker
              value={{
                startDateTime: startDateTime ?? new Date(),
                endDateTime: endDateTime ?? new Date(),
              }}
              onChange={({ startDateTime, endDateTime }) => {
                setValue("startDateTime", startDateTime, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setValue("endDateTime", endDateTime, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              startLabel="Start Date & Time"
              endLabel="End Date & Time"
            />
          </View>
        </View>
      </ScrollView>

      <View className="px-6 py-4 border-t border-gray-200 bg-white">
        <TouchableOpacity
          className="bg-pink-500 py-4 rounded-xl items-center justify-center"
          onPress={handleSave}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text variant="h2" className="text-white">
              Save Changes
            </Text>
          )}
        </TouchableOpacity>

        {/* Delete button temporarily disabled until the delete flow is confirmed */}
        {/* <TouchableOpacity
          className="bg-red-500 py-4 rounded-xl items-center justify-center mt-3"
          onPress={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text variant="h2" className="text-white">
              Delete Sub-Event
            </Text>
          )}
        </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
}
