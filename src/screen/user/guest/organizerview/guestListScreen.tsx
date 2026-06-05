import DraftInvitationCard from "@/src/components/guest/DraftInvitationCard";
import FamilyCard from "@/src/components/guest/FamilyGuestCard";
import GuestCard from "@/src/components/guest/GuestCard";
import { Text } from "@/src/components/ui/Text";
import { useSubEventsOfEvent, useSubmitRsvpResponse } from "@/src/features/events/hooks/use-event";
import { useEventStore, useSubEventListStore } from "@/src/features/events/store/useEventStore";
import {
  useCreateEventGuestCategory,
  useGetInvitationsForEvent,
  useRemoveInvitation,
} from "@/src/features/guests/api/use-guests";
import {
  useFamilyGuestStore,
  useGuestDetailStore,
} from "@/src/features/guests/store/useGuestDetailStore";
import {
  type FamilyGroup,
  type GroupedInvitation,
  type GuestDetailInterface,
  groupInvitationsByFamily,
} from "@/src/features/guests/types";

import { useThrottledRouter } from "@/src/hooks/useThrottledRouter";
import { cn } from "@/src/utils/cn";
import { _layoutAnimation } from "@/src/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { RelativePathString, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";

import { TextInput } from "react-native-gesture-handler";
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type GuestFilterTab = "accepted" | "pending" | "draft" | "Un-Invited"

export default function GuestListScreen() {
const {eventDraft} = useEventStore();
  const router = useRouter();
  const { push } = useThrottledRouter();
 
  const { eventId, isGuest, isSubEvent } = useLocalSearchParams();
  console.log('This is the event id', eventId , 'Ths is the sub event of the business' , isSubEvent  , 'This is the is gu👩‍🦲gu👩‍🦲gu👩‍🦲gu👩‍🦲gu👩‍🦲gu👩‍🦲gu👩‍🦲gu👩‍🦲gu👩‍🦲gu👩‍🦲est in the invitation ' ,isGuest )
const isSubEventBoolean = isSubEvent ==="true";
  const subEventIdParam = useMemo(() => {
    if (eventId && !isNaN(Number(eventId))) {
      return Number(eventId);
    }
    return null;
  }, [eventId]);
  const effectiveEventId = useMemo(() => {
    if (isSubEventBoolean) {
      if (eventDraft?.id) {
        return Number(eventDraft.id);
      }
      if (subEventIdParam) {
        return subEventIdParam;
      }
      return null;
    }
    if (subEventIdParam) {
      return subEventIdParam;
    }
    if (eventDraft?.id) {
      return Number(eventDraft.id);
    }
    return null;
  } , [ eventDraft?.id, isSubEventBoolean, subEventIdParam])

  const {
    data: subEventsResponse,
  } = useSubEventsOfEvent(Number(effectiveEventId));
  const { setSubEventList } = useSubEventListStore();

  useEffect(() => {
    setSubEventList(subEventsResponse ?? []);
  }, [subEventsResponse, setSubEventList])

  const setGuestDetail = useGuestDetailStore((state) => state.setGuestDetail);
  const clearGuestDetail = useGuestDetailStore(
    (state) => state.clearGuestDetail
  );
  const clearFamilyGuest = useFamilyGuestStore(
    (state) => state.clearFamilyGroup
  );
console.log('This is the sub event ')
  const { data: invitations, isLoading } = useGetInvitationsForEvent(effectiveEventId);
  const submitRsvpMutation = useSubmitRsvpResponse(effectiveEventId ?? 0);
  const removeInvitationMutation = useRemoveInvitation();
  const createCategoryMutation = useCreateEventGuestCategory();
 
  const [draftAction, setDraftAction] = useState<{
    userId: number;
    type: "send" | "delete" | "moveToDraft";
  } | null>(null);
  const [activeTab, setActiveTab] = useState<GuestFilterTab>("pending");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isActionsModalVisible, setIsActionsModalVisible] = useState(false);
  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const tabs: { label: string; value: GuestFilterTab }[] = useMemo(
    () =>
      isSubEventBoolean
        ? [
          { label: "Pending", value: "pending" },
          { label: "Accepted", value: "accepted" },
          { label: "Un-Invited", value: "Un-Invited" },
        ]
        : [
          { label: "Pending", value: "pending" },
          { label: "Accepted", value: "accepted" },
          { label: "Draft", value: "draft" },
        ],
    [isSubEventBoolean]
  );

  const getNormalizedCategory = useCallback(
    (category?: string | null) =>
      category?.trim().toLowerCase() || "uncategorized",
    []
  );

  const formatCategoryLabel = useCallback((category: string) => {
    if (category === "vvip") return "VVIP";
    if (category === "uncategorized") return "Uncategorized";
    return category.charAt(0).toUpperCase() + category.slice(1);
  }, []);

  const matchesTabStatus = useCallback(
    (status: string, tab: GuestFilterTab) => {
      switch (tab) {
        case "pending":
          return status === "pending" || status === "invited";
        case "accepted":
          return status === "accepted";
        case "draft":
          return status === "draft";
        case "Un-Invited":
        default:
          return false;
      }
    },
    []
  );

  const isGuestUninvitedFromSubEvent = useCallback(
    (guest: GuestDetailInterface) => {
      if (!isSubEventBoolean || !subEventIdParam) return false;
      const unInvited = guest.eventGuest?.unInvitedSubevent ?? [];
      return Array.isArray(unInvited) && unInvited.includes(subEventIdParam);
    },
    [isSubEventBoolean, subEventIdParam]
  );

  const tabFilteredInvitations = useMemo(() => {
    if (!invitations) return [] as GuestDetailInterface[];

    if (activeTab === "Un-Invited") {
      return invitations.filter(isGuestUninvitedFromSubEvent);
    }

    return invitations.filter((invitation: GuestDetailInterface) => {
      const status = String(invitation.eventGuest?.status ?? "pending")
        .trim()
        .toLowerCase();
      return matchesTabStatus(status, activeTab);
    });
  }, [
    invitations,
    activeTab,
    matchesTabStatus,
    isGuestUninvitedFromSubEvent,
    isSubEventBoolean,
  ]);

  const categoryStats = useMemo(() => {
    const categoryCountMap = new Map<string, number>();

    for (const invitation of tabFilteredInvitations) {
      const category = getNormalizedCategory(invitation.eventGuest?.category);
      categoryCountMap.set(category, (categoryCountMap.get(category) ?? 0) + 1);
    }

    const preferredOrder = [
      "friend",
      "family",
      "colleague",
      "vvip",
      "uncategorized",
    ];

    return Array.from(categoryCountMap.entries())
      .map(([value, count]) => ({
        value,
        label: formatCategoryLabel(value),
        count,
      }))
      .sort((a, b) => {
        const ai = preferredOrder.indexOf(a.value);
        const bi = preferredOrder.indexOf(b.value);
        if (ai === -1 && bi === -1) return a.label.localeCompare(b.label);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
  }, [tabFilteredInvitations, getNormalizedCategory, formatCategoryLabel]);

  useEffect(() => {
    setSelectedCategory("all");
  }, [activeTab]);

  useEffect(() => {
    if (selectedCategory === "all") return;
    const exists = categoryStats.some(
      (item) => item.value === selectedCategory
    );
    if (!exists) setSelectedCategory("all");
  }, [categoryStats, selectedCategory]);

  const matchesSelectedCategory = useCallback(
    (guest: GuestDetailInterface) => {
      if (selectedCategory === "all") return true;
      return (
        getNormalizedCategory(guest.eventGuest?.category) === selectedCategory
      );
    },
    [getNormalizedCategory, selectedCategory]
  );

  const getFamilyEffectiveStatus = useCallback(
    (members: GuestDetailInterface[]): string => {
      const hasAccepted = members.some(
        (m) => m.eventGuest?.status?.toLowerCase() === "accepted"
      );
      if (hasAccepted) return "accepted";

      const hasPendingOrInvited = members.some((m) => {
        const status = m.eventGuest?.status?.toLowerCase() ?? "";
        return status === "pending" || status === "invited";
      });
      if (hasPendingOrInvited) return "pending";

      return "declined";
    },
    []
  );
//  TODO: Have this in the backend 
  const groupedInvitations = useMemo(() => {
    if (!invitations) return [];
    return groupInvitationsByFamily(invitations);
  }, [invitations]);

  // TODO : Have this in the backend 
  const filteredGroupedInvitations = useMemo(() => {
    return groupedInvitations.filter((item: GroupedInvitation) => {
      if (activeTab === "Un-Invited") {
        if (item.type === "family") {
          return item.members.some((member) =>
            isGuestUninvitedFromSubEvent(member) &&
            matchesSelectedCategory(member)
          );
        }
        return (
          isGuestUninvitedFromSubEvent(item.data) &&
          matchesSelectedCategory(item.data)
        );
      }

      if (item.type === "family") {
        if (isSubEventBoolean) {
          const hasUninvitedMember = item.members.some((member) =>
            isGuestUninvitedFromSubEvent(member)
          );
          if (hasUninvitedMember) return false;
        }
        const effectiveStatus = getFamilyEffectiveStatus(item.members);
        const matchesStatus = matchesTabStatus(effectiveStatus, activeTab);

        if (!matchesStatus) return false;
        return item.members.some((member) => matchesSelectedCategory(member));
      }

      const status = String(item.data.eventGuest?.status ?? "pending")
        .trim()
        .toLowerCase();
      if (!matchesTabStatus(status, activeTab)) return false;
      return matchesSelectedCategory(item.data);
    })
      .map((item: GroupedInvitation): GroupedInvitation => {
        if (item.type === "family") {
          return {
            ...item,
            members: [...item.members].sort((a, b) =>
              (a.user.username ?? "").localeCompare(b.user.username ?? "")
            ),
          };
        }
        return item;
      })
      .sort((a, b) => {
        const nameA =
          a.type === "family" ? a.family_name : (a.data.user.username ?? "");
        const nameB =
          b.type === "family" ? b.family_name : (b.data.user.username ?? "");
        return nameA.localeCompare(nameB);

      });
  }, [
    groupedInvitations,
    activeTab,
    matchesSelectedCategory,
    matchesTabStatus,
    getFamilyEffectiveStatus,
    isGuestUninvitedFromSubEvent,
    isSubEventBoolean,
  ]);

  const draftInvitations = useMemo(() => {
    return tabFilteredInvitations.filter((invitation: GuestDetailInterface) => {
      const status = String(invitation.eventGuest?.status ?? "pending")
        .trim()
        .toLowerCase();
      return status === "draft" && matchesSelectedCategory(invitation);
    }
    );
  }, [tabFilteredInvitations, matchesSelectedCategory]);

  const filteredGuestCount =
    selectedCategory === "all"
      ? tabFilteredInvitations.length
      : tabFilteredInvitations.filter(matchesSelectedCategory).length;

  const selectedCategoryLabel =
    selectedCategory === "all" ? "All" : formatCategoryLabel(selectedCategory);

    // UPTO HERE upper part is all what should be done in the backend 
  const categoryPickerOptions = useMemo(
    () => [
      {
        value: "all",
        label: "All",
        count: tabFilteredInvitations.length,
      },
      ...categoryStats,
    ],
    [categoryStats, tabFilteredInvitations.length]
  );


  const openAddGuestScreen = useCallback(() => {
    if (!eventId) return;
    push(
      `./guests/addguest`
    );
  }, [eventId]);

  const openContactPickerScreen = useCallback(() => {
    if (!eventId) return;
    push(
      `./contactpicker` as RelativePathString
    );
  }, [eventId]);

  const openImportGuestScreen = useCallback(() => {
    if (!eventId) return;
    push(`./guests/import-guests` as RelativePathString);
  }, [eventId]);

  const openImportExcelScreen = useCallback(() => {
    if (!eventId) return;
    push(`./guests/import-excel` as RelativePathString);
  }, [eventId]);

  const openAddGuestCategoryModal = useCallback(() => {
    setIsAddCategoryModalVisible(true);
  }, []);

  const openAddGiftModal = useCallback(() => {
    push({
      pathname: `./guests/gifts-add`,
      params: { eventId: effectiveEventId },
    });
  }, [effectiveEventId]);

  const onPressGuestCard = (guest: GuestDetailInterface) => {
    setGuestDetail(guest);
    //TODO: Draft the detail of the guest instead of using the params in this
    push({
      pathname:
        `./guests/[guestDetailId]`,

        params: { eventId: effectiveEventId, guestDetailId: guest.user.id },
    });
  };

  const onEditRsvp = useCallback((guest: GuestDetailInterface) => {
    setGuestDetail(guest);
    push(`./guests/edit-rsvp` as RelativePathString);
  }, [setGuestDetail, push]);
// TODO: handle the case of the not available event guest int he list screen insterad  o using the ? in the file 
  const onPressDraftSend = useCallback(
    async (guest: GuestDetailInterface) => {
      if (!eventId || !guest?.user?.id) return;

      setDraftAction({ userId: guest.user.id, type: "send" });
      try {
        await submitRsvpMutation.mutateAsync({
          userId: guest.user.id,
          familyId: guest.eventGuest?.familyId,
          status: "pending",
        });
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to move draft to pending.";
        Alert.alert("Error", message);
      } finally {
        setDraftAction(null);
      }
    },
    [eventId, submitRsvpMutation]
  );

    if(!effectiveEventId || effectiveEventId === -1 || effectiveEventId === null) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Event not found.</Text>
      </SafeAreaView>
    );
  }

  const onDeleteDraft = useCallback(
    (guest: GuestDetailInterface) => {
      if (!eventId || !guest?.user?.id) return;

      const displayName =
        guest.user.username?.trim() ||
        guest.user.email ||
        "this guest";

      Alert.alert("Delete draft", `Delete ${displayName}'s draft invitation?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDraftAction({ userId: guest.user.id, type: "delete" });
            try {
              await removeInvitationMutation.mutateAsync({
                eventId:effectiveEventId,
                guestId: guest.user.id,
              });
            } catch (error: any) {
              const message =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to delete draft invitation.";
              Alert.alert("Error", message);
            } finally {
              setDraftAction(null);
            }
          },
        },
      ]);
    },
    [eventId, removeInvitationMutation]
  );

  const onMoveToDraft = useCallback(
    async (guest: GuestDetailInterface) => {
      if (!eventId || !guest?.user?.id) return;

      setDraftAction({ userId: guest.user.id, type: "moveToDraft" });
      try {
        await submitRsvpMutation.mutateAsync({
          userId: guest.user.id,
          familyId: guest.eventGuest?.familyId,
          status: "draft",
        });
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to move to draft.";
        Alert.alert("Error", message);
      } finally {
        setDraftAction(null);
      }
    },
    [eventId, submitRsvpMutation]
  );

  const onRemoveGuest = useCallback(
    (guest: GuestDetailInterface) => {
      if (!eventId || !guest?.user?.id) return;

      const displayName =
        guest.user.username?.trim() ||
        guest.user.email ||
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
              setDraftAction({ userId: guest.user.id, type: "delete" });
              try {
                await removeInvitationMutation.mutateAsync({
                  eventId: effectiveEventId,
                  guestId: guest.user.id,
                });
              } catch (error: any) {
                const message =
                  error?.response?.data?.message ||
                  error?.message ||
                  "Failed to remove guest. Please try again.";
                Alert.alert("Error", message);
              } finally {
                setDraftAction(null);
              }
            },
          },
        ]
      );
    },
    [eventId, removeInvitationMutation]
  );

  //Have the family Removal invitation api 
  const onRemoveFamily = useCallback(
    (family: FamilyGroup) => {
      if (!eventId || family.members.length === 0) return;

      Alert.alert(
        "Remove family",
        `Remove ${family.family_name}'s invitations from this event?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              const primaryGuest = family.members[0];
              setDraftAction({ userId: primaryGuest.user.id, type: "delete" });
              try {
                await Promise.all(
                  family.members.map((member) =>
                    removeInvitationMutation.mutateAsync({
                      eventId: effectiveEventId,
                      guestId: member.user.id,
                    })
                  )
                );
              } catch (error: any) {
                const message =
                  error?.response?.data?.message ||
                  error?.message ||
                  "Failed to remove family. Please try again.";
                Alert.alert("Error", message);
              } finally {
                setDraftAction(null);
              }
            },
          },
        ]
      );
    },
    [eventId, removeInvitationMutation]
  );

  const onPressFamilyCard = (familyData: FamilyGroup) => {
    if (familyData.members.length === 1) {
      const singleMember = familyData.members[0];
      setGuestDetail(singleMember);
      push({
        pathname: "./guests/[guestDetailId]",
        params: {
          eventId: effectiveEventId,
          guestDetailId: singleMember.eventGuest?.id,
        },
      });
    } else {
      push({
        pathname: "./guests/familymember",
        params: {
          eventId: effectiveEventId,
          familyId: familyData.familyId.toString(),
          familyName: familyData.family_name,
        },
      });
    }
  };

  useEffect(() => {
    return () => {
      clearFamilyGuest();
      clearGuestDetail();
    };
  }, [clearFamilyGuest, clearGuestDetail]);
  
  const [tabWidth, setTabWidth] = useState(0);
  const indicatorX = useSharedValue(0);

  // when tab changes, slide the indicator
  const handleTabPress = (tab: GuestFilterTab, index: number) => {
    setActiveTab(tab);
    indicatorX.value = withTiming(index * tabWidth, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });;
  }

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <SafeAreaView className="p-4 h-full" edges={["top"]}>
      <View>
        <View className="flex-row items-center justify-between mt-2 mb-3 border-b border-gray-300 pb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 rounded-full bg-white border border-gray-200 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={20} color="#e71872" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-jakarta-bold text-[#181114]">
            Guest Management
          </Text>
          <TouchableOpacity
            onPress={() => setIsActionsModalVisible(true)}
            className="h-10 w-10 rounded-full bg-white border border-gray-200 items-center justify-center"
          >
            <Ionicons name="add" size={20} color="#EE2B8C" />
          </TouchableOpacity>
        </View>
        <View className="my-2 flex-row items-center gap-2 ">
          <View className="h-14 rounded-md flex-1">
            <TextInput
              className="flex-1 h-full px-6 text-base text-gray-900 bg-gray-300/50 rounded-md"
              placeholder="Search for the friend"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity
            onPress={() => setIsCategoryModalVisible(true)}
            className="h-14 w-12 rounded-md bg-white border border-gray-200 items-center justify-center"
          >
            <View className="items-center">
              <Ionicons name="funnel-outline" size={18} color="#374151" />
              {selectedCategory !== "all" && (
                <View className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View className="flex-row"
          onLayout={(e) => setTabWidth(e.nativeEvent.layout.width / tabs.length)}
        >
          {tabs.map((tab, index: number) => (
            <Pressable
              key={tab.value}
              onPress={() => handleTabPress(tab.value, index)}
              className={cn(
                "flex-1 items-center pb-3 pt-2 ",
                activeTab === tab.value
                  ? "border-primary"
                  : "border-transparent"
              )}
            >
              <Text
                variant="h2"
                className={cn(
                  "uppercase tracking-wider",
                  activeTab === tab.value ? "text-primary" : "text-slate-500"
                )}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
          <Animated.View
            style={[
              indicatorStyle,
              {
                position: "absolute",
                bottom: 0,
                left: 0,
                width: tabWidth,
                height: 2,
                backgroundColor: "#EE2B8C",
              },
            ]}
          />

        </View>

        <Text className="text-[11px] text-gray-500 mt-2 font-jakarta">
          {selectedCategoryLabel} • {filteredGuestCount} guest
          {filteredGuestCount === 1 ? "" : "s"}
        </Text>
      </View>

      {isLoading ? (
        <Text>Loading invitations...</Text>
      ) : activeTab === "draft" && !isSubEventBoolean ? (
        <Animated.FlatList
          data={draftInvitations}
          keyExtractor={(item: GuestDetailInterface) =>
            `draft-${item.user.id}`
          }
          initialNumToRender={10}
          renderItem={({ item, index }: { item: GuestDetailInterface, index: number }) => {

            return <DraftInvitationCard
              guest={item}
              onPress={() => onPressGuestCard(item)}
              onMoveToPending={() => onPressDraftSend(item)}
              onDeleteDraft={() => onDeleteDraft(item)}
              isMoving={
                draftAction?.type === "send" &&
                draftAction?.userId === item.user.id
              }
              isDeleting={
                draftAction?.type === "delete" &&
                draftAction?.userId === item.user.id
              }
            />
          }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          className="mt-4"
          ListEmptyComponent={
            <Text
              style={{ textAlign: "center", color: "#6B7280", marginTop: 20 }}
            >
              {invitations?.length
                ? "No draft invitations found."
                : "No guests yet."}
            </Text>
          }
        />
      ) : (
        <FlatList
          data={filteredGroupedInvitations}
          keyExtractor={(item: GroupedInvitation) =>
            item.type === "family"
              ? `family-${item.familyId}`
              : `individual-${item.data.user.id}`
          }
          renderItem={({ item, index }: { item: GroupedInvitation, index: number }) => {
            if (item.type === "family") {
              const isPending = item.members.some(m => {
                const s = m.eventGuest?.status?.toLowerCase() ?? "";
                return s === "pending" || s === "invited";
              });
              return (
                <Animated.View
                  layout={_layoutAnimation}
                  entering={FadeInDown.delay(index * 20).duration(300)}
                >
                  <FamilyCard
                    family={item}
                    onPress={() => {
                      onPressFamilyCard(item);
                    }}
                    style={''}
                    onMoveToDraft={isPending ? () => {
                      const primaryGuest = item.members[0];
                      onMoveToDraft(primaryGuest);
                    } : undefined}
                    onDelete={
                      activeTab === "pending"
                        ? () => onRemoveFamily(item)
                        : undefined
                    }
                    isMovingToDraft={
                      draftAction?.type === "moveToDraft" &&
                      item.members.some(m => m.user.id === draftAction.userId)
                    }
                  />
                </Animated.View>
              );
            }

            return (
              <Animated.View
                layout={_layoutAnimation}
                entering={FadeInDown.delay(index * 20).duration(300)}>
                <GuestCard
                  guest={item.data}
                  onPress={() => {
                    onPressGuestCard(item.data);
                  }}
                  onMoveToDraft={() => onMoveToDraft(item.data)}
                  onEditRsvp={() => onEditRsvp(item.data)}
                  onDelete={
                    activeTab === "pending"
                      ? () => onRemoveGuest(item.data)
                      : undefined
                  }
                  isMovingToDraft={
                    draftAction?.type === "moveToDraft" &&
                    draftAction.userId === item.data.user.id
                  }
                />
              </Animated.View>
            );
          }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          className="mt-4"
          ListEmptyComponent={
            <Text
              style={{ textAlign: "center", color: "#6B7280", marginTop: 20 }}
            >
              {invitations?.length
                ? `No ${activeTab} guests found.`
                : "No guests yet."}
            </Text>
          }
        />
      )}

      <Modal
        visible={isActionsModalVisible}
        transparent
        allowSwipeDismissal
        animationType="slide"
        onRequestClose={() => setIsActionsModalVisible(false)}
      >
        <View className="flex-1 bg-black/35 justify-end">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsActionsModalVisible(false)}
            className="absolute inset-0"
          />

          <View className="bg-white rounded-t-3xl px-5 pt-5 pb-7">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-3" />
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-jakarta-bold text-base text-[#181114]">
                Quick actions
              </Text>
              <TouchableOpacity onPress={() => setIsActionsModalVisible(false)}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                setIsActionsModalVisible(false);
                openAddGuestScreen();
              }}
              className="flex-row items-center justify-between px-4 py-3.5 rounded-xl border mb-2 border-gray-200"
            >
              <Text className="font-jakarta-semibold text-sm text-[#181114]">Add guest</Text>
              <Ionicons name="person-add-outline" size={18} color="#EE2B8C" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setIsActionsModalVisible(false);
                openAddGiftModal();
              }}
              className="flex-row items-center justify-between px-4 py-3.5 rounded-xl border mb-2 border-gray-200"
            >
              <Text className="font-jakarta-semibold text-sm text-[#181114]">Add gift</Text>
              <Ionicons name="gift-outline" size={18} color="#EE2B8C" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setIsActionsModalVisible(false);
                openContactPickerScreen();
              }}
              className="flex-row items-center justify-between px-4 py-3.5 rounded-xl border mb-2 border-gray-200"
            >
              <Text className="font-jakarta-semibold text-sm text-[#181114]">Import contact</Text>
              <Ionicons name="call-outline" size={18} color="#EE2B8C" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setIsActionsModalVisible(false);
                openImportExcelScreen();
              }}
              className="flex-row items-center justify-between px-4 py-3.5 rounded-xl border mb-2 border-gray-200"
            >
              <Text className="font-jakarta-semibold text-sm text-[#181114]">Import excel</Text>
              <Ionicons name="document-text-outline" size={18} color="#EE2B8C" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setIsActionsModalVisible(false);
                openAddGuestCategoryModal();
              }}
              className="flex-row items-center justify-between px-4 py-3.5 rounded-xl border border-gray-200"
            >
              <Text className="font-jakarta-semibold text-sm text-[#181114]">Add category</Text>
              <Ionicons name="pricetag-outline" size={18} color="#EE2B8C" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isCategoryModalVisible}
        transparent
        allowSwipeDismissal
        animationType="fade"
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <View className="flex-1 bg-black/35 justify-end">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsCategoryModalVisible(false)}
            className="absolute inset-0"
          />

          <View className="bg-white rounded-t-3xl px-5 pt-5 pb-7">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-3" />
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-jakarta-bold text-base text-[#181114]">
                Filter by category
              </Text>
              <TouchableOpacity
                onPress={() => setIsCategoryModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {categoryPickerOptions.map((option) => {
              const isActive = selectedCategory === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    setSelectedCategory(option.value);
                    setIsCategoryModalVisible(false);
                  }}
                  className={cn(
                    "flex-row items-center justify-between px-4 py-3.5 rounded-xl border mb-2",
                    isActive
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 bg-white"
                  )}
                >
                  <Text className="font-jakarta-semibold text-sm text-[#181114]">
                    {option.label}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="font-jakarta text-xs text-gray-500">
                      {option.count}
                    </Text>
                    {isActive && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#ee2b8c"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      <Modal
        visible={isAddCategoryModalVisible}
        transparent
        allowSwipeDismissal
        animationType="fade"
        onRequestClose={() => setIsAddCategoryModalVisible(false)}
      >
        <View className="flex-1 bg-black/35 justify-end">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsAddCategoryModalVisible(false)}
            className="absolute inset-0"
          />

          <View className="bg-white rounded-t-3xl px-5 pt-5 pb-7">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-3" />
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-jakarta-bold text-base text-[#181114]">
                Add guest category
              </Text>
              <TouchableOpacity
                onPress={() => setIsAddCategoryModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              className="h-12 rounded-xl border border-gray-200 px-4 text-sm text-gray-900"
              placeholder="Category name"
              placeholderTextColor="#9CA3AF"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />

            <View className="flex-row items-center justify-end gap-3 mt-5">
              <TouchableOpacity
                onPress={() => {
                  setNewCategoryName("");
                  setIsAddCategoryModalVisible(false);
                }}
                className="px-4 py-2"
              >
                <Text className="text-sm text-gray-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  const trimmedTitle = newCategoryName.trim();
                  if (!trimmedTitle) return;
                  if (!effectiveEventId) {
                    Alert.alert("Error", "Invalid event.");
                    return;
                  }
                  try {
                    await createCategoryMutation.mutateAsync({
                      eventId: effectiveEventId,
                      payload: {
                        category_title: trimmedTitle,
                        priority: 1,
                      },
                    });
                    Alert.alert("Success", "Guest category created.");
                    setNewCategoryName("");
                    setIsAddCategoryModalVisible(false);
                  } catch (error: any) {
                    const message =
                      error?.response?.data?.message ||
                      error?.message ||
                      "Failed to create guest category.";
                    Alert.alert("Error", message);
                  }
                }}
                disabled={createCategoryMutation.isPending}
                className="px-4 py-2 rounded-lg bg-primary"
              >
                <Text className="text-sm text-white">
                  {createCategoryMutation.isPending ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

     
    </SafeAreaView>
  );
}