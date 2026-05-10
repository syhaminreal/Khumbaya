import { Text } from "@/src/components/ui/Text";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";

// Color constants from tailwind config:
// primary = #ee2b8c
// background-light = #f8f6f7
// background-dark = #221019
// gray-200 = #e5e7eb
// gray-400 = #9ca3af
// gray-500 = #6b7280
// gray-600 = #4b5563
// slate-900 = #0f172a
// slate-800 = #1e293b

type BusinessDetailProps = {
  data: {
    businessName: string;
    websiteOrLink: string;
    serviceableCities: string[];
    bio: string;
  };
  onChange: (updates: any) => void;
  onBack: () => void;
  onNext: () => void;
};

// dark: styles removed for nativewind consistency
export default function BusinessDetail({
  data,
  onChange,
  onBack,
  onNext,
}: BusinessDetailProps) {
  const [bioCharCount, setBioCharCount] = useState(data.bio.length);
  const [citiesOpen, setCitiesOpen] = useState(false);

  const handleBioChange = (text: string) => {
    if (text.length <= 500) {
      onChange({ bio: text });
      setBioCharCount(text.length);
    }
  };

  const availableCities = [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Miami",
  ];

  const toggleCity = (city: string) => {
    const updated = data.serviceableCities.includes(city)
      ? data.serviceableCities.filter((c) => c !== city)
      : [...data.serviceableCities, city];
    onChange({ serviceableCities: updated });
  };

  return (
    <View className="flex-1 bg-background-light ">
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
            Your Business Details
          </Text>
          {/* slate-600 = #475569 */}
          <Text
            className="text-base font-normal leading-relaxed"
            style={{ color: "#475569" }}
          >
            Help couples find you by sharing the basics about your services.
          </Text>
        </View>

        {/* Form Fields */}
        <View style={{ gap: 20 }}>
          {/* Business Name */}
          <View className="flex-col">
            {/* slate-900 = #0f172a */}
            <Text
              className="text-sm font-semibold leading-normal pb-2"
              style={{ color: "#0f172a" }}
            >
              Business Name
            </Text>
            <TextInput
              value={data.businessName}
              onChangeText={(v) => onChange({ businessName: v })}
              placeholder="e.g. Dreamy Weddings Co."
              placeholderTextColor="#9ca3af" // gray-400
              className="w-full rounded-xl p-4 text-base"
              style={{
                borderWidth: 1,
                borderColor: "#e5e7eb", // gray-200
                backgroundColor: "#ffffff",
                color: "#0f172a", // slate-900
              }}
            />
          </View>

          {/* Website / Social Link */}
          <View className="flex-col">
            <Text
              className="text-sm font-semibold leading-normal pb-2"
              style={{ color: "#0f172a" }}
            >
              Website or Instagram Link
            </Text>
            <View className="relative">
              <View className="absolute inset-y-0 left-0 pl-4 flex items-center">
                {/* gray-400 = #9ca3af */}
                <MaterialIcons name="link" size={20} color="#9ca3af" />
              </View>
              <TextInput
                value={data.websiteOrLink}
                onChangeText={(v) => onChange({ websiteOrLink: v })}
                placeholder="www.example.com"
                placeholderTextColor="#9ca3af"
                keyboardType="url"
                autoCapitalize="none"
                className="w-full rounded-xl p-4 pl-12 text-base"
                style={{
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  backgroundColor: "#ffffff",
                  color: "#0f172a",
                }}
              />
            </View>
          </View>

          {/* Serviceable Cities */}
          <View className="flex-col">
            <Text
              className="text-sm font-semibold leading-normal pb-2"
              style={{ color: "#0f172a" }}
            >
              Serviceable Cities
            </Text>
            <TouchableOpacity
              className="min-h-[56px] w-full items-center justify-between rounded-xl p-2 pr-4 flex-row"
              style={{
                borderWidth: 1,
                borderColor: "#e5e7eb", // gray-200
                backgroundColor: "#ffffff",
              }}
              onPress={() => setCitiesOpen(!citiesOpen)}
            >
              <View className="flex-row flex-wrap gap-2 pl-2 flex-1">
                {data.serviceableCities.length > 0 ? (
                  data.serviceableCities.map((city) => (
                    <View
                      key={city}
                      className="inline-flex items-center rounded-md px-2 py-1"
                      style={{
                        backgroundColor: "rgba(238, 43, 140, 0.1)", // primary/10
                        borderWidth: 1,
                        borderColor: "rgba(238, 43, 140, 0.3)", // primary/30
                      }}
                    >
                      <Text className="text-xs font-medium text-primary">
                        {city}
                      </Text>
                      <TouchableOpacity
                        onPress={() => toggleCity(city)}
                        className="ml-1"
                      >
                        <MaterialIcons name="close" size={14} color="#ee2b8c" />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text className="text-sm py-1" style={{ color: "#9ca3af" }}>
                    Select cities...
                  </Text>
                )}
              </View>
              {/* gray-400 = #9ca3af */}
              <MaterialIcons
                name="keyboard-arrow-down"
                size={24}
                color="#9ca3af"
              />
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {citiesOpen && (
              <View
                className="mt-2 rounded-xl overflow-hidden border"
                style={{
                  borderColor: "#e5e7eb",
                  backgroundColor: "#ffffff",
                }}
              >
                {availableCities.map((city) => (
                  <TouchableOpacity
                    key={city}
                    className="p-3 border-b flex-row items-center"
                    style={{ borderColor: "#e5e7eb" }}
                    onPress={() => toggleCity(city)}
                  >
                    <MaterialIcons
                      name={
                        data.serviceableCities.includes(city)
                          ? "check-circle"
                          : "radio-button-unchecked"
                      }
                      size={20}
                      color={
                        data.serviceableCities.includes(city)
                          ? "#ee2b8c"
                          : "#9ca3af"
                      }
                    />
                    <Text
                      className="ml-3 text-base"
                      style={{ color: "#0f172a" }}
                    >
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Helper Text */}
            {/* gray-500 = #6b7280 */}
            <Text className="text-xs mt-1.5" style={{ color: "#6b7280" }}>
              Select the main areas where you operate.
            </Text>
          </View>

          {/* About Bio */}
          <View className="flex-col">
            <View className="flex-row justify-between items-baseline pb-2">
              <Text
                className="text-sm font-semibold leading-normal"
                style={{ color: "#0f172a" }}
              >
                About Your Business
              </Text>
              {/* gray-400 = #9ca3af */}
              <Text className="text-xs" style={{ color: "#9ca3af" }}>
                {bioCharCount}/500
              </Text>
            </View>
            <TextInput
              value={data.bio}
              onChangeText={handleBioChange}
              placeholder="Tell us a bit about your style, experience, and what makes your service unique..."
              placeholderTextColor="#9ca3af"
              multiline
              className="w-full rounded-xl p-4 text-base"
              style={{
                minHeight: 140,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                backgroundColor: "#ffffff",
                color: "#0f172a",
                textAlignVertical: "top",
              }}
            />
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <View className="px-6">
        <TouchableOpacity
          className="w-full rounded-full bg-primary py-4 px-6 flex-row items-center justify-center gap-2"
          activeOpacity={0.9}
          onPress={onNext}
        >
          <Text className="text-white text-base font-bold leading-tight">
            Continue
          </Text>
          <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
