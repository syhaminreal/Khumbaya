import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Modal, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { Text } from "../ui/Text";

type Props = {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  cities: string[];
  selectedCity: string;
  onCityChange: (city: string) => void;
};

export function HeaderExploreVendor({
  searchQuery,
  onSearchChange,
  cities,
  selectedCity,
  onCityChange,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const showCityFilter = cities.length > 1;
  const hasActiveFilter = selectedCity !== "All";

  return (
    <View className="pt-6 pb-2 bg-gray-50">
      <View className="flex-row items-center mb-4 px-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
        >
          <Ionicons name="chevron-back" size={20} color="#ee2b8c" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-2xl text-gray-900" variant="h1">
          Find your dream team
        </Text>
        <View className="h-10 w-10" />
      </View>

      <View className="mx-4 flex-row items-center gap-2">
        <View className="flex-1 flex-row items-center h-12 bg-white rounded-2xl px-4 border border-gray-100">
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 h-full px-3 text-base text-gray-900"
            placeholder="Search photographers, venues..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>

        {showCityFilter && (
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            className="h-12 w-12 bg-white border border-gray-200 rounded-xl items-center justify-center"
          >
            <View className="items-center">
              <Ionicons name="funnel-outline" size={18} color="#374151" />
              {hasActiveFilter && (
                <View className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <View className="flex-1 bg-black/35 justify-end">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowPicker(false)}
            className="absolute inset-0"
          />
          <View className="bg-white rounded-t-3xl px-5 pt-5 pb-7">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-3" />
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base text-gray-900" variant="h2">
                Filter by city
              </Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {cities.map((city) => {
              const isActive = selectedCity === city;
              return (
                <TouchableOpacity
                  key={city}
                  onPress={() => {
                    onCityChange(city);
                    setShowPicker(false);
                  }}
                  className={`flex-row items-center justify-between px-4 py-3.5 rounded-xl border mb-2 ${
                    isActive
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <Text className={`text-sm ${isActive ? "text-primary" : "text-gray-800"}`}>
                    {city}
                  </Text>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={18} color="#EC4899" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}
