export { default } from "./gallery";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ImageUpload from "../ui/ImageUpload";

interface GalleryImage {
  id: string;
  uri: string;
  uploadedAt: string;
}

export function GalleryImageCard({
  image,
  onDelete,
}: {
  image: GalleryImage;
  onDelete: (id: string) => void;
}) {
  return (
    <View className="w-[32%] aspect-square m-[2px] rounded-lg overflow-hidden">
      <Image
        source={{ uri: image.uri }}
        className="w-full h-full"
        resizeMode="cover"
      />
      <View className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-1">
        <Text className="text-[8px] text-white" numberOfLines={1}>
          {image.uploadedAt}
        </Text>
      </View>
      <TouchableOpacity
        className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
        onPress={() => onDelete(image.id)}
      >
        <Ionicons name="close" size={12} color="white" />
      </TouchableOpacity>
    </View>
  );
}

 export  function EmptyGallery() {
  return (
    <View className="py-8 items-center">
      <Ionicons name="images-outline" size={48} color="#D1D5DB" />
      <Text className="text-sm text-gray-500 mt-2">No photos uploaded yet</Text>
      <Text className="text-xs text-gray-400 mt-1">
        Add photos using the button above
      </Text>
    </View>
  );
}

 function GalleryScreen() {
  const [images, setImages] = useState<GalleryImage[]>([]);

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const handleImageAdd = useCallback(
    (uri: string) => {
      if (!uri) return;

      const newImage: GalleryImage = {
        id: Date.now().toString(),
        uri: uri,
        uploadedAt: formatDate(new Date()),
      };

      setImages((prev) => [newImage, ...prev]);
    },
    [formatDate]
  );

  const handleImageDelete = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: GalleryImage }) => (
      <GalleryImageCard image={item} onDelete={handleImageDelete} />
    ),
    [handleImageDelete]
  );

  const keyExtractor = useCallback((item: GalleryImage) => item.id, []);

  const ListHeader = useCallback(
    () => (
      <View>
        {/* Add Photo Section */}
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Add New Photos
          </Text>
          <ImageUpload
            label=""
            placeholder="Tap to add photos"
            hint="Take a photo or choose from gallery"
            value=""
            onChange={handleImageAdd}
          />
        </View>

        {/* Uploaded Photos Section */}
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-gray-900">
              Uploaded Photos
            </Text>
            <View className="bg-primary/10 px-2 py-1 rounded-full">
              <Text className="text-xs font-semibold text-primary">
                {images.length} photos
              </Text>
            </View>
          </View>
        </View>
      </View>
    ),
    [images.length, handleImageAdd]
  );

  const ListFooter = useCallback(() => <View className="h-24" />, []);

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={3}
        contentContainerStyle={{ padding: 16 }}
        columnWrapperStyle={{ justifyContent: "flex-start" }}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <EmptyGallery />
          </View>
        }
        ListFooterComponent={ListFooter}
      />
    </SafeAreaView>
  );
}


