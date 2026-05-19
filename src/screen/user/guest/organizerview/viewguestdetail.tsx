import { Text } from "@/src/components/ui/Text";
import {
  BottomActionMenu,
  ThreeDotButton,
} from "@/src/components/event/guest/threedot";
import { useSubmitRsvpResponse } from "@/src/features/events/hooks/use-event";
import { useSubEventListStore } from "@/src/features/events/store/useEventStore";
import {
  useCreateEventGuestCategory,
  useGetEventGuestCategories,
  useRemoveInvitation,
} from "@/src/features/guests/api/use-guests";
import { useGuestDetailStore } from "@/src/features/guests/store/useGuestDetailStore";
import { useAuthStore } from "@/src/store/AuthStore";
import { formatDate, formatTime, toISODateString } from "@/src/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

type CategoryPriority = 1 | 2 | 3;

const PRIORITY_OPTIONS: Array<{ label: string; value: CategoryPriority }> = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
];

const formatDisplayValue = (value?: string) => {
  if (!value) return "-";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getProfileText = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
};

//TODO: Delete this


export default function ViewGuestDetail() {
  const router = useRouter();
  const guestDetail = useGuestDetailStore((state) => state.guestDraft);
  const currentUserId = useAuthStore((state) => state.user?.id ?? null);

  const statusValue = guestDetail?.eventGuest?.status?.toLowerCase?.() ?? "";
  const isConfirmed = statusValue === "accepted" || statusValue === "confirmed";

  const eventId = Number(guestDetail?.eventGuest?.eventId ?? 0);
  const { mutate: submitRsvpResponse, isPending } =
    useSubmitRsvpResponse(eventId);
  const removeInvitationMutation = useRemoveInvitation();
  const createCategoryMutation = useCreateEventGuestCategory();
  const {
    data: guestCategories = [],
    isLoading: isGuestCategoriesLoading,
  } = useGetEventGuestCategories(eventId || null);

  const initialRoom = guestDetail?.eventGuest?.assignedRoom ?? "";
  const initialArrivalInfo =
    guestDetail?.eventGuest?.arrivalInfo ??
    "";
  const initialDepartureInfo = guestDetail?.eventGuest?.departureInfo ?? "";
  const initialCategory = guestDetail?.eventGuest?.category ?? "";
  const initialNotes = guestDetail?.eventGuest?.notes ?? "";

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [newCategoryPriority, setNewCategoryPriority] =
    useState<CategoryPriority>(1);
  const [assignedRoom, setAssignedRoom] = useState(initialRoom);
  const [arrivalInfo, setArrivalInfo] = useState(initialArrivalInfo);
  const [departureInfo, setDepartureInfo] = useState(initialDepartureInfo);
  const [category, setCategory] = useState(initialCategory);
  const [notes] = useState(initialNotes);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  // TODO: Review this is genearated code 
  const { subEventList } = useSubEventListStore();
  const unInvitedSubevents = guestDetail?.eventGuest?.unInvitedSubevent ?? [];
  const subEvents = subEventList ?? [];
  const [unInvitedSubeventIds, setUnInvitedSubeventIds] = useState<number[]>(
    unInvitedSubevents
  );
  const [unInvitedUpdatedBy, setUnInvitedUpdatedBy] = useState<number | null>(
    currentUserId
  );

  useEffect(() => {
    setUnInvitedSubeventIds(unInvitedSubevents);
  }, [unInvitedSubevents]);

  const isSubEventInvited = (subEventId: string | number) =>
    !unInvitedSubeventIds.includes(Number(subEventId));

  const toggleSubEventInvite = (subEventId: string | number) => {
    const id = Number(subEventId);
    setUnInvitedSubeventIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setUnInvitedUpdatedBy(currentUserId);
  };

  console.log('This is the Guest invitation responce on the user interface 🦄🦄🦄🦄🦄🦄🦄🦄🦄🦄', guestDetail?.eventGuest, subEventList);

  const categoryOptions = useMemo(
    () =>
      guestCategories.map((item) => ({
        label: item.label,
        value: item.value,
      })),
    [guestCategories]
  );
  // TODO:Reviwe
  const hasAssignmentChanges = useMemo(() => {
    const initialUnInvited = [...unInvitedSubevents].sort((a, b) => a - b);
    const currentUnInvited = [...unInvitedSubeventIds].sort((a, b) => a - b);
    const unInvitedChanged =
      initialUnInvited.length !== currentUnInvited.length ||
      initialUnInvited.some((id, index) => id !== currentUnInvited[index]);

    return (
      assignedRoom.trim() !== initialRoom.trim() ||
      arrivalInfo.trim() !== initialArrivalInfo.trim() ||
      departureInfo.trim() !== initialDepartureInfo.trim() ||
      category.trim().toLowerCase() !== initialCategory.trim().toLowerCase() ||
      notes.trim() !== initialNotes.trim() ||
      unInvitedChanged
    );
  }, [
    assignedRoom,
    arrivalInfo,
    departureInfo,
    category,
    notes,
    initialRoom,
    initialArrivalInfo,
    initialDepartureInfo,
    initialCategory,
    initialNotes,
    unInvitedSubeventIds,
    unInvitedSubevents,
  ]);

  const headerTitle = guestDetail?.user?.username?.trim() || "Guest Detail";
  const isSaveDisabled = isPending || !hasAssignmentChanges;
  const guestUser = guestDetail?.user;
  const guestInfo =
    guestUser?.info && typeof guestUser.info === "object"
      ? (guestUser.info as Record<string, unknown>)
      : {};
  const guestProfile =
    (guestUser as any)?.profile && typeof (guestUser as any).profile === "object"
      ? ((guestUser as any).profile as Record<string, unknown>)
      : guestInfo.profile && typeof guestInfo.profile === "object"
        ? (guestInfo.profile as Record<string, unknown>)
        : {};
  const guestDob =
    guestUser?.dob ??
    guestProfile.dob ??
    guestProfile.dateOfBirth ??
    guestInfo.dob ??
    guestInfo.dateOfBirth;
  const formattedGuestDob =
    guestDob instanceof Date || typeof guestDob === "string"
      ? formatDate(toISODateString(guestDob))
      : "";
  const guestLocation = getProfileText(
    guestUser?.location,
    guestProfile.location,
    guestInfo.location,
    guestUser?.address,
    [guestUser?.city, guestUser?.country].filter(Boolean).join(", ")
  );
  const guestProfileRows = [
    {
      label: "Gender",
      icon: "person-outline" as const,
      value: getProfileText(
        (guestUser as any)?.gender,
        guestProfile.gender,
        guestInfo.gender
      ),
    },
    {
      label: "DOB",
      icon: "calendar-outline" as const,
      value: formattedGuestDob === "—" ? "" : formattedGuestDob,
    },
    {
      label: "Email",
      icon: "mail-outline" as const,
      value: getProfileText(guestUser?.email),
    },
    {
      label: "Location",
      icon: "location-outline" as const,
      value: guestLocation,
    },
    {
      label: "Food Preference",
      icon: "restaurant-outline" as const,
      value: getProfileText(
        guestUser?.foodPreference,
        (guestUser as any)?.foodPreferences,
        guestProfile.foodPreference,
        guestProfile.foodPreferences,
        guestInfo.foodPreference,
        guestInfo.foodPreferences
      ),
    },
  ].filter((row) => row.value);

  const handleSaveAssignments = () => {
    if (
      !guestDetail?.eventGuest ||
      !guestDetail?.user?.id ||
      !eventId
    ) {
      return;
    }

    const payload = {
      userId: guestDetail.user.id,
      familyId: guestDetail.eventGuest.familyId,
      isAccomodation: guestDetail.eventGuest.isAccomodation ?? undefined,
      isArrivalPickupRequired:
        guestDetail.eventGuest.isArrivalPickupRequired ?? undefined,
      isDeparturePickupRequired:
        guestDetail.eventGuest.isDeparturePickupRequired ?? undefined,
      assignedRoom: assignedRoom.trim() || null,
      arrivalInfo: arrivalInfo.trim() || null,
      departureInfo: departureInfo.trim() || null,
      notes: notes.trim(),
      category: category.trim() || undefined,
      role: category.trim() || undefined,
      unInvitedSubevent: unInvitedSubeventIds,
    };

    submitRsvpResponse(payload, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  const handleDeleteGuest = () => {
    setActionMenuVisible(false);

    if (!guestDetail?.user?.id || !eventId) {
      Alert.alert("Error", "Missing event or guest id.");
      return;
    }

    const displayName =
      guestDetail.user.username?.trim() ||
      guestDetail.user.email ||
      "this guest";

    Alert.alert(
      "Remove guest",
      `Remove ${displayName}'s invitation from this event?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeInvitationMutation.mutateAsync({
                eventId,
                guestId: guestDetail.user.id,
              });
              router.back();
            } catch (error: any) {
              const message =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to remove guest. Please try again.";
              Alert.alert("Error", message);
            }
          },
        },
      ]
    );
  };

  const handleCreateCategory = async () => {
    if (!eventId) {
      Alert.alert("Error", "Invalid event id");
      return;
    }

    const trimmedTitle = newCategoryTitle.trim();
    if (!trimmedTitle) {
      Alert.alert("Error", "Please enter category type.");
      return;
    }

    try {
      await createCategoryMutation.mutateAsync({
        eventId,
        payload: {
          category_title: trimmedTitle,
          priority: newCategoryPriority,
        },
      });
      setCategory(trimmedTitle);
      setNewCategoryTitle("");
      setNewCategoryPriority(1);
      setIsAddingCategory(false);
      setCategoryModalVisible(false);
      Alert.alert("Success", "Guest category created. Tap Save to apply changes.");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create guest category.";
      Alert.alert("Error", message);
    }
  };


  return (
    <>
      <Stack.Screen
        options={{
          title: headerTitle,
          headerRight: () =>
            <Pressable
              onPress={handleSaveAssignments}
              disabled={isSaveDisabled}
              style={{
                opacity: isSaveDisabled ? 0.5 : 1,
                paddingVertical: 4,

              }}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#EE2B8C" />
              ) : (
                <View className="bg-primary/90 rounded-md p-2 px-6">
                  <Text className="text-white font-bold text-sm">Save</Text>
                </View>
              )}
            </Pressable>,
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
      >
        <SafeAreaView className="flex-1 bg-white" edges={[]}>

          <Modal
            transparent
            animationType="fade"
            visible={categoryModalVisible}
            onRequestClose={() => {
              setCategoryModalVisible(false);
              setIsAddingCategory(false);
            }}
          >
            <View className="flex-1 bg-black/35 items-center justify-center px-6">
              <View className="w-full rounded-2xl bg-white p-5" style={{ gap: 14 }}>
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-bold text-[#1a1b3a]">
                    Select Category
                  </Text>
                  <Pressable
                    onPress={() => setIsAddingCategory((prev) => !prev)}
                    className="flex-row items-center rounded-full border border-primary/20 px-2.5 py-1"
                    style={{ gap: 4 }}
                  >
                    <Ionicons
                      name={isAddingCategory ? "remove-circle-outline" : "add-circle-outline"}
                      size={14}
                      color="#ee2b8c"
                    />
                    <Text className="text-xs font-semibold text-primary">
                      {isAddingCategory ? "Hide Add" : "Add Category"}
                    </Text>
                  </Pressable>
                </View>

                {isGuestCategoriesLoading ? (
                  <View className="py-6 items-center justify-center">
                    <ActivityIndicator color="#ee2b8c" />
                  </View>
                ) : categoryOptions.length ? (
                  <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                    {categoryOptions.map((option) => {
                      const isActive =
                        category?.toLowerCase() === option.value.toLowerCase();

                      return (
                        <Pressable
                          key={option.value}
                          className={`rounded-full px-3 py-1.5 border ${isActive
                            ? "border-primary bg-primary/10"
                            : "border-slate-200 bg-white"
                            }`}
                          onPress={() => {
                            setCategory(option.value);
                            setCategoryModalVisible(false);
                            setIsAddingCategory(false);
                          }}
                        >
                          <Text
                            className={`text-xs font-semibold ${isActive ? "text-primary" : "text-slate-700"
                              }`}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <Text className="text-xs text-slate-500">
                    No category found for this event. Use “Add Category”.
                  </Text>
                )}

                {isAddingCategory && (
                  <View className="border-t border-slate-200 pt-3" style={{ gap: 10 }}>
                    <View style={{ gap: 8 }}>
                      <Text className="text-xs font-semibold tracking-wide text-[#1a1b3a]">
                        CATEGORY TYPE
                      </Text>
                      <TextInput
                        className="h-12 w-full rounded-md border border-slate-200 bg-white px-3 text-base text-slate-900"
                        placeholder="e.g. friend"
                        placeholderTextColor="#94a3b8"
                        value={newCategoryTitle}
                        onChangeText={setNewCategoryTitle}
                      />
                    </View>

                    <View style={{ gap: 8 }}>
                      <Text className="text-xs font-semibold tracking-wide text-[#1a1b3a]">
                        PRIORITY (1-3)
                      </Text>
                      <View className="flex-row" style={{ gap: 8 }}>
                        {PRIORITY_OPTIONS.map((option) => {
                          const isActive = newCategoryPriority === option.value;
                          return (
                            <Pressable
                              key={option.value}
                              className={`flex-1 items-center justify-center rounded-md border py-2.5 ${isActive
                                ? "border-primary bg-primary/10"
                                : "border-slate-200 bg-white"
                                }`}
                              onPress={() => setNewCategoryPriority(option.value)}
                            >
                              <Text
                                className={`font-semibold ${isActive ? "text-primary" : "text-slate-700"
                                  }`}
                              >
                                {option.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    <Pressable
                      className="items-center justify-center rounded-md bg-[#ee2b8c] py-3"
                      onPress={handleCreateCategory}
                      disabled={createCategoryMutation.isPending}
                    >
                      <Text className="font-semibold text-white">
                        {createCategoryMutation.isPending ? "Saving..." : "Save New Category"}
                      </Text>
                    </Pressable>
                  </View>
                )}

                <Pressable
                  className="items-center justify-center rounded-md border border-slate-200 py-2.5"
                  onPress={() => {
                    setCategoryModalVisible(false);
                    setIsAddingCategory(false);
                  }}
                >
                  <Text className="font-semibold text-slate-600">Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <KeyboardAwareScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingBottom: 35,
              flexGrow: 1,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            extraScrollHeight={240}
            scrollEnabled={true}
          >
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <LinearGradient
                colors={["rgba(238,43,140,0.07)", "transparent"]}
                className="items-center px-6 pt-8 pb-8"
              >
                {!isConfirmed ? (
                  <View
                    className="absolute right-4 top-4 p-2 rounded-full bg-white"
                    style={{
                      shadowColor: "#000",
                      shadowOpacity: 0.12,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <ThreeDotButton onPress={() => setActionMenuVisible(true)} />
                  </View>
                ) : null}

                <View className="relative">
                  <View
                    className="w-32 h-32 rounded-full bg-primary border-4 border-white items-center justify-center"
                    style={{
                      shadowColor: "#000",
                      shadowOpacity: 0.15,
                      shadowRadius: 12,
                      elevation: 4,
                    }}
                  >
                    <Text variant="h1" className="text-white text-4xl">
                      {guestDetail?.user.username
                        ? guestDetail.user.username
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                        : "US"}
                    </Text>
                  </View>
                  <View className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white bg-emerald-500" />
                </View>

                <Text
                  variant="h1"
                  className="text-slate-900 text-2xl mt-4 text-center"
                >
                  {guestDetail?.user.username || "User Name"}
                </Text>
                <Text variant="h2" className="text-primary text-sm mt-1">
                  {isConfirmed ? "Confirmed" : "Pending"} •{" "}
                  {category || guestDetail?.eventGuest.category || "Guest"}
                </Text>
                <View className="flex-row items-center mt-2" style={{ gap: 6 }}>
                  <Ionicons name="call-outline" size={14} color="#64748b" />
                  <Text variant="caption" className="text-slate-500 text-sm">
                    {guestDetail?.user?.phone?.trim() || "Phone not available"}
                  </Text>
                </View>
              </LinearGradient>

              <View className="flex-row gap-3 px-6 pb-6 border-b border-primary/5">
                <TouchableOpacity
                  className="flex-1 bg-primary py-2.5 rounded-xl flex-row items-center justify-center gap-2"
                  activeOpacity={0.8}
                  style={{
                    shadowColor: "#EE2B8C",
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 4,
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={16} color="#fff" />
                  <Text variant="h2" className="text-white text-sm">
                    Message
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-primary/10 py-2.5 rounded-xl flex-row items-center justify-center gap-2"
                  activeOpacity={0.8}
                >
                  <Ionicons name="call-outline" size={16} color="#EE2B8C" />
                  <Text variant="h2" className="text-primary text-sm">
                    Call
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="px-6 pt-6 pb-10 gap-8">
                <View>
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center gap-2">
                      <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                        <Ionicons
                          name="id-card-outline"
                          size={18}
                          color="#EE2B8C"
                        />
                      </View>
                      <View>
                        <Text
                          variant="caption"
                          className="text-xs font-bold uppercase tracking-widest text-slate-400"
                        >
                          Guest Details
                        </Text>
                        <Text className="mt-0.5 text-sm font-semibold text-slate-900">
                          Profile information
                        </Text>
                      </View>
                    </View>

                    <View className="rounded-full bg-slate-100 px-3 py-1">
                      <Text className="text-[11px] font-semibold text-slate-500">
                        {guestProfileRows.length} field
                        {guestProfileRows.length === 1 ? "" : "s"}
                      </Text>
                    </View>
                  </View>

                  <View className="rounded-2xl border border-slate-100 bg-white p-3">
                    {guestProfileRows.length ? (
                      <View className="gap-2">
                        {guestProfileRows.map((row) => (
                          <View
                            key={row.label}
                            className="flex-row items-center rounded-xl bg-slate-50 px-3 py-3"
                            style={{ gap: 12 }}
                          >
                            <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
                              <Ionicons
                                name={row.icon}
                                size={17}
                                color="#EE2B8C"
                              />
                            </View>
                            <View className="flex-1">
                              <Text className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                {row.label}
                              </Text>
                              <Text
                                numberOfLines={2}
                                className="mt-0.5 text-sm font-semibold text-slate-900"
                              >
                                {row.value}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View className="items-center rounded-xl bg-slate-50 px-4 py-6">
                        <View className="mb-3 h-11 w-11 items-center justify-center rounded-full bg-white">
                          <Ionicons
                            name="information-circle-outline"
                            size={22}
                            color="#94a3b8"
                          />
                        </View>
                        <Text className="text-sm font-semibold text-slate-700">
                          No profile details yet
                        </Text>
                        <Text className="mt-1 text-center text-xs text-slate-500">
                          Details will appear here after the guest completes their profile.
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {isConfirmed && (
                  <View>
                  <View className="flex-row items-center gap-2 mb-4">
                    <Ionicons
                      name="person-circle-outline"
                      size={20}
                      color="#EE2B8C"
                    />
                    <Text
                      variant="caption"
                      className="text-xs font-bold uppercase tracking-widest"
                    >
                      Guest Requirements
                    </Text>
                  </View>
                  <View className="bg-slate-50 rounded-2xl px-4">
                    {[
                      {
                        label: "Category",
                        value:
                          category ||
                          guestDetail?.eventGuest?.category ||
                          "Uncategorized",
                        pill: true,
                      },
                      {
                        label: "Arrival Time",
                        value: guestDetail?.eventGuest?.arrivalDatetime
                          ? formatTime(
                            toISODateString(guestDetail?.eventGuest?.arrivalDatetime) ??
                            undefined
                          )
                          : "",
                        pill: false,
                      },
                      {
                        label: "Arrival Date",
                        value: formatDate(
                          toISODateString(guestDetail?.eventGuest?.arrivalDatetime) ?? undefined
                        ),
                        pill: false,
                      },
                      {
                        label: "Arrival Location",
                        value:
                          guestDetail?.eventGuest?.arrivalLocation ||
                          guestDetail?.eventGuest?.arrivalInfo ||
                          "",
                        pill: false,
                      },
                      {
                        label: "Departure Time",
                        value: guestDetail?.eventGuest?.departureDatetime
                          ? formatTime(
                            toISODateString(guestDetail?.eventGuest?.departureDatetime) ??
                            undefined
                          )
                          : "",
                        pill: false,
                      },
                      {
                        label: "Departure Date",
                        value: formatDate(
                          toISODateString(guestDetail?.eventGuest?.departureDatetime) ??
                          undefined
                        ),
                        pill: false,
                      },
                      {
                        label: "Departure Location",
                        value:
                          guestDetail?.eventGuest?.departureLocation ||
                          guestDetail?.eventGuest?.departureInfo ||
                          "",
                        pill: false,
                      },
                      {
                        label: "Accommodation",
                        value: `${guestDetail?.eventGuest.isAccomodation ? "Room Needed" : "Room not needed"}`,
                        pill: true,
                      },
                      {
                        label: "Arrival Pickup",
                        value: `${guestDetail?.eventGuest.isArrivalPickupRequired ? "Required" : "Not Required"}`,
                        pill: true,
                      },
                      {
                        label: "Departure Pickup",
                        value: `${guestDetail?.eventGuest.isDeparturePickupRequired ? "Required" : "Not Required"}`,
                        pill: true,
                      },

                    ].map((row, i, arr) => (
                      <View
                        key={i}
                        className={`flex-row justify-between items-center py-3 ${i < arr.length - 1 ? "border-b border-slate-100" : ""}`}
                      >
                        <Text variant="body" className="text-slate-500 text-sm">
                          {row.label}
                        </Text>
                        {row.pill ? (
                          <View className="flex-row items-center" style={{ gap: 8 }}>
                            <View className="bg-primary/10 px-3 py-1 rounded-full">
                              <Text variant="h2" className="text-primary text-xs">
                                {formatDisplayValue(row.value)}
                              </Text>
                            </View>

                            {row.label === "Category" && (
                              <Pressable
                                onPress={() => {
                                  setNewCategoryTitle(category || "");
                                  setCategoryModalVisible(true);
                                }}
                                className="flex-row items-center rounded-full border border-primary/25 px-2.5 py-1"
                                style={{ gap: 4 }}
                              >
                                <Ionicons name="create-outline" size={13} color="#EE2B8C" />
                                <Text className="text-[11px] font-semibold text-primary">
                                  Edit
                                </Text>
                              </Pressable>
                            )}
                          </View>
                        ) : (
                          <Text variant="h2" className="text-slate-900 text-sm">
                            {formatDisplayValue(row.value)}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                  </View>
                )}

                <View className="bg-white border border-slate-200 p-4 rounded-2xl mb-3">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-row gap-3 flex-1">
                      <View className="p-2 bg-primary/5 rounded-xl">
                        <Ionicons name="book-outline" size={24} color="#EE2B8C" />
                      </View>
                      <View>
                        <Text variant="caption" className="text-xs mb-0.5">
                          Notes
                        </Text>
                        <Text variant="h2" className="text-slate-900 text-sm">
                          {notes ||
                            "No additional notes"}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      className="p-1.5 rounded-lg"
                      activeOpacity={0.7}
                    ></TouchableOpacity>
                  </View>


                </View>
                {/* Sub event list TODO: CHEck this shit */}
                {subEvents.length > 0 && (
                  <View className="bg-white border border-slate-200 p-4 rounded-2xl mb-3">
                    <View className="flex-row items-center gap-2 mb-3">
                      <Ionicons
                        name="checkbox-outline"
                        size={22}
                        color="#EE2B8C"
                      />
                      <Text variant="caption" className="text-sm">
                        Invited Sub event
                      </Text>
                    </View>
                    <View className="flex-row flex-wrap" style={{ gap: 10 }}>
                      {subEvents.map((subEvent) => {
                        const isChecked = isSubEventInvited(subEvent.id);
                        return (
                          <TouchableOpacity
                            key={subEvent.id}
                            onPress={() => toggleSubEventInvite(subEvent.id)}
                            className="w-[48%] flex-row items-center rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2"
                            activeOpacity={0.8}
                          >
                            <Ionicons
                              name={isChecked ? "checkbox" : "square-outline"}
                              size={20}
                              color={isChecked ? "#EE2B8C" : "#94a3b8"}
                            />
                            <Text
                              variant="body"
                              className="ml-2 flex-1 text-slate-700 text-sm"
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {subEvent.title ?? "Untitled sub-event"}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {(guestDetail?.eventGuest?.isAccomodation ||
                  guestDetail?.eventGuest?.isArrivalPickupRequired ||
                  guestDetail?.eventGuest?.isDeparturePickupRequired) && (
                    <View>
                      <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-2">
                          <Ionicons
                            name="shield-checkmark-outline"
                            size={20}
                            color="#EE2B8C"
                          />
                          <Text
                            variant="caption"
                            className="text-xs font-bold uppercase tracking-widest"
                          >
                            Host Assignments
                          </Text>
                        </View>
                        <View className="bg-slate-100 px-2 py-0.5 rounded">
                          <Text
                            variant="caption"
                            className="text-[10px] uppercase font-bold"
                          >
                            Internal Use
                          </Text>
                        </View>
                      </View>

                      {guestDetail.eventGuest.isAccomodation && (
                        <View className="bg-white border border-slate-200 p-4 rounded-2xl mb-3">
                          <View className="flex-row items-center gap-2 mb-3">
                            <Ionicons
                              name="bed-outline"
                              size={20}
                              color="#EE2B8C"
                            />
                            <Text variant="caption" className="text-xs">
                              Room Assigned
                            </Text>
                          </View>
                          <TextInput
                            value={assignedRoom}
                            onChangeText={setAssignedRoom}

                            placeholder="Assign room"
                            placeholderTextColor="#94a3b8"
                            className="w-full bg-slate-50 rounded-md p-4 text-sm text-slate-900"
                          />
                        </View>
                      )}

                      {guestDetail.eventGuest.isArrivalPickupRequired && (
                        <View className="bg-white border border-slate-200 p-4 rounded-2xl mb-3">
                          <View className="flex-row items-center gap-2 mb-3">
                            <Ionicons
                              name="car-outline"
                              size={20}
                              color="#EE2B8C"
                            />
                            <Text variant="caption" className="text-xs">
                              Arrival Pickup Assigned
                            </Text>
                          </View>
                          <TextInput
                            value={arrivalInfo}
                            onChangeText={setArrivalInfo}

                            placeholder="Driver / pickup details"
                            placeholderTextColor="#94a3b8"
                            className="w-full bg-slate-50 rounded-md p-4 text-sm text-slate-900"
                          />
                        </View>
                      )}

                      {guestDetail.eventGuest.isDeparturePickupRequired && (
                        <View className="bg-white border border-slate-200 p-4 rounded-2xl mb-3">
                          <View className="flex-row items-center gap-2 mb-3">
                            <Ionicons
                              name="car-sport-outline"
                              size={20}
                              color="#EE2B8C"
                            />
                            <Text variant="caption" className="text-xs">
                              Departure Pickup Assigned
                            </Text>
                          </View>
                          <TextInput
                            value={departureInfo}
                            onChangeText={setDepartureInfo}

                            placeholder="Driver / departure details"
                            placeholderTextColor="#94a3b8"
                            className="w-full bg-slate-50 rounded-md p-4 text-sm text-slate-900"
                          />
                        </View>
                      )}


                    </View>
                  )}
              </View>
            </ScrollView>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>

      <BottomActionMenu
        visible={actionMenuVisible}
        onClose={() => setActionMenuVisible(false)}
        items={[
          {
            label: removeInvitationMutation.isPending ? "Removing..." : "Remove",
            icon: "trash-outline",
            color: "#EF4444",
            iconBgClassName: "bg-red-50",
            disabled: removeInvitationMutation.isPending,
            loading: removeInvitationMutation.isPending,
            onPress: handleDeleteGuest,
          },
        ]}
      />
    </>
  );
}
