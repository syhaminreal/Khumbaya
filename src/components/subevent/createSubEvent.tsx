import { DateTimeRangePicker } from "@/src/components/ui/DateTimeRangePicker";
import { Text } from "@/src/components/ui/Text";
import type { SubEvent } from "@/src/constants/event";
import {
  useCreateEvent,
  useSubEventsOfEvent,
} from "@/src/features/events/hooks/use-event";
import { sortByDateTime } from "@/src/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckSquare, Square } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const PRIMARY = "#ee2b8c";

type SubEventFormValues = {
  title: string;
  startDateTime: Date;
  endDateTime: Date;
};

export default function CreateSubEventScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { mutateAsync: createEvent } = useCreateEvent();
  const [loading, setLoading] = useState(false);
  const { data: subEventsResponse, isLoading } = useSubEventsOfEvent(
    Number(eventId)
  );

  const [showImport, setShowImport] = useState(false);
  const [selectedSubEvent, setSelectedSubEvent] = useState<SubEvent | null>(
    null
  );

  const parentId = Number(eventId);

  const { control, handleSubmit, setValue, watch } = useForm<SubEventFormValues>(
    {
      defaultValues: {
        title: "",
        startDateTime: new Date(),
        endDateTime: new Date(),
      },
    }
  );

  const startDateTime = watch("startDateTime");
  const endDateTime = watch("endDateTime");

  const subEvents = (subEventsResponse ?? []) as SubEvent[];
  const sortedSubEvents = useMemo(
    () => sortByDateTime(subEvents, (item) => item.startDateTime),
    [subEvents]
  );

  const handleSave = async (values: SubEventFormValues) => {
    if (!parentId || isNaN(parentId)) {
      Alert.alert("Error", "Invalid event. Please go back and try again.");
      return;
    }

    if (!values.title.trim()) {
      Alert.alert("Error", "Please enter a sub-event name");
      return;
    }

    if (showImport && !selectedSubEvent) {
      Alert.alert("Error", "Please select a sub-event first.");
      return;
    }

    setLoading(true);

    try {
      await createEvent({
        title: values.title.trim(),
        startDateTime: values.startDateTime,
        endDateTime: values.endDateTime,
        parentId,
        description: selectedSubEvent?.description ?? "",
        type: selectedSubEvent?.type ?? "Other",
        role: selectedSubEvent?.role ?? "Organizer",
        imageUrl: selectedSubEvent?.imageUrl ?? "",
        location: selectedSubEvent?.location ?? "",
        venue: selectedSubEvent?.venue ?? "",
        theme: selectedSubEvent?.theme,
        budget: selectedSubEvent?.budget,
      });

      Alert.alert("Success", "Sub-event created successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error creating sub-event:", error);
      Alert.alert("Error", "Failed to create sub-event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6">
        <View className="items-center mt-3">
          <View className="h-1 w-12 bg-pink-500/30 rounded-full" />
        </View>

       
        {/* Name + Date/Time (always shown) */}
        <View className="mt-6">
          <Text
            variant="caption"
            className="text-gray-500 uppercase tracking-widest mb-2"
          >
            Sub-event Name
          </Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="e.g. Champagne Toast"
                className="bg-white rounded-xl px-4 py-4 text-base border border-gray-200"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>

        <View className="mt-6">
          <DateTimeRangePicker
            value={{ startDateTime, endDateTime }}
            onChange={({ startDateTime, endDateTime }) => {
              setValue("startDateTime", startDateTime, {
                shouldDirty: true,
              });
              setValue("endDateTime", endDateTime, { shouldDirty: true });
            }}
            startLabel="Start"
            endLabel="End"
          />
        </View>
 {/* Import toggle */}
        <View className="mt-8">
          <Pressable
            onPress={() => setShowImport((prev) => !prev)}
            className={`flex-row items-center gap-3 p-3 bg-slate-50 rounded-md border-2 ${
              showImport ? "border-pink-200" : "border-transparent"
            }`}
          >
            {showImport ? (
              <CheckSquare size={20} color={PRIMARY} />
            ) : (
              <Square size={20} color="#cbd5e1" />
            )}
            <Text variant="h2" className="text-sm text-slate-900">
              Import from existing sub-event
            </Text>
          </Pressable>
        </View>

        {showImport && (
          <View className="mt-6">
            <Text
              variant="caption"
              className="text-gray-500 uppercase tracking-widest mb-2"
            >
              Select Sub-event
            </Text>

            <View className="h-14 rounded-xl border border-gray-200 bg-white px-4 justify-center">
              <Dropdown
                style={{ height: 40 }}
                data={sortedSubEvents.map((item) => ({
                  label: item.title ?? "Untitled",
                  value: String(item.id),
                }))}
                labelField="label"
                valueField="value"
                placeholder={isLoading ? "Loading..." : "Choose sub-event"}
                value={
                  selectedSubEvent?.id ? String(selectedSubEvent.id) : null
                }
                onChange={(item) => {
                  const selected = sortedSubEvents.find(
                    (sub) => String(sub.id) === item.value
                  );
                  if (!selected) return;
                  setSelectedSubEvent(selected);
                  setValue("title", selected.title ?? "", {
                    shouldDirty: true,
                  });
                  setValue(
                    "startDateTime",
                    selected.startDateTime
                      ? new Date(selected.startDateTime)
                      : new Date(),
                    { shouldDirty: true }
                  );
                  setValue(
                    "endDateTime",
                    selected.endDateTime
                      ? new Date(selected.endDateTime)
                      : new Date(),
                    { shouldDirty: true }
                  );
                }}
                selectedTextStyle={{
                  color: "#111827",
                  fontSize: 15,
                  fontWeight: "600",
                }}
                placeholderStyle={{ color: "#9CA3AF", fontSize: 15 }}
                itemTextStyle={{ color: "#181114", fontSize: 15 }}
                activeColor="#fdf2f8"
                disable={isLoading}
              />
            </View>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Footer */}
      <View className="px-6 py-4 border-t border-gray-200 bg-white">
        <TouchableOpacity
          className="bg-pink-500 py-4 rounded-xl flex-row items-center justify-center"
          onPress={handleSubmit(handleSave)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text variant="h2" className="text-white mr-2">
                Save Sub-Event
              </Text>
              <Ionicons name="checkmark-circle" size={22} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
