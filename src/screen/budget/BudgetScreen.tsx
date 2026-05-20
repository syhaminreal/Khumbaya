import { BudgetStatsGrid, CategoryCard } from "@/src/components/budget";
import { Text } from "@/src/components/ui/Text";
import { SetBudgetForm } from "@/src/features/budget/components";
import { useBudgetSummary } from "@/src/features/budget/hooks/use-budget";
import {
  useEventById,
  useUpdateEvent,
} from "@/src/features/events/hooks/use-event";
import { useEventStore } from "@/src/features/events/store/useEventStore";
import { useThrottledRouter } from "@/src/hooks/useThrottledRouter";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EventBudgetScreen() {
  const [search, setSearch] = useState("");
  //For the sub event also show the parent budget and the input from the parent thng in there 
  const [editBudgetVisible, setEditBudgetVisible] = useState(false);
  const { eventDraft } = useEventStore();
  const [budgetInput, setBudgetInput] = useState("");
  const router = useRouter();
  const { eventId, isSubEvent } = useLocalSearchParams<{ eventId: string; isSubEvent: string }>();
  let effectiveEventId = eventId;

  const isSubEventBoolean = useMemo(() => {
    if ("true" == isSubEvent) {
      return true;
    } else {
      return false;
    }
  }, [eventId]
  );

  if (isSubEvent) {

    if (!eventDraft) {
      return <>
        No information about the event seems like its coming from the wrong route
      </>
    }
    //Definiing the sub event from the draft if this is the sub event 
    effectiveEventId = isSubEventBoolean ? eventDraft.id : eventId;
  }

  const { data: eventData, isLoading: eventLoading } = useEventById(
    Number(effectiveEventId)
  );
  const { mutate: updateEvent, isPending: isUpdatingBudget } = useUpdateEvent(
    Number(eventId)
  );

  const hasBudget = eventData?.budget && eventData.budget > 0 ? true : false;
  const { data: budgetData, isLoading: budgetLoading } = useBudgetSummary(
    Number(effectiveEventId),
    { enabled: hasBudget }
  );

  const { push } = useThrottledRouter();
  const handleAddPress = () => {
    push({
      pathname: "../budget/addBudgetItem",
    });
  };


  const handleSaveBudget = async () => {
    const newBudget = parseFloat(budgetInput);
    if (isNaN(newBudget) || newBudget <= 0) {
      Alert.alert("Invalid Budget", "Please enter a valid budget amount");
      return;
    }

    try {
      updateEvent({ budget: newBudget });
      setEditBudgetVisible(false);
      Alert.alert("Success", "Budget updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update budget. Please try again.");
    }
  };

  if (eventLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#ee2b8c" />
      </View>
    );
  }

  if (!hasBudget && !isSubEventBoolean) {
    return <SetBudgetForm eventId={Number(eventId)} />;
  }

  if (budgetLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#ee2b8c" />
      </View>
    );
  }

  const data = budgetData; // Calculate the budget data of the parent id if it is a sub event, otherwise use the data as it is.
  const totalBudget = data.summary?.totalBudget;
  const totalAllocated = data.summary?.totalAllocated || 0;
  const totalSpent = data.summary?.totalSpend || 0;
  const totalRemaining = data.summary?.remaining || 0;

  const filteredCategories = data.categories.filter((cat: any) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 bg-[#f8f6f7]">
      <Stack.Screen
        options={{
          headerRight: () => (
            !isSubEventBoolean && <TouchableOpacity
              onPress={() =>
                push({
                  pathname: "../edit-event",
                })
              }
              className="pr-4"
              activeOpacity={0.7}
            >
              <MaterialIcons name="edit" size={24} color="#181114" />
            </TouchableOpacity>
          ),
        }}
      />

      <Modal
        visible={editBudgetVisible && !isSubEvent}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditBudgetVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setEditBudgetVisible(false)}
        >
          <View className="flex-1 items-center justify-center px-6">
            <Pressable
              className="bg-white rounded-3xl p-6 w-full"
              onPress={() => { }}
            >
              <Text
                className="text-[#181114] text-lg font-bold mb-4"
                variant="h1"
              >
                Edit Budget
              </Text>

              <View className="gap-2 mb-6">
                <Text className="text-sm text-gray-600 ml-1" variant="h2">
                  Budget Amount
                </Text>
                <View className="relative">
                  <Text
                    className="absolute left-4 top-3.5 text-sm text-gray-600"
                    variant="h2"
                  >
                    Rs.
                  </Text>
                  <TextInput
                    className="w-full h-14 bg-[#f8f6f7] pl-12 pr-4 rounded-md text-[#181114] border border-gray-100"
                    placeholder="0.00"
                    placeholderTextColor="#999"
                    keyboardType="decimal-pad"
                    value={budgetInput}
                    onChangeText={setBudgetInput}
                    autoFocus
                  />
                </View>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setEditBudgetVisible(false)}
                  className="flex-1 h-12 bg-gray-100 rounded-md items-center justify-center"
                >
                  <Text className="text-[#181114]" variant="h2">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveBudget}
                  disabled={isUpdatingBudget}
                  className="flex-1 h-12 bg-[#ee2b8c] rounded-md items-center justify-center"
                >
                  {isUpdatingBudget ? (
                    <MaterialIcons
                      name="hourglass-empty"
                      size={20}
                      color="white"
                    />
                  ) : (
                    <Text className="text-white font-bold" variant="h2">
                      Save
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-5 mt-5 rounded-md overflow-hidden shadow-lg">
          <LinearGradient
            colors={["#ee2b8c", "#d71f7a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-8 gap-6"
          >
            <View>
              <Text
                className="text-white text-xs opacity-80 tracking-widest mb-2"
                variant="h1"
              >
                TOTAL BUDGET
              </Text>
              <Text className="text-white text-4xl" variant="h1">
                Rs. {totalBudget.toLocaleString()}
              </Text>
            </View>

            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-white text-xs opacity-80" variant="h1">
                  Allocated
                </Text>
                <Text className="text-white text-xs opacity-80" variant="h2">
                  {totalBudget > 0
                    ? Math.round((totalAllocated / totalBudget) * 100)
                    : 0}
                  %
                </Text>
              </View>
              <View
                className="h-2.5 bg-white rounded-sm overflow-hidden"
                style={{ opacity: 0.2 }}
              >
                <View
                  className="h-full bg-white rounded-sm"
                  style={{
                    width: `${Math.min((totalAllocated / totalBudget) * 100, 100)}%`,
                  }}
                />
              </View>
            </View>

            <BudgetStatsGrid
              variant="budget"
              stats={[
                { label: "Allocated", value: totalAllocated },
                { label: "Remaining", value: totalRemaining },
                { label: "Spent", value: totalSpent },
              ]}
            />
          </LinearGradient>
        </View>

        <View className="mx-5 mt-6 mb-6">
          <View className="flex-row items-center bg-white rounded-md px-4 py-2 shadow-sm border border-gray-100">
            <MaterialIcons name="search" size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 ml-3 text-sm text-[#181114]"
              placeholder="Search categories..."
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {filteredCategories.length === 0 ? (
          <View className="mx-5 bg-white rounded-2xl p-8 items-center gap-3">
            <MaterialIcons name="folder-open" size={40} color="#d1d5db" />
            <Text className="text-gray-500 font-semibold text-center">
              No categories yet
            </Text>
            <Text className="text-xs text-gray-400 text-center">
              Start by adding your first budget category
            </Text>
          </View>
        ) : (
          <View className="px-5 gap-4">
            {filteredCategories.map((cat: any) => (
              <CategoryCard
                key={cat.id}
                id={cat.id}
                name={cat.name}
                allocatedBudget={cat.allocatedBudget}
                spend={cat.spent}
                onPress={() => {
                  router.push(
                    {
                      pathname: `/events/[eventId]/budget/[categoryId]`,
                      params: { categoryId: cat.id, eventId: effectiveEventId.toString(), navigationEventid: eventId.toString() }
                    }
                  );
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>
      {!isSubEventBoolean &&
        <TouchableOpacity
          className="absolute right-5 bottom-8 flex-row items-center gap-2 px-6 py-3 rounded-full bg-[#ee2b8c] shadow-lg active:opacity-80"
          activeOpacity={0.8}
          onPress={handleAddPress}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text className="text-white text-xs font-bold tracking-tight">
            Add Category
          </Text>
        </TouchableOpacity>
      }
    </View>
  );
}
