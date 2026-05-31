import api from "@/src/api/axios";
import ImageUpload from "@/src/components/ui/ImageUpload";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface GalleryImage {
  id: string;
  uri: string;
  uploadedAt: string;
}

function GalleryImageCard({
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

function EmptyGallery() {
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

export default function GalleryScreen() {
  const params = useLocalSearchParams() as { eventId?: string };
  const eventId = params.eventId;
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [uploading, setUploading] = useState(false);

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getMimeType = useCallback((uri: string) => {
    const extension = uri.split(".").pop()?.split("?")[0]?.toLowerCase();
    if (!extension) return "image/jpeg";
    if (
      ["mp4", "mov", "avi", "mkv", "webm", "3gp", "ogg"].includes(extension)
    ) {
      return `video/${extension === "mov" ? "quicktime" : extension}`;
    }
    if (extension === "heic") return "image/heic";
    if (extension === "heif") return "image/heif";
    if (extension === "svg") return "image/svg+xml";
    return `image/${extension}`;
  }, []);

  const uploadImage = useCallback(
    async (uri: string) => {
      if (!uri) return;
      if (!eventId) {
        Alert.alert("Upload failed", "Missing event id.");
        return;
      }

      setSelectedImage(uri);
      setUploading(true);

      try {
        const fileName = uri.split("/").pop() ?? `upload-${Date.now()}`;
        const fileType = getMimeType(uri);
        const data = new FormData();

        data.append("file", {
          uri,
          name: fileName,
          type: fileType,
        } as any);

        const response = await api.post(
          `/gallery/event/${eventId}/upload`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const responseData = response.data;
        const message =
          responseData?.message || responseData?.error || "Upload successful.";

        Alert.alert("Upload completed", message);

        const newImage: GalleryImage = {
          id: responseData?.publicId ?? Date.now().toString(),
          uri: responseData?.mediaUrl ?? uri,
          uploadedAt: formatDate(new Date()),
        };

        setImages((prev) => [newImage, ...prev]);
      } catch (err: unknown) {
        const errorMessage =
          err && typeof err === "object" && "message" in err
            ? (err as any).message
            : "Unable to upload image.";
        Alert.alert("Upload failed", String(errorMessage));
      } finally {
        setUploading(false);
        setSelectedImage("");
      }
    },
    [eventId, formatDate, getMimeType]
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
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
          <Text className="text-base font-bold text-gray-900 mb-3">
            Add New Photos
          </Text>
          <ImageUpload
            label=""
            placeholder={uploading ? "Uploading..." : "Tap to add photos"}
            hint="Take a photo or choose from gallery"
            value={selectedImage}
            onChange={uploadImage}
          />
          {uploading && (
            <Text className="text-sm text-gray-500 mt-2">
              Uploading file, please wait...
            </Text>
          )}
        </View>

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
    [images.length, uploading, selectedImage, uploadImage]
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
