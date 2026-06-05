import { Text } from "@/src/components/ui/Text";
import { useCreatepackage } from "@/src/features/packages";
import { _entering, _exiting, _layoutAnimation, shadowStyle } from "@/src/utils/helper";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type LineItem = {
  id: string;
  title: string;
  rate: string;
  quantity: string;
  amount: string;
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const initialItems: LineItem[] = [
  
];

export default function PackageCreateScreen() {
  const router = useRouter();
  const {businessId} = useLocalSearchParams();
  const [title, setTitle] = useState("");
  const { mutate: createPackage } = useCreatepackage(Number(businessId));
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [items, setItems] = useState<LineItem[]>(initialItems);

  const isLoading = false;

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      const value = parseFloat(item.amount);
      if (Number.isNaN(value)) return sum;
      return sum + value;
    }, 0);
  }, [items]);

  const handleAddItem = () => {
    setItems((prev) => [
      { id: createId(), title: "", rate: "", quantity: "1", amount: "" },
      ...prev,
    ]);
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const calculateAmount = (rate: string, quantity: string): string => {
    const rateNum = parseFloat(rate);
    const qtyNum = parseFloat(quantity);
    if (Number.isNaN(rateNum) || Number.isNaN(qtyNum)) return "";
    return (rateNum * qtyNum).toFixed(2);
  };

  const handleUpdateRate = (id: string, rate: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const amount = calculateAmount(rate, item.quantity);
        return { ...item, rate, amount };
      })
    );
  };

  const handleUpdateQuantity = (id: string, quantity: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const amount = calculateAmount(item.rate, quantity);
        return { ...item, quantity, amount };
      })
    );
  };

  const handleUpdateAmount = (id: string, amount: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const amountNum = parseFloat(amount);
        const qtyNum = parseFloat(item.quantity) || 1;
        if (!Number.isNaN(amountNum)) {
          const newRate = (amountNum / qtyNum).toFixed(2);
          return { ...item, amount, rate: newRate };
        }
        return { ...item, amount };
      })
    );
  };

  const handleUpdateTitle = (id: string, title: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title } : item))
    );
  };
  const savePackageClick = () => {
    createPackage({
      businessId: Number(businessId),
      title: title,
      totalAmount: basePrice ? (totalAmount + parseFloat(basePrice)).toFixed(2) : totalAmount.toFixed(2),
      currency: "USD",
      items: items.map(({ id, ...rest }) => ({ ...rest, group: "", remark: "" })),
   } ,{onSuccess : () => {router.back() }} 
     )
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#f8f6f7] items-center justify-center">
        <ActivityIndicator color="#ee2b8c" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f8f6f7]">
      <View className="bg-white border-b border-gray-100 px-4 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full items-center justify-center"
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={22} color="#ee2b8c" />
          </TouchableOpacity>
          <Text variant="h1" className="text-base text-[#ee2b8c]">
            New Package
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity activeOpacity={0.8} className="px-3 py-2"
          onPress={savePackageClick}
          >
            <Text variant="h1" className="text-xs text-[#ee2b8c]">
              Save
            </Text>
          </TouchableOpacity>
      
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-6">
          <View
            className="bg-white border border-gray-200 rounded-md p-5 mb-6"
            style={shadowStyle}
          >
            <Text className="text-xs uppercase tracking-wider text-gray-400 mb-5 font-semibold">
              Package Details
            </Text>

            <View className="gap-5">
              <View>
                <Text className="text-xs font-semibold uppercase tracking-wider text-[#594048] mb-2">
                  Package Title
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Premium Wedding Bundle"
                  placeholderTextColor="#896175"
                  className="h-14 bg-white border border-gray-200 rounded-md px-4 text-base text-text-light"
                />
              </View>

              {/* <View>
                <Text className="text-xs font-semibold uppercase tracking-wider text-[#594048] mb-2">
                  Description
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe what's included..."
                  placeholderTextColor="#896175"
                  multiline
                  numberOfLines={3}
                  className="bg-white border border-gray-200 rounded-md px-4 py-3 text-base text-text-light"
                />
              </View> */}

              <View>
                <Text className="text-xs font-semibold uppercase tracking-wider text-[#594048] mb-2">
                  Base Price
                </Text>
                <View className="flex-row items-center h-14 rounded-md border border-gray-200 bg-white overflow-hidden">
                  <View className="h-full flex-row items-center px-4 border-r border-gray-200">
                    <Text variant="h1" className="text-[#ee2b8c] text-base">$</Text>
                  </View>
                  <TextInput
                    value={basePrice}
                    onChangeText={setBasePrice}
                    placeholder="0.00"
                    placeholderTextColor="#896175"
                    keyboardType="decimal-pad"
                    className="flex-1 px-4 text-base text-text-light h-full"
                  />
                </View>
              </View>
            </View>
          </View>

          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xs uppercase tracking-widest text-gray-400">
                Line Items
              </Text>
              <TouchableOpacity
                onPress={handleAddItem}
                className="flex-row items-center gap-1"
                activeOpacity={0.8}
              >
                <MaterialIcons name="add-circle" size={18} color="#ee2b8c" />
                <Text variant="h1" className="text-xs text-[#ee2b8c]">
                  Add Package Item
                </Text>
              </TouchableOpacity>
            </View>

            <View className="gap-3">
              {items.map((item, index) => (
                <Animated.View
                  entering={_entering}
                  layout={_layoutAnimation}
                  exiting={_exiting}
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-md p-4"
                  style={shadowStyle}
                >
                  <View className="flex-row items-center gap-3 mb-3">
                    <Text className="text-xs text-gray-400 w-6">{index + 1}.</Text>
                    <TextInput
                      value={item.title}
                      onChangeText={(value) => handleUpdateTitle(item.id, value)}
                      placeholder="Item title"
                      placeholderTextColor="#896175"
                      className="flex-1 h-12 bg-white border border-gray-200 rounded-md px-3 text-base text-text-light"
                    />
                    <TouchableOpacity
                      onPress={() => handleDeleteItem(item.id)}
                      activeOpacity={0.8}
                      className="p-2"
                    >
                      <MaterialIcons name="delete" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center gap-2 pl-9">
                    <View className="flex-1">
                      <Text className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                        Rate
                      </Text>
                      <View className="flex-row items-center h-12 rounded-md border border-gray-200 bg-white overflow-hidden">
                        <View className="h-full flex-row items-center px-3 border-r border-gray-200">
                          <Text className="text-xs text-gray-400">$</Text>
                        </View>
                        <TextInput
                          value={item.rate}
                          onChangeText={(value) => handleUpdateRate(item.id, value)}
                          placeholder="0.00"
                          placeholderTextColor="#896175"
                          keyboardType="decimal-pad"
                          className="flex-1 px-3 text-base text-text-light h-full"
                        />
                      </View>
                    </View>

                    <View className="w-20">
                      <Text className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                        Qty
                      </Text>
                      <TextInput
                        value={item.quantity}
                        onChangeText={(value) => handleUpdateQuantity(item.id, value)}
                        placeholder="1"
                        placeholderTextColor="#896175"
                        keyboardType="decimal-pad"
                        className="h-12 bg-white border border-gray-200 rounded-md px-2 text-base text-text-light w-full text-center"
                      />
                    </View>

                    <View className="flex-1">
                      <Text className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                        Amount
                      </Text>
                      <View className="flex-row items-center h-12 rounded-md border border-gray-200 bg-white overflow-hidden">
                        <View className="h-full flex-row items-center px-3 border-r border-gray-200">
                          <Text className="text-xs text-gray-400">$</Text>
                        </View>
                        <TextInput
                          value={item.amount}
                          onChangeText={(value) => handleUpdateAmount(item.id, value)}
                          placeholder="0.00"
                          placeholderTextColor="#896175"
                          keyboardType="decimal-pad"
                        className="flex-1 px-4 text-base text-text-light h-full text-right"

                        />
                      </View>
                    </View>
                  </View>
                </Animated.View>
              ))}
            </View>
          </View>

          <Animated.View
            layout={_layoutAnimation}
            className="bg-[#f3f4f5] border border-pink-100 rounded-md p-5"
            style={shadowStyle}
          >
            <View className="flex-row items-center gap-2 mb-4">
              <MaterialIcons name="inventory" size={20} color="#ee2b8c" />
              <Text variant="h1" className="text-base text-[#181114]">
                Package Summary
              </Text>
            </View>

            <View className="gap-3 mb-5">
              {items.map((item) => (
                <View
                  key={`summary-${item.id}`}
                  className="flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-2 flex-1">
                    <MaterialIcons name="check-circle" size={14} color="#16a34a" />
                    <Text className="text-xs text-[#594048]" numberOfLines={1}>
                      {item.title || "Untitled item"}
                    </Text>
                    <Text className="text-[10px] text-gray-400">
                      ({item.quantity || 1} × ${item.rate || "0.00"})
                    </Text>
                  </View>
                  <Text className="text-xs text-[#181114] ">
                    ${item.amount || "0.00"}
                  </Text>
                </View>
              ))}
            </View>

            <View className="border-t border-pink-100 pt-4 gap-2">
              <View className="flex-row items-center justify-between">
                <Text variant="h1" className="text-sm text-[#181114]">
                  Calculated Total
                </Text>
                <Text variant="h1" className="text-base text-[#ee2b8c]">
                  ${totalAmount.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-[11px] text-gray-500">Base Price Adjustment</Text>
                <Text className="text-[11px] text-gray-600">
                  ${basePrice || "0.00"}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      
    </SafeAreaView>
  );
}