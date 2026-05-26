import { Button } from "@/src/components/ui/Button";
import { Text } from "@/src/components/ui/Text";
import { COUNTRY_DATA } from "@/src/constants/countrydata";
import { useSignup } from "@/src/features/user/api/use-user";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image, KeyboardAvoidingView,
  Platform, Pressable, TextInput, TouchableOpacity, View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { CountryOption, CountryPickerModal } from "../ui/CountryPhone";

type SignupDashboardFormData = {
  username: string;
  email: string;
  phone: string;
  password: string;
  agreedToTerms: boolean;
};

export default function SignupDashboard() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { mutate: signup, isPending } = useSignup();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupDashboardFormData>({
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      password: "",
      agreedToTerms: false,
    },
    mode: "onTouched",
  });

  const agreedToTerms = watch("agreedToTerms");
const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRY_DATA[0]);
    const [pickerVisible, setPickerVisible] = useState(false);
   const phone = watch("phone");
    const digits = phone.replace(/\D/g, "");
  const fullPhone = `+${selectedCountry.dialCode}-${digits}`;

  const handleSignUp = handleSubmit((formData) => {
    const { agreedToTerms: _, ...signupData } = {...formData,phone:fullPhone};

    signup(signupData, {
      onSuccess: () => {
        router.replace("/(protected)/(client-tabs)/home");
      },
    });
  });
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
    >
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 35,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={40}
        scrollEnabled={true}
      >
     
        <View className="pt-4">
          <Text className="text-3xl font-jakarta-bold text-text-light">
            Let's get started
          </Text>
          <Text className="text-base text-muted-light mt-2">
            Enter your details to begin planning your dream event.
          </Text>
        </View>
           <CountryPickerModal
          visible={pickerVisible}
          selected={selectedCountry}
          onSelect={setSelectedCountry}
          onClose={() => setPickerVisible(false)}
        />

        <View className="gap-6 pt-6">
          <View className="gap-2">
            <Text className="text-xs font-jakarta-semibold uppercase tracking-wider text-text-light">
              Full Name
            </Text>
            <Controller
              control={control}
              name="username"
              rules={{ required: "Full name is required" }}
              render={({ field: { value, onChange: onFieldChange } }) => (
                <TextInput
                  value={value}
                  onChangeText={onFieldChange}
                  placeholder="Jane Doe"
                  placeholderTextColor="#896175"
                  className={`h-14 rounded-md border bg-white px-4 text-base text-text-light ${errors.username ? "border-red-500" : "border-border"
                    }`}
                />
              )}
            />
            {errors.username && (
              <Text className="text-xs text-red-500">{errors.username.message}</Text>
            )}
          </View>

          <View className="gap-2">
            <Text className="text-xs font-jakarta-semibold uppercase tracking-wider text-text-light">
              Email Address
            </Text>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email",
                },
              }}
              render={({ field: { value, onChange: onFieldChange } }) => (
                <TextInput
                  value={value}
                  onChangeText={onFieldChange}
                  placeholder="jane@example.com"
                  placeholderTextColor="#896175"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className={`h-14 rounded-xl border bg-white px-4 text-base text-text-light ${errors.email ? "border-red-500" : "border-border"
                    }`}
                />
              )}
            />
            {errors.email && (
              <Text className="text-xs text-red-500">{errors.email.message}</Text>
            )}
          </View>

        
            <View>
              <Text className="mb-1 ml-1 text-xs font-semibold uppercase tracking-wider text-text-light">
                Phone number
              </Text>
              <View className="h-14 flex-row items-center rounded-md border border-gray-200 bg-white overflow-hidden">

                {/* Country trigger — opens full-screen modal */}
              <Pressable
                onPress={() =>setPickerVisible(true)}
                    className="h-full flex-row items-center gap-1.5 px-3 border-r border-gray-200">

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
                  name="phone"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="Enter phone number"
                      placeholderTextColor="#896175"
                      keyboardType="phone-pad"
                      editable={true}
                      className="flex-1 px-4 text-base text-text-light"
                    />
                  )}
                />
                </View>
              </View>

          <View className="gap-2">
            <Text className="text-xs font-jakarta-semibold uppercase tracking-wider text-text-light">
              Password
            </Text>
            <View
              className={`flex-row items-center rounded-xl border bg-white px-4 ${errors.password ? "border-red-500" : "border-border"
                }`}
            >
              <Controller
                control={control}
                name="password"
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                }}
                render={({ field: { value, onChange: onFieldChange } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onFieldChange}
                    placeholder="At least 8 characters"
                    placeholderTextColor="#896175"
                    secureTextEntry={!showPassword}
                    className="flex-1 py-4 text-base text-text-light"
                  />
                )}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                accessibilityRole="button"
              >
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={22}
                  color="#896175"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text className="text-xs text-red-500">{errors.password.message}</Text>
            )}
          </View>

          {/* Terms and Conditions Checkbox */}
          <Controller
            control={control}
            name="agreedToTerms"
            rules={{
              validate: (value) => value || "Please agree to the terms",
            }}
            render={({ field: { value, onChange: onFieldChange } }) => (
              <TouchableOpacity
                onPress={() => onFieldChange(!value)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: value }}
                className="flex-row items-center gap-2"
              >
                <View
                  className={`w-5 h-5 rounded border-2 ${value ? "bg-primary border-primary" : "border-gray-400"} items-center justify-center`}
                >
                  {value && <MaterialIcons name="check" size={14} color="white" />}
                </View>
                <Text className="text-sm text-muted-light">
                  I agree to the{" "}
                  <Text className="text-primary font-bold">Terms of Service</Text> and{" "}
                  <Text className="text-primary font-bold">Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            )}
          />
          {errors.agreedToTerms && (
            <Text className="text-xs text-red-500">{errors.agreedToTerms.message}</Text>
          )}
        </View>

        <View className="mt-auto gap-4 pt-8">
          <Button
            onPress={handleSignUp}
            disabled={!agreedToTerms || isPending}
            className={`rounded-xl ${!agreedToTerms || isPending ? "opacity-50" : ""}`}
          >
            {isPending ? "Signing Up..." : "Sign Up"}
          </Button>

          <TouchableOpacity accessibilityRole="button" className="items-center">
            <Link href="/(onboarding)/login" asChild>
              <Pressable>
                <Text className="text-sm text-muted-light">
                  Already have an account?{" "}
                  <Text className="text-primary">Log in</Text>
                </Text>
              </Pressable>
            </Link>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
}
