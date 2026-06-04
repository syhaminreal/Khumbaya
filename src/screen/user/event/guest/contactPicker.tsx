import {
  CountryOption,
  CountryPickerModal,
} from "@/src/components/ui/CountryPhone";
import { Text } from "@/src/components/ui/Text";
import { COUNTRY_DATA } from "@/src/constants/countrydata";

import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ContactItem = {
  id: string;
  name: string;
  phone: string;
};

export default function ContactPickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const eventId = useMemo(() => {
    const raw = Array.isArray(params.eventId)
      ? params.eventId[0]
      : params.eventId;
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  }, [params.eventId]);

  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [inviteWithFamily, setInviteWithFamily] = useState(false);
  const [familyGuestCount, setFamilyGuestCount] = useState("1");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    COUNTRY_DATA[0]
  );
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        setIsLoadingContacts(false);
        Alert.alert(
          "Permission Denied",
          "Contacts permission is required to import guests.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });

      const mapped: ContactItem[] = data
        .filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0)
        .map((c) => ({
          id: c.id!,
          name: c.name || "Unknown",
          phone: c.phoneNumbers![0].number ?? "",
        }))
        .filter((c) => c.phone.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name));

      setContacts(mapped);
      setIsLoadingContacts(false);
    })();
  }, []);

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.trim().toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
    );
  }, [contacts, search]);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, [contacts]);

  const handleImport = useCallback(() => {
    if (!eventId) {
      Alert.alert("Error", "Invalid event.");
      return;
    }
    if (selected.size === 0) {
      Alert.alert("No contacts selected", "Please select at least one contact.");
      return;
    }

    const payload = contacts
      .filter((c) => selected.has(c.id))
      .map((c) => ({ id: c.id, name: c.name, phone: c.phone }));

    router.push({
      pathname: "/(protected)/(client-stack)/events/[eventId]/(organizer)/guests/contact-review",
      params: {
        eventId: String(eventId),
        inviteWithFamily: String(inviteWithFamily),
        familyGuestCount: String(familyGuestCount),
        dialCode: selectedCountry.dialCode,
        contacts: JSON.stringify(payload),
      },
    });
  }, [
    eventId,
    selected,
    contacts,
    router,
    inviteWithFamily,
    familyGuestCount,
    selectedCountry.dialCode,
  ]);

  const renderItem = useCallback(
    ({ item }: { item: ContactItem }) => {
      const isSelected = selected.has(item.id);
      return (
        <Pressable
          onPress={() => toggleSelect(item.id)}
          className="flex-row items-center px-5 py-3.5 border-b border-gray-100"
        >
          {/* Avatar */}
          <View className="w-10 h-10 rounded-full bg-pink-100 items-center justify-center mr-4">
            <Text className="text-base font-semibold text-[#EE2B8C]">
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* Info */}
          <View className="flex-1">
            <Text className="text-sm font-semibold text-slate-800">
              {item.name}
            </Text>
            <Text className="text-xs text-slate-400 mt-0.5">{item.phone}</Text>
          </View>

          {/* Checkmark */}
          <View
            className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected
                ? "bg-[#EE2B8C] border-[#EE2B8C]"
                : "border-slate-300 bg-white"
              }`}
          >
            {isSelected && (
              <Ionicons name="checkmark" size={14} color="#fff" />
            )}
          </View>
        </Pressable>
      );
    },
    [selected, toggleSelect]
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={[]}>
      {/* Header */}
      {/* <View className="flex-row items-center px-5 pt-4 pb-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 p-1"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1a1b3a" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#1a1b3a] flex-1">
          Import from Contacts
        </Text>
        {selected.size > 0 && (
          <View className="bg-[#EE2B8C] rounded-full px-2.5 py-0.5">
            <Text className="text-white text-xs font-bold">
              {selected.size}
            </Text>
          </View>
        )}
      </View> */}

      {/* Search */}
      <View className="px-5 pb-3">
        <View className="flex-row items-center h-11 bg-gray-100 rounded-xl px-4">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-sm text-slate-800"
            placeholder="Search name or number…"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Family toggle + country code */}
      <View className="px-5 pb-3" style={{ gap: 10 }}>
        <View className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
          <View>
            <Text className="text-sm font-semibold text-slate-800">
              Invite with family
            </Text>
            <Text className="text-xs text-slate-500">
              Allow guest to bring family
            </Text>
          </View>
          <Switch
            value={inviteWithFamily}
            onValueChange={setInviteWithFamily}
            trackColor={{ false: "#cbd5e1", true: "#ee2b8c" }}
            thumbColor="#ffffff"
          />
        </View>

        {inviteWithFamily && (
          <View className="rounded-xl border border-gray-200 bg-white px-4 py-3">
            <Text className="text-sm font-semibold text-slate-800">
              Number of guests
            </Text>
            <TextInput
              className="mt-2 h-11 rounded-lg border border-gray-200 px-3 text-sm text-slate-800"
              placeholder="e.g. 2"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={familyGuestCount}
              onChangeText={(text) =>
                setFamilyGuestCount(text.replace(/\D/g, ""))
              }
            />
          </View>
        )}

        <View className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
          <View className="flex-row items-center gap-2">
            <Image
              source={selectedCountry.image}
              style={{ width: 26, height: 18, borderRadius: 3 }}
              resizeMode="cover"
            />
            <Text className="text-sm font-semibold text-slate-800">
              +{selectedCountry.dialCode}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setPickerVisible(true)}>
            <Text className="text-xs font-semibold text-[#EE2B8C]">
              Change
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="text-[11px] text-slate-500">
          Used when a contact has no country code.
        </Text>
      </View>

      {/* Contact List */}
      {isLoadingContacts ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EE2B8C" />
          <Text className="mt-3 text-slate-400 text-sm">
            Loading contacts…
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <View className="flex-1 items-center mt-16">
              <Ionicons name="people-outline" size={48} color="#D1D5DB" />
              <Text className="mt-3 text-slate-400 text-sm">
                {search ? "No contacts match your search." : "No contacts found."}
              </Text>
            </View>
          }
        />
      )}

      {/* Import Button */}
      {!isLoadingContacts && (
        <View className="absolute bottom-8 left-5 right-5">
          <TouchableOpacity
            onPress={handleImport}
            disabled={selected.size === 0}
            className={`h-14 rounded-2xl items-center justify-center flex-row ${selected.size === 0 ? "bg-gray-200" : "bg-[#EE2B8C]"
              }`}
            style={
              selected.size > 0
                ? {
                  shadowColor: "#EE2B8C",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 8,
                  elevation: 8,
                }
                : {}
            }
          >
            <>
              <Ionicons
                name="person-add-outline"
                size={20}
                color={selected.size === 0 ? "#9CA3AF" : "#fff"}
              />
              <Text
                className={`ml-2 text-sm font-semibold ${selected.size === 0 ? "text-gray-400" : "text-white"
                  }`}
              >
                  {selected.size === 0
                    ? "Select contacts to invite"
                    : `Review ${selected.size} contact${selected.size > 1 ? "s" : ""}`}
                </Text>
              </>
          </TouchableOpacity>
        </View>
      )}

      <CountryPickerModal
        visible={pickerVisible}
        selected={selectedCountry}
        onClose={() => setPickerVisible(false)}
        onSelect={(country) => setSelectedCountry(country)}
      />
    </SafeAreaView>
  );
}
