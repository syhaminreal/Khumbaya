import {
  EVENT_TYPES,
  EVENT_TYPE_TO_BACKEND,
  type EventType,
} from "@/src/constants/event";
import { CREATEEVENT } from "@/src/features/events/api/events.service";
import { useCreateEvent } from "@/src/features/events/hooks/use-event";
import { useImageUpload } from "@/src/hooks/useImageUpload";
import { formatDate, formatTime } from "@/src/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { uploadImageToCloudinary } from "../../../../utils/cloudinary";

import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

interface EventFormData {
  name: string;
  eventType: string;
  startdateTime: Date;
  endDateTime: Date;
}

export default function EventCreate() {
  const router = useRouter();
  const { mutate: createEvent, isPending: isCreatingEvent } = useCreateEvent();
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());
  const [selectedEndDateTime, setEndDateTime] = useState<Date>(new Date());
  const {
    imageUri: coverImage,
    pickImage,
    uploading,
    setUploading,
  } = useImageUpload();
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    eventType: "Wedding" as EventType,
    startdateTime: selectedDateTime, // June 16, 2024
    endDateTime: selectedEndDateTime,
  });

  const scale = useSharedValue(1);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");

  const onStartChange = (event: DateTimePickerEvent, pickedDate?: Date) => {
    if (event.type === "dismissed") {
      setShowStartPicker(false);
      setPickerMode("date");
      return;
    }

    if (!pickedDate) return;

    const next = new Date(selectedDateTime);
    if (pickerMode === "date") {
      next.setFullYear(
        pickedDate.getFullYear(),
        pickedDate.getMonth(),
        pickedDate.getDate()
      );
      setSelectedDateTime(next);
      setFormData((prev) => ({ ...prev, startdateTime: next }));

      if (Platform.OS === "android") {
        setShowStartPicker(false);
        setTimeout(() => {
          setPickerMode("time");
          setShowStartPicker(true);
        }, 0);
      } else {
        setPickerMode("time");
      }
    } else {
      next.setHours(
        pickedDate.getHours(),
        pickedDate.getMinutes(),
        pickedDate.getSeconds(),
        0
      );
      setSelectedDateTime(next);
      setFormData((prev) => ({ ...prev, startdateTime: next }));
      setShowStartPicker(false);
      setPickerMode("date");
    }
  };

  const onEndChange = (event: DateTimePickerEvent, pickedDate?: Date) => {
    if (event.type === "dismissed") {
      setShowEndPicker(false);
      setPickerMode("date");
      return;
    }

    if (!pickedDate) return;

    const next = new Date(selectedEndDateTime);
    if (pickerMode === "date") {
      next.setFullYear(
        pickedDate.getFullYear(),
        pickedDate.getMonth(),
        pickedDate.getDate()
      );
      setEndDateTime(next);
      setFormData((prev) => ({ ...prev, endDateTime: next }));

      if (Platform.OS === "android") {
        setShowEndPicker(false);
        setTimeout(() => {
          setPickerMode("time");
          setShowEndPicker(true);
        }, 0);
      } else {
        setPickerMode("time");
      }
    } else {
      next.setHours(
        pickedDate.getHours(),
        pickedDate.getMinutes(),
        pickedDate.getSeconds(),
        0
      );
      setEndDateTime(next);
      setFormData((prev) => ({ ...prev, endDateTime: next }));
      setShowEndPicker(false);
      setPickerMode("date");
    }
  };

  const handleSubmit = async () => {
    //validaton in the event creation in this
    if (!formData.name.trim()) {
      Alert.alert("Missing event name", "Please enter your event name.");
      return;
    }

    if (!formData.startdateTime) {
      Alert.alert("Missing event date", "Please select your event date.");
      return;
    }

    if (selectedEndDateTime <= selectedDateTime) {
      Alert.alert("Invalid schedule", "End time must be after start time.");
      return;
    }

    let imageUrl: string | undefined;

    if (coverImage) {
      try {
        setUploading(true);
        imageUrl = await uploadImageToCloudinary(coverImage);
      } catch (error) {
        Alert.alert(
          "Image upload failed",
          "Could not upload the selected image. Please try again."
        );
        return;
      } finally {
        setUploading(false);
      }
    }

    const payload: CREATEEVENT = {
      title: formData.name.trim(),
      description: `${formData.eventType} event`,
      type: EVENT_TYPE_TO_BACKEND[formData.eventType as EventType],
      rsvpDeadline: new Date(
        selectedDateTime.getTime() - 1 * 24 * 60 * 60 * 1000
      ).toISOString(), // 1 day before event start
      startDateTime: selectedDateTime,
      endDateTime: selectedEndDateTime,
      parentId: undefined,
      role: "Organizer",
      imageUrl,
    };

    createEvent(payload, {
      onSuccess: () => {
        router.push("/(protected)/(client-tabs)/events");
      },
      onError: () => {
        Alert.alert(
          "Event creation failed",
          "Please check your details and try again."
        );
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  const handleEventNameChange = (text: string) => {
    setFormData((prev) => ({ ...prev, name: text }));
  };

  const handleEventTypeSelect = (type: EventType) => {
    setFormData((prev) => ({ ...prev, eventType: type }));
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8f6f7]">
      <KeyboardAvoidingView
        className="flex-1 max-w-[480px] self-center w-full"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-2 pb-2 bg-[#f8f6f7]">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-black/5 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#181114" />
          </TouchableOpacity>
          <Text className="font-plusjakartasans-bold text-lg text-[#181114] flex-1 text-center">
            Create New Event
          </Text>
          <View className="w-10" />
        </View>
        <ScrollView
          className="flex-1 mb-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Cover Image Upload , make the image uploading in the application*/}
          <View className="px-4 pt-3">
            <TouchableOpacity
              onPress={pickImage}
              className="w-full aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-gray-200"
              activeOpacity={0.8}
            >
              {coverImage ? (
                <Image
                  source={{ uri: coverImage }}
                  className="w-full h-full absolute"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-[#f3f4f6]" />
              )}
              <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/20 items-center justify-center">
                <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mb-2">
                  <Ionicons name="camera" size={24} color="white" />
                </View>
                <Text className="font-plusjakartasans-medium text-base text-white">
                  {coverImage ? "Change Event Cover" : "Add Event Cover"}
                </Text>
                <Text className="font-plusjakartasans-regular text-xs text-white/70 mt-1">
                  High quality JPG or PNG
                </Text>
              </View>
            </TouchableOpacity>
            {uploading ? (
              <Text className="mt-2 text-sm text-[#6b7280]">
                Uploading image...
              </Text>
            ) : coverImage ? (
              <Text className="mt-2 text-sm text-[#6b7280]">
                Selected image will be uploaded to Cloudinary.
              </Text>
            ) : null}
          </View>

          {/* Event Name Input */}
          <View className="px-4 pt-3">
            <Text className="font-plusjakartasans-bold text-base text-[#181114] mb-3">
              Event Name
            </Text>
            <TextInput
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base font-plusjakartasans-regular text-[#181114]"
              placeholder="e.g., Aisha & Omar's Wedding"
              placeholderTextColor="#9CA3AF"
              value={formData.name}
              onChangeText={handleEventNameChange}
            />
          </View>

          {/* Event Type Selection */}
          <View className="px-4 pt-3">
            <Text className="font-plusjakartasans-bold text-base text-[#181114] mb-3">
              What type of event is it?
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {EVENT_TYPES.map((type) => {
                const isSelected = formData.eventType === type;
                const chipClassName = isSelected
                  ? "px-5 py-2.5 rounded-full bg-[#ee2b8c] border border-[#ee2b8c]"
                  : "px-5 py-2.5 rounded-full bg-white border border-gray-200";
                const textClassName = isSelected
                  ? "font-plusjakartasans-medium text-sm text-white"
                  : "font-plusjakartasans-medium text-sm text-gray-600";

                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => handleEventTypeSelect(type)}
                    className={chipClassName}
                  >
                    <Text className={textClassName}>{type}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View className="px-4 pt-6">
            <Text className="font-plusjakartasans-bold text-base text-[#181114] mb-3">
              Event Schedule
            </Text>

            <View className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
              <View className="flex-row items-center justify-between w-full mb-4">
                <View className="flex-row items-center gap-3">
                  <View className="w-3 h-3 rounded-full bg-[#ee2b8c]" />
                  <Text className="font-plusjakartasans-medium text-base text-zinc-700">
                    Start
                  </Text>
                </View>

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => {
                      setPickerMode("date");
                      setShowStartPicker(true);
                    }}
                    className="px-4 py-2 bg-zinc-100 rounded-full"
                  >
                    <Text className="font-plusjakartasans-medium text-sm text-zinc-700">
                      {formatDate(selectedDateTime.toISOString())}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setPickerMode("time");
                      setShowStartPicker(true);
                    }}
                    className="px-4 py-2 bg-zinc-100 rounded-full"
                  >
                    <Text className="font-plusjakartasans-medium text-sm text-zinc-700">
                      {formatTime(selectedDateTime.toISOString())}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="w-full h-[1px] bg-zinc-100 mb-4" />

              <View className="flex-row items-center justify-between w-full">
                <View className="flex-row items-center gap-3">
                  <View className="w-3 h-3 rounded-full border-2 border-[#ee2b8c] bg-white" />
                  <Text className="font-plusjakartasans-medium text-base text-zinc-700">
                    End
                  </Text>
                </View>

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => {
                      setPickerMode("date");
                      setShowEndPicker(true);
                    }}
                    className="px-4 py-2 bg-zinc-100 rounded-full"
                  >
                    <Text className="font-plusjakartasans-medium text-sm text-zinc-700">
                      {formatDate(selectedEndDateTime.toISOString())}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setPickerMode("time");
                      setShowEndPicker(true);
                    }}
                    className="px-4 py-2 bg-zinc-100 rounded-full"
                  >
                    <Text className="font-plusjakartasans-medium text-sm text-zinc-700">
                      {formatTime(selectedEndDateTime.toISOString())}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {showStartPicker && (
              <DateTimePicker
                value={selectedDateTime}
                mode={pickerMode}
                is24Hour={false}
                onChange={onStartChange}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={selectedEndDateTime}
                mode={pickerMode}
                is24Hour={false}
                onChange={onEndChange}
              />
            )}
          </View>

          {/* Bottom spacing for footer */}
          <View className="h-[100px]" />
        </ScrollView>

        {/* Sticky Footer */}
        <View className="absolute bottom-0 left-0 right-0 p-6 pb-8  max-w-[480px] self-center w-full">
          <TouchableOpacity
            onPress={handleSubmit}
            className="w-full bg-[#ee2b8c] flex-row items-center justify-center gap-2 py-4 rounded-2xl shadow-lg shadow-[#ee2b8c]/25"
            activeOpacity={0.8}
            disabled={isCreatingEvent}
            onPressIn={() => {
              scale.value = 0.98;
            }}
            onPressOut={() => {
              scale.value = 1;
            }}
          >
            <Text className="font-plusjakartasans-bold text-base text-white">
              {isCreatingEvent ? "Creating..." : "Create Event"}
            </Text>
            {/* <Ionicons name="arrow-forward" size={20} color="white" /> */}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
