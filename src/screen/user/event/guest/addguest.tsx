import {
  CountryOption,
  CountryPickerModal,
} from "@/src/components/ui/CountryPhone";
import { Text } from "@/src/components/ui/Text";
import { COUNTRY_DATA } from "@/src/constants/countrydata";
import {
  useCreateEventGuestCategory,
  useGetEventGuestCategories,
  useInviteGuest,
} from "@/src/features/guests/api/use-guests";
import { useFindUserWithPhone } from "@/src/features/user/api/use-user";
import { User } from "@/src/store/AuthStore";

import { shadowStyle } from "@/src/utils/helper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  View
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type AddGuestFormValues = {
  fullName: string;
  phone: string;
  category: string;
  numberOfGuests: string;
  invitation_name: string;
};

type FoundUser = User;
type SubmitAction = "draft" | "send" | null;
type CategoryPriority = 1 | 2 | 3;

const PRIORITY_OPTIONS: Array<{ label: string; value: CategoryPriority }> = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
];

const AddGuestScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const inviteGuestMutation = useInviteGuest();
  const createCategoryMutation = useCreateEventGuestCategory();

  const [inviteWithFamily, setInviteWithFamily] = useState(true);
  const [autoFilledPhone, setAutoFilledPhone] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    COUNTRY_DATA[0]
  );
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeSubmitAction, setActiveSubmitAction] =
    useState<SubmitAction>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [newCategoryPriority, setNewCategoryPriority] =
    useState<CategoryPriority>(1);

  const eventId = Number(params.eventId);

  const {
    data: guestCategories = [],
    isLoading: isGuestCategoriesLoading,
  } = useGetEventGuestCategories(eventId || null);

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<AddGuestFormValues>({
      defaultValues: {
        fullName: "",
        invitation_name: "",
        numberOfGuests: "1",
        phone: "",
        category: "",

      },
    });

  const watchedPhone = watch("phone");
  const phoneDigits = watchedPhone.replace(/\D/g, "");

  const shouldSearch = useMemo(() => {
    return phoneDigits.length > 0;
  }, [phoneDigits]);

  const fullGuestPhone = `+${selectedCountry.dialCode}-${phoneDigits}`;

  const {
    data: foundUsersResponse,
    isFetching: isFindingUser,
    error: findUserError,
    isError: isFindUserError,
  } = useFindUserWithPhone(fullGuestPhone, {
    enabled: shouldSearch,
    debounceMs: 1000,
  });

  const foundUserData =
    (foundUsersResponse as { items?: unknown } | undefined)?.items ??
    foundUsersResponse;

  const foundUser = useMemo<FoundUser | null>(() => {
    if (!foundUserData) return null;
    if (Array.isArray(foundUserData)) {
      return (foundUserData[0] as FoundUser | undefined) ?? null;
    }
    return foundUserData as FoundUser;
  }, [foundUserData]);

  const isMatchedUser = shouldSearch && !isFindingUser && !!foundUser;

  useEffect(() => {
    if (!phoneDigits) {
      setAutoFilledPhone(null);
      return;
    }
  }, [phoneDigits]);

  useEffect(() => {
    if (isMatchedUser && foundUser) {
      setValue("fullName", foundUser.username || "", {
        shouldValidate: true,
      });
      setAutoFilledPhone(phoneDigits);
    }
  }, [isMatchedUser, foundUser, phoneDigits, setValue]);

  useEffect(() => {
    if (shouldSearch && !isFindingUser && !foundUser && autoFilledPhone) {
      setValue("fullName", "", { shouldValidate: true });
      setAutoFilledPhone(null);
    }
  }, [shouldSearch, isFindingUser, foundUser, autoFilledPhone, setValue]);

  useEffect(() => {
    if (isFindUserError && findUserError) {
      const maybeResponse = findUserError as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      Alert.alert(
        "Error",
        maybeResponse.response?.data?.message ||
        maybeResponse.message ||
        "Failed to find user with this phone number."
      );
    }
  }, [isFindUserError, findUserError]);

  const submitGuest = useCallback(
    async (
      values: AddGuestFormValues,
      isDraft: boolean,
      submitAction: Exclude<SubmitAction, null>
    ) => {
      setActiveSubmitAction(submitAction);

      if (!eventId) {
        Alert.alert("Error", "Invalid event id");
        setActiveSubmitAction(null);
        return;
      }

      const currentPhone = fullGuestPhone.trim();

      if (!currentPhone) {
        Alert.alert("Error", "Please enter a phone number.");
        setActiveSubmitAction(null);
        return;
      }

      const isSearchComplete = !isFindingUser;

      if (!isSearchComplete) {
        Alert.alert(
          "Please wait",
          `Wait for phone lookup to finish before ${isDraft ? "saving draft" : "sending invitation"
          }.`
        );
        setActiveSubmitAction(null);
        return;
      }

      const resolvedName = foundUser?.username || values.fullName.trim() || values.phone.trim();

      if (!resolvedName) {
        Alert.alert(
          "Error",
          "Please enter guest full name or use a phone that matches an existing user."
        );
        setActiveSubmitAction(null);
        return;
      }

      try {
        await inviteGuestMutation.mutateAsync({
          eventId,
          payload: {
            invitation_name: values.invitation_name.trim() || "",
            numberOfGuests: inviteWithFamily ? Number(values.numberOfGuests) : 1,
            phone: fullGuestPhone,
            fullName: values.fullName.trim() ?? resolvedName,
            isDraft,
            isFamily: inviteWithFamily,
            role: "Guest",
            category: values.category,
            status: isDraft ? "draft" : "pending",
            isAccomodation: false,
          },
        });

        Alert.alert(
          "Success",
          isDraft
            ? "Guest draft saved successfully!"
            : "Guest added successfully!"
        );
        reset();
        router.back();
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to add guest. Please try again.";
        Alert.alert("Error", message);
      } finally {
        setActiveSubmitAction(null);
      }
    },
    [
      eventId,
      foundUser,
      fullGuestPhone,
      isFindingUser,
      inviteGuestMutation,
      inviteWithFamily,
      phoneDigits,
      reset,
      router,
    ]
  );

  const onValidSubmit = useCallback(
    async (values: AddGuestFormValues) => {
      await submitGuest(values, false, "send");
    },
    [submitGuest]
  );

  const onValidDraftSubmit = useCallback(
    async (values: AddGuestFormValues) => {
      await submitGuest(values, true, "draft");
    },
    [submitGuest]
  );

  const onInvalidSubmit = useCallback(
    (errors: FieldErrors<AddGuestFormValues>) => {
      const firstError =
        errors.fullName ||
        errors.phone ||
        errors.numberOfGuests ||
        errors.category;
      if (firstError?.message) {
        Alert.alert("Error", firstError.message as string);
      }
    },
    []
  );

  const handleCreateCategory = useCallback(async () => {
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

      setValue("category", trimmedTitle, { shouldValidate: true });
      setNewCategoryTitle("");
      setNewCategoryPriority(1);
      setCategoryModalVisible(false);
      Alert.alert("Success", "Guest category created successfully.");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create guest category.";
      Alert.alert("Error", message);
    }
  }, [
    createCategoryMutation,
    eventId,
    newCategoryPriority,
    newCategoryTitle,
    setValue,
  ]);

  return (
    <KeyboardAvoidingView
      className="flex-1 "
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
    >
      <CountryPickerModal
        visible={pickerVisible}
        selected={selectedCountry}
        onSelect={setSelectedCountry}
        onClose={() => setPickerVisible(false)}
      />
      <Modal
        transparent
        animationType="fade"
        visible={categoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View className="flex-1 bg-black/35 items-center justify-center px-6">
          <View className="w-full rounded-xl bg-white p-5" style={{ gap: 14 }}>
            <Text className="text-lg font-bold text-[#1a1b3a]">
              Add Guest Category
            </Text>

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
              <Dropdown
                style={{
                  height: 48,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  borderRadius: 6,
                  paddingHorizontal: 12,
                  backgroundColor: "#ffffff",
                }}
                placeholderStyle={{ color: "#94a3b8", fontSize: 14 }}
                selectedTextStyle={{ color: "#1a1b3a", fontSize: 14 }}
                data={PRIORITY_OPTIONS}
                labelField="label"
                valueField="value"
                placeholder="Select priority"
                value={newCategoryPriority}
                onChange={(item: { value: CategoryPriority }) =>
                  setNewCategoryPriority(item.value)
                }
              />
            </View>

            <View className="flex-row" style={{ gap: 10 }}>
              <Pressable
                className="flex-1 items-center justify-center rounded-md border border-slate-200 py-3"
                onPress={() => setCategoryModalVisible(false)}
                disabled={createCategoryMutation.isPending}
              >
                <Text className="font-semibold text-slate-600">Cancel</Text>
              </Pressable>
              <Pressable
                className="flex-1 items-center justify-center rounded-md bg-[#ee2b8c] py-3"
                onPress={handleCreateCategory}
                disabled={createCategoryMutation.isPending}
              >
                <Text className="font-semibold text-white">
                  {createCategoryMutation.isPending ? "Saving..." : "Save"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <KeyboardAwareScrollView
        className="flex-1 "
        contentContainerStyle={{
          paddingBottom: 35,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={100}
        scrollEnabled={true}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 pb-4 pt-8">
            <Text className="text-3xl font-bold tracking-tight text-[#1a1b3a]">
              New Guest
            </Text>
            <Text className="mt-1 text-sm text-slate-500">
              Fill in the details to send an official invitation.
            </Text>
          </View>

          <View className="flex flex-col gap-6 px-6" style={{ gap: 24 }}>
            <View style={{ gap: 8 }}>
              <Text className="text-sm font-semibold tracking-wide text-[#1a1b3a]">
                PHONE NUMBER
              </Text>
              <Controller
                control={control}
                name="phone"
                rules={{
                  validate: (value) => {
                    return (
                      value.trim().length > 0 || "Please enter a phone number"
                    );
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <View className="h-14 w-full flex-row items-center overflow-hidden rounded-md border border-slate-200 bg-white">
                    <Pressable
                      onPress={() => setPickerVisible(true)}
                      className="h-full flex-row items-center gap-1.5 border-r border-slate-200 px-3"
                    >
                      <Image
                        source={selectedCountry.image}
                        style={{ width: 26, height: 18, borderRadius: 3 }}
                        resizeMode="cover"
                      />
                      <Text className="text-sm font-medium text-slate-800">
                        +{selectedCountry.dialCode}
                      </Text>
                      <MaterialIcons
                        name="arrow-drop-down"
                        size={18}
                        color="#94a3b8"
                      />
                    </Pressable>
                    <TextInput
                      className="flex-1 px-4 text-base text-slate-900"
                      placeholder="9761890004"
                      placeholderTextColor="#94a3b8"
                      keyboardType="phone-pad"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />
              <View className="min-h-5 mt-1">
                {isFindingUser ? (
                  <View className="flex-row items-center" style={{ gap: 6 }}>
                    <ActivityIndicator size="small" color="#ee2b8c" />
                    <Text className="text-xs text-slate-500">
                      Searching user...
                    </Text>
                  </View>
                ) : null}

                {isMatchedUser ? (
                  <View className="flex-row items-center rounded-md border border-[#ee2b8c]/20 bg-[#ee2b8c]/5 p-3 mb-4">
                    <View
                      className="rounded-full mr-3 items-center justify-center"
                      style={{
                        width: 32,
                        height: 32,
                        backgroundColor: "rgba(238,43,140,0.15)",
                      }}
                    >
                      <MaterialIcons name="person" size={16} color="#ee2b8c" />
                    </View>
                    <View className="flex-1 flex-row justify-between">
                      <Text className="text-sm font-bold text-[#1a1b3a]">
                        {foundUser?.username || "User found"}
                      </Text>
                      <Text className="text-xs text-black ">User Found</Text>
                    </View>
                  </View>
                ) : null}

                <View style={{ gap: 8 }}>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold tracking-wide text-[#1a1b3a]">
                      GUEST CATEGORY
                    </Text>
                    <Pressable
                      onPress={() => setCategoryModalVisible(true)}
                      className="flex-row items-center"
                      style={{ gap: 4 }}
                    >
                      <MaterialIcons name="add-circle-outline" size={16} color="#ee2b8c" />
                      <Text className="text-xs font-semibold text-[#ee2b8c]">
                        Add category
                      </Text>
                    </Pressable>
                  </View>
                  <Controller
                    control={control}
                    name="category"
                    rules={{
                      validate: (value) => {
                        return (
                          value.trim().length > 0 ||
                          "Please select guest category"
                        );
                      },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <Dropdown
                        style={{
                          height: 56,
                          borderWidth: 1,
                          borderColor: "#e2e8f0",
                          borderRadius: 6,
                          paddingHorizontal: 16,
                          backgroundColor: "#ffffff",
                        }}
                        placeholderStyle={{ color: "#94a3b8", fontSize: 16 }}
                        selectedTextStyle={{ color: "#1a1b3a", fontSize: 16 }}
                        data={guestCategories}
                        labelField="label"
                        valueField="value"
                        disable={isGuestCategoriesLoading || !guestCategories.length}
                        placeholder={
                          isGuestCategoriesLoading
                            ? "Loading guest categories..."
                            : guestCategories.length
                              ? "Select guest category"
                              : "No guest category available"
                        }
                        value={value}
                        onChange={(item: any) => onChange(item.value)}
                      />
                    )}
                  />

                  {!isGuestCategoriesLoading && !guestCategories.length ? (
                    <Text className="text-xs text-slate-500">
                      Guest categories are unavailable for this event right now.
                    </Text>
                  ) : null}
                </View>

                {shouldSearch && !isFindingUser && !foundUser ? (
                  <Text className="text-xs text-slate-500">
                    User was not found. You are creating a new guest entry.
                  </Text>
                ) : null}
              </View>
            </View>
            {!isMatchedUser && (
              <>
                <View style={{ gap: 8 }}>
                  <Text className="text-sm font-semibold tracking-wide text-[#1a1b3a]">
                    GUEST FULL NAME
                  </Text>
                  <Controller
                    control={control}
                    name="fullName"
                    rules={{
                      validate: (value) => {
                        if (isMatchedUser) return true;
                        return (
                          value.trim().length > 0 || "Please enter a guest name"
                        );
                      },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="h-14 w-full rounded-md border border-slate-200 bg-white px-4 text-base text-slate-900"
                        placeholder="e.g. Alexander Hamilton"
                        placeholderTextColor="#94a3b8"
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </View>
              </>
            )}

            <View
              className="rounded-md border border-[#ee2b8c]/10 p-5"
              style={{ backgroundColor: "rgba(238,43,140,0.05)", gap: 16 }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center" style={{ gap: 12 }}>
                  <View
                    className="rounded-md p-2"
                    style={{ backgroundColor: "rgba(238,43,140,0.1)" }}
                  >
                    <MaterialIcons
                      name="family-restroom"
                      size={20}
                      color="#ee2b8c"
                    />
                  </View>
                  <View>
                    <Text className="font-bold text-[#1a1b3a]">
                      Invite with Family
                    </Text>
                    <Text className="text-xs text-slate-500">
                      Allow guest to bring others
                    </Text>
                  </View>
                </View>
                <Switch
                  value={inviteWithFamily}
                  onValueChange={setInviteWithFamily}
                  trackColor={{ false: "#cbd5e1", true: "#ee2b8c" }}
                  thumbColor="#ffffff"
                />
              </View>

              {inviteWithFamily && (
                <View
                  className="border-t border-[#ee2b8c]/10 pt-4"
                  style={{ gap: 12 }}
                >
                  <View className="flex-row items-start" style={{ gap: 8 }}>
                    <MaterialIcons
                      name="info"
                      size={14}
                      color="#ee2b8c"
                      style={{ marginTop: 2 }}
                    />
                    <Text className="flex-1 text-xs italic leading-relaxed text-slate-500">
                      The primary guest will be able to add names and details
                      for each family member during their digital RSVP process.
                    </Text>
                  </View>

                  <View style={{ gap: 8 }}>
                    <Text className="text-sm font-semibold tracking-wide text-[#1a1b3a]">
                      NUMBER OF GUESTS
                    </Text>
                    <Controller
                      control={control}
                      name="numberOfGuests"
                      rules={{
                        validate: (value) => {
                          if (!inviteWithFamily) return true;
                          const guestCount = Number(value);
                          return (
                            (Number.isInteger(guestCount) && guestCount > 0) ||
                            "Please enter a valid number of guests"
                          );
                        },
                      }}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          className="h-14 w-full rounded-md border border-slate-200 bg-white px-4 text-base text-slate-900"
                          placeholder="e.g. 2"
                          placeholderTextColor="#94a3b8"
                          keyboardType="number-pad"
                          value={value}
                          onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
                        />
                      )}
                    />
                  </View>
                </View>
              )}
            </View>

            <View style={{ gap: 8 }}>
              <Text className="text-sm font-semibold tracking-wide text-[#1a1b3a]">
                INVITATION NAME (OPTIONAL)
              </Text>
              <Controller
                control={control}
                name="invitation_name"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="h-14 w-full rounded-md border border-slate-200 bg-white px-4 text-base text-slate-900"
                    placeholder="e.g. Sharma Family"
                    placeholderTextColor="#94a3b8"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>
          </View>

          <View className="mt-8 px-6 flex-row" style={{ gap: 12 }}>
            {inviteGuestMutation.isPending ? (
              activeSubmitAction === "draft" ? (
                <Pressable
                  className="flex-1 flex-row items-center justify-center rounded-md border border-[#ee2b8c] bg-white py-4"
                  style={{ gap: 8 }}
                  disabled
                >
                  <Text className="text-base font-bold text-[#ee2b8c]">
                    Saving...
                  </Text>
                  <MaterialIcons name="drafts" size={18} color="#ee2b8c" />
                </Pressable>
              ) : (
                <Pressable
                  className="flex-1 flex-row items-center justify-center rounded-md bg-[#ee2b8c] py-4"
                  style={{
                    gap: 8,
                    shadowColor: "#ee2b8c",
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                  disabled
                >
                  <Text className="text-base font-bold text-white">
                    Sending...
                  </Text>
                  <MaterialIcons name="send" size={18} color="#fff" />
                </Pressable>
              )
            ) : (
              <>

                <Pressable
                  className="flex-1 flex-row items-center justify-center rounded-md border border-[#ee2b8c] bg-white py-4"
                  style={{
                    gap: 8,
                    ...shadowStyle
                  }}
                  disabled={isFindingUser || !phoneDigits}
                  onPress={handleSubmit(onValidSubmit, onInvalidSubmit)}
                >
                  <Text className="text-base font-bold text-primary">
                    Send Invitation
                  </Text>
                  <MaterialIcons name="send" size={18} color="#ee2b8c" />
                </Pressable>

                <Pressable
                  className="flex-1 flex-row items-center justify-center rounded-md !bg-[#ee2b8c] py-4"
                  style={{ gap: 8, ...shadowStyle }}
                  disabled={isFindingUser || !phoneDigits}
                  onPress={handleSubmit(onValidDraftSubmit, onInvalidSubmit)}
                >
                  <Text className="text-base font-bold text-white">
                    Save Draft
                  </Text>
                  <MaterialIcons name="drafts" size={18} color="white" />
                </Pressable>

              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddGuestScreen;
