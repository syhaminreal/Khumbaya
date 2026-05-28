import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VehicleSummaryCard } from "../../components/logistics/VehicleSummaryCard";
import { useAssignVehicle, useGetVehicleAssignement, useGuestTransportation } from "../../features/logistics/hooks/use-transport";
import { AssignVehileInputType, LogisticsTimelineItem, SelectTransportation } from "../../features/logistics/type";
import { cn } from "../../utils/cn";
import { formatDate, formatTime } from "../../utils/helper";

type AssignTransportFormValues = {
  fromLocation: string;
  toLocation: string;
  fromTime: Date;
  toTime: Date;
};

type AssignmentType = "arrival" | "departure" | null;
type EditableEndpoint = "from" | "to" | null;

export default function ManageVehicleScreen() {
  const router = useRouter();
  const { eventId, vehicleId, isGuest } = useLocalSearchParams<{
    eventId?: string
    vehicleId?: string
    isGuest?: string
  }>();
  const isGuestView = isGuest === "true";

  const [activeTab, setActiveTab] = React.useState<"timeline" | "assign">("assign");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);
  const [assignmentType, setAssignmentType] = React.useState<AssignmentType>(null);
  const [selectedGuestId, setSelectedGuestId] = React.useState<number | null>(null);
  const [selectedGuestData, setSelectedGuestData] = React.useState<SelectTransportation | null>(null);
  const [editableEndpoint, setEditableEndpoint] = React.useState<EditableEndpoint>(null);
  const [showTimePicker, setShowTimePicker] = React.useState(false);
  const [pickerMode, setPickerMode] = React.useState<"date" | "time">("date");
  const [pickerTarget, setPickerTarget] = React.useState<"fromTime" | "toTime" | null>(null);

  const { data: guests, isLoading: guestsLoading } = useGuestTransportation(eventId ?? "");
  const { data: assignedVehicles, isLoading: assignedLoading } = useGetVehicleAssignement(vehicleId ?? "");
  console.log('This is the assigned vehicle d🦓🦓🦓🦓🦓🦓🦓🦓ata ', assignedVehicles);
  const assignVehicleMutation = useAssignVehicle(eventId ?? "");

  const {
    handleSubmit,
    watch,
    reset,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors, dirtyFields },
  } = useForm<AssignTransportFormValues>({
    defaultValues: {
      fromLocation: "",
      toLocation: "",
      fromTime: new Date(),
      toTime: new Date(),
    },
    mode: "onTouched",
  });

  const fromLocation = watch("fromLocation");
  const toLocation = watch("toLocation");
  const fromTime = watch("fromTime");
  const toTime = watch("toTime");

  const timelineAssignments = React.useMemo<LogisticsTimelineItem[]>(() => {
    return assignedVehicles || [];
  }, [assignedVehicles]);

  if (isGuestView) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6" edges={["top", "bottom"]}>
        <MaterialIcons name="construction" size={44} color="#ee2b8c" />
        <Text className="mt-4 text-lg font-jakarta-bold text-gray-900">Coming soon</Text>
        <Text className="mt-2 text-sm text-gray-500 text-center">
          Guest access to logistics details is on the way.
        </Text>
      </SafeAreaView>
    );
  }

  const getAssignmentStatus = (assignment: LogisticsTimelineItem) => {
    const now = new Date();
    const start = assignment.pickupTime;
    const end = assignment.dropoffTime;

    if (start && now < start) return "Upcoming";
    if (start && end && now >= start && now <= end) return "On Route";
    if (end && now > end) return "Completed";
    return "Scheduled";
  };

  const getStatusStyles = (status: string) => {
    if (status === "Completed") return { badge: "bg-surface-container-high", text: "text-on-surface-variant/70" };
    if (status === "On Route") return { badge: "bg-primary/10", text: "text-primary" };
    return { badge: "bg-zinc-100", text: "text-zinc-700" };
  };

  const formatGuestMoment = (value?: string | null) => {
    if (!value) return "Time not set";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Time not set";

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(parsed);
  };

  const getGuestLocation = (
    primary?: string | null,
    unavailableLabel: string = "Not set"
  ) => {
    return primary || unavailableLabel;
  };

  const filteredGuests = React.useMemo(() => {
    if (!guests) return [];
    return guests.filter(guest =>
      guest.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.user.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (getGuestLocation(guest.arrivalLocation).toLowerCase().includes(searchQuery.toLowerCase())) ||
      (getGuestLocation(guest.departureLocation).toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [guests, searchQuery]);

  const tabs: { label: string; value: "timeline" | "assign" }[] = [
    { label: "Assign Guest", value: "assign" },
    { label: "Timeline", value: "timeline" },
  ];

  const resetAssignForm = () => {
    setSelectedGuestId(null);
    setSelectedGuestData(null);
    setAssignmentType(null);
    setEditableEndpoint(null);
    setPickerTarget(null);
    reset({
      fromLocation: "",
      toLocation: "",
      fromTime: new Date(),
      toTime: new Date(),
    });
    setShowTimePicker(false);
    setPickerMode("date");
  };

  const parseOptionalGuestDate = (value?: string | null) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const openAssignModal = (guest: SelectTransportation, type: AssignmentType) => {
    if (!type) return;

    setSelectedGuestData(guest);
    setSelectedGuestId(guest.id);
    setAssignmentType(type);
    setEditableEndpoint("to");
    setPickerTarget("toTime");

    const arrivalTime = parseOptionalGuestDate(guest.arrivalDatetime) ?? new Date();
    const departureTime = parseOptionalGuestDate(guest.departureDatetime) ?? new Date();

    if (type === "arrival") {
      reset({
        fromLocation: "",
        toLocation: "",
        fromTime: arrivalTime,
        toTime: new Date(arrivalTime.getTime() + 60 * 60 * 1000),
      });
    } else {
      reset({
        fromLocation: "",
        toLocation: "",
        fromTime: departureTime,
        toTime: new Date(departureTime.getTime() + 60 * 60 * 1000),
      });
    }

    clearErrors();
    setIsAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setIsAssignModalOpen(false);
    resetAssignForm();
  };

  const openTimePicker = (target: "fromTime" | "toTime") => {
    setPickerTarget(target);
    setPickerMode("date");
    setShowTimePicker(true);
  };

  const onTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "dismissed") {
      setShowTimePicker(false);
      setPickerMode("date");
      return;
    }

    if (!pickerTarget || !date) return;

    const currentValue = getValues(pickerTarget) ?? new Date();
    const updated = new Date(currentValue);

    if (pickerMode === "date") {
      updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setValue(pickerTarget, updated, { shouldDirty: true, shouldValidate: true });

      if (Platform.OS === "android") {
        setShowTimePicker(false);
        setTimeout(() => {
          setPickerMode("time");
          setShowTimePicker(true);
        }, 0);
      } else {
        setPickerMode("time");
      }
    } else {
      updated.setHours(date.getHours(), date.getMinutes());
      setValue(pickerTarget, updated, { shouldDirty: true, shouldValidate: true });
      setShowTimePicker(false);
      setPickerMode("date");
    }
  };

  const assignVehicle = handleSubmit(async (values) => {
    const vehicleIdNumber = Number(vehicleId);

    if (!selectedGuestId || !assignmentType || !selectedGuestData) {
      Alert.alert("Missing data", "Please select a guest and assignment type.");
      return;
    }

    if (!vehicleId || Number.isNaN(vehicleIdNumber)) {
      Alert.alert("Missing vehicle", "Vehicle id is missing from route params.");
      return;
    }

    const requiredLocationField = "toLocation";
    const requiredTimeField = "toTime";

    if (!values[requiredLocationField].trim()) {
      setError(requiredLocationField, {
        type: "validate",
        message: "This location is required.",
      });
      return;
    }

    if (values.toTime <= values.fromTime) {
      setError(requiredTimeField, {
        type: "validate",
        message: "Drop-off time must be after pickup time.",
      });
      return;
    }

    clearErrors([requiredLocationField, requiredTimeField]);

    try {
      const payload: AssignVehileInputType = {
        vehicleId: vehicleIdNumber,
        invitationId: selectedGuestId,
        isArrival: assignmentType === "arrival",
        isDeparture: assignmentType === "departure",
        fromTime: values.fromTime,
        toTime: values.toTime,
        fromLocation: values.fromLocation.trim() || autoFromLocation.trim(),
        toLocation: values.toLocation.trim(),
      };

      await assignVehicleMutation.mutateAsync(payload);

      Alert.alert("Assigned", `${assignmentType === "arrival" ? "Arrival" : "Departure"} assigned successfully.`);
      closeAssignModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to assign vehicle.";
      Alert.alert("Assignment failed", message);
    }
  });

  const isArrivalAssignment = assignmentType === "arrival";
  const isDepartureAssignment = assignmentType === "departure";
  const editableLocationField = "toLocation";
  const editableTimeField = "toTime";
  const autoFromLocation = isArrivalAssignment
    ? (selectedGuestData?.arrivalLocation ?? selectedGuestData?.arrivalInfo ?? "")
    : "";
  const autoFromTime = isArrivalAssignment
    ? (parseOptionalGuestDate(selectedGuestData?.arrivalDatetime) ?? null)
    : null;
  const autoToLocation = isDepartureAssignment
    ? (selectedGuestData?.departureLocation ?? selectedGuestData?.departureInfo ?? "")
    : "";
  const autoToTime = isDepartureAssignment
    ? (parseOptionalGuestDate(selectedGuestData?.departureDatetime) ?? null)
    : null;
  const editableLocationLabel = "To";
  const autoLocationLabel = "From";
  const editableTimeLabel = "To Time";
  const autoTimeLabel = "From Time";
  const fromSuggestionTime = autoFromTime
    ? `${formatDate(autoFromTime.toISOString())} • ${formatTime(autoFromTime.toISOString())}`
    : "Not set";
  const toSuggestionTime = autoToTime
    ? `${formatDate(autoToTime.toISOString())} • ${formatTime(autoToTime.toISOString())}`
    : "Not set";
  const fromTimeValue = `${formatDate((fromTime as Date).toISOString())} • ${formatTime((fromTime as Date).toISOString())}`;
  const toTimeValue = `${formatDate((toTime as Date).toISOString())} • ${formatTime((toTime as Date).toISOString())}`;
  const fromTimeDisplay = dirtyFields.fromTime ? fromTimeValue : "Select time";
  const toTimeDisplay = dirtyFields.toTime ? toTimeValue : "Select time";
  const fromPlaceholder = isArrivalAssignment
    ? "Pickup location (arrival)"
    : "Pickup location (departure)";
  const toPlaceholder = isArrivalAssignment
    ? "Where should the guest be brought to?"
    : "Where should we drop the guest off?";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="px-4 py-2 border-b border-gray-100 bg-white z-50">
        <View className="flex-row items-center justify-between h-14 w-full">
          {/* Left: Back Button */}
          <Pressable
            onPress={() => router.back()}
            className="p-2 -ml-2 rounded-full active:bg-gray-50"
          >
            <MaterialIcons name="arrow-back" size={24} color="#ee2b8c" />
          </Pressable>

          {/* Center: Title (Absolute) */}
          <View className="absolute left-0 right-0 items-center justify-center pointer-events-none -z-10">
            <Text className="text-lg font-jakarta-bold text-gray-900 text-center">
              Vehicle Logistics
            </Text>
          </View>

          {/* Right: Spacer for symmetry */}
          <View className="w-10" />
        </View>
      </View>

      {/* Custom Tab Selector */}
      <View className="bg-surface-container-high/60 rounded-2xl p-1 h-11 mx-5 mt-4 flex-row items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <Pressable
              key={tab.value}
              onPress={() => setActiveTab(tab.value)}
              className={cn(
                "flex-1 items-center justify-center h-full rounded-xl",
                isActive ? "bg-primary" : "bg-transparent"
              )}
            >
              <Text
                className={cn(
                  "text-[10px] font-jakarta-bold uppercase tracking-wider",
                  isActive ? "text-white" : "text-on-surface-variant"
                )}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40, paddingHorizontal: 20 }}
      >
        {activeTab === "timeline" ? (
          <>
            {/* Vehicle Summary Section */}
            <VehicleSummaryCard summary={{
              id: "1",
              vehicle_name: assignedVehicles && assignedVehicles.length > 0 ? assignedVehicles[0].vehicleName : "Vehicle Name",
              type: "Bus",
              status: "Active - On Route",
              loadFactor: 0.75,
              tripsCompleted: 3,
              totalTrips: 5,
              date: new Date().toISOString(),
            }} />

            {/* Timeline Header */}
            <View className="flex-row items-center justify-between mb-5 px-1">
              <Text className="text-xs font-jakarta-bold text-gray-400 uppercase tracking-[2px]">
                Today's Schedule
              </Text>
              <View className="bg-gray-100 px-2.5 py-1 rounded-lg">
                <Text className="text-[10px] font-jakarta-bold text-gray-500">
                  {timelineAssignments.length} TASKS
                </Text>
              </View>
            </View>

            {/* Timeline List */}
            {assignedLoading ? (
              <View className="flex-1 items-center justify-center py-20">
                <ActivityIndicator size="large" color="#ee2b8c" />
              </View>
            ) : timelineAssignments.length > 0 ? (
              timelineAssignments.map((assignment, index) => {
                const status = getAssignmentStatus(assignment);
                const statusStyles = getStatusStyles(status);

                const pickupTimeStr = assignment.pickupTime ? formatTime(assignment.pickupTime.toISOString()) : "Time not set";
                const dropoffTimeStr = assignment.dropoffTime ? formatTime(assignment.dropoffTime.toISOString()) : "Time not set";

                return (
                  <View
                    key={String(assignment.id ?? `${index}-${assignment.pickupTime?.getTime()}`)}
                    className="bg-white rounded-2xl border border-gray-100 p-4 mb-3.5"
                  >
                    <View className="flex-row justify-between items-center mb-3">
                      <View className="flex-1 pr-3">
                        <Text className="text-[13px] font-jakarta-bold text-on-surface" numberOfLines={1}>
                          Guest:{assignment.guestName}

                        </Text>
                        <View className="flex-row items-center gap-1 mt-0.5">
                          <Text className="text-[10px] text-gray-500 font-jakarta-medium" numberOfLines={1}>
                            {assignment.driverNumber
                              ?? "Phone not set"}
                          </Text>
                          <Text className="text-[10px] text-gray-300">•</Text>
                          <Text className="text-[10px] text-primary/70 font-jakarta-bold">

                            {assignment.driverName ? `Driver: ${assignment.driverName}` : "Driver not assigned"}

                          </Text>
                        </View>
                      </View>

                      <View className={cn("px-2.5 py-1 rounded-full", "bg-surface-container-high")}>
                        <Text className={cn("text-[9px] uppercase font-jakarta-bold tracking-wider", "text-on-surface-variant/70")}>
                          Completed
                        </Text>
                      </View>
                    </View>

                    <Text className="text-[11px] text-primary font-jakarta-semibold mb-3">{assignment.pickupTime ? formatDate(assignment.pickupTime.toISOString()) : "Date not set"}</Text>

                    <View className="bg-surface-container/50 rounded-xl p-3">
                      <View className="flex-row items-start gap-3 mb-2">
                        <View className="items-center mt-1">
                          <View className="w-2 h-2 rounded-full bg-primary z-10" />
                          <View className="w-[1px] h-8 bg-outline-variant absolute top-2" />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center justify-between gap-2">
                            <Text className="text-[12px] font-jakarta-semibold text-on-surface flex-1">
                              {assignment.pickupLocation}
                            </Text>
                            <Text className="text-[11px] font-jakarta-semibold text-gray-500 shrink-0">
                              {pickupTimeStr}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View className="flex-row items-start gap-3">
                        <View className="items-center mt-1">
                          <View className="w-2 h-2 rounded-full border-2 border-primary bg-white z-10" />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center justify-between gap-2">
                            <Text className="text-[12px] font-jakarta-semibold text-on-surface flex-1">
                              {assignment.dropoffLocation}
                            </Text>
                            <Text className="text-[11px] font-jakarta-semibold text-gray-500 shrink-0">
                              {dropoffTimeStr}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <View className="items-center justify-center py-20">
                <MaterialIcons name="directions-car" size={36} color="#9ca3af" />
                <Text className="text-gray-400 font-jakarta-medium text-sm mt-2">No assigned trips yet for this vehicle.</Text>
              </View>
            )}
          </>
        ) : guestsLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#ee2b8c" />
          </View>
        ) : guests && guests.length > 0 ? (
          <View className="flex-1 py-4">
            {/* Search and Filter */}
            <View className="flex-row items-center gap-3 mb-6">
              <View className="flex-1 flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-12">
                <Ionicons name="search" size={20} color="#9ca3af" />
                <TextInput
                  placeholder="Search guests or locations..."
                  className="flex-1 ml-2 font-jakarta-medium text-sm text-gray-900"
                  placeholderTextColor="#9ca3af"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery !== "" && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={18} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity className="w-12 h-12 bg-white border border-gray-100 rounded-2xl items-center justify-center shadow-sm">
                <Ionicons name="options-outline" size={20} color="#ee2b8c" />
              </TouchableOpacity>
            </View>

            {searchQuery && <View className="flex-row items-center justify-between mb-5 px-1">
              <Text className="text-xs font-jakarta-bold text-gray-400 uppercase tracking-[2px]">
                Search Results
              </Text>
              <View className="bg-gray-100 px-2.5 py-1 rounded-lg">
                <Text className="text-[10px] font-jakarta-bold text-gray-500">
                  {filteredGuests.length} GUESTS
                </Text>
              </View>
            </View>
            }

            {filteredGuests.length > 0 ? (
              filteredGuests.map((guest) => (
                <View
                  key={guest.id}
                  className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm"
                >
                  <View className="flex-row items-start justify-between mb-3 gap-3">
                    <View className="flex-row items-start flex-1">
                      <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                        <Text className="text-primary font-jakarta-bold">
                          {guest.user.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-jakarta-bold text-gray-900">
                          {guest.user.name}
                        </Text>
                        <View className="flex-row items-center mt-0.5 gap-1.5 flex-wrap">
                          <Ionicons name="call-outline" size={12} color="#6b7280" />
                          <Text className="text-[10px] text-gray-500 font-jakarta">
                            {guest.user.phone || "No phone"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row gap-2 mb-3">
                    {guest.arrivalInfo === "assigned" ? (
                      <View className="flex-1 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 items-center justify-center">
                        <Text className="text-gray-500 text-[10px] font-jakarta-bold uppercase text-center">
                          Arrival Assigned
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        className="flex-1 bg-primary/5 px-3 py-2 rounded-lg border border-primary/10"
                        onPress={() => openAssignModal(guest, "arrival")}
                      >
                        <Text className="text-primary text-[10px] font-jakarta-bold uppercase text-center">
                          Assign Arrival
                        </Text>
                      </TouchableOpacity>
                    )}

                    {guest.departureInfo === "assigned" ? (
                      <View className="flex-1 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 items-center justify-center">
                        <Text className="text-gray-500 text-[10px] font-jakarta-bold uppercase text-center">
                          Departure Assigned
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        className="flex-1 bg-primary/5 px-3 py-2 rounded-lg border border-primary/10"
                        onPress={() => openAssignModal(guest, "departure")}
                      >
                        <Text className="text-primary text-[10px] font-jakarta-bold uppercase text-center">
                          Assign Departure
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View className="border-t border-gray-50 pt-3 gap-3">
                    <View className="flex-row items-center gap-3">
                      <View className="flex-1 flex-row items-center gap-2 min-w-0">
                        <Ionicons name="location-outline" size={14} color="#6b7280" style={{ marginTop: 1 }} />
                        <View className="flex-1 min-w-0">
                          <Text className="text-[9px] font-jakarta-bold text-gray-400 uppercase">
                            {guest.isArrivalPickupRequired ? "Pickup Needed" : "Self Arrival"}
                          </Text>
                          <Text className="text-[11px] font-jakarta-semibold text-gray-700" numberOfLines={1}>
                            {getGuestLocation(guest.arrivalLocation, guest.isArrivalPickupRequired ? "Pickup Needed" : "Self Arrival")}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-[11px] font-jakarta-semibold text-gray-500 shrink-0">
                        {formatGuestMoment(guest.arrivalDatetime)}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-3">
                      <View className="flex-1 flex-row items-center gap-2 min-w-0">
                        <Ionicons name="flag-outline" size={14} color="#6b7280" style={{ marginTop: 1 }} />
                        <View className="flex-1 min-w-0">
                          <Text className="text-[9px] font-jakarta-bold text-gray-400 uppercase">
                            {guest.isDeparturePickupRequired ? "Departure Needed" : "Self Departure"}
                          </Text>
                          <Text className="text-[11px] font-jakarta-semibold text-gray-700" numberOfLines={1}>
                            {getGuestLocation(guest.departureLocation, guest.isDeparturePickupRequired ? "Drop-off Needed" : "Self Departure")}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-[11px] font-jakarta-semibold text-gray-500 shrink-0">
                        {formatGuestMoment(guest.departureDatetime)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className="items-center justify-center py-20">
                <Ionicons name="search-outline" size={40} color="#9ca3af" />
                <Text className="text-gray-400 font-jakarta-medium text-sm mt-2">No guests match your search.</Text>
              </View>
            )}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
              <MaterialIcons name="person-add" size={32} color="#ee2b8c" />
            </View>
            <Text className="text-base font-jakarta-bold text-gray-900 mb-2">No Guest Assignments</Text>
            <Text className="text-sm text-gray-400 text-center font-jakarta-medium px-10">
              There are no guests requiring transportation services for this event currently.
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={isAssignModalOpen}
        onRequestClose={closeAssignModal}
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-5">
          <View className="w-full bg-white rounded-2xl p-6 border border-gray-100">
            {/* Header */}
            <View className="flex-row items-start justify-between mb-5 gap-3">
              <View className="flex-1">
                <Text className="text-base font-jakarta-bold text-gray-900">
                  {isArrivalAssignment ? "Assign Arrival" : "Assign Departure"}
                </Text>
                <Text className="text-[11px] text-gray-500 mt-1">
                  {selectedGuestData?.user.name}
                </Text>
                <Text className="text-[10px] text-gray-400 mt-1 leading-4">
                  Guest invitation data stays on the auto-filled side. You only edit the vehicle route side here.
                </Text>
              </View>
              <TouchableOpacity
                onPress={closeAssignModal}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View className="gap-5 mb-6">
              <View className="gap-3">
                <Text className="text-[9px] font-jakarta-bold text-gray-400 uppercase">
                  {autoLocationLabel}
                </Text>
                <View className="border border-gray-200 rounded-md overflow-hidden bg-white">
                  <TextInput
                    placeholder={fromPlaceholder}
                    className="px-4 py-3 font-jakarta-medium text-sm text-gray-900"
                    placeholderTextColor="#9ca3af"
                    value={fromLocation}
                    onChangeText={(text) => setValue("fromLocation", text, { shouldDirty: true, shouldValidate: true })}
                  />
                </View>
                {autoFromLocation ? (
                  <Text className="text-[11px] text-gray-400 font-jakarta-medium italic mt-1">
                    {`Suggestion: ${autoFromLocation}`}
                  </Text>
                ) : null}
                <View className="mt-2 gap-2">
                  <Text className="text-[10px] font-jakarta-bold text-gray-500 uppercase">
                    {autoTimeLabel}
                  </Text>
                  <TouchableOpacity
                    onPress={() => openTimePicker("fromTime")}
                    className="bg-white border border-gray-100 rounded-md px-4 py-3 flex-row items-center justify-between"
                  >
                    <View>
                      <Text className="text-sm font-jakarta-semibold text-gray-900">
                        {fromTimeDisplay}
                      </Text>

                    </View>
                    <Ionicons name="time-outline" size={18} color="#ee2b8c" />
                  </TouchableOpacity>
                  {autoFromTime ? (
                    <Text className="text-xs text-gray-400 font-jakarta-medium italic">
                      {`Suggestion: ${fromSuggestionTime}`}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View className="gap-3">
                <Text className="text-[9px] font-jakarta-bold text-gray-400 uppercase">
                  {editableLocationLabel}
                </Text>
                <View className="border border-gray-200 rounded-md overflow-hidden bg-white">
                  <TextInput
                    placeholder={toPlaceholder}
                    className="px-4 py-3 font-jakarta-medium text-sm text-gray-900"
                    placeholderTextColor="#9ca3af"
                    value={toLocation}
                    onChangeText={(text) => setValue(editableLocationField, text, { shouldDirty: true, shouldValidate: true })}
                  />
                </View>
                {isDepartureAssignment && autoToLocation ? (
                  <Text className="text-[11px] text-gray-400 font-jakarta-medium italic mt-1">
                    {`Suggestion: ${autoToLocation}`}
                  </Text>
                ) : null}
                {errors[editableLocationField] && (
                  <Text className="text-[10px] text-red-500 font-jakarta-medium">
                    {errors[editableLocationField]?.message}
                  </Text>
                )}
              </View>

              <View className="gap-3">
                <Text className="text-[9px] font-jakarta-bold text-gray-400 uppercase">
                  {editableTimeLabel}
                </Text>
                <TouchableOpacity
                  onPress={() => openTimePicker(editableTimeField)}
                  className="bg-white border border-gray-100 rounded-md px-4 py-3 flex-row items-center justify-between"
                >
                  <View>
                    <Text className="text-sm font-jakarta-semibold text-gray-900">
                      {toTimeDisplay}
                    </Text>
                    <Text className="text-xs text-gray-500 font-jakarta-medium mt-0.5">
                      Tap to adjust time
                    </Text>
                  </View>
                  <Ionicons name="time-outline" size={18} color="#ee2b8c" />
                </TouchableOpacity>
                {isDepartureAssignment && autoToTime ? (
                  <Text className="text-xs text-gray-400 font-jakarta-medium italic">
                    {`Suggestion: ${toSuggestionTime}`}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              onPress={assignVehicle}
              disabled={assignVehicleMutation.isPending}
              className={cn("px-4 py-3 rounded-xl items-center",
                assignVehicleMutation.isPending ? "bg-primary/50" : "bg-primary"
              )}
            >
              {assignVehicleMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-jakarta-bold">
                  {isArrivalAssignment ? "Assign Arrival" : "Assign Departure"}
                </Text>
              )}
            </TouchableOpacity>

            {showTimePicker && pickerTarget ? (
              <DateTimePicker
                value={getValues(pickerTarget) ?? new Date()}
                mode={pickerMode}
                display="default"
                onChange={onTimeChange}
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
