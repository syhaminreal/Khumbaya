import { Text } from "@/src/components/ui/Text";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, ScrollView, TouchableOpacity, View } from "react-native";

// Progress value (in percent)
const PROGRESS = 40; // TODO: derive from state/flow

// Calculate card width for 2-column grid
const SCREEN_WIDTH = Dimensions.get("window").width;
const PADDING = 24; // px-6 = 24px
const GAP = 16;
const CARD_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP) / 2;

type Category = {
  key: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

// Categories data (Photography and Music & DJ selected per reference) This will be fetched from API later
const CATEGORIES: Category[] = [
  { key: "catering", title: "Catering", icon: "restaurant" },
  { key: "photography", title: "Photography", icon: "photo-camera" },
  { key: "decor", title: "Decor", icon: "local-florist" },
  { key: "music", title: "Music & DJ", icon: "music-note" },
  { key: "venue", title: "Venue", icon: "castle" },
  { key: "makeup", title: "Makeup & Hair", icon: "face-retouching-natural" },
  { key: "planning", title: "Planning", icon: "edit-note" },
  { key: "transport", title: "Transport", icon: "directions-car" },
];

type CategorySelectionProps = {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  onBack: () => void;
  onNext: () => void;
};

// dark: styles removed for nativewind consistency
export default function CategorySelection({
  selectedCategories,
  onChange,
  onBack,
  onNext,
}: CategorySelectionProps) {
  const toggleCategory = (key: string) => {
    const updated = selectedCategories.includes(key)
      ? selectedCategories.filter((k) => k !== key)
      : [...selectedCategories, key];
    onChange(updated);
  };
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
            What services do you offer?
          </Text>
          {/* slate-600 = #475569 */}
          <Text
            className="text-base font-normal leading-relaxed"
            style={{ color: "#475569" }}
          >
            Choose one or more categories that best describe your business. This
            helps couples find you easily.
          </Text>
        </View>

        {/* Categories Grid */}
        <View
          className="mt-6 flex-row flex-wrap justify-between pb-8"
          style={{ gap: 16 }}
        >
          {CATEGORIES.map((item) => (
            <CategoryCard
              key={item.key}
              item={item}
              selected={selectedCategories.includes(item.key)}
              onSelect={() => toggleCategory(item.key)}
            />
          ))}
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
          {/* text-sm not available for icons; using size prop */}
          {/* primary = #ee2b8c (button bg) */}
          <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CategoryCard({
  item,
  selected,
  onSelect,
}: {
  item: Category;
  selected: boolean;
  onSelect: () => void;
}) {
  const isSelected = selected;
  return (
    <TouchableOpacity
      className={`relative rounded-2xl p-5 items-center justify-center shadow-sm ${
        isSelected
          ? "border-2 border-primary bg-primary/5"
          : "border-2 border-transparent bg-white"
      }`}
      style={{ width: CARD_WIDTH }}
      activeOpacity={0.9}
      onPress={onSelect}
    >
      {/* Icon circle */}
      {/* Unselected bg = #fcebf4; selected uses white bg */}
      <View
        className={`items-center justify-center rounded-full`}
        style={{
          width: 48,
          height: 48,
          backgroundColor: isSelected ? "#ffffff" : "#fcebf4",
        }}
      >
        {/* text-primary = #ee2b8c; dark text white */}
        <MaterialIcons
          name={item.icon}
          size={28}
          color={isSelected ? "#ee2b8c" : "#ee2b8c"}
        />
      </View>

      {/* Title */}
      <Text
        className={`${isSelected ? "text-primary" : "text-white"} text-sm font-bold leading-tight mt-3`}
        style={!isSelected ? { color: "#181114" } : undefined}
      >
        {item.title}
      </Text>

      {/* Checkmark */}
      <View className="absolute top-3 right-3">
        {isSelected ? (
          <MaterialIcons name="check-circle" size={20} color="#ee2b8c" />
        ) : (
          // Hidden placeholder in design; omit when not selected
          <View style={{ width: 20, height: 20, opacity: 0 }} />
        )}
      </View>
    </TouchableOpacity>
  );
}
