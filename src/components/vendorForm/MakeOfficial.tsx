import { Text } from "@/src/components/ui/Text";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";

type DocumentType = "government" | "business";

type MakeOfficialProps = {
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void | Promise<void>;
};

type UploadedFile = {
  name: string;
  size: number;
};

type MakeOfficialFormValues = {
  docType: DocumentType;
  uploadedFile: UploadedFile | null;
};

// dark: styles removed for nativewind consistency
export default function MakeOfficial({
  onBack,
  onNext,
  onSubmit,
}: MakeOfficialProps) {
  const { setValue, control } = useFormContext<MakeOfficialFormValues>();
  const docType = useWatch({ control, name: "docType" }) ?? "government";
  const uploadedFile = useWatch({ control, name: "uploadedFile" }) ?? null;

  const handleFilePick = () => {
    // TODO: Implement with expo-image-picker or expo-document-picker once installed
    // For now, simulating file pick with a mock file
    Alert.alert(
      "File Upload",
      "File picker will be implemented once expo-document-picker is installed.",
      [
        {
          text: "Add Mock File",
          onPress: () => {
            setValue(
              "uploadedFile",
              {
                name: `${docType === "government" ? "government_id" : "business_license"}.pdf`,
                size: 2.5,
              },
              { shouldDirty: true }
            );
          },
        },
        { text: "Cancel" },
      ]
    );
  };

  const handleSubmit = () => {
    if (!uploadedFile) {
      Alert.alert("Missing Document", "Please upload a document first");
      return;
    }
    onSubmit();
  };

  return (
    <View className="flex-1">
      {/* Scrollable Content */}
      <ScrollView
        className="flex-1 px-6 pb-6 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {/* Headline */}
        <View className="mb-8">
          {/* text-light = #181114 */}
          <Text
            className="text-3xl font-bold leading-tight mb-3"
            style={{ color: "#181114" }}
          >
            Let's make it official
          </Text>
          {/* slate-600 = #475569 */}
          <Text
            className="text-base font-normal leading-relaxed"
            style={{ color: "#475569" }}
          >
            To ensure the safety of our couples, we require proof of identity or
            business registration. Verified vendors get{" "}
            <Text className="font-bold text-primary">3x more bookings</Text>.
          </Text>
        </View>

        {/* Segmented Control */}
        <View className="pb-6">
          <View className="flex-row rounded-xl p-1 bg-gray-200">
            {/* Government ID */}
            <TouchableOpacity
              className="flex-1"
              onPress={() =>
                setValue("docType", "government", { shouldDirty: true })
              }
            >
              <View
                className={`flex items-center justify-center py-2.5 px-3 rounded-lg ${
                  docType === "government" ? "bg-white rounded-xl" : ""
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    docType === "government"
                      ? "text-primary"
                      : "text-muted-light"
                  }`}
                >
                  Government ID
                </Text>
              </View>
            </TouchableOpacity>

            {/* Business License */}
            <TouchableOpacity
              className="flex-1"
              onPress={() =>
                setValue("docType", "business", { shouldDirty: true })
              }
            >
              <View
                className={`flex items-center justify-center py-2.5 px-3 rounded-lg ${
                  docType === "business" ? "bg-white rounded-xl" : ""
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    docType === "business" ? "text-primary" : "text-muted-light"
                  }`}
                >
                  Business License
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upload Area */}
        <View className="pb-4">
          <TouchableOpacity onPress={handleFilePick}>
            <View className="flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 py-14 bg-gray-100">
              {/* Cloud Icon */}
              <View className="h-14 w-14 mb-3 rounded-full flex items-center justify-center bg-pink-100">
                <MaterialIcons name="cloud-upload" size={28} color="#ee2b8c" />
              </View>

              <Text className="mb-1 text-sm font-semibold text-center text-text-light">
                Tap to upload document
              </Text>
              <Text className="text-xs text-center px-6 text-muted-light">
                SVG, PNG, JPG or PDF (max. 5MB)
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Uploaded File Display */}
        {uploadedFile && (
          <View className="pb-4 px-2">
            <View className="flex-row items-center justify-between p-3 rounded-xl bg-gray-100">
              <View className="flex-row items-center flex-1 gap-3">
                <View className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-100">
                  <MaterialIcons name="description" size={20} color="#4caf50" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-text-light">
                    {uploadedFile.name}
                  </Text>
                  <Text className="text-xs text-muted-light">
                    {uploadedFile.size.toFixed(1)} MB • Ready
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() =>
                  setValue("uploadedFile", null, { shouldDirty: true })
                }
              >
                <MaterialIcons name="delete" size={20} color="#896175" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Security Note */}
        <View className="px-2 py-2 flex-row items-center justify-center gap-2">
          <MaterialIcons name="lock" size={16} color="#896175" />
          <Text className="text-xs font-medium text-muted-light">
            Your data is encrypted and secure.
          </Text>
        </View>
      </ScrollView>

      <View className="px-6">
        <TouchableOpacity
          onPress={handleSubmit}
          className="w-full rounded-full bg-primary py-4 px-6 flex-row items-center justify-center gap-2"
          activeOpacity={0.9}
        >
          <Text className="text-white text-base font-bold leading-tight">
            Submit for Review
          </Text>
          <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
