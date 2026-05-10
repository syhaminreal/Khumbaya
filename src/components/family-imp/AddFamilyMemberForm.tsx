import { CountryOption, CountryPickerModal } from "@/src/components/ui/CountryPhone";
import { COUNTRY_DATA } from "@/src/constants/countrydata";
import { AddFamilyMemberPayload } from "@/src/features/family/api/family.service";
import {
  useAddFamilyMember,
  useUpdateFamilyMember,
} from "@/src/features/family/hooks/use-family";
import { useFindUserWithPhone } from "@/src/features/user/api/use-user";
import { formatDate, parseDate } from "@/src/utils/helper";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Text } from "../ui/Text";

const FOOD_PREFERENCES = [
  { label: "Veg", value: "Vegetarian" },
  { label: "Non-Veg", value: "Non-Veg" },
  { label: "Vegan", value: "Vegan" },
  { label: "Jain", value: "Jain" },
];

interface AddFamilyMemberFormProps {
  familyId: number;
  memberId?: number;
  initialData?: any;
  onSuccess: any;
}

export default function AddFamilyMemberForm({
  familyId,
  memberId,
  initialData,
  onSuccess,
}: AddFamilyMemberFormProps) {
  const isEditMode = !!initialData;

  const { mutate: addMember, isPending: isAdding } = useAddFamilyMember();
  const { mutate: updateMember, isPending: isUpdating } =
    useUpdateFamilyMember();

  const isPending = isAdding || isUpdating;

  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRY_DATA[0]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddFamilyMemberPayload>({
    defaultValues: {
      phone: "",
      username: initialData?.username || "",
      email: initialData?.email || "",
      relation: initialData?.relation || "",
      dob: initialData?.dob ?? new Date(),
      foodPreference: initialData?.foodPreference || "",
    },
  });

  const [dobDate, setDobDate] = React.useState<Date>(
    initialData?.dob ? parseDate(initialData.dob) : new Date()
  );

  const watchedPhone = watch("phone") ?? "";
  const digits = watchedPhone.replace(/\D/g, "");
  const fullPhonePayload = digits ? `+${selectedCountry.dialCode}-${digits}` : "";
  const shouldSearchUserByPhone = !isEditMode && digits.length > 0;

  const {
    data: userWithPhone,
    isFetching: isFindingUser,
    error: findUserError,
    isError: isFindUserError,
  } = useFindUserWithPhone(digits, {
    enabled: shouldSearchUserByPhone,
    debounceMs: 1000,
  });

  const foundUser =
    userWithPhone?.items?.length > 0 ? userWithPhone.items[0] : undefined;
  const isMatchedUser =
    shouldSearchUserByPhone && !isFindingUser && !!foundUser;
  const shouldLockFullName = !isEditMode && isMatchedUser;
  const hasExistingFamily =
    !isEditMode && isMatchedUser && foundUser?.familyId != null;

  // Button disabled if: pending, searching, no family, or user already in another family
  const isButtonDisabled =
    isPending || isFindingUser || !familyId || hasExistingFamily;

  React.useEffect(() => {
    if (isEditMode && initialData?.phone) {
      const match = initialData.phone.match(/^\+(\d+)-(.+)$/);
      if (match) {
        const found = COUNTRY_DATA.find((c) => c.dialCode === match[1]);
        if (found) setSelectedCountry(found);
        setValue("phone", match[2]);
      } else {
        setValue("phone", initialData.phone.replace(/\D/g, ""));
      }
    }
  }, [initialData?.phone]);

  React.useEffect(() => {
    if (initialData?.dob) {
      const nextDob = parseDate(initialData.dob);
      setDobDate(nextDob);
      setValue("dob", nextDob);
    }
  }, [initialData?.dob, setValue]);

  React.useEffect(() => {
    if (!isEditMode && isMatchedUser && foundUser) {
      setValue("username", foundUser?.username || "", { shouldValidate: true });
      if (foundUser.email) {
        setValue("email", foundUser?.email, { shouldValidate: true });
      }
    }
  }, [isEditMode, isMatchedUser, foundUser, setValue]);

  React.useEffect(() => {
    if (isFindUserError && findUserError) {
      const message =
        (findUserError as any)?.response?.data?.message ||
        (findUserError as any)?.message ||
        "Failed to find user with this phone number.";
      Alert.alert("Error", message);
    }
  }, [findUserError, isFindUserError]);

  const handleDobChange = (
    event: DateTimePickerEvent,
    date?: Date
  ) => {
    if (event.type === "dismissed") {
      setShowDobPicker(false);
      return;
    }

    if (!date) return;

    setDobDate(date);
    setValue("dob", date, { shouldValidate: true, shouldDirty: true });
    setShowDobPicker(false);
  };

  const onSubmit = (values: AddFamilyMemberPayload) => {
    if (!familyId) {
      Alert.alert(
        "Error",
        "Family not found. Please create/select a family first."
      );
      return;
    }

    if (!isEditMode && hasExistingFamily) {
      Alert.alert(
        "Cannot add member",
        "This user is already linked to another family."
      );
      return;
    }
    console.log(
      "The data of r🍈🍈🍈🍈🍈🍈🍈🍈🍈🍈🍈he user while editing or creating the new member in the famili are",
      {
        username: values.username?.trim(),
        relation: values.relation?.trim(),
        dob: values.dob,
        phone: fullPhonePayload || undefined,
        foodPreference: values.foodPreference || undefined,
        email: values.email?.trim() || undefined,
      }
    );
    const payload = {
      username: values.username?.trim(),
      relation: values.relation?.trim(),
      dob: values.dob instanceof Date
        ? values.dob.toISOString().slice(0, 10)
        : values.dob,
      phone: fullPhonePayload || undefined,
      foodPreference: values.foodPreference || undefined,
      email: values.email?.trim() || undefined,
    };

    if (isEditMode) {
      if (!memberId) {
        Alert.alert("Error", "Invalid member for editing.");
        return;
      }
      updateMember(
        { familyId, memberId, data: payload },
        {
          onSuccess: () => {
            Alert.alert("Success", "Family member updated");
            onSuccess?.();
          },
          onError: (error: any) => {
            Alert.alert(
              "Error",
              error?.response?.data?.message || "Failed to update family member"
            );
          },
        }
      );
    } else {
      addMember(
        { familyId, data: payload as AddFamilyMemberPayload },
        {
          onSuccess: () => {
            Alert.alert("Success", "Family member added");
            onSuccess?.();
          },
          onError: (error: any) => {
            Alert.alert(
              "Error",
              error?.response?.data?.message || "Failed to add family member"
            );
          },
        }
      );
    }
  };

  return (
    <View className="bg-primary/5 border-2 border-dashed border-primary/30 rounded-xl p-5 mt-6">
      <View className="flex-row items-center justify-center gap-2 mb-4">
        <Ionicons
          name={isEditMode ? "create-outline" : "person-add-outline"}
          size={18}
          className="!text-primary"
        />
        <Text className="text-base font-jakarta-bold text-primary">
          {isEditMode ? "Edit Member" : "Add New Member"}
        </Text>
      </View>

      {!isEditMode && (
        <View className="min-h-5 mt-1 mb-2">
          {isFindingUser && (
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <ActivityIndicator size="small" color="#ee2b8c" />
              <Text className="text-xs text-slate-500">Searching user...</Text>
            </View>
          )}

          {isMatchedUser && (
            <View className="flex-row items-center rounded-md border border-[#ee2b8c]/20 bg-[#ee2b8c]/5 p-3">
              <View className="flex-1">
                <Text className="text-sm font-bold text-[#1a1b3a]">
                  {foundUser?.username || "User found"}
                </Text>
                <Text className="text-xs text-slate-600">
                  {hasExistingFamily
                    ? "This user is already in a family and cannot be added."
                    : "User found. Name/email auto-filled."}
                </Text>
              </View>
            </View>
          )}

          {shouldSearchUserByPhone && !isFindingUser && !foundUser && (
            <Text className="text-xs text-slate-500">
              No user found with this phone. Continue adding manually.
            </Text>
          )}
        </View>
      )}

      {/* Phone - Hidden when user found in add mode */}
      <View className="mb-3">
        <Text className="text-xs font-jakarta-bold uppercase tracking-wide text-text-tertiary mb-1.5 ml-1">
          Phone Number (Optional)
        </Text>
        <View className={`h-14 flex-row items-center rounded-sm border overflow-hidden ${
          errors.phone ? "border-red-500" : "border-border"
        }`}>
          {/* Country trigger */}
          <Pressable
            onPress={() => setPickerVisible(true)}
            className="h-full flex-row items-center gap-1.5 px-3 border-r border-border"
          >
            <Image
              source={selectedCountry.image}
              style={{ width: 26, height: 18, borderRadius: 3 }}
              resizeMode="cover"
            />
            <Text className="text-sm font-medium text-text-primary">
              +{selectedCountry.dialCode}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={18} color="#9ca3af" />
          </Pressable>

          {/* Digits input */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange } }) => (
              <TextInput
                className="flex-1 px-4 py-3 text-sm text-text-primary bg-background"
                placeholder="9761890004"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>

        <CountryPickerModal
          visible={pickerVisible}
          selected={selectedCountry}
          onSelect={setSelectedCountry}
          onClose={() => setPickerVisible(false)}
        />

        {errors.phone && (
          <Text className="text-xs text-red-500 mt-1 ml-1">
            {errors.phone.message}
          </Text>
        )}
      </View>

      {/* Full Name */}

      {!isMatchedUser && (
        <View className="mb-3">
          <Text className="text-xs font-jakarta-bold uppercase tracking-wide text-text-tertiary mb-1.5 ml-1">
            Full Name
          </Text>
          <Controller
            control={control}
            name="username"
            rules={{ required: "Name is required" }}
            render={({ field: { value, onChange } }) => (
              <TextInput
                className={`w-full bg-background rounded-sm px-4 py-3 text-sm text-text-primary border ${
                  errors.username ? "border-red-500" : "border-border"
                } ${shouldLockFullName ? "bg-gray-100" : ""}`}
                placeholder={
                  shouldLockFullName
                    ? "Auto-filled from phone lookup"
                    : "Enter name"
                }
                placeholderTextColor="#9CA3AF"
                value={foundUser?.username || value}
                onChangeText={onChange}
                editable={!shouldLockFullName}
              />
            )}
          />
          {errors.username && (
            <Text className="text-xs text-red-500 mt-1 ml-1">
              {errors.username.message}
            </Text>
          )}
        </View>
      )}

      {/* DOB */}
      <View className="mb-3">
        <Text className="text-xs font-jakarta-bold uppercase tracking-wide text-text-tertiary mb-1.5 ml-1">
          Date of Birth
        </Text>

        <TouchableOpacity
          onPress={() => setShowDobPicker(true)}
          disabled={isPending}
          className={`w-full flex-row items-center justify-between rounded-sm border bg-background px-4 py-3 ${errors.dob ? "border-red-500" : "border-border"}`}
        >
          <Text className="text-sm text-text-primary">
            {dobDate ? formatDate(dobDate.toISOString()) : "Select date of birth"}
          </Text>
          <MaterialIcons name="calendar-today" size={18} color="#9ca3af" />
        </TouchableOpacity>

        {showDobPicker && (
          <DateTimePicker
            value={dobDate}
            mode="date"
            is24Hour={false}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDobChange}
            maximumDate={new Date()}
          />
        )}
        {errors.dob && (
          <Text className="text-xs text-red-500 mt-1 ml-1">
            {errors.dob.message}
          </Text>
        )}
      </View>

      {/* Relation */}
      <View className="mb-3">
        <Text className="text-xs font-jakarta-bold uppercase tracking-wide text-text-tertiary mb-1.5 ml-1">
          Relation
        </Text>
        <Controller
          control={control}
          name="relation"
          rules={{ required: "Relation is required" }}
          render={({ field: { value, onChange } }) => (
            <TextInput
              className={`w-full bg-background rounded-sm px-4 py-3 text-sm text-text-primary border ${
                errors.relation ? "border-red-500" : "border-border"
              }`}
              placeholder="Spouse"
              placeholderTextColor="#9CA3AF"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {errors.relation && (
          <Text className="text-xs text-red-500 mt-1 ml-1">
            {errors.relation.message}
          </Text>
        )}
      </View>

      {/* Email - Hidden when user found in add mode */}
      {(!isMatchedUser || isEditMode) && (
        <View className="mb-3">
          <Text className="text-xs font-jakarta-bold uppercase tracking-wide text-text-tertiary mb-1.5 ml-1">
            Email Address (optional)
          </Text>
          <Controller
            control={control}
            name="email"
            rules={{
              validate: (value) => {
                if (!value) return true;
                return (
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
                  "Invalid email address"
                );
              },
            }}
            render={({ field: { value, onChange } }) => (
              <TextInput
                className={`w-full bg-background rounded-sm px-4 py-3 text-sm text-text-primary border ${
                  errors.email ? "border-red-500" : "border-border"
                }`}
                placeholder="example@mail.com"
                placeholderTextColor="#9CA3AF"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
          {errors.email && (
            <Text className="text-xs text-red-500 mt-1 ml-1">
              {errors.email.message}
            </Text>
          )}
        </View>
      )}

      {/* Food Preference */}
      <View className="mb-3">
        <Text className="text-xs font-jakarta-bold uppercase tracking-wide text-text-tertiary mb-1.5 ml-1">
          Meal Preference
        </Text>
        <Controller
          control={control}
          name="foodPreference"
          render={({ field: { value, onChange } }) => (
            <Dropdown
              style={{
                height: 50,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 6,
                paddingHorizontal: 12,
                backgroundColor: "white",
              }}
              placeholderStyle={{ color: "#9CA3AF" }}
              selectedTextStyle={{ color: "#111827", fontSize: 14 }}
              data={FOOD_PREFERENCES}
              labelField="label"
              valueField="value"
              placeholder="Select meal preference"
              value={value}
              onChange={(item: any) => onChange(item.value)}
            />
          )}
        />
      </View>

      <TouchableOpacity
        className={`w-full rounded-sm py-3.5 flex-row items-center justify-center mt-1 ${isButtonDisabled ? "bg-gray-400" : "bg-primary"}`}
        onPress={handleSubmit(onSubmit)}
        disabled={isButtonDisabled}
      >
        <Text className="text-white text-base" variant="h2">
          {isPending
            ? "Saving..."
            : isEditMode
              ? "Update Member"
              : "Add Member"}
        </Text>
        {!isPending && (
          <Ionicons
            name={isEditMode ? "checkmark" : "add"}
            size={20}
            color="white"
            style={{ marginLeft: 8 }}
          />
        )}
      </TouchableOpacity>

      {!isEditMode && !familyId && (
        <Text className="text-xs text-red-500 mt-2 text-center">
          Please create a family first before adding members.
        </Text>
      )}

      {!isEditMode && hasExistingFamily && (
        <Text className="text-xs text-red-500 mt-2 text-center">
          This phone belongs to a user who already has a family.
        </Text>
      )}
    </View>
  );
}
