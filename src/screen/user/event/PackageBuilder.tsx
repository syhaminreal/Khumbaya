import { Text } from "@/src/components/ui/Text";
import { useGetPackage } from "@/src/features/packages/api/use-package";
import { Package, PackageItem } from "@/src/features/packages/types";
import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

function parseNumber(value?: string | number): number {
  if (value === undefined || value === null) return 0;
  const sanitized = String(value).replace(/,/g, "").trim();
  const num = Number(sanitized);
  return Number.isFinite(num) ? num : 0;
}

function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", INR: "₹", NPR: "Rs.",
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString()}`;
}

function getItemAmount(item: PackageItem): number {
  const amount = parseNumber(item.amount);
  if (amount > 0) return amount;
  const qty = parseNumber(item.quantity) || 1;
  return qty * parseNumber(item.rate);
}

// ── Line item row (scrollable list) ─────────────────────────────────────────
function LineItemRow({
  item,
  selected,
  onToggle,
  currency,
}: {
  item: PackageItem;
  selected: boolean;
  onToggle: () => void;
  currency: string;
}) {
  const amount = getItemAmount(item);
  const qty = parseNumber(item.quantity);
  const rate = parseNumber(item.rate);

  return (
    <Pressable
      onPress={onToggle}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: selected ? '#e5e7eb' : '#f3f4f6',
        padding: 16,
        marginBottom: 12,
        backgroundColor: '#ffffff',
        opacity: selected ? 1 : 0.5,
        shadowColor: "#000",
        shadowOpacity: selected ? 0.05 : 0,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: selected ? 1 : 0,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <MaterialIcons
          name={selected ? "check-box" : "check-box-outline-blank"}
          size={22}
          color={selected ? "#ee2b8c" : "#d1d5db"}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: selected ? '#111827' : '#9ca3af' }}>
            {item.title}
          </Text>
          {(item.remark || item.group || (qty > 1 && rate > 0)) ? (
            <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
              {item.remark || item.group
                ? `${item.remark || item.group}${qty > 1 && rate > 0 ? `  ·  ${qty} × ${formatCurrency(rate, currency)}` : ""}`
                : `${qty} × ${formatCurrency(rate, currency)}`}
            </Text>
          ) : null}
        </View>
      </View>
      <Text style={{ fontSize: 14, fontWeight: 'bold', marginLeft: 8, color: selected ? '#ee2b8c' : '#d1d5db' }}>
        {formatCurrency(amount, currency)}
      </Text>
    </Pressable>
  );
}

// ── Summary row (bottom card) ────────────────────────────────────────────────
function SummaryRow({
  item,
  selected,
  currency,
}: {
  item: PackageItem;
  selected: boolean;
  currency: string;
}) {
  const amount = getItemAmount(item);
  return (
    <View
      className={`flex-row items-center justify-between ${
        selected ? "" : "opacity-40"
      }`}
    >
      <View className="flex-row items-center gap-1.5 flex-1">
        <MaterialIcons
          name={selected ? "check-circle" : "cancel"}
          size={13}
          color={selected ? "#046c00" : "#9ca3af"}
        />
        <Text
          className={`text-sm flex-1 ${
            selected ? "text-gray-800" : "text-gray-400 line-through"
          }`}
          numberOfLines={1}
        >
          {item.title}
        </Text>
      </View>
      <Text
        className={`text-sm font-bold ml-2 ${
          selected ? "text-gray-800" : "text-gray-400"
        }`}
      >
        {formatCurrency(amount, currency)}
      </Text>
    </View>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function PackageBuilder() {
  const router = useRouter();
  const { packageId, businessId } = useLocalSearchParams<{
    packageId?: string;
    businessId?: string;
  }>();

  const resolvedBusinessId = businessId ? Number(businessId) : null;
  const resolvedPackageId = packageId ? Number(packageId) : null;

  const { data, isLoading } = useGetPackage(resolvedBusinessId);

  const pkg: Package | null = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.packages ?? [];
    return (
      list.find((p: Package) => p.id === resolvedPackageId) ?? list[0] ?? null
    );
  }, [data, resolvedPackageId]);

  // All items selected by default; user can uncheck what they don't want
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (pkg) {
      setSelectedIds(new Set(pkg.items.map((_, i) => i)));
    }
  }, [pkg]);

  const currency = pkg?.currency || "USD";

  const selectedTotal = useMemo(() => {
    if (!pkg) return 0;
    return pkg.items.reduce(
      (sum, item, i) => sum + (selectedIds.has(i) ? getItemAmount(item) : 0),
      0
    );
  }, [pkg, selectedIds]);

  const toggleItem = (index: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });

  const handleBack = () => {
    if (router.canGoBack()) router.back();
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#ee2b8c" />
      </View>
    );
  }

  // ── Not found ──
  if (!pkg) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <MaterialIcons name="inventory-2" size={48} color="#d1d5db" />
        <Text className="text-gray-500 mt-3">Package not found</Text>
        <Pressable
          onPress={handleBack}
          className="mt-4 px-6 py-3 bg-primary rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const selectedCount = selectedIds.size;

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Top bar ── */}
      <View className="bg-white border-b border-gray-100 px-4 h-14 flex-row items-center justify-between"
        style={{ shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 }}
      >
        <Pressable
          onPress={handleBack}
          className="w-8 h-8 items-center justify-center"
        >
          <MaterialIcons name="arrow-back" size={22} color="#ee2b8c" />
        </Pressable>
        <Text className="text-xl font-bold text-primary" numberOfLines={1}>
          {pkg.title}
        </Text>
        <View className="w-8" />
      </View>

      {/* ── Scrollable line items ── */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 420 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Section header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Line Items
          </Text>
          <Text className="text-xs text-gray-400">
            {selectedCount} / {pkg.items.length} selected
          </Text>
        </View>

        {pkg.items.length === 0 ? (
          <View className="items-center py-12">
            <MaterialIcons name="inventory-2" size={40} color="#e5e7eb" />
            <Text className="text-gray-400 mt-3 text-sm">No items in this package</Text>
          </View>
        ) : (
          pkg.items.map((item, index) => (
            <LineItemRow
              key={index}
              item={item}
              selected={selectedIds.has(index)}
              onToggle={() => toggleItem(index)}
              currency={currency}
            />
          ))
        )}
      </ScrollView>

      {/* ── Sticky bottom summary ── */}
      <View className="absolute bottom-0 left-0 right-0 px-4 pb-8">
        <View
          className="bg-white rounded-2xl border border-gray-100 p-5"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: -4 },
            elevation: 10,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center gap-2 mb-4">
            <MaterialIcons name="receipt-long" size={18} color="#ee2b8c" />
            <Text className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Package Summary
            </Text>
          </View>

          {/* All items, checked or struck-through */}
          <View className="gap-3 border-b border-gray-100 pb-4 mb-4">
            {pkg.items.map((item, index) => (
              <SummaryRow
                key={index}
                item={item}
                selected={selectedIds.has(index)}
                currency={currency}
              />
            ))}
          </View>

          {/* Total row */}
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-base font-bold text-gray-900">
              Calculated Total
            </Text>
            <Text className="text-2xl font-bold text-primary">
              {formatCurrency(selectedTotal, currency)}
            </Text>
          </View>

          {/* Send Request CTA */}
          <Pressable
            className="w-full py-4 rounded-xl items-center justify-center active:opacity-80"
            style={{ backgroundColor: "#ee2b8c" }}
            android_ripple={{ color: "#c4006e" }}
          >
            <Text className="text-white text-base font-bold">Send Request</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
