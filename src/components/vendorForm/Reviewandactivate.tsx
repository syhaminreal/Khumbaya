import React from "react";
import {
  ImageBackground,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Styled components for Nativewind compatibility

// dark: styles removed for nativewind consistency
const ProfileActivation = ({ progress, onBack, onNext }: any) => {
  return (
    <SafeAreaView className="flex-1 bg-[#f8f6f7]">
      {/* Optimized: Used hex #f8f6f7 for background-light and #221019 for background-dark */}
      <StatusBar barStyle="dark-content" />

      <View className="flex-1">
        {/* Top App Bar */}
        <View className="flex-row items-center px-4 py-3 justify-between bg-[#f8f6f7]/95">
          <TouchableOpacity className="size-10 items-center justify-center rounded-full bg-black/5">
            {/* Replace with Icon: arrow_back */}
            <Text className="text-[#181114] text-xl">←</Text>
          </TouchableOpacity>
          <Text className="text-[#181114] text-lg font-bold tracking-tight">
            Review & Activate
          </Text>
          <View className="size-10" />
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Bar */}
          <View className="py-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-[#181114] text-sm font-medium">
                Step 4 of 4
              </Text>
              {/* Optimized: Used hex #ee2b8c for primary */}
              <Text className="text-xs font-bold text-[#ee2b8c]">100%</Text>
            </View>
            <View className="h-2 w-full rounded-full bg-[#ee2b8c]/20">
              <View
                className="h-2 rounded-full bg-[#ee2b8c]"
                style={{ width: "100%" }}
              />
            </View>
          </View>
          {/* Hero Image Section */}
          <View className="w-full aspect-[16/9] rounded-2xl overflow-hidden mb-6 shadow-sm bg-gray-200">
            <ImageBackground
              source={{
                uri: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
              }}
              className="w-full h-full justify-end"
            >
              <View className="absolute inset-0 bg-black/20" />
              <View className="absolute bottom-3 right-3 bg-white/90 px-3 py-1 rounded-full flex-row items-center">
                <Text className="text-green-600 text-xs font-bold mr-1">✓</Text>
                <Text className="text-xs font-bold text-green-700">
                  Ready to Review
                </Text>
              </View>
            </ImageBackground>
          </View>

          {/* Headline */}
          <View className="mb-2 items-center">
            <Text className="text-[#181114] text-2xl font-bold">
              You're all set!
            </Text>
          </View>
          {/* Trust Message */}
          <View className="mb-8 items-center">
            <Text className="text-gray-600 text-base text-center leading-6">
              Once you activate, our team will verify your documents and
              business details within{" "}
              <Text className="font-semibold text-[#ee2b8c]">24 hours</Text> to
              ensure quality for our couples.
            </Text>
          </View>

          {/* Vendor Summary Card */}
          <VendorCard />

          {/* Bottom Padding for Scroll */}
          <View className="h-32" />
        </ScrollView>

        {/* Fixed Bottom Action Area */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-8">
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-full bg-[#ee2b8c] h-14 rounded-xl flex-row items-center justify-center shadow-lg"
            style={{
              shadowColor: "#ee2b8c",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <Text className="text-white font-bold text-lg mr-2">
              Activate My Profile
            </Text>
            {/* Replace with Icon: rocket_launch */}
            <Text className="text-white text-xl">🚀</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Internal Child Component
// dark: styles removed for nativewind consistency
const VendorCard = () => {
  return (
    <View className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      {/* Optimized: Used hex #2F1522 for card-dark */}

      {/* Header */}
      <View className="flex-row items-center gap-3 mb-4 pb-4 border-b border-gray-100">
        <View className="size-12 rounded-full bg-[#ee2b8c]/10 items-center justify-center">
          <Text className="text-[#ee2b8c]">📷</Text>
        </View>
        <View>
          <Text className="text-lg font-bold text-[#181114]">
            Luxe Event Photography
          </Text>
          <Text className="text-sm text-gray-500">
            Photography & Videography
          </Text>
        </View>
      </View>

      {/* Details */}
      <View className="gap-y-3">
        <DetailItem
          icon="💎"
          label="Primary Service"
          value="Full Day Wedding Package"
        />
        <DetailItem icon="📍" label="Location" value="San Francisco, CA" />
      </View>

      {/* Edit Action */}
      <TouchableOpacity className="mt-5 w-full py-2 flex-row items-center justify-center">
        <Text className="text-sm font-medium text-gray-500">
          ✎ Edit Details
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// dark: styles removed for nativewind consistency
const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View className="flex-row items-start gap-3">
    <Text className="text-gray-400 mt-0.5">{icon}</Text>
    <View>
      <Text className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </Text>
      <Text className="text-sm font-medium text-[#181114]">{value}</Text>
    </View>
  </View>
);

export default ProfileActivation;
