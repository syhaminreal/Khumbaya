import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Modal, Switch, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { Text } from "../ui/Text";

type Props = {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  cities: string[];
  selectedCity: string;
  onCityChange: (city: string) => void;
  showFavouritesOnly: boolean;
  onFavouritesChange: (value: boolean) => void;
  isLoggedIn: boolean;
};

export function HeaderExploreVendor({
  searchQuery,
  onSearchChange,
  cities,
  selectedCity,
  onCityChange,
  showFavouritesOnly,
  onFavouritesChange,
  isLoggedIn,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const showFilterButton = cities.length > 1 || isLoggedIn;
  const hasActiveFilter = selectedCity !== "All" || showFavouritesOnly;

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

        {showFilterButton && (
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            className="h-12 w-12 bg-white border border-gray-200 rounded-xl items-center justify-center"
            accessibilityLabel="Open filters"
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
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View className="flex-1 bg-black/35 justify-end">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowPicker(false)}
            className="absolute inset-0"
          />
          <View className="bg-white rounded-t-3xl px-5 pt-5 pb-10">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-4" />

            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg text-gray-900" variant="h2">
                Filters
              </Text>
              <TouchableOpacity
                onPress={() => setShowPicker(false)}
                className="h-8 w-8 items-center justify-center rounded-full bg-gray-100"
                accessibilityLabel="Close filters"
              >
                <Ionicons name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {isLoggedIn && (
              <>
                <Text className="text-xs text-gray-400 uppercase tracking-widest mb-2 px-1">
                  My Favourites
                </Text>
                <View className="flex-row items-center justify-between px-4 py-3.5 rounded-xl border border-gray-200 bg-white mb-5">
                  <View className="flex-row items-center gap-3">
                    <Ionicons
                      name={showFavouritesOnly ? "heart" : "heart-outline"}
                      size={18}
                      color={showFavouritesOnly ? "#EC4899" : "#6B7280"}
                    />
                    <Text className={`text-sm ${showFavouritesOnly ? "text-primary" : "text-gray-800"}`}>
                      Show favourites only
                    </Text>
                  </View>
                  <Switch
                    value={showFavouritesOnly}
                    onValueChange={onFavouritesChange}
                    trackColor={{ false: "#E5E7EB", true: "#FBCFE8" }}
                    thumbColor={showFavouritesOnly ? "#EC4899" : "#9CA3AF"}
                  />
                </View>
              </>
            )}

            <Text className="text-xs text-gray-400 uppercase tracking-widest mb-2 px-1">
              City
            </Text>
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
