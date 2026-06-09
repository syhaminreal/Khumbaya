import { Text } from "@/src/components/ui/Text";
import {
  useGetBusinessById,
  useGetEventVendor,
} from "@/src/features/business/hooks/use-business";
import { PackageList } from "@/src/features/packages/components/PackageList";
import { shadowStyle } from "@/src/utils/helper";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, ScrollView, View } from "react-native";

const FALLBACK_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDIWVyUn7mizRXt-pU0k_RKFdAfNF_d21mLZuL6fE-z88oUHVipXSGUhNmA5WfOISIeb5QApM1WV-MqiArQgJejxYGuerwubu6lcVkwkED06qEDLGBM7Xqz0ISW7b9rPn7S5ZW1hwAZxyVJLtwp0mkKKpGBUzYThC2D9AsRi-INlhoD8olL86wNyceuSQjvSCGLvlkuKEaRRpvGNa3ooDKEzBTa-g2eoD-4QuvwrSjC7f8_Nwv5Gm18EKFeYf5rKFnpg1QNMlLOq18";

function formatStatusLabel(status: unknown): string {
  const normalized = String(status ?? "").toLowerCase();
  if (normalized.includes("confirm") || normalized.includes("book") || normalized.includes("complete")) {
    return "Booked";
  }
  if (normalized.includes("negotiat")) return "In Negotiation";
  if (normalized.includes("enquir")) return "Enquired";
  return "Pending";
}

function formatDate(value: unknown): string | null {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function EventVendorDetail() {
  const router = useRouter();
  const { eventId, vendorId } = useLocalSearchParams<{ eventId?: string; vendorId?: string }>();
  const resolvedEventId = Array.isArray(eventId) ? eventId[0] : eventId ?? "";
  const resolvedVendorId = Array.isArray(vendorId) ? vendorId[0] : vendorId ?? "";

  const { data: eventVendor, isLoading, isError } = useGetEventVendor(resolvedEventId, resolvedVendorId);
  const { data: businessWithAttribute } = useGetBusinessById(resolvedVendorId);


  const handleGoBack = () => {
    if (router.canGoBack()) return router.back();
    router.replace({ pathname: "/(protected)/(client-stack)/events/[eventId]/(organizer)/vendor" as any, params: { eventId: resolvedEventId } });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#ee2b8c" />
      </View>
    );
  }

  if (isError || !eventVendor) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 gap-2 px-6">
        <MaterialIcons name="store-mall-directory" size={48} color="#d1d5db" />
        <Text className="text-lg text-gray-600">Vendor enquiry not found</Text>
        <Pressable onPress={handleGoBack} className="mt-2 px-6 py-3 bg-primary rounded-lg">
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const biz = businessWithAttribute?.businessInformation;
  const vendorName = biz?.businessName ?? "Vendor";
  const avatarImage = biz?.avatar ?? FALLBACK_AVATAR;

  const status = formatStatusLabel(eventVendor?.status);
  const isBooked = status === "Booked";
  const enquiredOn = formatDate(eventVendor?.createdAt);
  const guestCount = eventVendor?.guests ?? eventVendor?.estimatedGuest;
  const requirements = eventVendor?.notes;

  const businessId = biz?.id ?? Number(resolvedVendorId);

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: vendorName,
          headerBackButtonDisplayMode: "minimal",
          headerTitleAlign: "center",
          headerLeft: () => (
            <Pressable onPress={handleGoBack} className="px-2 py-1">
              <MaterialIcons name="arrow-back" size={22} color="#181114" />
            </Pressable>
          ),
        }}
      />


      <ScrollView className="flex-1" contentContainerClassName="px-4 py-6 gap-4 pb-12" showsVerticalScrollIndicator={false}>
        {/* Quick actions */}
        <View className="   py-2 gap-3">
          <View className="flex-row items-center gap-3">
            <Pressable
              className="flex-row flex-1 items-center justify-center gap-1 border border-gray-200 rounded-md py-3"
              android_ripple={{ color: "#f3f4f6" }}
              onPress={() => router.push({ pathname: "/(shared)/explore/[vendorId]" as any, params: { vendorId: resolvedVendorId, fromEventId: resolvedEventId } })}
            >
              <MaterialIcons name="chat-bubble-outline" size={20} color="#4B5563" />
              <Text className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Message</Text>
            </Pressable>

            <Pressable
              className="flex-row flex-1 items-center justify-center gap-1 bg-primary rounded-md py-3"
              style={{ elevation: 4, shadowColor: "#ee2b8c", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }}
              android_ripple={{ color: "#c4006e" }}
            >
              <MaterialIcons name="description" size={20} color="#fff" />
              <Text className="text-[11px] font-semibold uppercase tracking-wide text-white">Review Contract</Text>
            </Pressable>
          </View>

          <Pressable
            className="items-center justify-center gap-1 flex-row border border-gray-200 rounded-md py-3"
            onPress={() => router.push({ pathname: "/(shared)/explore/[vendorId]" as any, params: { vendorId: resolvedVendorId, fromEventId: resolvedEventId } })}
          >
            <MaterialIcons name="info-outline" size={20} color="#4B5563" />
            <Text className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Details</Text>
          </Pressable>
        </View>
        {/* Enquiry details card */}
        <View className=" rounded-2xl border border-gray-100 overflow-hidden"
          style={shadowStyle}
        >
          <View className="p-5 border-b border-gray-100 flex-row items-center gap-3">
            <View className="h-14 w-14 rounded-full overflow-hidden bg-gray-100">
              <Image source={{ uri: avatarImage }} className="h-full w-full" resizeMode="cover" />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                Enquiry Details
              </Text>
              <Text className="text-xl font-bold text-gray-900">{vendorName}</Text>
            </View>
          </View>

          <View className="p-5 flex-row gap-4 border-b border-gray-100 bg-gray-50/60">
            <View className="flex-1">
              <Text className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Current Status</Text>
              <View
                className={`flex-row items-center gap-1.5 self-start px-2.5 py-1 rounded-md border ${isBooked ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
                  }`}
              >
                <MaterialIcons
                  name={isBooked ? "check-circle-outline" : "hourglass-empty"}
                  size={16}
                  color={isBooked ? "#166534" : "#C2410C"}
                />
                <Text className={`text-sm font-medium ${isBooked ? "text-green-800" : "text-orange-700"}`}>
                  {status}
                </Text>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Enquired On</Text>
              <View className="flex-row items-center gap-1.5">
                <MaterialIcons name="calendar-today" size={16} color="#9CA3AF" />
                <Text className="text-sm font-medium text-gray-900">{enquiredOn ?? "—"}</Text>
              </View>
            </View>
          </View>

          <View className="p-5 gap-6">
            <View>
              <View className="flex-row items-center gap-1.5 mb-2">
                <MaterialIcons name="people-outline" size={20} color="#4B5563" />
                <Text className="text-sm font-medium text-gray-600">Estimated Guest Count</Text>
              </View>
              {guestCount != null ? (
                <Text className="text-3xl font-bold text-primary">
                  {guestCount} <Text className="text-base text-gray-400 font-normal">Attendees</Text>
                </Text>
              ) : (
                <Text className="text-sm text-gray-400">Not specified</Text>
              )}
            </View>

            {requirements ? (
              <View>
                <View className="flex-row items-center gap-1.5 mb-3">
                  <MaterialIcons name="edit-note" size={20} color="#4B5563" />
                  <Text className="text-sm font-medium text-gray-600">Organizer Requirements</Text>
                </View>
                <View className="bg-gray-50 border-l-4 border-primary rounded-r-lg p-4">
                  <Text className="text-sm text-gray-600 leading-relaxed italic">&ldquo;{requirements}&rdquo;</Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* Available packages */}
        {!!businessId && (
          <PackageList
            businessId={Number(businessId)}
            showActions={false}
            eventId={resolvedEventId}
            vendorId={resolvedVendorId}
          />
        )}
      </ScrollView>
    </View>
  );
}
