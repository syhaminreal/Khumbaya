import { Text } from "@/src/components/ui/Text";
import { useThrottledRouter } from "@/src/hooks/useThrottledRouter";
import { shadowStyle } from "@/src/utils/helper";
import { MaterialIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useGetPackage } from "../api/use-package";
import { Package, PackageItem } from "../types";
interface PackageListProps {
  businessId: number;
  showActions?: boolean;
}

function parseNumber(value?: string | number): number {
  if (value === undefined || value === null) return 0;
  const sanitized = String(value).replace(/,/g, "").trim();
  const num = Number(sanitized);
  return Number.isFinite(num) ? num : 0;
}

function formatCurrency(amount: string | number, currency: string): string {
  const numAmount = parseNumber(amount);
  if (!Number.isFinite(numAmount)) return `${currency} ${amount}`;

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

function getItemAmount(item: PackageItem): number {
  const amount = parseNumber(item.amount);
  if (amount > 0) return amount;
  const quantity = parseNumber(item.quantity) || 1;
  const rate = parseNumber(item.rate);
  return quantity * rate;
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

function PackageItemRow({
  item,
  index,
  currency,
}: {
  item: PackageItem;
  index: number;
  currency: string;
}) {
  const quantity = parseNumber(item.quantity);
  const rate = parseNumber(item.rate);
  const amount = getItemAmount(item);
  return (
    <View
      className={`flex-row items-center justify-between py-3 ${
        index !== 0 ? "border-t border-gray-50" : ""
      }`}
    >
      <View className="flex-1 flex-row items-center gap-2">
        <View className="w-6 h-6 rounded-full bg-[#f3f4f6] items-center justify-center">
          <MaterialIcons name="check" size={14} color="#6b7280" />
        </View>
        <View className="flex-1">
          <Text className="text-base text-[#181114] font-semibold">
            {item.title}
            {quantity ? ` × ${quantity}` : ""}
          </Text>
          {item.group && (
            <Text className="text-sm text-gray-400">{item.group}</Text>
          )}
        </View>
      </View>
      <View className="items-end">
        {quantity > 1 && rate > 0 && (
          <Text className="text-sm text-gray-400">
            {quantity} x {formatCurrency(rate, currency)}
          </Text>
        )}
        <Text className="text-base text-[#181114] font-semibold">
          {formatCurrency(amount, currency)}
        </Text>
      </View>
    </View>
  );
}

function PackageCard({
  packageItem,
  onEdit,
  onShare,
  onPress,
  isExpanded,
  showActions,
}: {
  packageItem: Package;
  onEdit?: () => void;
  onShare?: () => void;
  onPress?: () => void;
  isExpanded?: boolean;
  showActions?: boolean;
}) {
  const displayItems = packageItem.items || [];
  const itemsTotal = (packageItem.items || []).reduce(
    (sum, item) => sum + getItemAmount(item),
    0
  );
  const currency = packageItem.currency || "";

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={shadowStyle}
    >
      <View
        className="px-4 py-4"
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text
              variant="h1"
              className="text-[#181114] text-lg"
              numberOfLines={2}
            >
              {packageItem.title}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              {packageItem.items?.length || 0} items included
            </Text>
          </View>
        </View>

        <View className="mt-4">
          <View className="flex-row items-end gap-2">
            <Text variant="h1" className="text-2xl text-[#181114]">
              {formatCurrency(itemsTotal, currency)}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-4">
          <View className="flex-row items-center gap-2">
            <View className="w-6 h-6 rounded-full bg-[#f3f4f6] items-center justify-center">
              <MaterialIcons name={isExpanded ? "expand-less" : "expand-more"} size={18} color="#6b7280" />
            </View>
            <Text className="text-xs text-gray-500">
              {isExpanded ? "Hide details" : "View details"}
            </Text>
          </View>
          {showActions ? (
            <View className="flex-row items-center gap-1">
              {onEdit && (
                <TouchableOpacity
                  onPress={onEdit}
                  activeOpacity={0.75}
                  className="w-8 h-8 rounded-full bg-[#f3f4f6] items-center justify-center"
                >
                  <MaterialIcons name="edit" size={16} color="#6b7280" />
                </TouchableOpacity>
              )}
              {onShare && (
                <TouchableOpacity
                  onPress={onShare}
                  activeOpacity={0.75}
                  className="w-8 h-8 rounded-full bg-[#f3f4f6] items-center justify-center"
                >
                  <MaterialIcons name="share" size={16} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        </View>
      </View>

      {isExpanded && (
        <View className="px-4 pb-4 pt-2 border-t border-gray-100">
          {displayItems.length > 0 && (
            <View>
              <Text className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">
                What&apos;s Included
              </Text>
              <View>
                {displayItems.map((item, index) => (
                  <PackageItemRow
                    key={index}
                    item={item}
                    index={index}
                    currency={currency}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </Pressable>
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

function EmptyState({ businessId, showActions }: { businessId: number; showActions?: boolean }) {
  const {push } = useThrottledRouter()
  const handleCreatePackage = () => {
    // TODO: Navigate to create package screen when available
    push({
      pathname: "./packages/create",
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
          No packages yet
        </Text>
        <Text className="text-sm text-gray-400 text-center max-w-xs mb-8">
          {showActions
            ? "Start building custom service tiers to streamline your client proposals."
            : "This vendor hasn't added any packages yet."}
        </Text>
        {showActions && (
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
        )}
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
  showActions,
}: {
  packages: Package[];
  businessId: number;
  showActions: boolean;
}) {
  const { push } = useThrottledRouter();
  const { width } = useWindowDimensions();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const numColumns = useMemo(() => {
    const availableWidth = Math.max(width - 48, 0);
    const maxColumns = Math.floor(availableWidth / 340) || 1;
    return Math.min(2, Math.max(1, maxColumns));
  }, [width]);

  const handleCreatePackage = () => {
    push({
      pathname: "./packages/create",
      params: { businessId: String(businessId) },
    });
  };

  const handleEditPackage = (pkg: Package) => {
    // TODO: Navigate to edit package screen when available
    // router.push({
    //   pathname: "/business/[businessId]/package/[packageId]/edit",
    //   params: {
    //     businessId: String(businessId),
    //     packageId: String(pkg.id),
    //   },
    // });
    console.log("Navigate to edit package:", pkg.id);
  };

  const handleSharePackage = (pkg: Package) => {
    // TODO: Implement share functionality
    console.log("Share package:", pkg.id);
  };

  const handleOpenDetails = (pkg: Package) => {
    setExpandedId((prev) => (prev === pkg.id ? null : (pkg.id ?? null)));
  };

  const handleViewAll = () => {
    // TODO: Navigate to all packages screen when available
    // router.push({
    //   pathname: "/business/[businessId]/packages",
    //   params: { businessId: String(businessId) },
    // });
    console.log("Navigate to all packages for business:", businessId);
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
        <View className="flex-row items-center gap-3">
          {showActions && (
            <TouchableOpacity
              onPress={handleCreatePackage}
              activeOpacity={0.75}
              className="flex-row items-center gap-1"
            >
              <MaterialIcons name="add" size={16} color="#ee2b8c" />
              <Text className="text-sm text-[#ee2b8c] font-medium">Create</Text>
            </TouchableOpacity>
          )}
          {packages.length > 2 && (
            <TouchableOpacity onPress={handleViewAll} activeOpacity={0.75}>
              <Text className="text-sm text-[#ee2b8c] font-medium">View All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={packages}
        keyExtractor={(item, index) => String(item.id ?? index)}
        renderItem={({ item }) => (
          <View className={numColumns > 1 ? "flex-1" : ""}>
            <PackageCard
              packageItem={item}
              onEdit={() => handleEditPackage(item)}
              onShare={() => handleSharePackage(item)}
              onPress={() => handleOpenDetails(item)}
              isExpanded={expandedId === (item.id ?? null)}
              showActions={showActions}
            />
          </View>
        )}
        numColumns={numColumns}
        columnWrapperStyle={
          numColumns > 1 ? { gap: 16, marginBottom: 16 } : undefined
        }
        contentContainerStyle={{ gap: numColumns > 1 ? 0 : 16 }}
        scrollEnabled={false}
        key={numColumns}
      />
    </View>
  );
}

export function PackageList({ businessId, showActions = true }: PackageListProps) {
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
    return <EmptyState businessId={businessId} showActions={showActions} />;
  }

  // Render packages
  return (
    <PackageGrid
      packages={packages}
      businessId={businessId}
      showActions={showActions}
    />
  );
}

export default PackageList;
