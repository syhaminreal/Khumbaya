import { Text } from "@/src/components/ui/Text";
import { useAuthStore } from "@/src/store/AuthStore";
import { MaterialIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Animated, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import BusinessDetail from "./BuisnessDetail";
import CategorySelection from "./CategorySelection";
import MakeOfficial from "./MakeOfficial";
import TellUs from "./TellUs";
import VendorContacts from "./VendorContacts";
const uploadedFileSchema = z
  .union([
    z.object({
      name: z.string(),
      size: z.number(),
    }),
    z.null(),
  ])
  .refine((value) => value !== null, "Document is required");

const vendorFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  countryCode: z.string().min(1, "Country code is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (value) => value.replace(/\D/g, "").length === 10,
      "Phone must be 10 digits"
    ),
  password: z.string().min(8, "Min 8 characters"),
  businessType: z.enum(["company", "individual"]).nullable(),
  selectedCategories: z.array(z.string()),
  businessName: z.string(),
  websiteOrLink: z.string(),
  serviceableCities: z.array(z.string()),
  bio: z.string(),
  docType: z.enum(["government", "business"]),
  uploadedFile: uploadedFileSchema,
});

type VendorFormValues = z.input<typeof vendorFormSchema>;
type VendorFormOutput = z.infer<typeof vendorFormSchema>;
type BusinessType = VendorFormValues["businessType"];

const TOTAL_STEPS = 5;

// dark: styles removed for nativewind consistency
export default function VendorFormFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const { setAuth } = useAuthStore();
  const formMethods = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      countryCode: "US +1",
      phone: "",
      password: "",
      businessType: null,
      selectedCategories: [],
      businessName: "",
      websiteOrLink: "",
      serviceableCities: [],
      bio: "",
      docType: "government",
      uploadedFile: null,
    },
    mode: "onTouched",
  });
  const { getValues, handleSubmit, register, reset, watch, trigger } =
    formMethods;

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(20)).current;

  const progress = (currentStep / TOTAL_STEPS) * 100;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    register("uploadedFile");
    register("docType");
  }, [register]);

  const stepFields: Record<number, (keyof VendorFormValues)[]> = {
    1: ["fullName", "email", "countryCode", "phone", "password"],
    2: ["businessType"],
    3: ["selectedCategories"],
    4: ["businessName", "websiteOrLink", "serviceableCities", "bio"],
    5: ["uploadedFile"],
  };

  const handleNext = useCallback(async () => {
    const fields = stepFields[currentStep] ?? [];
    if (fields.length > 0) {
      const isValid = await trigger(fields);
      if (!isValid) return;
    }

    const nextStep = currentStep + 1;
    if (nextStep <= TOTAL_STEPS) {
      if (nextStep < TOTAL_STEPS) {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        });
      }
      setCurrentStep(nextStep);
    } else {
      // Final submission logic here
      const finalData = getValues();

      // You can replace the above line with your actual submission logic (e.g., API call)
    }
  }, [currentStep, fadeAnim, trigger]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev > 1) {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        });
        return prev - 1;
      }
      return prev;
    });
  }, [fadeAnim]);

  const updateFormData = (updates: Partial<VendorFormValues>) => {
    reset(
      {
        ...getValues(),
        ...updates,
      },
      {
        keepDirty: true,
        keepTouched: true,
        keepErrors: true,
      }
    );
  };

  const formValues = watch();

  const handleSubmitFinal = handleSubmit(async (finalData) => {
    await AsyncStorage.setItem("vendorData", JSON.stringify(finalData));
    setAuth("demo-vendor-token", {
      id: `vendor-${Date.now()}`,
      email: finalData.email,
      name: finalData.fullName,
    });
  });

  // Map of step IDs to components
  const steps: Record<number, React.ReactNode> = {
    1: (
      <>
        <Header handleBack={handleBack} progress={progress} currentStep={1} />
        <VendorContacts onBack={handleBack} onNext={handleNext} />
      </>
    ),
    2: (
      <>
        <Header handleBack={handleBack} progress={progress} currentStep={2} />
        <TellUs
          selectedType={formValues.businessType}
          onChange={(type) => updateFormData({ businessType: type })}
          onBack={handleBack}
          onNext={handleNext}
        />
      </>
    ),
    3: (
      <>
        <Header handleBack={handleBack} progress={progress} currentStep={3} />
        <CategorySelection
          selectedCategories={formValues.selectedCategories}
          onChange={(categories) =>
            updateFormData({ selectedCategories: categories })
          }
          onBack={handleBack}
          onNext={handleNext}
        />
      </>
    ),
    4: (
      <>
        <Header handleBack={handleBack} progress={progress} currentStep={4} />
        <BusinessDetail
          data={{
            businessName: formValues.businessName,
            websiteOrLink: formValues.websiteOrLink,
            serviceableCities: formValues.serviceableCities,
            bio: formValues.bio,
          }}
          onChange={(updates) => updateFormData(updates)}
          onBack={handleBack}
          onNext={handleNext}
        />
      </>
    ),
    5: (
      <>
        {/* Top App Bar */}
        <Header handleBack={handleBack} progress={progress} currentStep={5} />
        <MakeOfficial
          onBack={handleBack}
          onNext={handleNext}
          onSubmit={handleSubmitFinal}
        />
      </>
    ),
  };

  return (
    <FormProvider {...formMethods}>
      <View className="flex-1 bg-background-light">
        <SafeAreaView className="flex-1">
          {/* Progress bar  */}
          {steps[currentStep]}
        </SafeAreaView>
        {/* Button to update the current or the submit based on the number of the steps */}
      </View>
    </FormProvider>
  );
}

// dark: styles removed for nativewind consistency
function Header({
  handleBack,
  progress,
  currentStep,
}: {
  handleBack: () => void;
  progress: number;
  currentStep: number;
}) {
  return (
    <>
      <View className="flex-row items-center px-4 pt-6 pb-2 justify-between">
        <TouchableOpacity
          className="items-center justify-center rounded-full"
          accessibilityRole="button"
          onPress={handleBack}
        >
          {/* text-light = #181114 (commented for reference); dark text is white */}
          {/* TODO: Add text-light to tailwind config as #181114 */}
          <MaterialIcons name="arrow-back-ios-new" size={24} color="#181114" />
        </TouchableOpacity>
        <Text
          className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10 text-white"
          style={{ color: "#181114" }}
        >
          Vendor Onboarding
        </Text>
      </View>

      <View className="flex-col gap-2 px-6 pb-4">
        <View className="flex-row gap-6 justify-between items-center">
          {/* text-light = #181114 */}
          <Text className="text-sm font-semibold" style={{ color: "#181114" }}>
            Step {currentStep} of 5
          </Text>
          {/* primary = #ee2b8c */}
          <Text className="text-xs font-bold text-primary">{progress}%</Text>
        </View>
        {/* Track background light = #e6dbe0 (not in config) */}
        <View
          className="h-2 w-full rounded-full overflow-hidden"
          style={{ backgroundColor: "#e6dbe0" }}
        >
          {/* Fill primary = #ee2b8c */}
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>
    </>
  );
}
