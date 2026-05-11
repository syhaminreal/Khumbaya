import { formatDate } from "@/src/utils/helper";
import { Ionicons } from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";
import { Image, Text, View } from "react-native";

interface EventDetailHeroProps {
  imageUrl?: string;
  status?: string;
  title?: string;
  date?: string;
  startDateTime?: string;
  endDateTime?: string;
  location?: string;
  venue?: string;
  days?: number;
  hours?: number;
  minutes?: number;
}

const FALLBACK_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDeW7ylSiob80ww9XoAOOV3fReuakm7CdifvgqSXNruTM_9zAafkSATg54Dmx3H7FAZ5KXTRd39NLDkX59Y3q3sxo1tkE7A7izp0iVgffzw7wQD1ZGNTwh0GVaKomwXQ9aAgwXmkYiHuyLVXHjwPa43pqfUwcXAnj00ohS22F1JIFaI0gqlP4ljcXEqU0-A1ZjuQLfYmk0FeUhi3kPIuFPTGwNPv_HTUqTqGaOGf9I_Hr5lb4N45xrwpUyAvH3ZVxD2I2QRXr3HmhQ";

const EventDetailHero = ({
  imageUrl,
  status = "upcoming",
  title = "Event Details",
  date = "—",
  startDateTime,
  endDateTime,
  location = "—",
  venue,
  days = 0,
  hours = 0,
  minutes = 0,
}: EventDetailHeroProps) => {
  const event = {
    imageUrl: imageUrl || FALLBACK_IMAGE,
    status,
    title,
    date,
    startDateTime,
    endDateTime,
    location,
    venue,
    days,
    hours,
    minutes,
  };

  return (
    <View>
      <View className="relative w-full h-[30vh]  rounded-full ">
        <Image
          source={{ uri: event.imageUrl }}
          className="absolute inset-0 w-full h-full "
          resizeMode="cover"
        />
        {/* Dark overlay gradient */}
        <View className="absolute inset-0 overflow-hidden z-10">
          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.3)", "transparent"]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={{ flex: 1 }}
          />
        </View>

        <View className="absolute bottom-10 left-0 w-full px-6 z-10 mb-4">
          <View className="flex-col gap-1 items-center justify-center">
            <Text className="text-3xl font-extrabold text-white leading-tight tracking-tight text-center">
              {event.title}
            </Text>
            <View className="flex items-center gap-1 text-white/90 mt-1">
              <View className="flex flex-row gap-3">
                <Ionicons name="calendar" size={18} color="white" />
                <Text className="text-sm font-medium text-white">
                  {/* {event.date} */}
                   {event.startDateTime
                    ?  formatDate(event.startDateTime)
                    : "—"}
                  {event.endDateTime
                    ? ` - ${formatDate(event.endDateTime)}`
                    : ""}
                </Text>
              </View>
              <View className="flex flex-row gap-3">
                <Ionicons name="location" size={18} color="white" />
                <Text className="text-sm font-medium text-white">
                  {event.location}
                </Text>
              </View>
              {event.venue && (
                <View className="flex flex-row gap-3">
                  <Ionicons name="business" size={18} color="white" />
                  <Text className="text-sm font-medium text-white">
                    {event.venue}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default EventDetailHero;
