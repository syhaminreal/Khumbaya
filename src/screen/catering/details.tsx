import { useCateringById } from "@/src/features/catering";
import { useDeleteMenuMutation, useMenuList } from "@/src/features/catering/menu";
import { useThrottledRouter } from "@/src/hooks/useThrottledRouter";
import { formatDateTimeRangeVerbose, toISODateString } from "@/src/utils/helper";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
        ActivityIndicator,
        ScrollView,
        Text,
        TouchableOpacity,
        View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const categoryOrder = [
        "Appetizer",
        "Starter",
        "Main Course",
        "Dessert",
        "Beverage",
        "Other",
];

const CATEGORY_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
        Appetizer: "restaurant",
        Starter: "restaurant",
        "Main Course": "dinner-dining",
        Dessert: "cake",
        Beverage: "local-drink",
        Other: "restaurant-menu",
};

export default function CateringDetailsScreen() {
        const router = useRouter();
        const { push } = useThrottledRouter();
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
        } = useMenuList(cateringId, menuPage, 100, { enabled: !!cateringId });

        const deleteMenuMutation = useDeleteMenuMutation();

        const handleDeleteMenuItem = (menuId: number) => {
                deleteMenuMutation.mutate(menuId);
        };

        const groupedMenus = useMemo(() => {
                return (menuData || []).reduce((acc: any, item: any) => {
                        const key = item.menuType ?? item.type ?? "Other";
                        (acc[key] ??= []).push(item);
                        return acc;
                }, {});
        }, [menuData]);

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

        const expandedCategories = useMemo(
                () =>
                  sortedCategories.reduce<Record<string, boolean>>((acc, category) => {
                                acc[category] = true;
                                return acc;
                        }, {}),
                [sortedCategories]
        );

        const toggleCategory = (category: string) => {
                void category;
        };

        const handleAddMenu = () => {
                if (isViewerMode) return;
                router.push({
                        pathname: "./[cateringId]/add-menu",
                        params: { eventId, cateringId },
                });
        };

        if (isLoadingCatering) {
                return (
                        <SafeAreaView className="flex-1 bg-surface items-center justify-center">
                                <ActivityIndicator size="large" color="#ee2b8c" />
                        </SafeAreaView>
                );
        }

        if (cateringError || !catering) {
                return (
                        <SafeAreaView className="flex-1 bg-surface px-4 items-center justify-center">
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

        return (
                <SafeAreaView className="flex-1 bg-surface" edges={["top", "bottom"]}>

                        <Stack.Screen
                                options={{
                                        headerLeft: () => (
                                                <TouchableOpacity
                                                        onPress={() => router.back()}
                                                        className="h-9 w-9 items-center justify-center"
                                                >
                                                        <MaterialIcons name="keyboard-arrow-left" size={32} color="#ee2b8c" />
                                                </TouchableOpacity>
                                        ),
                                        title: "Catering Details",
                                        headerTitleAlign: "center",
                                        headerRight: () => (
                                                !isViewerMode ? (
                                                                        <TouchableOpacity
                                                                                onPress={() =>
                                                                                        push({
                                                                                                pathname: "./[cateringId]/edit",
                                                                                                params: { eventId, cateringId, isEdit: "true" },
                                                                                        })
                                                                                }
                                                                                className="h-9 w-9 items-center justify-center"
                                                                        >
                                                                <MaterialIcons name="edit" size={20} color="#181114" />
                                                        </TouchableOpacity>
                                                ) : null
                                        ),
                                }}
                        />

                        <ScrollView className="flex-1 px-4 pb-6" contentContainerStyle={{ paddingBottom: 40 }}>
                                {/* Catering Overview */}
                                <View className="space-y-5 mb-8">
                                        <View className="flex-row items-start justify-between">
                                                <View>
                                                        <Text className="text-lg font-bold text-on-surface mb-1">
                                                                {catering.name}
                                                        </Text>
                                                        <View className="space-y-1.5">
                                                                <View className="flex-row items-center gap-2">
                                                                        <MaterialIcons name="schedule" size={18} color="#594048" />
                                                                        <Text className="text-sm text-on-surface-variant leading-tight">
                                                                                {formatDateTimeRangeVerbose(
                                                                                        toISODateString(catering.startDateTime),
                                                                                        toISODateString(catering.endDateTime)
                                                                                )}
                                                                        </Text>
                                                                </View>
                                                                <View className="flex-row items-center gap-2 mt-1">
                                                                        <MaterialIcons name="storefront" size={18} color="#594048" />
                                                                        <Text className="text-sm text-on-surface-variant">
                                                                                {catering.vendorId ? "Vendor Assigned" : "No vendor assigned"}
                                                                        </Text>
                                                                </View>
                                                        </View>
                                                </View>
                                                <View className="px-3 py-1 bg-tertiary-container rounded-full border border-tertiary-container">
                                                        <Text className="text-tertiary font-semibold text-xs">
                                                                {catering.mealType}
                                                        </Text>
                                                </View>
                                        </View>

                                        {/* Stats Cards */}
                                                        <View className="flex-row gap-4 pt-2">
                                                <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-surface-container items-center justify-center">
                                                        <MaterialIcons name="attach-money" size={26} color="#ee2b8c" className="mb-1" />
                                                        <Text className="text-xl font-semibold text-on-surface mt-2">
                                                                {catering.perPlateprice ? `$${catering.perPlateprice}` : "N/A"}
                                                        </Text>
                                                        <Text className="text-xs text-on-surface-variant mt-1 uppercase tracking-wider">
                                                                Per plate
                                                        </Text>
                                                </View>
                                                <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-surface-container items-center justify-center">
                                                        <MaterialIcons name="restaurant" size={26} color="#ee2b8c" className="mb-1" />
                                                        <Text className="text-xl font-semibold text-on-surface mt-2">
                                                                {menuData?.length || 0}
                                                        </Text>
                                                        <Text className="text-xs text-on-surface-variant mt-1 uppercase tracking-wider">
                                                                Menu items
                                                        </Text>
                                                </View>
                                        </View>
                                </View>

                                {/* Menu Section */}
                                <View className="space-y-6">
                                        <View className="flex-row items-center justify-between mb-4">
                                                <Text className="text-2xl font-bold text-on-surface">Menu</Text>
                                                {!isViewerMode && (
                                                        <TouchableOpacity
                                                                onPress={handleAddMenu}
                                                                className="bg-primary px-4 py-2 rounded-full flex-row items-center gap-1.5"
                                                        >
                                                                <MaterialIcons name="add" size={18} color="#ffffff" />
                                                                <Text className="text-white font-semibold text-sm">Add item</Text>
                                                        </TouchableOpacity>
                                                )}
                                        </View>

                                        {sortedCategories.map((category) => {
                                                const isExpanded = expandedCategories[category];
                                                const items = groupedMenus[category];
                                                const iconName = CATEGORY_ICONS[category] || "restaurant-menu";

                                                return (
                                                        <View
                                                                key={category}
                                                                className="bg-white rounded-xl overflow-hidden border border-surface-container shadow-sm mb-4"
                                                        >
                                                                {/* Category Header */}
                                                                <TouchableOpacity
                                                                        onPress={() => toggleCategory(category)}
                                                                        className="w-full flex-row items-center justify-between p-4 bg-surface-container"
                                                                >
                                                                        <View className="flex-row items-center gap-3">
                                                                                <MaterialIcons name={iconName} size={24} color="#ee2b8c" />
                                                                                <Text className="font-semibold text-on-surface text-base ml-2">
                                                                                        {category}
                                                                                </Text>
                                                                              
                                                                        </View>
                                                                        
                                                                </TouchableOpacity>

                                                                {/* Category Items List */}
                                                                {isExpanded && (
                                                                        <View className="px-4 pb-2">
                                                                                {items.map((item: any, index: number) => (
                                                                                        <View
                                                                                                        key={item.id}
                                                                                                        className={`py-4 flex-row items-center justify-between ${index !== items.length - 1
                                                                                                                        ? "border-b border-surface-container"
                                                                                                                        : ""
                                                                                                        }`}
                                                                                        >
                                                                                                <View className="flex-row items-start gap-4 flex-1">
                                                                                                        <View className="h-7 w-7 rounded-full bg-surface-container items-center justify-center">
                                                                                                                <Text className="text-[11px] font-semibold text-on-surface-variant">
                                                                                                                        {index + 1}
                                                                                                                </Text>
                                                                                                        </View>
                                                                                                        <View className="flex-1">
                                                                                                                <Text className="font-medium text-on-surface text-base">
                                                                                                                        {item.name}
                                                                                                                </Text>
                                                                                                                <Text className="text-xs text-on-surface-variant mt-0.5">
                                                                                                                        {item.description || item.menuType || category}
                                                                                                                </Text>
                                                                                                                {item.note ? (
                                                                                                                        <Text className="text-[11px] text-on-surface-variant mt-1.5">
                                                                                                                                Note: {item.note}
                                                                                                                        </Text>
                                                                                                                ) : null}
                                                                                                        </View>
                                                                                                </View>
                                                                                                <View className="items-end gap-2">
                                                                                                        <View className="px-2.5 py-1 rounded-full bg-surface-container border border-surface-container">
                                                                                                                <Text className="text-[10px] font-semibold text-on-surface-variant">
                                                                                                                        Guests {item.guestCount ?? "—"}
                                                                                                                </Text>
                                                                                                        </View>
                                                                                                        {!isViewerMode && (
                                                                                                                <TouchableOpacity
                                                                                                                        onPress={() => handleDeleteMenuItem(item.id)}
                                                                                                                        disabled={deleteMenuMutation.isPending}
                                                                                                                        className="h-8 w-8 items-center justify-center rounded-full bg-red-50"
                                                                                                                >
                                                                                                                        <MaterialIcons name="delete-outline" size={18} color="#ef4444" />
                                                                                                                </TouchableOpacity>
                                                                                                        )}
                                                                                                </View>
                                                                                        </View>
                                                                                ))}
                                                                        </View>
                                                                )}
                                                        </View>
                                                );
                                        })}

                                        {/* Menu Footer Summary */}
                                        {menuData && menuData.length > 0 && (
                                                <View className="pt-4 flex-row items-center justify-center gap-2 opacity-80 mt-2">
                                                        <MaterialIcons name="info" size={18} color="#594048" />
                                                        <Text className="text-sm text-on-surface-variant">
                                                                {menuData.length} items · {sortedCategories.length} categories
                                                        </Text>
                                                </View>
                                        )}
                                </View>
                        </ScrollView>
                </SafeAreaView>
        );
}
