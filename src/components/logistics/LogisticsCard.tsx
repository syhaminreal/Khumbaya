import { MaterialIcons } from '@expo/vector-icons';
import { Truck, UserPlus } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface LogisticsCardProps {
  id: string;
  type: string;
  status: 'En Route' | 'Active' | 'In Service' | 'Idle';
  origin: string;
  destination: string;
  availabilityStart?:   Date |null;
  availabilityEnd?:  Date|null;
  onPress?: () => void;
  onEditPress?: () => void;
  onManagePress?: () => void;
  onAddGuestPress?: () => void;
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'En Route':
      return { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' };
    case 'Active':
      return { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' };
    case 'In Service':
      return { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500' };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-500' };
  }
};

export const LogisticsCard: React.FC<LogisticsCardProps> = ({
  id,
  type,
  status,
  origin,
  destination,
  availabilityStart,
  availabilityEnd,
  onPress,
  onEditPress,
  onManagePress,
  onAddGuestPress,
}) => {
  const styles = getStatusStyles(status);
  const topLine = origin === 'Not set'
    ? `Start: ${availabilityStart || 'Not set'}`
    : origin;
  const bottomLine = destination === 'Not set'
    ? `End: ${availabilityEnd || 'Not set'}`
    : destination;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-white p-4 rounded-2xl mb-4 border border-gray-100 shadow-sm"
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-pink-50 rounded-xl items-center justify-center mr-3">
            <Truck size={20} color="#ee2b8c" />
          </View>
          <View>
            <Text className="text-gray-900 font-jakarta-bold text-base">{id}</Text>
            <Text className="text-gray-500 font-jakarta text-xs">{type}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          {onEditPress && (
            <TouchableOpacity
              onPress={onEditPress}
              className="w-8 h-8 rounded-full items-center justify-center border border-gray-100 bg-gray-50"
            >
              <MaterialIcons name="more-vert" size={16} color="#6b7280" />
            </TouchableOpacity>
          )}
          <View className={`${styles.bg} px-3 py-1 rounded-full border border-black/5 flex-row items-center`}>
            <View className={`w-1.5 h-1.5 rounded-full ${styles.dot} mr-1.5`} />
            <Text className={`${styles.text} text-[10px] font-jakarta-bold uppercase`}>{status}</Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center mb-4 pl-1">
        <View className="items-center mr-3">
          <View className="w-1.5 h-1.5 rounded-full bg-pink-500" />
          <View className="w-[1px] h-6 bg-gray-200" />
          <View className="w-1.5 h-1.5 rounded-full border border-pink-500" />
        </View>
        <View className="flex-1 justify-between h-10">
          <Text className="text-gray-900 font-jakarta-semibold text-xs" numberOfLines={1}>{topLine}</Text>
          <Text className="text-gray-400 font-jakarta-medium text-xs" numberOfLines={1}>{bottomLine}</Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity 
          className="flex-1 bg-primary h-10 rounded-xl items-center justify-center shadow-lg shadow-pink-200"
          onPress={onManagePress}
        >
          <Text className="text-white font-jakarta-bold text-sm">Manage</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100"
          onPress={onAddGuestPress}
        >
          <UserPlus size={18} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
