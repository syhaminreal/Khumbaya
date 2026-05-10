import { Text } from "@/src/components/ui/Text";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

// Color constants from tailwind config:
// primary = #ee2b8c
// background-light = #f8f6f7
// background-dark = #221019
// text-light = #181114
// gray-100 = #f3f4f6
// gray-200 = #e5e7eb
// gray-400 = #9ca3af
// gray-500 = #6b7280
// gray-600 = #4b5563

type BusinessType = "company" | "individual" | null;

type TellUsProps = {
  selectedType: BusinessType;
  onChange: (type: BusinessType) => void;
  onBack: () => void;
  onNext: () => void;
};

// dark: styles removed for nativewind consistency
export default function TellUs({
  selectedType,
  onChange,
  onBack,
  onNext,
}: TellUsProps) {
  return (
    <View className="flex-1 bg-background-light">
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
            Tell us about you
          </Text>
          {/* slate-600 = #475569 */}
          <Text
            className="text-base font-normal leading-relaxed"
            style={{ color: "#475569" }}
          >
            Choose your business structure to help us customize your profile.
          </Text>
        </View>

        {/* Selection Grid */}
        <View style={{ gap: 16 }}>
          {/* Option 1: Company / Agency */}
          <TouchableOpacity
            className="relative"
            onPress={() => onChange("company")}
            activeOpacity={0.8}
          >
            <View
              className="flex-col items-center p-6 rounded-xl shadow-sm"
              style={{
                backgroundColor:
                  selectedType === "company"
                    ? "rgba(238, 43, 140, 0.05)"
                    : "#ffffff",
                borderWidth: 2,
                borderColor:
                  selectedType === "company" ? "#ee2b8c" : "transparent",
              }}
            >
              <View
                className="mb-4 p-4 rounded-full items-center justify-center"
                style={{ backgroundColor: "#f8f6f7" }} // background-light
              >
                {/* primary = #ee2b8c */}
                <MaterialIcons name="domain" size={32} color="#ee2b8c" />
              </View>
              {/* text-light = #181114 */}
              <Text
                className="text-lg font-bold mb-2"
                style={{ color: "#181114" }}
              >
                Company / Agency
              </Text>
              {/* gray-500 = #6b7280 */}
              <Text
                className="text-sm text-center"
                style={{ color: "#6b7280" }}
              >
                I represent a registered business entity with a team.
              </Text>

              {/* Checkmark for selected state */}
              {selectedType === "company" && (
                <View className="absolute top-4 right-4">
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color="#ee2b8c"
                  />
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Option 2: Individual Professional */}
          <TouchableOpacity
            className="relative"
            onPress={() => onChange("individual")}
            activeOpacity={0.8}
          >
            <View
              className="flex-col items-center p-6 rounded-xl shadow-sm"
              style={{
                backgroundColor:
                  selectedType === "individual"
                    ? "rgba(238, 43, 140, 0.05)"
                    : "#ffffff",
                borderWidth: 2,
                borderColor:
                  selectedType === "individual" ? "#ee2b8c" : "transparent",
              }}
            >
              <View
                className="mb-4 p-4 rounded-full items-center justify-center"
                style={{ backgroundColor: "#f8f6f7" }} // background-light
              >
                <MaterialIcons name="person" size={32} color="#ee2b8c" />
              </View>
              <Text
                className="text-lg font-bold mb-2"
                style={{ color: "#181114" }}
              >
                Individual Professional
              </Text>
              <Text
                className="text-sm text-center"
                style={{ color: "#6b7280" }}
              >
                I am a freelancer or solo vendor working independently.
              </Text>

              {/* Checkmark for selected state */}
              {selectedType === "individual" && (
                <View className="absolute top-4 right-4">
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color="#ee2b8c"
                  />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
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
