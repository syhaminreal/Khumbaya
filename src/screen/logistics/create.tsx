import { MaterialIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import z from "zod";
import { CountryOption, CountryPickerModal } from "../../components/ui/CountryPhone";
import { DateTimeRangePicker } from "../../components/ui/DateTimeRangePicker";
import { COUNTRY_DATA } from "../../constants/countrydata";
import { useCreateVehicle, useUpdateVehicle } from "../../features/logistics/hooks/use-transport";
import { useEventvehicleStore } from "../../features/logistics/store/useLogisticStore";
import { cn } from "../../utils/cn";

const createLogisticsFormSchema = z
  .object({
    vehicleName: z.string().trim().min(1, "Please enter a vehicle name."),
    capacity: z
      .string()
      .trim()
      .min(1, "Please enter passenger capacity.")
      .refine((value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed >= 0;
      }, "Please enter a valid passenger capacity."),
    wheels: z.string().optional(),
    driverName: z.string().optional(),
    driverPhone: z.string().optional(),
    availablityStartTime: z.date(),
    availablityEndTime: z.date(),
  })
  .refine((values) => values.availablityEndTime > values.availablityStartTime, {
    path: ["availablityEndTime"],
    message: "End time must be after start time.",
  });

type CreateLogisticsFormValues = z.infer<typeof createLogisticsFormSchema>;

// ─── Sub-components ────────────────────────────────────────────────────────────

const FormSection = ({ title, subtitle, children, icon, iconColor = "#ee2b8c", iconBg = "bg-primary/10" }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  iconBg?: string;
}) => (
  <View className="mb-3 mt-2">
    <View className="flex-row items-center mb-5 px-1">
      <View className={cn("w-10 h-10 rounded-xl items-center justify-center mr-3", iconBg)}>
        <MaterialIcons name={icon} size={20} color={iconColor} />
      </View>
      <View>
        <Text className="text-lg font-bold text-[#181114] tracking-tight">{title}</Text>
        {subtitle && <Text className="text-xs font-medium text-gray-500">{subtitle}</Text>}
      </View>
    </View>
    <View className="px-1">
      {children}
    </View>
  </View>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────
// Make this the editable and the create both 

export default function CreateLogisticsScreen() {
  
  const router = useRouter();
  
  const { eventId , isEdit, vehicleId } = useLocalSearchParams();
  const isEditMode = useMemo(() => isEdit === "true", [isEdit]);
  const { draft, clearDraft } = useEventvehicleStore();
  const createVehicleMutation = useCreateVehicle(String(eventId ?? ""));
  const updateVehicleMutation = useUpdateVehicle(String(eventId ?? ""), vehicleId ? String(vehicleId) : undefined);

  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRY_DATA[0]);
  const [pickerVisible, setPickerVisible] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateLogisticsFormValues>({
    resolver: zodResolver(createLogisticsFormSchema),
    defaultValues: {
      vehicleName: "",
      capacity: "",
      wheels: "",
      driverName: "",
      driverPhone: "",
      availablityStartTime: new Date(),
      availablityEndTime: new Date(),
    },
  });

  const startDate = watch("availablityStartTime");
  const endDate = watch("availablityEndTime");

  useEffect(() => {
    if (!isEditMode || !draft) return;

    const parseDate = (value?: Date | string | null) => {
      if (!value) return new Date();
      const parsed = value instanceof Date ? value : new Date(value);
      return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    const parseDriverNumber = (value?: string | null) => {
      if (!value) return { dialCode: null as string | null, phone: "" };
      const normalized = value.startsWith("+") ? value.slice(1) : value;
      const [dialCode, phone = ""] = normalized.split("-");
      return { dialCode, phone };
    };

    const { dialCode, phone } = parseDriverNumber(draft.driverNumber ?? undefined);
    const matchedCountry = dialCode ? COUNTRY_DATA.find((item) => item.dialCode === dialCode) : undefined;
    if (matchedCountry) {
      setSelectedCountry(matchedCountry);
    }

    reset({
      vehicleName: draft.vehicleName ?? "",
      capacity: draft.capacity !== null && draft.capacity !== undefined ? String(draft.capacity) : "",
      wheels: "",
      driverName: draft.driverName ?? "",
      driverPhone: phone,
      availablityStartTime: parseDate(draft.availablityStartTime),
      availablityEndTime: parseDate(draft.availablityEndTime),
    });
  }, [draft, isEditMode, reset]);

  const onSubmit = async (values: CreateLogisticsFormValues) => {
    if (!eventId || Array.isArray(eventId)) {
      Alert.alert("Error", "Invalid event id.");
      return;
    }

    const parsedCapacity = Number(values.capacity);
    const cleanedDriverName = values.driverName?.trim() ?? "";
    const cleanedPhone = values.driverPhone?.trim() ?? "";
    const fullDriverNumber = cleanedPhone
      ? `+${selectedCountry.dialCode}-${cleanedPhone}`
      : undefined;

    try {
      if (isEditMode) {
        if (!vehicleId || Array.isArray(vehicleId)) {
          Alert.alert("Error", "Invalid vehicle id.");
          return;
        }

        await updateVehicleMutation.mutateAsync({
          vehicleName: values.vehicleName.trim(),
          capacity: parsedCapacity,
          driverName: cleanedDriverName || undefined,
          driverNumber: fullDriverNumber,
          availablityStartTime: values.availablityStartTime,
          availablityEndTime: values.availablityEndTime,
        });

        clearDraft();
        Alert.alert("Success", "Vehicle updated successfully.", [
          { text: "OK", onPress: () => router.back() },
        ]);
        return;
      }else{

        await createVehicleMutation.mutateAsync({
          vehicleName: values.vehicleName.trim(),
          capacity: parsedCapacity,
          driverName: cleanedDriverName || undefined,
          driverNumber: fullDriverNumber,
          availablityStartTime: values.availablityStartTime,
          availablityEndTime: values.availablityEndTime,
        });
  
        Alert.alert("Success", "Vehicle added successfully.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }

    } catch (error) {
      const message = (error as Error).message || "An error occurred while saving the vehicle.";

      Alert.alert("Error", message);
    }
  };

  const onInvalid = () => {
    const firstMessage =
      errors.vehicleName?.message ||
      errors.capacity?.message ||
      errors.availablityEndTime?.message ||
      "Please check the form fields.";

    Alert.alert("Validation", firstMessage);
  };

  const handleSave = handleSubmit(onSubmit, onInvalid);
  const isSaving = isEditMode ? updateVehicleMutation.isPending : createVehicleMutation.isPending;

  return (
    <SafeAreaView className="flex-1 bg-[#f8f6f7]" edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" />

      {/* Country Picker Modal */}
      <CountryPickerModal
        visible={pickerVisible}
        selected={selectedCountry}
        onSelect={setSelectedCountry}
        onClose={() => setPickerVisible(false)}
      />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2 pb-2 bg-[#f8f6f7]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-black/5 items-center justify-center"
        >
          <MaterialIcons name="arrow-back" size={20} color="#181114" />
        </TouchableOpacity>
        <Text className="font-bold text-lg text-[#181114] flex-1 text-center">
          {isEditMode ? "Edit Vehicle" : "Add Vehicle"}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          className="w-16 h-10 items-center justify-center"
          style={{ opacity: isSaving ? 0.6 : 1 }}
        >
          <Text className="text-primary font-bold">
            {isSaving ? (isEditMode ? "Saving..." : "Adding...") : (isEditMode ? "Save" : "Add")}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={120}
      >
        <View className="flex-1 px-4 py-6">
          {/* Hero Image Section */}
          <View className="relative w-full h-44 mb-8 rounded-2xl overflow-hidden shadow-sm">
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop" }}
              className="w-full h-full object-cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              className="absolute inset-0 justify-end p-5"
            >
              <Text className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1">Fleet Management</Text>
              <Text className="text-white text-xl font-bold tracking-tight">New Asset Registration</Text>
            </LinearGradient>
          </View>

          {/* Form Sections */}
          <FormSection
            title="Vehicle Details"
            subtitle="Identification and basic specs"
            icon="directions-car"
          >
            <View className="mb-5">
              <Text className="mb-1 ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Vehicle Name</Text>
              <Controller
                control={control}
                name="vehicleName"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="h-14 rounded-md border border-gray-200 bg-white px-4  text-[#181114]"
                    placeholder="e.g. Executive Sedan 01"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.vehicleName?.message && (
                <Text className="mt-1 ml-1 text-xs text-red-500">{errors.vehicleName.message}</Text>
              )}
            </View>
            <View className="mb-5 flex-row gap-4">
              <View className="flex-1">
                <Text className="mb-1 ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Passenger Capacity</Text>
                <Controller
                  control={control}
                  name="capacity"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="h-14 rounded-md border border-gray-200 bg-white px-4  text-[#181114]"
                      placeholder="e.g. 4"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="numeric"
                    />
                  )}
                />
                {errors.capacity?.message && (
                  <Text className="mt-1 ml-1 text-xs text-red-500">{errors.capacity.message}</Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="mb-1 ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Number of Wheels</Text>
                <Controller
                  control={control}
                  name="wheels"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="h-14 rounded-md border border-gray-200 bg-white px-4  text-[#181114]"
                      placeholder="e.g. 4"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="numeric"
                    />
                  )}
                />
              </View>
            </View>
          </FormSection>

          <FormSection
            title="Service window"
            subtitle="Operational availability"
            icon="schedule"
            iconColor="#a23665"
            iconBg="bg-secondary-container/20"
          >
            <DateTimeRangePicker
              value={{
                startDateTime: startDate,
                endDateTime: endDate,
              }}
              onChange={({ startDateTime, endDateTime }) => {
                setValue("availablityStartTime", startDateTime, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setValue("availablityEndTime", endDateTime, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            />

            {errors.availablityEndTime?.message && (
              <Text className="mt-2 ml-1 text-xs text-red-500">{errors.availablityEndTime.message}</Text>
            )}
          </FormSection>

          <FormSection
            title="Driver Info"
            subtitle="Assigned driver information"
            icon="person"
            iconColor="#046c00"
            iconBg="bg-tertiary-container"
          >
            <View className="flex-row gap-2 mb-5 ">
              <View className="flex-1">
                <Text className="mb-1 ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Driver Name</Text>
                <Controller
                  control={control}
                  name="driverName"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="h-14 rounded-md border border-gray-200 bg-white px-4 text-base text-[#181114]"
                      placeholder="Full Legal Name"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
              </View>
            </View>

            <View className="mb-5">
              <Text className="mb-1 ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Driver Phone</Text>
              <View className="h-14 flex-row items-center rounded-md border border-gray-200 bg-white overflow-hidden">
                <Pressable
                  onPress={() => setPickerVisible(true)}
                  className="h-full flex-row items-center gap-1.5 px-3 border-r border-gray-100 bg-gray-50/30"
                >
                  <Image
                    source={selectedCountry.image}
                    style={{ width: 26, height: 18, borderRadius: 3 }}
                    resizeMode="cover"
                  />
                  <Text className="text-sm font-medium text-gray-800">
                    +{selectedCountry.dialCode}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={18} color="#9ca3af" />
                </Pressable>
                <Controller
                  control={control}
                  name="driverPhone"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="Enter phone number"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      className="flex-1 px-4 text-base text-[#181114]"
                    />
                  )}
                />
              </View>
            </View>
          </FormSection>

          {/* Bottom CTA */}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
