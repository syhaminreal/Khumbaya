import { useGetBusinessById } from "@/src/features/business/hooks/use-business";
import { useLocalSearchParams } from "expo-router";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const VendorDetailScreen = () => {
  const { vendorId } = useLocalSearchParams<{ vendorId?: string }>();
  const resolvedVendorId = Array.isArray(vendorId)
    ? vendorId[0]
    : (vendorId ?? "");

  const {
    data: vendorData,
    isLoading,
    isError,
  } = useGetBusinessById(resolvedVendorId);

  const vendor = vendorData?.businessInformation;
  const services = vendorData?.vendorServicesinformation ?? [];

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView
        contentContainerClassName="space-y-4 p-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-3xl bg-white p-5 shadow-sm shadow-slate-200">
          <Text className="text-2xl font-bold text-slate-900">
            Vendor Details
          </Text>
          <Text className="mt-1 text-sm text-slate-500">
            {resolvedVendorId
              ? `ID: ${resolvedVendorId}`
              : "Vendor ID not available"}
          </Text>
        </View>

        {isLoading ? (
          <View className="rounded-3xl bg-white p-5 shadow-sm shadow-slate-200">
            <Text className="text-sm text-slate-500">
              Loading vendor information…
            </Text>
          </View>
        ) : isError ? (
          <View className="rounded-3xl bg-white p-5 shadow-sm shadow-slate-200">
            <Text className="text-sm font-medium text-red-600">
              Could not load vendor details.
            </Text>
          </View>
        ) : !vendor ? (
          <View className="rounded-3xl bg-white p-5 shadow-sm shadow-slate-200">
            <Text className="text-sm text-slate-500">
              No vendor found for this ID.
            </Text>
          </View>
        ) : (
          <View className="space-y-4 rounded-3xl bg-white p-5 shadow-sm shadow-slate-200">
            {vendor.avatar ? (
              <Image
                source={{ uri: vendor.avatar }}
                className="h-48 w-full rounded-3xl bg-slate-100"
                accessibilityLabel="Vendor image"
              />
            ) : (
              <View className="h-48 w-full items-center justify-center rounded-3xl bg-slate-100">
                <Text className="text-sm text-slate-500">
                  No image available
                </Text>
              </View>
            )}

            <View className="space-y-2">
              <Text className="text-xl font-bold text-slate-900">
                {vendor.businessName ?? "Unnamed Vendor"}
              </Text>
              <Text className="text-sm text-slate-500">
                {vendor.category ?? "Category unavailable"}
              </Text>
              <Text className="text-sm text-slate-500">
                {vendor.location ?? "Location unavailable"}
                {vendor.city ? ` · ${vendor.city}` : ""}
                {vendor.country ? ` · ${vendor.country}` : ""}
              </Text>
            </View>

            <View className="rounded-3xl bg-slate-50 p-4">
              <Text className="text-sm font-semibold text-slate-700">
                Overview
              </Text>
              <Text className="mt-2 text-sm leading-6 text-slate-600">
                {vendor.description ?? "No description available."}
              </Text>
            </View>

            <View className="grid gap-3">
              <View className="rounded-3xl bg-slate-50 p-4">
                <Text className="text-sm font-semibold text-slate-700">
                  Contact
                </Text>
                <Text className="mt-2 text-sm text-slate-600">
                  {vendor.contactPersonname ?? "Contact person not available"}
                </Text>
                <Text className="text-sm text-slate-600">
                  {vendor.contactPhone ??
                    vendor.whatsappNumber ??
                    "Phone not available"}
                </Text>
                <Text className="text-sm text-slate-600">
                  {vendor.websiteUrl
                    ? `Website: ${vendor.websiteUrl}`
                    : "Website not available"}
                </Text>
              </View>

              <View className="rounded-3xl bg-slate-50 p-4">
                <Text className="text-sm font-semibold text-slate-700">
                  Metrics
                </Text>
                <Text className="mt-2 text-sm text-slate-600">
                  Price from:{" "}
                  {vendor.priceStartingFrom
                    ? `₹${vendor.priceStartingFrom}`
                    : "Unavailable"}
                </Text>
                <Text className="text-sm text-slate-600">
                  Experience:{" "}
                  {vendor.yearsOfExperience
                    ? `${vendor.yearsOfExperience} years`
                    : "Unavailable"}
                </Text>
                <Text className="text-sm text-slate-600">
                  Verified: {vendor.isVerified ? "Yes" : "No"}
                </Text>
              </View>

              {services.length > 0 ? (
                <View className="rounded-3xl bg-slate-50 p-4 space-y-3">
                  <Text className="text-sm font-semibold text-slate-700">
                    Services
                  </Text>
                  {services.slice(0, 3).map((service) => (
                    <View
                      key={service.id}
                      className="rounded-2xl bg-white p-3 shadow-sm shadow-slate-100 space-y-1"
                    >
                      <Text className="text-sm font-semibold text-slate-900">
                        {service.artistType ?? "Service"}
                      </Text>
                      <Text className="text-sm text-slate-600">
                        {service.stylesSpecialized ?? "Details unavailable"}
                      </Text>
                      <Text className="text-sm text-slate-600">
                        Advance:{" "}
                        {service.advanceAmount
                          ? `₹${service.advanceAmount}`
                          : "Unavailable"}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default VendorDetailScreen;
