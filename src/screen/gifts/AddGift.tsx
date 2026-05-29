import { useEffect, useMemo } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { Dropdown } from "react-native-element-dropdown";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  useCreateGift,
  useGiftById,
  useGiftCategoriesByEvent,
  useGiftsByEvent,
  useUpdateGift,
} from "@/src/features/gifts/hooks/use-gifts";
import { useGetInvitationsForEvent } from "@/src/features/guests/api/use-guests";
import type { GuestDetailInterface } from "@/src/features/guests/types";

const addCategoryRoute =
  "/(protected)/(client-stack)/events/[eventId]/(organizer)/gifts/add-category" as const;

interface GiftFormData {
  title: string;
  description: string;
  categoryId?: number;
  price: string;
  currency: string;
  recipientName: string;
  businessId: string;
  maxPerGuest: string;
  totalStock: string;
  giftId?: number;
}

const normalizeName = (value: string) => value.trim().toLowerCase();

const getGuestName = (guest: GuestDetailInterface) =>
  guest.user.username?.trim() ||
  guest.user.email?.trim() ||
  guest.user.phone?.trim() ||
  `Guest ${guest.eventGuest?.id}`;

const AddGift = () => {
  const params = useLocalSearchParams();
  const eventId = Number(params.eventId?.toString() ?? 0);
  const giftId = Number(params.giftId?.toString() ?? 0);
  const isSendMode = params.mode?.toString() === "send";
  const isEditMode = giftId > 0 && !isSendMode;
  const router = useRouter();

  const categoriesQuery = useGiftCategoriesByEvent(eventId);
  const categories = categoriesQuery.data ?? [];
  const giftsQuery = useGiftsByEvent(eventId);
  const giftQuery = useGiftById(isEditMode ? giftId : null);
  const guestsQuery = useGetInvitationsForEvent(eventId > 0 ? eventId : null);
  const createGiftMutation = useCreateGift();
  const updateGiftMutation = useUpdateGift();

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name,
        value: String(category.id),
      })),
    [categories]
  );
  const giftOptions = useMemo(
    () =>
      (giftsQuery.data ?? []).map((gift) => ({
        label: gift.title,
        value: String(gift.id),
      })),
    [giftsQuery.data]
  );
  const guests = useMemo(
    () =>
      ((guestsQuery.data ?? []) as GuestDetailInterface[]).filter(
        (guest) => guest.eventGuest?.id
      ),
    [guestsQuery.data]
  );

  const { control, handleSubmit, setValue, watch } = useForm<GiftFormData>({
    defaultValues: {
      title: "",
      description: "",
      categoryId: undefined,
      price: "",
      currency: "NPR",
      recipientName: "",
      businessId: "",
      maxPerGuest: "1",
      totalStock: "1",
      giftId: undefined,
    },
  });
  const recipientName = watch("recipientName");
  const matchedRecipient = useMemo(() => {
    const typedName = normalizeName(recipientName);

    if (!typedName) {
      return null;
    }

    const exactMatch = guests.find(
      (guest) => normalizeName(getGuestName(guest)) === typedName
    );

    if (exactMatch) {
      return exactMatch;
    }

    return (
      guests.find((guest) =>
        normalizeName(getGuestName(guest)).includes(typedName)
      ) ?? null
    );
  }, [guests, recipientName]);

  const onSubmit = async (data: GiftFormData) => {
    if (isSendMode) {
      if (!data.giftId) {
        Alert.alert("Validation", "Please select a gift to send.");
        return;
      }

      if (!data.recipientName.trim()) {
        Alert.alert("Validation", "Please enter recipient name.");
        return;
      }

      if (!matchedRecipient?.eventGuest?.id) {
        Alert.alert(
          "Validation",
          "No invited guest matches that name. Please enter an existing guest name."
        );
        return;
      }

      try {
        const selectedGift = (giftsQuery.data ?? []).find(
          (gift) => gift.id === data.giftId
        );

        if (!selectedGift) {
          Alert.alert("Validation", "Selected gift is no longer available.");
          return;
        }

        if (!selectedGift.categoryId || selectedGift.price == null) {
          Alert.alert(
            "Validation",
            "Selected gift needs a category and price before it can be sent."
          );
          return;
        }

        await createGiftMutation.mutateAsync({
          eventId: String(eventId),
          payload: {
            title: selectedGift.title,
            description: selectedGift.description ?? "",
            categoryId: selectedGift.categoryId,
            price: Number(selectedGift.price),
            currency: selectedGift.currency ?? "NPR",
            recipientId: matchedRecipient.eventGuest.id,
            businessId: selectedGift.businessId ?? null,
            maxPerGuest: selectedGift.maxPerGuest ?? null,
            totalStock: selectedGift.totalStock ?? null,
          },
        });

        Alert.alert("Success", "Gift sent successfully.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } catch (error: any) {
        Alert.alert("Error", error?.message || "Unable to send gift.");
      }
      return;
    }

    if (isEditMode) {
      if (!data.title.trim()) {
        Alert.alert("Validation", "Gift title is required.");
        return;
      }

      if (!data.price.trim() || Number.isNaN(Number(data.price))) {
        Alert.alert("Validation", "Enter a valid gift price.");
        return;
      }

      if (!data.categoryId) {
        Alert.alert("Validation", "Please select a gift category.");
        return;
      }

      try {
        await updateGiftMutation.mutateAsync({
          eventId: String(eventId),
          giftId: String(giftId),
          payload: {
            title: data.title.trim(),
            categoryId: data.categoryId,
            price: Number(data.price),
            currency: data.currency.trim() || "NPR",
            businessId: data.businessId ? Number(data.businessId) : null,
          },
        });

        Alert.alert("Success", "Gift updated successfully.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } catch (error: any) {
        Alert.alert("Error", error?.message || "Unable to update gift.");
      }
      return;
    }

    if (!data.title.trim()) {
      Alert.alert("Validation", "Gift title is required.");
      return;
    }

    if (!data.categoryId) {
      Alert.alert("Validation", "Please select a gift category.");
      return;
    }

    if (!data.price.trim() || Number.isNaN(Number(data.price))) {
      Alert.alert("Validation", "Enter a valid gift price.");
      return;
    }

    try {
      await createGiftMutation.mutateAsync({
        eventId: String(eventId),
        payload: {
          title: data.title.trim(),
          categoryId: data.categoryId,
          price: Number(data.price),
          currency: data.currency.trim() || "NPR",
          businessId: data.businessId ? Number(data.businessId) : null,
        },
      });

      Alert.alert("Success", "Gift saved successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Unable to save gift.");
    }
  };

  useEffect(() => {
    if (!categoryOptions.length) {
      setValue("categoryId", undefined);
    }
  }, [categoryOptions, setValue]);

  useEffect(() => {
    const gift = giftQuery.data;

    if (!isEditMode || !gift) {
      return;
    }

    setValue("title", gift.title ?? "");
    setValue("description", gift.description ?? "");
    setValue("categoryId", gift.categoryId ?? undefined);
    setValue("price", gift.price != null ? String(gift.price) : "");
    setValue("currency", gift.currency ?? "NPR");
    setValue(
      "businessId",
      gift.businessId != null ? String(gift.businessId) : ""
    );
  }, [giftQuery.data, isEditMode, setValue]);

  if (isEditMode && giftQuery.isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Loading gift details...</Text>
      </SafeAreaView>
    );
  }

  if (isEditMode && !giftQuery.data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-4">
        <Text className="text-center text-gray-500">
          Gift not found. Please return to the gift list.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen
        options={{
          title: isSendMode
            ? "Send Gift"
            : isEditMode
              ? "Edit Gift"
              : "Create Gift",
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
          <View className="mb-4">
            <Text className="text-base font-semibold mb-3">
              {isSendMode
                ? "Send gift"
                : isEditMode
                  ? "Update gift"
                  : "Gift details"}
            </Text>

            {isSendMode ? (
              <>
                <Text className="text-sm text-gray-600 mb-2">Gift</Text>
                <Controller
                  control={control}
                  name="giftId"
                  render={({ field: { onChange, value } }) => (
                    <Dropdown
                      data={giftOptions}
                      disable={giftsQuery.isLoading || !giftOptions.length}
                      value={value ? String(value) : undefined}
                      onChange={(item) => onChange(Number(item.value))}
                      placeholder={
                        giftsQuery.isLoading
                          ? "Loading gifts..."
                          : giftOptions.length
                            ? "Select a gift"
                            : "No gifts available"
                      }
                      style={{
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        padding: 12,
                        opacity:
                          giftsQuery.isLoading || !giftOptions.length
                            ? 0.65
                            : 1,
                      }}
                      labelField="label"
                      valueField="value"
                      placeholderStyle={{ color: "#6b7280" }}
                      selectedTextStyle={{ color: "#111827", fontSize: 14 }}
                    />
                  )}
                />

                <Text className="text-sm font-semibold tracking-wide text-[#1a1b3a] mt-4 mb-2">
                  RECIPIENT NAME
                </Text>
                <Controller
                  control={control}
                  name="recipientName"
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
                <View className="min-h-5 mt-2">
                  {guestsQuery.isLoading ? (
                    <Text className="text-xs text-slate-500">
                      Loading guests...
                    </Text>
                  ) : matchedRecipient ? (
                    <View className="rounded-md border border-[#ee2b8c]/20 bg-[#ee2b8c]/5 p-3">
                      <Text className="text-sm font-bold text-[#1a1b3a]">
                        {getGuestName(matchedRecipient)}
                      </Text>
                      <Text className="mt-1 text-xs text-slate-500">
                        Guest found
                      </Text>
                    </View>
                  ) : recipientName.trim() ? (
                    <Text className="text-xs text-slate-500">
                      No invited guest found with this name.
                    </Text>
                  ) : null}
                </View>
              </>
            ) : (
              <>
                <Text className="text-sm text-gray-600 mb-2">Title</Text>
                <Controller
                  control={control}
                  name="title"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder="Gift title"
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"
                    />
                  )}
                />

                <Text className="text-sm text-gray-600 mt-4 mb-2">
                  Category
                </Text>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field: { onChange, value } }) => (
                    <Dropdown
                      data={categoryOptions}
                      disable={
                        categoriesQuery.isLoading || !categoryOptions.length
                      }
                      value={value ? String(value) : undefined}
                      onChange={(item) => onChange(Number(item.value))}
                      placeholder={
                        categoriesQuery.isLoading
                          ? "Loading categories..."
                          : categoryOptions.length
                            ? "Select a category"
                            : "No gift categories"
                      }
                      style={{
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        padding: 12,
                        opacity:
                          categoriesQuery.isLoading || !categoryOptions.length
                            ? 0.65
                            : 1,
                      }}
                      labelField="label"
                      valueField="value"
                      placeholderStyle={{ color: "#6b7280" }}
                      selectedTextStyle={{ color: "#111827", fontSize: 14 }}
                    />
                  )}
                />
                {!categoriesQuery.isLoading && !categoryOptions.length && (
                  <View className="mt-3 rounded-2xl border border-pink-100 bg-pink-50 p-3">
                    <Text className="text-sm text-pink-700">
                      Create a gift category before adding a gift.
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: addCategoryRoute,
                          params: { eventId: String(eventId) },
                        })
                      }
                      className="mt-3 self-start rounded-xl bg-[#ee2b8c] px-4 py-2"
                    >
                      <Text className="text-sm font-semibold text-white">
                        New Category
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <Text className="text-sm text-gray-600 mt-4 mb-2">Price</Text>
                <Controller
                  control={control}
                  name="price"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      keyboardType="numeric"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder="Enter amount"
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"
                    />
                  )}
                />

                <Text className="text-sm text-gray-600 mt-4 mb-2">
                  Currency
                </Text>
                <Controller
                  control={control}
                  name="currency"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder="NPR"
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"
                    />
                  )}
                />
              </>
            )}
          </View>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            className="rounded-2xl bg-[#ee2b8c] px-5 py-4 items-center"
          >
            <Text className="text-white font-semibold">
              {isSendMode
                ? "Send Gift"
                : isEditMode
                  ? "Update Gift"
                  : "Save Gift"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddGift;
