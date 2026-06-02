import {
  BottomActionMenu,
  ThreeDotButton,
} from "@/src/components/event/guest/threedot";
import { Text } from "@/src/components/ui/Text";
import { useSubmitRsvpResponse } from "@/src/features/events/hooks/use-event";
import { useSubEventListStore } from "@/src/features/events/store/useEventStore";
import {
  useAssignGiftToInvitation,
  useCreateEventGuestCategory,
  useGetEventGuestCategories,
  useGetInvitationGifts,
  useRemoveInvitation,
} from "@/src/features/guests/api/use-guests";
import { useGiftsByEvent } from "@/src/features/gifts/hooks/use-gifts";
import { useGuestDetailStore } from "@/src/features/guests/store/useGuestDetailStore";
import { _entering, _exiting, _layoutAnimation, formatDate, formatTime, toISODateString } from "@/src/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useRouter } from "expo-router";
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
import { Dropdown } from "react-native-element-dropdown";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Animated from "react-native-reanimated";
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

const getAgeFromDob = (dob: Date) => {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age;
};

//TODO: Delete this


export default function ViewGuestDetail() {
  const router = useRouter();
  const guestDetail = useGuestDetailStore((state) => state.guestDraft);
  const setGuestDetail = useGuestDetailStore((state) => state.setGuestDetail);

  const statusValue = guestDetail?.eventGuest?.status?.toLowerCase?.() ?? "";
  const isConfirmed = statusValue === "accepted" || statusValue === "confirmed";

  const eventId = Number(guestDetail?.eventGuest?.eventId ?? 0);
  const { mutate: submitRsvpResponse, isPending } =
    useSubmitRsvpResponse(eventId);
  const removeInvitationMutation = useRemoveInvitation();
  const createCategoryMutation = useCreateEventGuestCategory();
  const assignGiftMutation = useAssignGiftToInvitation();
  const {
    data: guestCategories = [],
    isLoading: isGuestCategoriesLoading,
  } = useGetEventGuestCategories(eventId || null);
  const invitationId = guestDetail?.eventGuest?.id ?? null;
  const {
    data: invitationGift,
    isLoading: isInvitationGiftLoading,
  } = useGetInvitationGifts(invitationId);
  const {
    data: eventGiftsData,
    isLoading: isEventGiftsLoading,
    refetch: refetchEventGifts,
  } = useGiftsByEvent(eventId );

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
  const notes = guestDetail?.eventGuest?.notes ?? initialNotes;
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [assigningGiftId, setAssigningGiftId] = useState<number | null>(null);
  const [isAssigningGift, setisAssigningGift] = useState<boolean>(false);
  const [isGiftAssignEnabled, setIsGiftAssignEnabled] = useState(false);
  const [selectedGiftId, setSelectedGiftId] = useState<number | null>(null);
  // TODO: Review this is genearated code 
  const { subEventList } = useSubEventListStore();
  const unInvitedSubevents = useMemo(
    () => guestDetail?.eventGuest?.unInvitedSubevent ?? [],
    [guestDetail?.eventGuest?.unInvitedSubevent]
  );
  const subEvents = subEventList ?? [];
  const [unInvitedSubeventIds, setUnInvitedSubeventIds] = useState<number[]>(
    unInvitedSubevents
  );

  useEffect(() => {
    setUnInvitedSubeventIds((prev) => {
      const next = unInvitedSubevents;
      if (prev.length !== next.length) {
        return next;
      }
      for (let i = 0; i < prev.length; i += 1) {
        if (prev[i] !== next[i]) {
          return next;
        }
      }
      return prev;
    });
  }, [unInvitedSubevents]);

  useFocusEffect(() => {
    if (eventId) {
      refetchEventGifts();
    }
  });

  const isSubEventInvited = (subEventId: string | number) =>
    !unInvitedSubeventIds.includes(Number(subEventId));

  const toggleSubEventInvite = (subEventId: string | number) => {
    const id = Number(subEventId);
    setUnInvitedSubeventIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    return guestCategories
      .filter((item) => {
        const key = item.value.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((item) => ({ label: item.label, value: item.value }));
  }, [guestCategories]);
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
  const guestDob: any =
    guestUser?.dob ??
    guestProfile.dob ??
    guestProfile.dateOfBirth ??
    guestInfo.dob ??
    guestInfo.dateOfBirth;
  const parsedGuestDob = guestDob ? new Date(guestDob) : null;
  const isValidDob = parsedGuestDob instanceof Date && !Number.isNaN(parsedGuestDob.getTime());
  const formattedGuestDob = isValidDob
    ? formatDate(toISODateString(parsedGuestDob))
    : "";
  const guestAge = isValidDob ? getAgeFromDob(parsedGuestDob) : null;
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
      label: "Age",
      icon: "hourglass-outline" as const,
      value: guestAge !== null ? String(guestAge) : "",
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

const visibleGuestProfileRows = guestProfileRows.filter(
    (row) => !row.value?.includes("@khumbaya.com")
  );

  const eventGifts = useMemo(() => {
    const items = (eventGiftsData as any)?.items ?? eventGiftsData ?? [];
    return Array.isArray(items) ? items : [];
  }, [eventGiftsData]);

  const eventGiftOptions = useMemo(
    () =>
      eventGifts.map((gift: any) => ({
        label: gift.name,
        value: gift.id,
      })),
    [eventGifts]
  );

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
      assignedRoom: assignedRoom.trim() || undefined,
      arrivalInfo: arrivalInfo.trim() || undefined,
      departureInfo: departureInfo.trim() || undefined,
      notes: notes.trim(),
      category: category.trim() || undefined,
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

  const handleAssignGift = async (giftId: number) => {
    if (!invitationId) {
      Alert.alert("Error", "Invitation not found.");
      return;
    }
    setisAssigningGift(true)
    setAssigningGiftId(giftId);
    try {
      await assignGiftMutation.mutateAsync({ invitationId, giftId });
      Alert.alert("Success", "Gift assigned successfully.");
      setSelectedGiftId(null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to assign gift. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setAssigningGiftId(null);
      setisAssigningGift(false)
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
                <View className="absolute right-4 top-4 flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => router.push("./edit-rsvp")}
                    activeOpacity={0.75}
                    className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-full bg-white"
                    style={{
                      shadowColor: "#000",
                      shadowOpacity: 0.08,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <Ionicons name="pencil-outline" size={12} color="#EE2B8C" />
                    <Text className="text-[11px] font-semibold text-primary">Edit RSVP</Text>
                  </TouchableOpacity>
                  {!isConfirmed && (
                    <View
                      className="p-2 rounded-full bg-white"
                      style={{
                        shadowColor: "#000",
                        shadowOpacity: 0.12,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    >
                      <ThreeDotButton onPress={() => setActionMenuVisible(true)} />
                    </View>
                  )}
                </View>

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
                <Pressable
                  onPress={() => {
                    setNewCategoryTitle(category || "");
                    setCategoryModalVisible(true);
                  }}
                  className="flex-row items-center mt-1"
                  style={{ gap: 4 }}
                >
                  <Text variant="h2" className="text-primary text-sm">
                    {isConfirmed ? "Confirmed" : "Pending"} •{" "}
                    {category || guestDetail?.eventGuest?.category || "Guest"}
                  </Text>
                  <Ionicons name="create-outline" size={13} color="#EE2B8C" />
                </Pressable>
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
                          className="text-xs font-bold uppercase tracking-widest"
                        >
                          Guest Details
                        </Text>
                      </View>
                    </View>

                    <View className="rounded-full bg-slate-100 px-3 py-1">
                      <Text className="text-[11px] font-semibold text-slate-500">
                        {visibleGuestProfileRows.length} field
                        {visibleGuestProfileRows.length === 1 ? "" : "s"}
                      </Text>
                    </View>
                  </View>

                  <View className="rounded-2xl border border-slate-100 bg-white ">
                    {visibleGuestProfileRows.length ? (
                      <View className="gap-2">
                        {visibleGuestProfileRows.map((row) => (
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

                            <View className="flex-1 flex-row justify-between items-center">
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
                          value: `${guestDetail?.eventGuest?.isAccomodation ? "Room Needed" : "Room not needed"}`,
                          pill: true,
                        },
                        {
                          label: "Arrival Pickup",
                          value: `${guestDetail?.eventGuest?.isArrivalPickupRequired ? "Required" : "Not Required"}`,
                          pill: true,
                        },
                        {
                          label: "Departure Pickup",
                          value: `${guestDetail?.eventGuest?.isDeparturePickupRequired ? "Required" : "Not Required"}`,
                          pill: true,
                        },

                      ].map((row, i, arr) =>
                        row.value ? ( <View
                          key={i}
                          className={`flex-row justify-between items-center py-3 ${i < arr.length - 1 ? "border-b border-slate-100" : ""}`}
                        >
                          <Text variant="body" className="text-slate-500 text-sm">
                            {row.label}
                          </Text>
                          {row.pill ? (
                            <View className="bg-primary/10 px-3 py-1 rounded-full">
                              <Text variant="h2" className="text-primary text-xs">
                                {formatDisplayValue(row.value)}
                              </Text>
                            </View>
                          ) : (
                            <Text variant="h2" className="text-slate-900 text-sm">
                              {formatDisplayValue(row.value)}
                            </Text>
                          )}
                        </View>
                      ) : null
                    )}
                    </View>
                  </View>
              

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

                {invitationGift ? (
                  <Animated.View
                    className="bg-white border border-slate-200 p-4 rounded-2xl mb-3"
                    layout={_layoutAnimation}
                    entering={_entering}
                    exiting={_exiting}
                  >
                    <View className="flex-row items-center gap-2 mb-3">
                      <Ionicons name="gift-outline" size={22} color="#EE2B8C" />
                      <Text variant="caption" className="text-xs">
                        Assigned Gift
                      </Text>
                    </View>
                    {isInvitationGiftLoading ? (
                      <ActivityIndicator color="#ee2b8c" />
                    ) : (
                      <View className="gap-2">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-xs text-slate-500">Gift</Text>
                          <Text className="text-sm font-semibold text-slate-900">
                            {invitationGift.giftName}
                          </Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-xs text-slate-500">Category</Text>
                          <Text className="text-sm font-semibold text-slate-900">
                            {invitationGift.giftCategory}
                          </Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-xs text-slate-500">Value</Text>
                          <Text className="text-sm font-semibold text-slate-900">
                            {invitationGift.giftValue}
                          </Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-xs text-slate-500">Count</Text>
                          <Text className="text-sm font-semibold text-slate-900">
                            {invitationGift.giftCount}
                          </Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-xs text-slate-500">Total</Text>
                          <Text className="text-sm font-semibold text-slate-900">
                            {invitationGift.totalCount}
                          </Text>
                        </View>
                      </View>
                    )}
                  </Animated.View>
                ) : null}
                {isGiftAssignEnabled && !invitationGift ? (
                  <Animated.View
                    className="bg-white border border-slate-200 p-4 rounded-2xl mb-3"
                    layout={_layoutAnimation}
                    entering={_entering}
                    exiting={_exiting}
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center" style={{ gap: 8 }}>
                        <Ionicons name="gift" size={20} color="#EE2B8C" />
                        <Text variant="caption" className="text-xs">
                          Assign Gift to Guest
                        </Text>
                      </View>
                    </View>

                    {isEventGiftsLoading ? (
                      <ActivityIndicator color="#ee2b8c" />
                    ) : eventGiftOptions.length ? (
                      <View style={{ gap: 12 }}>
                        <Dropdown
                          data={eventGiftOptions}
                          labelField="label"
                          valueField="value"
                          value={selectedGiftId}
                          placeholder="Select a gift"
                          onChange={(item) => setSelectedGiftId(item.value)}
                          style={{
                            height: 44,
                            borderWidth: 1,
                            borderColor: "#e2e8f0",
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            backgroundColor: "#ffffff",
                          }}
                          placeholderStyle={{ color: "#94a3b8", fontSize: 14 }}
                          selectedTextStyle={{ color: "#181114", fontSize: 14 }}
                          containerStyle={{ borderRadius: 12 }}
                        />

                        <TouchableOpacity
                          onPress={() =>
                            selectedGiftId != null && handleAssignGift(selectedGiftId)
                          }
                          disabled={
                            selectedGiftId == null ||
                            assigningGiftId === selectedGiftId
                          }
                          className="items-center justify-center rounded-md bg-primary/90 py-2.5"
                          style={{ opacity: selectedGiftId == null ? 0.6 : 1 }}
                        >
                          <Text className="text-white text-xs font-semibold">
                            {isAssigningGift && assigningGiftId === selectedGiftId
                              ? "Assigning..."
                              : "Assign Gift"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => router.push("./gifts-add")}
                        className="mt-1 items-center justify-center rounded-md border border-primary/20 bg-primary/5 py-2.5"
                      >
                        <Text className="text-xs font-semibold text-primary">
                          No gifts found. Add a new gift
                        </Text>
                      </TouchableOpacity>
                    )}
                  </Animated.View>
                ) : null}
              {( !invitationGift) && (
                <Animated.View
                  layout={_layoutAnimation}
                  entering={_entering}
                  exiting={_exiting}
                >
                  <Pressable
                    onPress={() => setIsGiftAssignEnabled((prev) => !prev)}
                    className={`flex-row items-center gap-3 p-3 bg-slate-50 rounded-md border-2 ${
                      isGiftAssignEnabled ? "border-pink-200" : "border-transparent"
                    }`}
                  >
                    <Ionicons
                      name={isGiftAssignEnabled ? "checkbox" : "square-outline"}
                      size={20}
                      color={isGiftAssignEnabled ? "#EE2B8C" : "#cbd5e1"}
                    />
                    <Text className="text-sm text-slate-900 font-semibold">
                      Assign Gift to the guest
                    </Text>
                  </Pressable>
                </Animated.View>)}
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
