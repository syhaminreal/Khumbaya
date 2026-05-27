import { useThrottledRouter } from '@/src/hooks/useThrottledRouter';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Navigation, Plus, Truck } from 'lucide-react-native';
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogisticsCard } from '../../components/logistics/LogisticsCard';
import { StatCard } from '../../components/logistics/StatCard';
import { useGetVehicle } from '../../features/logistics/hooks/use-transport';
import { useEventvehicleStore } from '../../features/logistics/store/useLogisticStore';
import type { EventVehicle } from '../../features/logistics/type';
import { formatDate, formatTime } from '../../utils/helper';
import GuestLogistic from '../guest/guest-logistic';

const toFleetStatus = (status?: string): 'En Route' | 'Active' | 'In Service' | 'Idle' => {
  const normalized = status?.toLowerCase?.() ?? '';
  if (normalized.includes('route')) return 'En Route';
  if (normalized.includes('service')) return 'In Service';
  if (normalized.includes('active')) return 'Active';
  return 'Idle';
};

const toAvailabilityText = (value?: Date | null | string) => {
  if (!value) return 'Not set';

  const iso = typeof value === 'string' ? value : value.toISOString();
  const date = formatDate(iso);
  const time = formatTime(iso);

  if (date === '—' && time === '') return 'Not set';
  return `${date} • ${time}`;
};



const LogisticsHomepage = () => {
  const {push} =useThrottledRouter();
  const router = useRouter();
  const { eventId, isGuest } = useLocalSearchParams();
  const isGuestView = isGuest === "true";
  const setDraft = useEventvehicleStore((state) => state.setDraft);
  const { data: vehicles = [], isLoading: isVehiclesLoading } = useGetVehicle(String(eventId ?? ''));

  const fleetCards = vehicles.map((vehicle: EventVehicle, index: number) => {
    const idValue = vehicle.id ?? index + 1;

    return {
      key: String(idValue),
      id: vehicle.vehicleName || `Vehicle ${idValue}`,
      type: vehicle.capacity ? `${vehicle.capacity}-Seater` : 'Transport Vehicle',
      status: toFleetStatus(),
      origin: `Start: ${toAvailabilityText(vehicle.availablityStartTime)}`,
      destination: `End: ${toAvailabilityText(vehicle.availablityEndTime)}`,
      rawId: String(idValue),
      rawVehicle: vehicle,
    };
  });



  const handleAddVehicle = () => {
    if (isGuestView) return;
    push(`./add-logistics`);
  };

  const handleManageVehicle = (busId: string) => {
   push({
      pathname: './manage',
      params: {
        eventId: String(eventId),
        vehicleId: busId,
      },
    });

  };

  const handleEditVehicle = (vehicle: EventVehicle, vehicleId: string) => {
    if (isGuestView) return;
    setDraft(vehicle);
    push({
      pathname: './edit-logistics',
      params: {
        eventId: String(eventId),
        vehicleId,
        isEdit: 'true',
      },
    });
  };
  
  if (isGuestView) {
    return (
     <GuestLogistic />
    );
  }
  return (
    <SafeAreaView
      className='flex-1'
      edges={["top", "bottom"]}
    >
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        {/* Custom Top Bar */}
        <View className="px-6 pb-2 pt-4 flex-row items-center bg-white">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} className="bg-white rounded-full p-2 shadow">
            <Ionicons name="chevron-back" size={22} color="#ee2b8c" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-xl font-jakarta-bold text-gray-900">Logistics</Text>
          {!isGuestView && (
            <TouchableOpacity
              onPress={handleAddVehicle}
              className="bg-primary px-4 py-2 rounded-xl flex-row items-center shadow-lg shadow-pink-200"
            >
              <Plus size={18} color="white" />
              <Text className="text-white font-jakarta-bold text-sm ml-1">Add</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          className="bg-gray-50/50"
        >
          {/* Statistics Section */}
          <View className="px-6 py-6 pt-2">
            <View className="flex-row justify-between mb-4 items-center">
              <Text className="text-gray-900 font-jakarta-bold text-lg">Operational Overview</Text>
            </View>

            <View className="flex-row mb-3">
              <StatCard
                label="Active Fleet"
                value="24"
                icon={Truck}
                color="#ee2b8c"
                bgColor="bg-pink-50"
              />
              <StatCard
                label="In Transit"
                value="18"
                icon={Navigation}
                color="#059669"
                bgColor="bg-emerald-50"
              />
            </View>

          </View>

          {/* Fleet Status Section */}
          <View className="px-6 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-900 font-jakarta-bold text-lg">Fleet Status</Text>
              <TouchableOpacity>
                <Text className="text-primary font-jakarta-semibold text-sm">View All</Text>
              </TouchableOpacity>
            </View>

            {isVehiclesLoading ? (
              <View className="py-8 items-center justify-center">
                <ActivityIndicator size="small" color="#ee2b8c" />
              </View>
            ) : fleetCards.length > 0 ? (
              fleetCards.slice(0, 3).map((vehicle) => (
                <LogisticsCard
                  key={vehicle.key}
                  id={vehicle.id}
                  type={vehicle.type}
                  status={vehicle.status}
                  origin={vehicle.origin}
                  destination={vehicle.destination}
                  onPress={() => handleManageVehicle(vehicle.rawId)}
                  onEditPress={() => handleEditVehicle(vehicle.rawVehicle, vehicle.rawId)}
                  onManagePress={() => handleManageVehicle(vehicle.rawId)}
                />
              ))
            ) : (
              <View className="bg-white rounded-2xl p-4 border border-gray-100">
                <Text className="text-gray-500 font-jakarta-medium text-sm">No vehicles added for this event yet.</Text>
              </View>
            )}
          </View>


        </ScrollView>

      </View>
    </SafeAreaView>
  );
};

export default LogisticsHomepage;
