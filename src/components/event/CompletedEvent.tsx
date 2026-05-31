import { useGetCompletedEvents } from "@/src/features/events/hooks/use-event";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { Event_WITH_ROLE } from "./EventwithRole";

interface CompletedEventsTabProps {
	isActive: boolean;
}

export const CompletedEventsTab = ({ isActive }: CompletedEventsTabProps) => {
	const [refreshing, setRefreshing] = useState(false);
    if(!isActive){
        return null;
    }
	const {
		data: completedEvents = [],
		isLoading,
		isError,
		refetch,
	} = useGetCompletedEvents({ enabled: isActive });

	const onRefresh = async () => {
		setRefreshing(true);
		await refetch();
		setRefreshing(false);
	};

	return (
		<ScrollView
			className="flex-1 px-4"
			showsVerticalScrollIndicator={false}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}
			contentContainerStyle={{ paddingBottom: 100 }}
		>
			{isLoading ? (
				<View className="items-center justify-center mt-24">
					<Text className="text-gray-400 text-base font-medium mt-4">
						Loading completed events...
					</Text>
				</View>
			) : isError ? (
				<View className="items-center justify-center mt-24">
					<Text className="text-gray-400 text-base font-medium mt-4">
						Failed to load completed events
					</Text>
				</View>
			) : completedEvents.length > 0 ? (
				completedEvents.map((event) => (
					<Event_WITH_ROLE key={event.id} event={event} onPress={() => {}} />
				))
			) : (
				<View className="items-center justify-center mt-24">
					<Ionicons name="checkmark-done-circle-outline" size={52} color="#d1d5db" />
					<Text className="text-gray-400 text-base font-medium mt-4">
						No events found
					</Text>
					<Text className="text-gray-400 text-sm mt-1 text-center px-8">
						No completed events
					</Text>
				</View>
			)}
		</ScrollView>
	);
};
