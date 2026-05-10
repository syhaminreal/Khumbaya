import { Text } from "@/src/components/ui/Text";
import { OtherServiceAttribute } from "@/src/features/business/types";
import { shadowStyle } from "@/src/utils/helper";
import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
type InfoRowItem = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string | number | null | undefined;
};

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string | number;
}) {
  return (
    <View className="flex-row items-center gap-3 py-3 border-b border-gray-50">
      <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
        <MaterialIcons name={icon} size={16} color="#ee2b8c" />
      </View>
      <Text className="text-xs text-[#594048] flex-1">{label}</Text>
      <Text variant="h1" className="text-xs text-[#181114] text-right max-w-[50%]" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function BoolBadge({ label, value }: { label: string; value: boolean }) {
  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-xl px-3 py-2 ${value ? "bg-emerald-50 border border-emerald-200" : "bg-gray-50 border border-gray-200"
        }`}
    >
      <MaterialIcons
        name={value ? "check-circle" : "cancel"}
        size={14}
        color={value ? "#059669" : "#9ca3af"}
      />
      <Text
        className={`text-[11px] ${value ? "text-emerald-700" : "text-gray-400"}`}
      >
        {label}
      </Text>
    </View>
  );
}


export default function ServiceDetailsSection({
  service,
  onEdit,
}: {
  service: OtherServiceAttribute;
  onEdit?: () => void;
}) {
  const allRows: InfoRowItem[] = [
    { icon: "person", label: "Artist Type", value: service.artistType },
    { icon: "palette", label: "Styles Specialized", value: service.stylesSpecialized },
    { icon: "event-available", label: "Max Bookings / Day", value: service.maxBookingsPerDay },
    {
      icon: "payments",
      label: "Advance Amount",
      value: service.advanceAmount != null ? `₹${service.advanceAmount.toLocaleString()}` : null,
    },
    {
      icon: "flight-takeoff",
      label: "Travel Charges",
      value: service.travelCharges != null ? `₹${service.travelCharges.toLocaleString()}` : null,
    },
    {
      icon: "shopping-bag",
      label: "Minimum Order",
      value: service.minOrder != null ? `₹${service.minOrder.toLocaleString()}` : null,
    },
  ];
  const infoRows = allRows.filter(
    (r): r is InfoRowItem & { value: string | number } => r.value != null
  );

  const boolFlags = [
    { label: "Uses Own Material", value: service.usesOwnMaterial },
    { label: "Available for Destination", value: service.availableForDestination },
    { label: "Customization Available", value: service.customizationAvailable },
    { label: "Serves Veg", value: service.servicesVeg },
  ];

  return (
    <View
      className="bg-white rounded-2xl border border-gray-100 p-4"
      style={shadowStyle}
    >
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="miscellaneous-services" size={18} color="#ee2b8c" />
          <Text variant="h1" className="text-base text-[#181114]">Service Details</Text>
        </View>
        {onEdit && (
          <TouchableOpacity
            onPress={onEdit}
            activeOpacity={0.75}
            className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
          >
            <MaterialIcons name="edit" size={15} color="#594048" />
          </TouchableOpacity>
        )}
      </View>

      {infoRows.map((r) => (
        <InfoRow key={r.label} icon={r.icon} label={r.label} value={r.value} />
      ))}

      {service.portfolioLink != null && (
        <InfoRow
          icon="link"
          label="Portfolio"
          value={service.portfolioLink}
        />
      )}

      <View className="flex-row flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
        {boolFlags.map((f) => (
          <BoolBadge key={f.label} label={f.label} value={f.value} />
        ))}
      </View>
    </View>
  );
}
