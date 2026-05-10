import { Text } from "@/src/components/ui/Text";
import { calculatePasswordStrength } from "@/src/utils/helper";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";

type VendorContactsFormValues = {
  fullName: string;
  email: string;
  countryCode: string;
  phone: string;
  password: string;
};

// dark: styles removed for nativewind consistency
export default function VendorContacts({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext<VendorContactsFormValues>();
  const [showPassword, setShowPassword] = useState(false);
  const passwordValue = useWatch({ control, name: "password" }) ?? "";

  const strengthConfig = {
    weak: { bars: 1, color: "#ef4444", label: "Weak" },
    medium: { bars: 2, color: "#facc15", label: "Medium strength" },
    strong: { bars: 3, color: "#10b981", label: "Strong" },
    "very-strong": { bars: 4, color: "#10b981", label: "Very strong" },
  };

  const strength = strengthConfig[calculatePasswordStrength(passwordValue)];

  return (
    <View className="flex-1 bg-background-light">
      {/* Header */}

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1 px-6 pb-6 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {/* Headline */}
        <View className="mb-8">
          {/* text-light = #181114 */}
          <Text
            className="text-3xl font-bold leading-tight mb-3"
            style={{ color: "#181114" }}
          >
            Let's get started
          </Text>
          {/* slate-600 = #475569 */}
          <Text
            className="text-base font-normal leading-relaxed"
            style={{ color: "#475569" }}
          >
            Create an account to start managing bookings and connecting with
            couples.
          </Text>
        </View>

        {/* Form Fields */}
        <View style={{ gap: 20 }}>
          {/* Full Name */}
          <View style={{ gap: 6 }}>
            {/* text-light = #181114 */}
            <Text
              className="text-sm font-semibold"
              style={{ color: "#181114" }}
            >
              Full Name
            </Text>
            <View className="relative">
              <Controller
                control={control}
                name="fullName"
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Jane Doe"
                    placeholderTextColor="#94a3b8" // slate-400
                    className="w-full rounded-xl px-4 py-3.5 text-base"
                    style={{
                      borderWidth: 1,
                      borderColor: "#e5e7eb", // gray-200
                      backgroundColor: "#ffffff",
                      color: "#181114", // text-light
                      paddingRight: 48,
                    }}
                  />
                )}
              />
              <View
                className="absolute right-4 top-1/2"
                style={{ transform: [{ translateY: -10 }] }}
              >
                {/* slate-400 = #94a3b8 */}
                <MaterialIcons name="person" size={20} color="#94a3b8" />
              </View>
            </View>
            {errors.fullName?.message && (
              <Text className="text-xs" style={{ color: "#ef4444" }}>
                {errors.fullName.message}
              </Text>
            )}
          </View>

          {/* Email */}
          <View style={{ gap: 6 }}>
            <Text
              className="text-sm font-semibold"
              style={{ color: "#181114" }}
            >
              Work Email
            </Text>
            <View className="relative">
              <Controller
                control={control}
                name="email"
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="jane@events.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="w-full rounded-xl px-4 py-3.5 text-base"
                    style={{
                      borderWidth: 1,
                      borderColor: "#e5e7eb",
                      backgroundColor: "#ffffff",
                      color: "#181114",
                      paddingRight: 48,
                    }}
                  />
                )}
              />
              <View
                className="absolute right-4 top-1/2"
                style={{ transform: [{ translateY: -10 }] }}
              >
                <MaterialIcons name="mail" size={20} color="#94a3b8" />
              </View>
            </View>
            {errors.email?.message && (
              <Text className="text-xs" style={{ color: "#ef4444" }}>
                {errors.email.message}
              </Text>
            )}
          </View>

          {/* Phone Number */}
          <View style={{ gap: 6 }}>
            <Text
              className="text-sm font-semibold"
              style={{ color: "#181114" }}
            >
              Phone Number
            </Text>
            <View className="flex-row" style={{ gap: 12 }}>
              {/* Country Code Picker - simplified to TextInput for React Native */}
              <View className="w-24 shrink-0">
                <Controller
                  control={control}
                  name="countryCode"
                  render={({ field: { value } }) => (
                    <TextInput
                      value={value}
                      editable={false}
                      className="w-full rounded-xl px-3 py-3.5 text-base text-center"
                      style={{
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        backgroundColor: "#ffffff",
                        color: "#181114",
                      }}
                    />
                  )}
                />
              </View>
              <Controller
                control={control}
                name="phone"
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="(555) 123-4567"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    className="flex-1 rounded-xl px-4 py-3.5 text-base"
                    style={{
                      borderWidth: 1,
                      borderColor: "#e5e7eb",
                      backgroundColor: "#ffffff",
                      color: "#181114",
                    }}
                  />
                )}
              />
            </View>
            {errors.phone?.message && (
              <Text className="text-xs" style={{ color: "#ef4444" }}>
                {errors.phone.message}
              </Text>
            )}
          </View>

          {/* Password */}
          <View style={{ gap: 6 }}>
            <Text
              className="text-sm font-semibold"
              style={{ color: "#181114" }}
            >
              Password
            </Text>
            <View className="relative">
              <Controller
                control={control}
                name="password"
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Create a password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    className="w-full rounded-xl px-4 py-3.5 text-base"
                    style={{
                      borderWidth: 1,
                      borderColor: "#e5e7eb",
                      backgroundColor: "#ffffff",
                      color: "#181114",
                      paddingRight: 48,
                    }}
                  />
                )}
              />
              <TouchableOpacity
                className="absolute right-4 top-1/2"
                style={{ transform: [{ translateY: -10 }] }}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={20}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>
            {errors.password?.message && (
              <Text className="text-xs" style={{ color: "#ef4444" }}>
                {errors.password.message}
              </Text>
            )}

            {/* Password Strength Meter */}
            {passwordValue.length > 0 && (
              <View className="mt-1">
                <View
                  className="flex-row w-full mb-1"
                  style={{ gap: 6, height: 6 }}
                >
                  {[1, 2, 3, 4].map((bar) => (
                    <View
                      key={bar}
                      className="flex-1 rounded-full"
                      style={{
                        backgroundColor:
                          bar <= strength.bars ? strength.color : "#e5e7eb",
                      }}
                    />
                  ))}
                </View>
                <Text
                  className="text-xs font-medium"
                  style={{ color: strength.color }}
                >
                  {strength.label}
                </Text>
              </View>
            )}
          </View>

          {/* Continue Button */}
          <View className="mt-4">
            <TouchableOpacity
              className="w-full rounded-full py-3.5 items-center justify-center shadow-md"
              style={{ backgroundColor: "#ee2b8c" }} // primary
              onPress={onNext}
              activeOpacity={0.9}
            >
              <Text className="text-white font-bold text-lg">Continue</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Divider */}
        <View className="flex-row items-center my-6 py-2">
          <View
            className="flex-1"
            style={{ height: 1, backgroundColor: "#e5e7eb" }}
          />
          {/* slate-500 = #64748b */}
          <Text
            className="mx-4 text-sm font-medium"
            style={{ color: "#64748b" }}
          >
            Or sign up with
          </Text>
          <View
            className="flex-1"
            style={{ height: 1, backgroundColor: "#e5e7eb" }}
          />
        </View>

        {/* Social Login */}
        <View className="flex-row" style={{ gap: 16 }}>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center rounded-xl py-3"
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              backgroundColor: "#ffffff",
              gap: 8,
            }}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["#4285F4", "#34A853"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="size-5 rounded-full items-center justify-center"
            >
              <Text className="text-[10px] text-white font-bold">G</Text>
            </LinearGradient>
            {/* slate-700 = #334155 */}
            <Text
              className="text-sm font-semibold"
              style={{ color: "#334155" }}
            >
              Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center rounded-xl py-3"
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              backgroundColor: "#ffffff",
              gap: 8,
            }}
            activeOpacity={0.7}
          >
            <View
              className="size-5 rounded-full items-center justify-center"
              style={{ backgroundColor: "#000000" }}
            >
              <Text className="text-[10px] text-white font-bold">A</Text>
            </View>
            <Text
              className="text-sm font-semibold"
              style={{ color: "#334155" }}
            >
              Apple
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="mt-8 items-center pb-4">
          {/* slate-500 = #64748b */}
          <Text className="text-sm" style={{ color: "#64748b" }}>
            Already have an account?{" "}
            <Text className="text-primary font-bold">Log in</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
