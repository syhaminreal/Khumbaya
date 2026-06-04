import { Text } from "@/src/components/ui/Text";
import { shadowStyle } from "@/src/utils/helper";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { useGetPackage } from "../api/use-package";
import { Package, PackageItem } from "../types";

interface PackageListProps {
  businessId: number;
}

function formatCurrency(amount: string, currency: string): string {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return `${currency} ${amount}`;

  const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    NPR: "Rs.",
  };

  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${numAmount.toLocaleString()}`;
}

function SkeletonCard() {
  return (
    <View
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={shadowStyle}
    >
      {/* Header shimmer */}
      <View className="h-24 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse" />

      <View className="p-5">
        {/* Title shimmer */}
        <View className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />

        {/* Price shimmer */}
        <View className="h-8 w-1/2 bg-gray-200 rounded animate-pulse mb-4" />

        {/* Description shimmer */}
        <View className="h-4 w-full bg-gray-100 rounded animate-pulse mb-2" />
        <View className="h-4 w-2/3 bg-gray-100 rounded animate-pulse mb-6" />

        {/* Items shimmer */}
        <View className="space-y-3 mb-6">
          {[1, 2, 3].map((i) => (
            <View key={i} className="flex-row items-center justify-between">
              <View className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
              <View className="h-4 w-1/4 bg-gray-100 rounded animate-pulse" />
            </View>
          ))}
        </View>

        {/* Button shimmer */}
        <View className="h-12 w-full bg-gray-200 rounded-xl animate-pulse" />
      </View>
    </View>
  );
}

function PackageItemRow({ item, index }: { item: PackageItem; index: number }) {
  return (
    <View
      className={`flex-row items-center justify-between py-3 ${
        index !== 0 ? "border-t border-gray-50" : ""
      }`}
    >
      <View className="flex-1 flex-row items-center gap-2">
        <View className="w-6 h-6 rounded-full bg-primary/10 items-center justify-center">
          <MaterialIcons name="check" size={14} color="#ee2b8c" />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-[#181114] font-medium">{item.title}</Text>
          {item.group && (
            <Text className="text-xs text-gray-400">{item.group}</Text>
          )}
        </View>
      </View>
      <View className="items-end">
        {item.quantity && parseInt(item.quantity) > 1 && (
          <Text className="text-xs text-gray-400">
            {item.quantity} x {item.rate}
          </Text>
        )}
        <Text className="text-sm text-[#181114] font-semibold">
          {formatCurrency(item.amount, "")}
        </Text>
      </View>
    </View>
  );
}

function PackageCard({
  packageItem,
  onEdit,
  onShare,
}: {
  packageItem: Package;
  onEdit?: () => void;
  onShare?: () => void;
}) {
  const hasMoreThanThreeItems = (packageItem.items?.length || 0) > 3;
  const displayItems = packageItem.items?.slice(0, 3) || [];
  const remainingCount = (packageItem.items?.length || 0) - 3;

  return (
    <View
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={shadowStyle}
    >
      {/* Gradient Header */}
      <View
        className="px-5 py-6"
        style={{
          backgroundColor: "#ee2b8c",
        }}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-white/80 text-xs uppercase tracking-wider font-medium mb-1">
              Package
            </Text>
            <Text
              variant="h1"
              className="text-white text-xl"
              numberOfLines={2}
            >
              {packageItem.title}
            </Text>
          </View>
          <View className="flex-row gap-1">
            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                activeOpacity={0.75}
                className="w-8 h-8 rounded-full bg-white/20 items-center justify-center"
              >
                <MaterialIcons name="edit" size={16} color="white" />
              </TouchableOpacity>
            )}
            {onShare && (
              <TouchableOpacity
                onPress={onShare}
                activeOpacity={0.75}
                className="w-8 h-8 rounded-full bg-white/20 items-center justify-center"
              >
                <MaterialIcons name="share" size={16} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Price in header */}
        <View className="mt-4">
          <Text className="text-white/80 text-xs mb-1">Total Price</Text>
          <Text variant="h1" className="text-white text-3xl">
            {formatCurrency(packageItem.totalAmount, packageItem.currency)}
          </Text>
        </View>
      </View>

      <View className="p-5">
        {/* Package Items */}
        {displayItems.length > 0 && (
          <View className="mb-4">
            <Text className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">
              What&apos;s Included
            </Text>
            <View>
              {displayItems.map((item, index) => (
                <PackageItemRow key={index} item={item} index={index} />
              ))}
            </View>
            {hasMoreThanThreeItems && (
              <View className="pt-2 border-t border-gray-50">
                <Text className="text-xs text-primary text-center">
                  +{remainingCount} more items
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Total Section */}
        <View className="pt-4 border-t border-gray-100">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-500">Total Amount</Text>
            <Text
              variant="h1"
              className="text-xl text-[#181114]"
            >
              {formatCurrency(packageItem.totalAmount, packageItem.currency)}
            </Text>
          </View>
        </View>

        {/* View Details Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          className="mt-5 bg-[#EE2B8C] rounded-xl py-3.5 items-center"
        >
          <Text className="text-white font-semibold text-sm">View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function LoadingState() {
  return (
    <View className="mt-8">
      <View className="flex-row items-center justify-between mb-4">
        <Text variant="h1" className="text-lg text-[#181114]">
          Available Packages
        </Text>
        <View className="flex-row items-center gap-2">
          <ActivityIndicator size="small" color="#ee2b8c" />
          <Text className="text-sm text-gray-400">Loading packages...</Text>
        </View>
      </View>
      <View className="flex-col gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </View>
    </View>
  );
}

function EmptyState({ businessId }: { businessId: number }) {
  const router = useRouter();

  const handleCreatePackage = () => {
    router.push({
      pathname: "/business/[businessId]/package/create",
      params: { businessId: String(businessId) },
    });
  };

  return (
    <View className="mt-8">
      <Text variant="h1" className="text-lg text-[#181114] mb-4">
        Packages
      </Text>
      <View
        className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 flex flex-col items-center justify-center"
        style={shadowStyle}
      >
        <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-6">
          <MaterialIcons name="inventory-2" size={40} color="#ee2b8c" />
        </View>
        <Text variant="h1" className="text-lg text-[#181114] mb-2 text-center">
          No packages created yet
        </Text>
        <Text className="text-sm text-gray-400 text-center max-w-xs mb-8">
          Start building custom service tiers to streamline your client
          proposals.
        </Text>
        <TouchableOpacity
          onPress={handleCreatePackage}
          activeOpacity={0.85}
          className="bg-[#EE2B8C] rounded-xl py-3.5 px-6 flex-row items-center gap-2"
        >
          <MaterialIcons name="add" size={20} color="white" />
          <Text className="text-white font-semibold text-sm">
            Create First Package
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ErrorState({ error }: { error: Error | null }) {
  return (
    <View className="mt-8">
      <Text variant="h1" className="text-lg text-[#181114] mb-4">
        Packages
      </Text>
      <View
        className="bg-red-50 rounded-2xl border border-red-100 p-6"
        style={shadowStyle}
      >
        <View className="flex-row items-center gap-3 mb-2">
          <MaterialIcons name="error-outline" size={24} color="#ef4444" />
          <Text className="text-red-600 font-semibold">
            Failed to load packages
          </Text>
        </View>
        <Text className="text-red-500 text-sm">
          {error?.message || "Something went wrong. Please try again."}
        </Text>
      </View>
    </View>
  );
}

function PackageGrid({
  packages,
  businessId,
}: {
  packages: Package[];
  businessId: number;
}) {
  const router = useRouter();

  const handleEditPackage = (pkg: Package) => {
    if (pkg.id) {
      router.push({
        pathname: "/business/[businessId]/package/[packageId]/edit",
        params: {
          businessId: String(businessId),
          packageId: String(pkg.id),
        },
      });
    }
  };

  const handleSharePackage = (pkg: Package) => {
    // Implement share functionality
    console.log("Share package:", pkg.id);
  };

  const handleViewAll = () => {
    router.push({
      pathname: "/business/[businessId]/packages",
      params: { businessId: String(businessId) },
    });
  };

  return (
    <View className="mt-8">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
            <MaterialIcons name="inventory-2" size={18} color="#ee2b8c" />
          </View>
          <Text variant="h1" className="text-lg text-[#181114]">
            Available Packages
          </Text>
        </View>
        {packages.length > 2 && (
          <TouchableOpacity onPress={handleViewAll} activeOpacity={0.75}>
            <Text className="text-sm text-[#ee2b8c] font-medium">View All</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-col gap-4">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            packageItem={pkg}
            onEdit={() => handleEditPackage(pkg)}
            onShare={() => handleSharePackage(pkg)}
          />
        ))}
      </View>
    </View>
  );
}

export function PackageList({ businessId }: PackageListProps) {
  const { data, isLoading, isError, error } = useGetPackage(businessId);

  // Handle loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Handle error state
  if (isError) {
    return <ErrorState error={error} />;
  }

  // Handle empty state - data might be null or packages array might be empty
  const packages = Array.isArray(data) ? data : data?.packages || [];
  if (!packages || packages.length === 0) {
    return <EmptyState businessId={businessId} />;
  }

  // Render packages
  return <PackageGrid packages={packages} businessId={businessId} />;
}

export default PackageList;
