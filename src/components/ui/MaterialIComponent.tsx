import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
export const MaterialIconCompopnent = ({
  name,
  size = 20,
}: {
  name: string;
  color?: string;
  size?: number;
}) => (
  <MaterialIcons
    name={name.replace(/_/g, "-") as keyof typeof MaterialIcons.glyphMap}
    className="!text-primary"
    size={size}
  />
);

  export const openDateOrTimePicker = (
    field: "arrivalDateTime" | "departureDateTime",
    dateTime: Date | null,
    type: "date" | "time",
    onChange:()=>void
  ) => {
    const value = dateTime ?? new Date();
    DateTimePickerAndroid.open({
      value,
      onChange:onChange,
      mode: type,
    });
  };