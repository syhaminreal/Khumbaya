import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import { Modal, Platform } from "react-native";
import Animated, { Easing, FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";


type DateTimePickerChangeEvent = { type?: string };
type DateTimePickerMode = "date" | "time";
type DateTimeSetValue<TField extends string = string> = (
  field: TField,
  value: Date | null,
  options?: { shouldDirty?: boolean }
) => void;

// Helper Function 
export const openDateOrTimePicker = (
  field: string,
  dateTime: Date | null,
  type: DateTimePickerMode,
  onChange: (event: DateTimePickerChangeEvent, selectedDate?: Date) => void
) => {
  void field;
  const value = dateTime ?? new Date();
  DateTimePickerAndroid.open({
    value,
    onChange: onChange,
    mode: type,
  });
};

// NOTE: Reusable date/time picker handler is intentionally not used in RSVP for now.
// It can be brought back later if multiple screens need the same merge logic.
// export const createDateTimePickerHandler = <TField extends string>(
//   field: TField,
//   mode: DateTimePickerMode,
//   currentValue: Date | null,
//   setValue: DateTimeSetValue<TField>,
//   options: { shouldDirty?: boolean } = { shouldDirty: true }
// ) =>
//   (event: DateTimePickerChangeEvent, selectedDate?: Date) => {
//     if (event?.type === "dismissed") return;
//
//     const baseValue = currentValue ?? new Date();
//     const pickedValue = selectedDate ?? baseValue;
//
//     let nextValue = pickedValue;
//     if (mode === "date" && baseValue) {
//       nextValue = new Date(baseValue);
//       nextValue.setFullYear(
//         pickedValue.getFullYear(),
//         pickedValue.getMonth(),
//         pickedValue.getDate()
//       );
//     }
//     if (mode === "time" && baseValue) {
//       nextValue = new Date(baseValue);
//       nextValue.setHours(
//         pickedValue.getHours(),
//         pickedValue.getMinutes(),
//         pickedValue.getSeconds(),
//         pickedValue.getMilliseconds()
//       );
//     }
//
//     setValue(field, nextValue, options);
//   };
type PasswordStrength = "weak" | "medium" | "strong" | "very-strong";
export const calculatePasswordStrength = (pwd: string): PasswordStrength => {
  if (pwd.length === 0) return "weak";
  if (pwd.length < 6) return "weak";
  if (pwd.length < 10) return "medium";
  if (pwd.length < 14) return "strong";
  return "very-strong";
};

const _damping = 8;
export const _entering = FadeInDown.springify(500).damping(_damping).easing(Easing.ease);
export const _exiting = FadeOut.springify(500).damping(_damping).easing(Easing.ease);
export const _layoutAnimation = LinearTransition.springify(500).damping(_damping);
export const parseDate = (value?: string): Date => {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export const formatDate = (dateValue?: string) => {
  if (!dateValue) return "—";

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDateWithWeekday = (dateValue?: string) => {
  if (!dateValue) return "—";

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (
  dateValue?: string,
  fallbackTime?: string | null
) => {
  if (fallbackTime) return fallbackTime;
  if (!dateValue) return "";

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const toISODateString = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "";
  const parsed = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString();
};

export const getDateKey = (dateValue?: string | null): string => {
  if (!dateValue) return "";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};

export const formatDateTime = (dateValue?: string | null): string => {
  if (!dateValue) return "—";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatTimeRange = (
  startDateTime?: string | null,
  endDateTime?: string | null,
  fallbackText = ""
): string => {
  const startText = startDateTime ? formatTime(startDateTime) : "";
  const endText = endDateTime ? formatTime(endDateTime) : "";

  if (startText && endText) return `${startText} — ${endText}`;
  if (startText) return startText;
  if (endText) return endText;
  return fallbackText;
};

/**
 * Friendly date + time range formatter used by UI screens.
 * Example: "May 21 · 3:00 PM – 4:00 PM"
 */
export const formatDateTimeRangeVerbose = (
  startDateTime?: string | null,
  endDateTime?: string | null
): string => {
  if (!startDateTime && !endDateTime) return "—";

  const start = startDateTime ? new Date(startDateTime) : null;
  const end = endDateTime ? new Date(endDateTime) : null;

  if (start && Number.isNaN(start.getTime())) return "—";
  if (end && Number.isNaN(end.getTime())) return "—";

  if (start && end) {
    return `${formatShort(start)} · ${formatTime(startDateTime ?? undefined)} – ${formatTime(
      endDateTime ?? undefined
    )}`;
  }

  if (start) return `${formatShort(start)} · ${formatTime(startDateTime ?? undefined)}`;
  if (end) return `${formatShort(end)} · ${formatTime(endDateTime ?? undefined)}`;
  return "—";
};

type ChecklistDueMeta = {
  label: string;
  badgeClassName: string;
  textClassName: string;
};

export const getChecklistDueMeta = (
  dateValue?: string | null
): ChecklistDueMeta | null => {
  if (!dateValue) return null;
  const dateKey = getDateKey(dateValue);
  if (!dateKey) return null;
  const todayKey = getDateKey(new Date().toISOString());
  if (dateKey !== todayKey) return null;

  return {
    label: "Due Today",
    badgeClassName: "bg-orange-50",
    textClassName: "text-orange-500",
  };
};

export const formatShort = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export const formatDayOnly = (date: Date) =>
  date.toLocaleDateString("en-US", {
    day: "numeric",
  });
type SubEventStatusMeta = {
  label: string;
  badgeClassName: string;
  dotClassName: string;
  cardClassName: string;
  isActive: boolean;
};

export const getSubEventStatusMeta = (
  status?: string | null
): SubEventStatusMeta => {
  const normalized = status?.toLowerCase?.() ?? "upcoming";

  switch (normalized) {
    case "ongoing":
      return {
        label: "Happening now",
        badgeClassName: "bg-pink-500 text-white",
        dotClassName:
          "bg-pink-500 text-white ring-1 ring-pink-200 border-2 border-[#f8f6f7]",
        cardClassName: "border-2 border-pink-500 shadow-sm",
        isActive: true,
      };
    case "completed":
      return {
        label: "Done",
        badgeClassName: "bg-gray-800 text-white",
        dotClassName:
          "bg-gray-100 text-gray-500 border-2 border-[#f8f6f7]",
        cardClassName: "border border-transparent opacity-60",
        isActive: false,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        badgeClassName: "bg-red-700 text-white",
        dotClassName: "bg-red-100 text-red-600 border-2 border-[#f8f6f7]",
        cardClassName: "border border-red-100 opacity-80",
        isActive: false,
      };
    default:
      return {
        label: "Upcoming",
        badgeClassName: "bg-green-500 text-white",
        dotClassName: "bg-white text-[#181114] border-2 border-[#f8f6f7]",
        cardClassName: "border border-[#e6dbe0]",
        isActive: false,
      };
  }
};

export const sortByDateTime = <T>(
  items: T[],
  getDateValue: (item: T) => string | null | undefined
): T[] => {
  return [...items].sort((a, b) => {
    const aDate = getDateValue(a);
    const bDate = getDateValue(b);
    const aTime = aDate ? new Date(aDate).getTime() : Number.POSITIVE_INFINITY;
    const bTime = bDate ? new Date(bDate).getTime() : Number.POSITIVE_INFINITY;
    return aTime - bTime;
  });
};

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}


export const shadowStyle = {
  backgroundColor: '#FFF', // Always need a bg color for shadows to show
  borderRadius: 12,

  // The "Pop" Border
  borderWidth: 1,
  borderColor: 'rgba(0, 0, 0, 0.05)', // Super subtle border

  ...Platform.select({
    ios: {
      // New boxShadow API for smooth animation
      boxShadow: [
        {
          offsetX: 0,
          offsetY: 2,
          blurRadius: 8,
          color: 'rgba(0, 0, 0, 0.07)',
        },
      ],
    },
    android: {
      // Latest Android shadow support (RN 0.76+)
      boxShadow: [
        {
          offsetX: 0,
          offsetY: 2,
          blurRadius: 8,
          color: 'rgba(0, 0, 0, 0.07)',
        },
      ],
      // Fallback for older versions if needed
      // elevation: 3, 
    },
    default: {},
  }),
};



export const AnimatedModal  = Animated.createAnimatedComponent(Modal);