import { useToggleFavourite } from "@/src/features/favourite/hooks/use-favourite";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, View } from "react-native";
import { Text } from "../ui/Text";
import type { Vendor } from "@/src/utils/type/vendor";

export function VendorCard({ vendor }: { vendor: Vendor }) {
  const router = useRouter();
  const goToVendorDetail = () => {
    router.push(`/(shared)/explore/${vendor.id}`);
  };
  const { isFavourite, toggle } = useToggleFavourite(Number(vendor.id));

  return (
    <Pressable
      className="bg-white rounded-xl overflow-hidden"
      onPress={goToVendorDetail}
    >
      <View className="relative w-full aspect-[4/3] bg-gray-200">
        <Image
          source={{ uri: vendor.image }}
          className="w-full h-full"
          resizeMode="cover"
        />

        <Pressable
          onPress={() => toggle()}
          className="absolute top-3 right-3 bg-white/20 rounded-full p-2"
        >
          <MaterialIcons
            name={isFavourite ? "favorite" : "favorite-border"}
            size={20}
            color="white"
          />
        </Pressable>

        <View className="absolute bottom-3 left-3 bg-white/90 rounded-lg px-2 py-1 flex-row items-center gap-1">
          <MaterialIcons name="star" size={16} color="#EAB308" />
          <Text variant="caption" className="font-bold text-gray-900">
            {vendor.rating}
          </Text>
          <Text variant="caption" className="text-xs text-gray-500">
            ({vendor.reviews})
          </Text>
        </View>
      </View>

      <View className="p-4 gap-2">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-lg text-gray-900" variant="h1">
              {vendor.name}
            </Text>
            <Text
              variant="caption"
              className="text-primary/90 text-sm mt-1 shadow-[0_0_15px_5px_primary]"
            >
              {vendor.category}
            </Text>
          </View>
          {vendor.priceLevel && (
            <View className="bg-success-50 px-2 py-1 rounded">
              <Text variant="caption" className="text-success-700 font-semibold ">
                {vendor.priceLevel}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center gap-1 mt-1">
          <MaterialIcons name="location-on" size={18} color="#6B7280" />
          <Text variant="caption" className="text-gray-500">
            {vendor.location}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
