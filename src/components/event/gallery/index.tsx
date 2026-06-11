import ImageUpload from "@/src/components/ui/ImageUpload";
import {
  useDeleteEventGalleryImage,
  useEventGallery,
  useUploadEventGalleryImage,
} from "@/src/features/events/hooks/use-event";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
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
  const {
    data: images = [],
    isLoading,
    error,
    refetch,
  } = useEventGallery(eventId, { enabled: !!eventId });
  const uploadGalleryMutation = useUploadEventGalleryImage(eventId ?? "");
  const uploadLoading = uploadGalleryMutation.status === "pending";
  const uploadGalleryImage = uploadGalleryMutation.mutateAsync;
  const { mutate: deleteGalleryImage } = useDeleteEventGalleryImage(
    eventId ?? ""
  );
  const [selectedImage, setSelectedImage] = useState("");
  const loadError = error
    ? String((error as any).message || "Unable to load gallery.")
    : null;

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

      try {
        const fileName = uri.split("/").pop() ?? `upload-${Date.now()}`;
        const fileType = getMimeType(uri);

        const responseData = await uploadGalleryImage({
          uri,
          name: fileName,
          type: fileType,
        });

        const message =
          responseData?.message || responseData?.error || "Upload successful.";

        Alert.alert("Upload completed", message);
      } catch (err: unknown) {
        const errorMessage =
          err && typeof err === "object" && "message" in err
            ? (err as any).message
            : "Unable to upload image.";
        Alert.alert("Upload failed", String(errorMessage));
      } finally {
        setSelectedImage("");
      }
    },
    [eventId, getMimeType, uploadGalleryImage]
  );

  const handleImageDelete = useCallback(
    (id: string) => {
      if (!eventId) {
        Alert.alert("Delete failed", "Missing event id.");
        return;
      }

      Alert.alert(
        "Delete Photo",
        "Are you sure you want to remove this photo?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              deleteGalleryImage(id, {
                onError: (err: unknown) => {
                  const errorMessage =
                    err && typeof err === "object" && "message" in err
                      ? (err as any).message
                      : "Unable to delete photo.";
                  Alert.alert("Delete failed", String(errorMessage));
                },
                onSuccess: () => {
                  Alert.alert("Photo removed", "Photo deleted successfully.");
                },
              });
            },
          },
        ]
      );
    },
    [deleteGalleryImage, eventId]
  );

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
            placeholder={uploadLoading ? "Uploading..." : "Tap to add photos"}
            hint="Take a photo or choose from gallery"
            value={selectedImage}
            onChange={uploadImage}
          />
          {uploadLoading && (
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
    [images.length, uploadLoading, selectedImage, uploadImage]
  );

  const ListFooter = useCallback(() => <View className="h-24" />, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light">
        <ActivityIndicator size="large" color="#ec4899" />
        <Text className="mt-3 text-base text-gray-500">Loading gallery...</Text>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-light px-6">
        <Text className="text-center text-base font-semibold text-gray-900 mb-3">
          Unable to load gallery
        </Text>
        <Text className="text-center text-sm text-gray-500 mb-4">
          {loadError}
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="rounded-full bg-pink-500 px-5 py-3"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
