import { Text } from "@/src/components/ui/Text";
import { LAYOUT } from "@/src/constants/layout";
import {
    useCreateGift,
    useCreateGiftCategory,
    useGiftCategoriesByEvent,
    useGiftsByEvent,
} from "@/src/features/gifts/hooks/use-gifts";
import { _entering, _exiting, _layoutAnimation } from "@/src/utils/helper";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {useEventStore} from "@/src/features/events/store/useEventStore";
import { useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const GiftAddScreen = () => {
    const router = useRouter();
    const { eventId } = useLocalSearchParams() as { eventId?: string };
        const event = useEventStore((state) => state.eventDraft);
    const giftNameInputRef = useRef<TextInput>(null);
    const [giftName, setGiftName] = useState("");
    const [giftValue, setGiftValue] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [giftCount, setGiftCount] = useState("1");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    if (!eventId) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-gray-500">Missing event information.</Text>
            </View>
        );
    }
    const { data: categories = [] } = useGiftCategoriesByEvent(eventId );
    const { data: gifts = [], isLoading: isGiftsLoading } = useGiftsByEvent(eventId);
    console.log("This is the category list int he gift add screen😘screen😘screen😘", categories);
    const createCategoryMutation = useCreateGiftCategory();
    const createGiftMutation = useCreateGift();

    const categoryOptions = useMemo(
        () =>
            categories?.map((category) => ({
                label: category.name,
                value: category.name,
            })),
        [categories]
    );

    const formattedValue = useMemo(() => {
        if (!giftValue.trim()) return "0.00";
        const numericValue = Number(giftValue);
        if (Number.isNaN(numericValue)) return "0.00";
        return numericValue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }, [giftValue]);

    const handleCreateCategory = async () => {
        const trimmedName = newCategoryName.trim();
        if (!eventId) {
            Alert.alert("Missing Event", "Event ID is required to create a category.");
            return;
        }
        if (!trimmedName) {
            Alert.alert("Category name required", "Please enter a category name.");
            return;
        }

        try {
            await createCategoryMutation.mutateAsync({
                eventId,
                payload: { name: trimmedName },
            });
            setSelectedCategory(trimmedName);
            setNewCategoryName("");
            setIsCategoryModalVisible(false);
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to create category.";
            Alert.alert("Error", message);
        }
    };

    const handleSaveGift = async () => {
        const trimmedName = giftName.trim();
        if (!eventId) {
            Alert.alert("Missing Event", "Event ID is required to save a gift.");
            return;
        }
        if (!trimmedName) {
            Alert.alert("Gift name required", "Please enter a gift name.");
            return;
        }
        if (!selectedCategory) {
            Alert.alert("Category required", "Please select a gift category.");
            return;
        }

        const numericValue = giftValue.trim() ? Number(giftValue) : undefined;
        if (giftValue.trim() && Number.isNaN(numericValue)) {
            Alert.alert("Invalid value", "Estimated value must be a number.");
            return;
        }

        const numericCount = Number(giftCount);
        if (!Number.isInteger(numericCount) || numericCount < 1) {
            Alert.alert("Invalid count", "Total number of gifts must be a whole number greater than 0.");
            return;
        }

        try {
            await createGiftMutation.mutateAsync({
                eventId,
                payload: {
                    name: trimmedName,
                    category: selectedCategory,
                    value: numericValue,
                    count: numericCount,
                },
            });
            setGiftName("");
            setGiftValue("");
            setGiftCount("1");
            setSelectedCategory(null);
            setShowCreateForm(false);
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to save gift.";
            Alert.alert("Error", message);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <View
                className="flex-row items-center justify-between border-b border-slate-200 bg-white"
                style={{ height: LAYOUT.headerHeight, paddingHorizontal: LAYOUT.screenPaddingX }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"
                >
                    <Ionicons name="arrow-back" size={20} color="#181114" />
                </TouchableOpacity>
                <Text className="text-sm font-bold">{event?.title && event.title.length > 10 ? event.title.slice(0, 20) + " Gifts" : " Gifts"}</Text>
                <View className="flex-row items-center" style={{ gap: 10 }}>
                    <TouchableOpacity
                        onPress={() => {}}
                        className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"
                    >
                        <Ionicons name="search" size={18} color="#111827" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setShowCreateForm((prev) => !prev)}
                        className="h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20"
                    >
                        <Ionicons
                            name={showCreateForm ? "close" : "add"}
                            size={20}
                            color="#EE2B8C"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAwareScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: LAYOUT.screenPaddingX,
                    paddingTop: LAYOUT.screenPaddingTop,
                    paddingBottom: LAYOUT.screenPaddingBottom + 32,
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {showCreateForm && (
                    <Animated.View className="mb-6"
                    layout ={_layoutAnimation} 
                    entering={_entering}
                    exiting={_exiting}
                    >
                        <View
                            className="bg-primary overflow-hidden"
                            style={{ height: 144, borderRadius: LAYOUT.cardRadius }}
                        >
                            <View className="absolute -top-10 -right-5 h-48 w-48 rounded-full bg-white/10" />
                            <View className="flex-1 justify-between p-5">
                                <View className="flex-row items-start justify-between">
                                    <View>
                                        <Text className="text-white text-2xl font-bold">
                                            Start the Celebration
                                        </Text>
                                        <Text className="text-white/80 text-xs mt-1">
                                            Thoughtful gifts make moments unforgettable
                                        </Text>
                                    </View>
                                    <Ionicons name="sparkles" size={28} color="rgba(255,255,255,0.5)" />
                                </View>
                                <TouchableOpacity
                                    onPress={() => giftNameInputRef.current?.focus()}
                                    className="self-start flex-row items-center bg-white px-4 py-2 rounded-full"
                                    style={{ gap: 6 }}
                                >
                                    <Text className="text-primary text-xs font-semibold">
                                        Start adding details
                                    </Text>
                                    <Ionicons name="arrow-forward" size={16} color="#EE2B8C" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                )}

                {showCreateForm && (
                <Animated.View style={{ gap: LAYOUT.sectionGap }} layout={_layoutAnimation} entering={_entering} exiting={_exiting} >
                    <View style={{ gap: LAYOUT.fieldGap }}>
                        <Text className="text-xs font-semibold text-slate-500 ml-1">
                            Gift Name
                        </Text>
                        <TextInput
                            ref={giftNameInputRef}
                            value={giftName}
                            onChangeText={setGiftName}
                            placeholder="e.g. Vintage Porcelain Set"
                            placeholderTextColor="#94a3b8"
                            className="border border-slate-200 bg-white text-sm text-[#181114]"
                            style={{
                                height: LAYOUT.inputHeight,
                                borderRadius: LAYOUT.cardRadius,
                                paddingHorizontal: 16,
                            }}
                        />
                    </View>

                    <View style={{ gap: LAYOUT.fieldGap }}>
                        <Text className="text-xs font-semibold text-slate-500 ml-1">
                            Estimated Value
                        </Text>
                        <View className="flex-row items-center border border-slate-200 bg-white"
                            style={{
                                height: LAYOUT.inputHeight,
                                borderRadius: LAYOUT.cardRadius,
                                paddingHorizontal: 16,
                            }}
                        >
                            <Text className="text-sm font-semibold text-slate-400">$</Text>
                            <TextInput
                                value={giftValue}
                                onChangeText={setGiftValue}
                                placeholder="0.00"
                                keyboardType="decimal-pad"
                                placeholderTextColor="#94a3b8"
                                className="flex-1 text-sm text-[#181114] ml-2"
                            />
                        </View>
                    </View>
                    <View style={{ gap: LAYOUT.fieldGap }}>
                        <Text className="text-xs font-semibold text-slate-500 ml-1">
                           Total Number of Gifts
                        </Text>
                        <TextInput
                            value={giftCount}
                            onChangeText={setGiftCount}
                            placeholder="1"
                            keyboardType="number-pad"
                            placeholderTextColor="#94a3b8"
                            className="border border-slate-200 bg-white text-sm text-[#181114]"
                            style={{
                                height: LAYOUT.inputHeight,
                                borderRadius: LAYOUT.cardRadius,
                                paddingHorizontal: 16,
                            }}
                        />
                    </View>
                    <View style={{ gap: LAYOUT.fieldGap }}>
                        <Text className="text-xs font-semibold text-slate-500 ml-1">
                            Category
                        </Text>
                        <View className="flex-row items-center" style={{ gap: 10 }}>
                   {categories.length > 0 && (
                            <View className="flex-1">
                                <Dropdown
                                    data={categoryOptions}
                                    labelField="label"
                                    valueField="value"
                                    value={selectedCategory}
                                    placeholder="Select a category"
                                    onChange={(item) => setSelectedCategory(item.value)}
                                    style={{
                                        height: LAYOUT.inputHeight,
                                        borderWidth: 1,
                                        borderColor: "#e2e8f0",
                                        borderRadius: LAYOUT.cardRadius,
                                        paddingHorizontal: 16,
                                        backgroundColor: "#ffffff",
                                    }}
                                    placeholderStyle={{ color: "#94a3b8", fontSize: 14 }}
                                    selectedTextStyle={{ color: "#181114", fontSize: 14 }}
                                    containerStyle={{ borderRadius: 12 }}
                                />
                            </View>
                            )}
                            <TouchableOpacity
                                onPress={() => setIsCategoryModalVisible(true)}
                                className={
                                    categories.length > 0
                                        ? "items-center justify-center bg-primary/10   border border-primary/20"
                                        : "flex-1 items-center justify-center bg-primary/10 border border-primary/20"
                                }
                                style={{
                                    height: categories.length > 0 ? LAYOUT.inputHeight : LAYOUT.buttonHeight,
                                    width: categories.length > 0 ? LAYOUT.inputHeight : undefined,
                                    borderRadius: LAYOUT.cardRadius,
                                    paddingHorizontal: categories.length > 0 ? 0 : 16,
                                }}
                            >
                                <View className="flex-row items-center" style={{ gap: 8 }}>
                                    <View className="h-8 w-8 items-center justify-center rounded-full">
                                        <Ionicons name="add" size={18} color="#EE2B8C" />
                                    </View>
                                    {categories.length === 0 && (
                                        <Text className="text-black text-sm font-bold">
                                            Add your first category
                                         
                                        </Text>
                                        
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleSaveGift}
                        className="bg-primary items-center justify-center"
                        style={{ height: LAYOUT.buttonHeight, borderRadius: LAYOUT.cardRadius }}
                        disabled={createGiftMutation.isPending}
                    >
                        <Text className="text-white text-sm font-semibold">
                            {createGiftMutation.isPending ? "Saving..." : "Save Gift"}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
                )}

                <Animated.View className="mt-8" style={{ gap: 12 }} layout={_layoutAnimation} entering={_entering} exiting={_exiting}>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-semibold text-[#181114]">
                            Available gifts
                        </Text>
                        <Text className="text-xs text-slate-500">
                            {gifts.length} items
                        </Text>
                    </View>

                    {isGiftsLoading ? (
                        <View className="py-6 items-center justify-center">
                            <ActivityIndicator size="small" color="#EE2B8C" />
                        </View>
                    ) : gifts.length === 0 ? (
                        <View
                            className="border border-slate-100 bg-white items-center justify-center"
                            style={{ borderRadius: LAYOUT.cardRadius, padding: 16 }}
                        >
                            <Text className="text-sm text-slate-500">
                                No gifts added yet.
                            </Text>
                        </View>
                    ) : (
                        gifts.map((gift) => (
                            <View
                                key={gift.id}
                                className="border border-slate-100 bg-white"
                                style={{ borderRadius: LAYOUT.cardRadius, padding: 16 }}
                            >
                                <View className="flex-row items-start justify-between">
                                    <View className="flex-1">
                                        <Text className="text-base font-semibold text-[#181114]">
                                            {gift.name}
                                        </Text>
                                        <Text className="text-xs text-slate-500 mt-1">
                                            {gift.category || "Uncategorized"}
                                        </Text>
                                    </View>
                                    <Text className="text-primary font-semibold">
                                        {gift.value != null
                                            ? `$${Number(gift.value).toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}`
                                            : "$0.00"}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </Animated.View>
            </KeyboardAwareScrollView>

            <Modal
                visible={isCategoryModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsCategoryModalVisible(false)}
            >
                <View className="flex-1 bg-black/35 justify-end">
                    <Pressable
                        className="absolute inset-0"
                        onPress={() => setIsCategoryModalVisible(false)}
                    />

                    <View
                        className="bg-white px-5 pt-5 pb-7"
                        style={{
                            borderTopLeftRadius: LAYOUT.bottomSheetRadius,
                            borderTopRightRadius: LAYOUT.bottomSheetRadius,
                        }}
                    >
                        <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-3" />
                        <View className="  flex-row items-center justify-between mb-3">
                            <Text className="text-base font-bold text-[#181114] ">
                                Add Category
                            </Text>
                            <TouchableOpacity
                                onPress={() => setIsCategoryModalVisible(false)}
                            >
                                <Ionicons name="close" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-xs text-slate-500 mb-4">
                            Create a custom label to keep your registry organized.
                        </Text>
                        <TextInput
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                            placeholder="e.g. Garden Party Essentials"
                            placeholderTextColor="#94a3b8"
                            className="border border-slate-200 bg-white text-sm text-[#181114]"
                            style={{
                                height: LAYOUT.inputHeight,
                                borderRadius: LAYOUT.cardRadius,
                                paddingHorizontal: 16,
                            }}
                        />
                        <View className="flex-row items-center justify-end mt-5" style={{ gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => setIsCategoryModalVisible(false)}
                                className="px-4 py-2"
                            >
                                <Text className="text-sm text-slate-500">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleCreateCategory}
                                className="bg-primary px-5 py-2 rounded-full"
                                disabled={createCategoryMutation.isPending}
                            >
                                <Text className="text-sm text-white font-semibold">
                                    {createCategoryMutation.isPending ? "Saving..." : "Create"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default GiftAddScreen;