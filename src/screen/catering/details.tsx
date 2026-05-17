import { Text } from "@/src/components/ui/Text";
import { useCateringById } from "@/src/features/catering";
import { useMenuList } from "@/src/features/catering/menu";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORY_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  Starter: "restaurant-menu",
  "Main Course": "local-dining",
  Dessert: "cake",
  Beverage: "local-drink",
  Appetizer: "dinner-dining",
};

const MEAL_TYPE_COLORS: Record<string, string> = {
  Breakfast: "#f59e0b",
  Lunch: "#10b981",
  "High Tea": "#8b5cf6",
  Dinner: "#3b82f6",
  "Late Night": "#6366f1",
};

const DIET_CONFIG: Record<string, { color: string; label: string }> = {
  Vegetarian: { color: "#16a34a", label: "Veg" },
  "Non-Vegetarian": { color: "#dc2626", label: "Non-Veg" },
  Vegan: { color: "#059669", label: "Vegan" },
};

const VegDot = ({ isVegetarian, type }: { isVegetarian: boolean; type?: string }) => {
  const diet = type ? DIET_CONFIG[type] : null;
  const color = diet?.color ?? (isVegetarian ? "#16a34a" : "#dc2626");
  return (
    <View
      style={{ borderColor: color }}
      className="w-4 h-4 rounded-sm border items-center justify-center"
    >
      <View
        style={{ backgroundColor: color }}
        className="w-2 h-2 rounded-full"
      />
    </View>
  );
};

const MenuItemCard = ({ item, onPress }: { item: any; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.6}
    className="flex-row items-center gap-3 py-3 px-4 mb-2 bg-surface-light rounded-xl border border-outline-variant/10"
  >
    <VegDot isVegetarian={item.isVegetarian} type={item.type} />
    <View className="flex-1">
      <Text className="text-sm font-semibold text-on-surface">{item.name}</Text>
      {item.description ? (
        <Text className="text-xs text-muted-light mt-0.5" numberOfLines={1}>
          {item.description}
        </Text>
      ) : null}
    </View>
    <MaterialIcons name="chevron-right" size={16} color="#ccc" />
  </TouchableOpacity>
);

const CategorySection = ({
  category,
  items,
  onItemPress,
}: {
  category: string;
  items: any[];
  onItemPress: (id: number) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const icon = CATEGORY_ICONS[category] || "restaurant-menu";

  return (
    <View className="mb-4">
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between py-2.5 px-4 bg-primary/5 rounded-xl mb-2"
        activeOpacity={0.6}
      >
        <View className="flex-row items-center gap-2">
          <MaterialIcons name={icon} size={16} color="#ee2b8c" />
          <Text className="text-sm font-bold text-on-surface">{category}</Text>
          <View className="bg-primary/10 rounded-full px-2 py-0.5">
            <Text className="text-xs font-bold text-primary">{items.length}</Text>
          </View>
        </View>
        <MaterialIcons
          name={isExpanded ? "expand-less" : "expand-more"}
          size={18}
          color="#999"
        />
      </TouchableOpacity>

      {isExpanded &&
        items.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onPress={() => onItemPress(item.id)}
          />
        ))}
    </View>
  );
};

const StatPill = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) => (
  <View className="flex-1 bg-surface-light rounded-2xl px-4 py-3 border border-outline-variant/10 items-center">
    <MaterialIcons name={icon} size={20} color="#ee2b8c" />
    <Text className="text-base font-black text-on-surface mt-1">{value}</Text>
    <Text className="text-xs text-muted-light mt-0.5">{label}</Text>
  </View>
);

export default function CateringDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const eventId = Number(params.eventId);
  const cateringId = Number(params.cateringId);
  const isGuest = params.isGuest === "true";
  const isSubEvent = params.isSubEvent === "true";
  const isViewerMode = isGuest || isSubEvent;

  const [menuPage] = useState(1);

  const {
    data: catering,
    isLoading: isLoadingCatering,
    error: cateringError,
    refetch: refetchCatering,
  } = useCateringById(cateringId, { enabled: !!cateringId });

  const {
    data: menuData,
    isLoading: isLoadingMenu,
    error: menuError,
    refetch: refetchMenu,
  } = useMenuList(cateringId, menuPage, 100, { enabled: !!cateringId });

  const groupedMenus = useMemo(() => {
    return (menuData || []).reduce((acc: any, item: any) => {
      const key = item.menuType ?? "Other";
      (acc[key] ??= []).push(item);
      return acc;
    }, {});
  }, [menuData]);

  const categoryOrder = ["Starter", "Appetizer", "Main Course", "Beverage", "Dessert"];
  const sortedCategories = useMemo(() => {
    return Object.keys(groupedMenus).sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [groupedMenus]);

  const vegCount = useMemo(
    () => (menuData || []).filter((i: any) => i.isVegetarian).length,
    [menuData]
  );

  const handleAddMenu = () => {
    if (isViewerMode) return;

    router.push({
      pathname:
        "./[cateringId]/add-menu",
      params: { eventId, cateringId },
    });
  };

  if (isLoadingCatering) {
    return (
      <SafeAreaView className="flex-1 bg-background-light items-center justify-center">
        <ActivityIndicator size="large" color="#ee2b8c" />
      </SafeAreaView>
    );
  }

  if (cateringError || !catering) {
    return (
      <SafeAreaView className="flex-1 bg-background-light px-4 items-center justify-center">
        <MaterialIcons name="error-outline" size={40} color="#ee2b8c" />
        <Text className="text-on-surface font-bold text-base mt-4">
          Failed to load catering details
        </Text>
        <TouchableOpacity
          onPress={() => refetchCatering()}
          className="mt-3 px-5 py-2 bg-primary rounded-xl"
        >
          <Text className="text-white font-bold text-sm">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const mealColor = MEAL_TYPE_COLORS[catering.mealType] ?? "#ee2b8c";
  const startDate = new Date(catering.startDateTime);
  const endDate = new Date(catering.endDateTime);

  return (
    <View className="flex-1 bg-background-light">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
        refreshControl={
          <RefreshControl
            refreshing={isLoadingCatering || isLoadingMenu}
            onRefresh={() => {
              refetchCatering();
              refetchMenu();
            }}
            tintColor="#ee2b8c"
          />
        }
      >
        {/* Hero Header */}
        <View className="bg-surface-light px-5 pt-5 pb-6 border-b border-outline-variant/10">
          <View className="flex-row items-start justify-between mb-3">
            <Text className="text-2xl font-black text-on-surface flex-1 mr-3" numberOfLines={2}>
              {catering.name}
            </Text>
            {catering.mealType ? (
              <View
                style={{ backgroundColor: mealColor + "18", borderColor: mealColor + "40" }}
                className="rounded-full px-3 py-1 border"
              >
                <Text style={{ color: mealColor }} className="text-xs font-bold">
                  {catering.mealType}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="flex-row items-center gap-1 mb-1">
            <MaterialIcons name="schedule" size={13} color="#999" />
            <Text className="text-xs text-muted-light">
              {startDate.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              –{" "}
              {endDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <MaterialIcons name="storefront" size={13} color="#999" />
            <Text className="text-xs text-muted-light">
              {catering.vendorId ? "Vendor assigned" : "No vendor assigned"}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row gap-3 px-5 mt-4">
          <StatPill
            icon="attach-money"
            label="Per plate"
            value={`$${catering.perPlateprice}`}
          />
          <StatPill
            icon="restaurant"
            label="Menu items"
            value={String(menuData?.length ?? 0)}
          />
          {/* <StatPill
            icon="eco"
            label="Veg items"
            value={String(vegCount)}
          /> */}
        </View>

        {/* Menu Section */}
        <View className="px-5 mt-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-base font-black text-on-surface">Menu</Text>
            {!isViewerMode && (
              <TouchableOpacity
                onPress={handleAddMenu}
                className="flex-row items-center gap-1 bg-primary px-3 py-1.5 rounded-full"
                activeOpacity={0.7}
              >
                <MaterialIcons name="add" size={14} color="#fff" />
                <Text className="text-xs font-bold text-white">Add item</Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoadingMenu && !menuData ? (
            <ActivityIndicator size="small" color="#ee2b8c" className="mt-6" />
          ) : menuError ? (
            <View className="py-4">
              <Text className="text-sm text-red-500">Failed to load menu items.</Text>
              <TouchableOpacity onPress={() => refetchMenu()} className="mt-2">
                <Text className="text-sm text-primary font-semibold">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : sortedCategories.length > 0 ? (
            <>
              {sortedCategories.map((category) => (
                <CategorySection
                  key={category}
                  category={category}
                  items={groupedMenus[category]}
                  onItemPress={() => {}}
                />
              ))}
              <View className="flex-row items-center gap-1.5 mt-3">
                <MaterialIcons name="info-outline" size={12} color="#bbb" />
                <Text className="text-xs text-muted-light">
                  {menuData?.length ?? 0} items · {sortedCategories.length} categories
                </Text>
              </View>
            </>
            ) : (
            <View className="items-center justify-center py-16 bg-surface-light rounded-2xl border border-outline-variant/10">
              <MaterialIcons name="restaurant-menu" size={36} color="#ddd" />
              <Text className="text-sm font-semibold text-muted-light mt-3">
                No menu items yet
              </Text>
              {!isViewerMode && (
                <TouchableOpacity
                  onPress={handleAddMenu}
                  className="mt-4 bg-primary px-5 py-2 rounded-full"
                >
                  <Text className="text-sm font-bold text-white">+ Add first item</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
