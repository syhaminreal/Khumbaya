import { VendorCard } from "@/src/components/onboarding/VendorCard";
import { Text } from "@/src/components/ui/Text";
import { useGetFavourites } from "@/src/features/favourite/hooks/use-favourite";
import { Business } from "@/src/features/business/types";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { ActivityIndicator, FlatList, View } from "react-native";

function businessToVendor(b: Business) {
  return {
    id: String(b.id),
    name: b.businessName,
    category: b.category ?? "",
    rating: 0,
    reviews: 0,
    location: [b.city, b.country].filter(Boolean).join(", "),
    image: b.avatar ?? b.cover ?? "",
  };
}

export default function FavouritesScreen() {
  const { data: favourites = [], isLoading } = useGetFavourites();

  return (
    <>
      <Stack.Screen options={{ title: "My Favourites" }} />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ec4899" />
        </View>
      ) : favourites.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <MaterialIcons name="favorite-border" size={48} color="#d1d5db" />
          <Text variant="h1" className="text-gray-400 text-center">
            No favourites yet
          </Text>
          <Text variant="caption" className="text-gray-400 text-center">
            Tap the heart on any vendor to save them here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favourites}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerClassName="p-4 gap-4"
          columnWrapperClassName="gap-4"
          renderItem={({ item }) => (
            <View className="flex-1">
              <VendorCard vendor={businessToVendor(item)} />
            </View>
          )}
        />
      )}
    </>
  );
}
