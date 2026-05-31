import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

interface ImageUploadProps {
  value?: string;
  onChange: (uri: string) => void;
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label,
  placeholder = "Upload Image",
  hint,
  error,
}: ImageUploadProps) {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onChange(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to your camera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onChange(result.assets[0].uri);
    }
  };

  const showOptions = () => {
    Alert.alert(
      "Select Image",
      "Choose an option",
      [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const removeImage = () => {
    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => onChange("") },
    ]);
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>
      )}

      <TouchableOpacity
        className={`border-2 border-dashed rounded-xl overflow-hidden ${
          error ? "border-red-300" : "border-gray-200"
        }`}
        onPress={value ? removeImage : showOptions}
      >
        {value ? (
          <View className="relative">
            <Image
              source={{ uri: value }}
              className="w-full h-48"
              resizeMode="cover"
            />
            <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 items-center">
              <Ionicons name="camera" size={20} color="white" />
              <Text className="text-white text-xs mt-0.5">Tap to change</Text>
            </View>
          </View>
        ) : (
          <View className="items-center justify-center p-6 bg-gray-50">
            <Ionicons name="camera-outline" size={32} color="#9CA3AF" />
            <Text className="mt-2 text-sm text-gray-500 font-medium">
              {placeholder}
            </Text>
            {hint && <Text className="mt-1 text-xs text-gray-400">{hint}</Text>}
          </View>
        )}
      </TouchableOpacity>

      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
}
