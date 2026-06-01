import AvatarPicker from "@/src/components/ui/AvatarPicker";
import { updateUserMeFormDataApi } from "@/src/features/user/api/user.service";
import { useAuthStore } from "@/src/store/AuthStore";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Link, Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

type ToggleButtonProps = {
  title: string;
  active: boolean;
  onPress: () => void;
};

type RowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
};

export default function ProfileScreen() {
  const [tab, setTab] = useState<"account" | "info">("account");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { clearAuth: logout, user, updateUser } = useAuthStore();
  const router = useRouter();

  const getFileName = (uri: string) => {
    const parts = uri.split("/");
    const fileName = parts[parts.length - 1] || `photo-${Date.now()}.jpg`;
    return fileName.includes(".") ? fileName : `${fileName}.jpg`;
  };

  const getMimeType = (uri: string) => {
    const extension = uri.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      case "svg":
        return "image/svg+xml";
      case "webp":
        return "image/webp";
      case "heic":
      case "heif":
        return "image/heic";
      default:
        return "image/jpeg";
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(onboarding)");
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    const asset = result.assets[0];
    const uri = asset.uri;
    const fileName = getFileName(uri);
    const mimeType = getMimeType(uri);

    const formData = new FormData();
    formData.append("photo", {
      uri,
      name: fileName,
      type: mimeType,
    } as any);

    setUploadingAvatar(true);
    try {
      const updatedUser = await updateUserMeFormDataApi(formData);
      if (updatedUser?.photo) {
        updateUser({ photo: updatedUser.photo });
      }
      Alert.alert("Profile Updated", "Your avatar was uploaded successfully.");
    } catch (error) {
      console.error("Avatar upload failed", error);
      Alert.alert(
        "Upload failed",
        "Unable to upload profile photo. Please try again."
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={handleLogout}
              className="px-2 py-1"
              accessibilityRole="button"
              accessibilityLabel="Log out"
            >
              <Ionicons name="log-out-outline" size={22} />
            </Pressable>
          ),
        }}
      ></Stack.Screen>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-2 bg-white pb-11"
      >
        <View className="items-center bg-white py-6">
          <AvatarPicker
            name={user?.username || "User"}
            avatarUri={user?.photo ?? undefined}
            onPick={handlePickAvatar}
            size="large"
            showEditButton={true}
            showName={false}
          />
          {uploadingAvatar && (
            <View className="mt-3 flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#ec4899" />
              <Text className="text-sm text-gray-500">Uploading avatar...</Text>
            </View>
          )}
          <Text className="text-2xl font-bold mt-4 text-gray-900">
            {user?.username || "User"}
          </Text>
          {user?.email && !user?.email.startsWith("guest_") && (
            <Text className="text-gray-500 text-sm">{user?.email}</Text>
          )}
          <Text className="text-gray-500 text-sm">{user?.phone}</Text>
        </View>
        <View className="mx-6 bg-white rounded-2xl p-1 flex-row shadow-sm">
          <ToggleButton
            title=" Business"
            active={tab === "account"}
            onPress={() => setTab("account")}
          />
          <ToggleButton
            title="Account"
            active={tab === "info"}
            onPress={() => setTab("info")}
          />
        </View>
        {tab === "account" ? <Account /> : <Info />}
      </ScrollView>
    </>
  );
}

const ToggleButton = ({ title, active, onPress }: ToggleButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: active ? "#ec4899" : "transparent",
        shadowColor: active ? "#000" : undefined,
        shadowOffset: active ? { width: 0, height: 1 } : undefined,
        shadowOpacity: active ? 0.1 : undefined,
        shadowRadius: active ? 2 : undefined,
        elevation: active ? 2 : undefined,
      }}
    >
      <Text
        style={{
          textAlign: "center",
          fontWeight: "600",
          color: active ? "#ffffff" : "#9ca3af",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
};

/* ---------- Row ---------- */

const Row = ({ icon, title, href }: RowProps & { href: string }) => (
  <Link href={href as any} asChild>
    <Pressable className="flex-row items-center justify-between border border-gray-200 p-4 rounded-md  mb-3 shadow-sm active:scale-[0.98]">
      <View className="flex-row items-center gap-4">
        <LinearGradient
          colors={["#ec489933", "#db277733"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 9999 }}
          className="p-2 border border-gray-200 rounded-full"
        >
          <MaterialIcons name={icon} size={24} color="#ec4899" />
        </LinearGradient>

        <Text className="font-semibold text-gray-900">{title}</Text>
      </View>

      <MaterialIcons name="chevron-right" size={22} color="#9ca3af" />
    </Pressable>
  </Link>
);

/* ---------- Sections ---------- */

const Account = () => (
  <View className="mx-6 mt-4">
    <Row icon="analytics" title="Analytics" href="/profile/analytics" />
    <Row
      icon="business"
      title="Business Information"
      href="/profile/business-information"
    />
    <Row
      icon="sell"
      title="Services & Pricing"
      href="/profile/services-pricing"
    />
    <Row icon="photo-library" title="Portfolio" href="/profile/portfolio" />
    <Row
      icon="verified"
      title="Vendor Verification"
      href="/profile/vendor-verification"
    />
  </View>
);

const Info = () => (
  <View className="mx-6 mt-4">
    <Row icon="person" title="Edit Profile" href="/profile/edit-profile" />
    <Row icon="favorite" title="My Favourites" href="/profile/favourites" />
    <Row icon="group" title="Family Members" href="/profile/family-members" />
    <Row icon="lock" title="Change Password" href="/profile/change-password" />
  </View>
);
