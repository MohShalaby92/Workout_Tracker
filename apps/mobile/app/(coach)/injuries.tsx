import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAuthStore } from "@/store/auth";
import { useInjuriesStore } from "@/store/injuries";
import { useClientsStore } from "@/store/clients";
import type { InjuryStatus } from "@shared/types/database";
import type { InjuryWithClient } from "@/services/injuries";
import { BODY_PARTS } from "@shared/constants";

const STATUS_FILTERS: (InjuryStatus | "all")[] = [
  "all",
  "active",
  "recovering",
  "resolved",
];

const INJURY_STATUSES: InjuryStatus[] = ["active", "recovering", "resolved"];

const STATUS_STYLES: Record<
  InjuryStatus,
  { bg: string; text: string; border: string }
> = {
  active: {
    bg: "bg-red-500/20",
    text: "text-red-500",
    border: "border-l-red-500",
  },
  recovering: {
    bg: "bg-amber-500/20",
    text: "text-amber-500",
    border: "border-l-amber-500",
  },
  resolved: {
    bg: "bg-green-500/20",
    text: "text-green-500",
    border: "border-l-green-500",
  },
};

export default function InjuriesScreen() {
  const { session } = useAuthStore();
  const store = useInjuriesStore();
  const { clients, fetch: fetchClients } = useClientsStore();

  const [filterClientId, setFilterClientId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingInjury, setEditingInjury] = useState<InjuryWithClient | null>(
    null
  );
  const [selectedClientId, setSelectedClientId] = useState("");
  const [injuryName, setInjuryName] = useState("");
  const [area, setArea] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<InjuryStatus>("active");
  const [avoid, setAvoid] = useState("");
  const [notes, setNotes] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");

  const coachId = session?.user.id;

  useEffect(() => {
    if (coachId) {
      store.fetch(coachId);
      fetchClients(coachId);
    }
  }, [coachId]);

  const filtered = useMemo(() => {
    let result = store.filteredInjuries();
    if (filterClientId) {
      result = result.filter((i) => i.client_id === filterClientId);
    }
    return result;
  }, [store.filteredInjuries(), filterClientId]);

  const openCreate = useCallback(() => {
    setEditingInjury(null);
    setSelectedClientId("");
    setInjuryName("");
    setArea("");
    setDate(new Date().toISOString().slice(0, 10));
    setStatus("active");
    setAvoid("");
    setNotes("");
    setDoctorNotes("");
    setModalVisible(true);
  }, []);

  const openEdit = useCallback((injury: InjuryWithClient) => {
    setEditingInjury(injury);
    setSelectedClientId(injury.client_id);
    setInjuryName(injury.name);
    setArea(injury.area);
    setDate(injury.date);
    setStatus(injury.status);
    setAvoid(injury.avoid ?? "");
    setNotes(injury.notes ?? "");
    setDoctorNotes(injury.doctor_notes ?? "");
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!injuryName.trim() || !area.trim()) {
      Alert.alert("Error", "Name and body area are required");
      return;
    }
    if (!editingInjury && !selectedClientId) {
      Alert.alert("Error", "Please select a client");
      return;
    }
    try {
      const input = {
        name: injuryName.trim(),
        area: area.trim(),
        date,
        status,
        avoid: avoid.trim() || null,
        notes: notes.trim() || null,
        doctor_notes: doctorNotes.trim() || null,
      };
      if (editingInjury) {
        await store.update(editingInjury.id, input);
      } else {
        await store.create(selectedClientId, input);
        if (coachId) store.fetch(coachId);
      }
      setModalVisible(false);
    } catch {
      Alert.alert("Error", "Failed to save injury");
    }
  }, [
    injuryName,
    area,
    date,
    status,
    avoid,
    notes,
    doctorNotes,
    editingInjury,
    selectedClientId,
    store,
    coachId,
  ]);

  const handleDelete = useCallback(
    (injury: InjuryWithClient) => {
      const doDelete = () =>
        store.remove(injury.id).catch(() =>
          Alert.alert("Error", "Failed to delete injury")
        );

      if (Platform.OS === "web") {
        if (window.confirm(`Are you sure you want to delete "${injury.name}"?`)) {
          doDelete();
        }
        return;
      }
      Alert.alert("Delete Injury", `Are you sure you want to delete "${injury.name}"?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: doDelete },
      ]);
    },
    [store]
  );

  const renderInjury = useCallback(
    ({ item }: { item: InjuryWithClient }) => {
      const style = STATUS_STYLES[item.status];
      return (
        <Pressable
          onLongPress={() => openEdit(item)}
          className={`bg-white dark:bg-navy-card rounded-xl p-4 border border-gray-200 dark:border-navy-border border-l-4 ${style.border} mb-3`}
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-3">
              <Text className="text-[11px] text-gray-400 mb-0.5">
                {item.client?.name ?? "Unknown Client"}
              </Text>
              <Text className="font-bold text-[15px] text-gray-900 dark:text-gray-200">
                {item.name}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {item.area} · {item.date}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className={`rounded-full px-2.5 py-0.5 ${style.bg}`}>
                <Text
                  className={`text-[10px] font-semibold capitalize ${style.text}`}
                >
                  {item.status}
                </Text>
              </View>
              <Pressable onPress={() => openEdit(item)} hitSlop={8}>
                <Ionicons name="pencil-outline" size={16} color="#9CA3AF" />
              </Pressable>
              <Pressable onPress={() => handleDelete(item)} hitSlop={8}>
                <Ionicons name="trash-outline" size={16} color="#EF5350" />
              </Pressable>
            </View>
          </View>

          {item.avoid ? (
            <View className="bg-gray-50 dark:bg-navy-input rounded-md px-3 py-2 mt-2">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                <Text className="text-gray-900 dark:text-gray-200 font-semibold">
                  Avoid:{" "}
                </Text>
                {item.avoid}
              </Text>
            </View>
          ) : null}

          {item.notes ? (
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              {item.notes}
            </Text>
          ) : null}
        </Pressable>
      );
    },
    [openEdit, handleDelete]
  );

  return (
    <View className="flex-1 bg-gray-100 dark:bg-navy-deep">
      <ScreenHeader title="Injuries" showDrawerToggle />

      <View className="flex-1 px-5 pt-5">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-900 dark:text-gray-200">
            Injuries & Limitations
          </Text>
          <Pressable
            onPress={openCreate}
            className="bg-teal-proto px-5 py-2.5 rounded-lg"
          >
            <Text className="text-navy-deep font-semibold text-[13px]">
              + Add Injury
            </Text>
          </Pressable>
        </View>

        {/* Client filter */}
        <View className="flex-row gap-2 mb-3">
          <Pressable
            onPress={() => setFilterClientId(null)}
            className={`px-3.5 py-1.5 rounded-md border ${
              filterClientId === null
                ? "bg-teal-proto border-teal-proto"
                : "bg-transparent border-gray-300 dark:border-navy-border"
            }`}
          >
            <Text
              className={`text-xs capitalize ${
                filterClientId === null
                  ? "text-navy-deep font-semibold"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              All Clients
            </Text>
          </Pressable>
          {clients.map((c) => (
            <Pressable
              key={c.id}
              onPress={() =>
                setFilterClientId(filterClientId === c.client_id ? null : c.client_id)
              }
              className={`px-3.5 py-1.5 rounded-md border ${
                filterClientId === c.client_id
                  ? "bg-teal-proto border-teal-proto"
                  : "bg-transparent border-gray-300 dark:border-navy-border"
              }`}
            >
              <Text
                className={`text-xs capitalize ${
                  filterClientId === c.client_id
                    ? "text-navy-deep font-semibold"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {c.user.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Status filter */}
        <View className="flex-row gap-2 mb-4">
          {STATUS_FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => store.setFilter(f)}
              className={`px-3.5 py-1.5 rounded-md border ${
                store.filter === f
                  ? "bg-teal-proto border-teal-proto"
                  : "bg-transparent border-gray-300 dark:border-navy-border"
              }`}
            >
              <Text
                className={`text-xs capitalize ${
                  store.filter === f
                    ? "text-navy-deep font-semibold"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        {store.isLoading && !filtered.length ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#00E5CC" />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderInjury}
            contentContainerClassName="pb-8"
            ListEmptyComponent={
              <View className="items-center justify-center py-16">
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color="#9CA3AF"
                />
                <Text className="font-semibold text-[15px] text-gray-900 dark:text-gray-200 mt-3">
                  No injuries recorded
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  Track client injuries and limitations to keep training safe.
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Create / Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <ScrollView
            contentContainerClassName="min-h-full justify-end"
            keyboardShouldPersistTaps="handled"
          >
            <View className="bg-white dark:bg-navy-card rounded-t-2xl p-6">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-lg font-bold text-gray-900 dark:text-gray-200">
                  {editingInjury ? "Edit Injury" : "Add Injury"}
                </Text>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  hitSlop={8}
                >
                  <Ionicons name="close" size={24} color="#9CA3AF" />
                </Pressable>
              </View>

              {/* Client selector (only for new) */}
              {!editingInjury ? (
                <>
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client
                  </Text>
                  <FlatList
                    horizontal
                    data={clients}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="gap-2 mb-4"
                    renderItem={({ item }) => (
                      <Pressable
                        onPress={() => setSelectedClientId(item.client_id)}
                        className={`px-3 py-1.5 rounded-lg border ${
                          selectedClientId === item.client_id
                            ? "bg-teal-proto border-teal-proto"
                            : "bg-transparent border-gray-300 dark:border-navy-border"
                        }`}
                      >
                        <Text
                          className={`text-xs ${
                            selectedClientId === item.client_id
                              ? "text-navy-deep font-semibold"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {item.user.name}
                        </Text>
                      </Pressable>
                    )}
                  />
                </>
              ) : null}

              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Injury Name
              </Text>
              <TextInput
                value={injuryName}
                onChangeText={setInjuryName}
                placeholder="e.g. Right knee sprain"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-100 dark:bg-navy-input border border-gray-200 dark:border-navy-border rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 text-base mb-4"
              />

              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Body Area
              </Text>
              <FlatList
                horizontal
                data={BODY_PARTS as unknown as string[]}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2 mb-4"
                renderItem={({ item: part }) => (
                  <Pressable
                    onPress={() => setArea(part)}
                    className={`px-3 py-1.5 rounded-lg border ${
                      area === part
                        ? "bg-teal-proto border-teal-proto"
                        : "bg-transparent border-gray-300 dark:border-navy-border"
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        area === part
                          ? "text-navy-deep font-semibold"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {part}
                    </Text>
                  </Pressable>
                )}
              />

              {/* Date */}
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date (YYYY-MM-DD)
              </Text>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="2026-04-01"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-100 dark:bg-navy-input border border-gray-200 dark:border-navy-border rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 text-base mb-4"
              />

              {/* Status */}
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </Text>
              <View className="flex-row gap-2 mb-4">
                {INJURY_STATUSES.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setStatus(s)}
                    className={`flex-1 py-2 rounded-lg border items-center ${
                      status === s
                        ? "bg-teal-proto border-teal-proto"
                        : "bg-transparent border-gray-300 dark:border-navy-border"
                    }`}
                  >
                    <Text
                      className={`text-xs capitalize font-semibold ${
                        status === s
                          ? "text-navy-deep"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {s}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Avoid */}
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Movements to Avoid
              </Text>
              <TextInput
                value={avoid}
                onChangeText={setAvoid}
                placeholder="e.g. Dips, kipping pull-ups"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-100 dark:bg-navy-input border border-gray-200 dark:border-navy-border rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 text-base mb-4"
              />

              {/* Notes */}
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Additional notes"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={2}
                className="bg-gray-100 dark:bg-navy-input border border-gray-200 dark:border-navy-border rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 text-base mb-4"
              />

              {/* Doctor Notes */}
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Doctor Notes
              </Text>
              <TextInput
                value={doctorNotes}
                onChangeText={setDoctorNotes}
                placeholder="Doctor's recommendations"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={2}
                className="bg-gray-100 dark:bg-navy-input border border-gray-200 dark:border-navy-border rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 text-base mb-6"
              />

              <Pressable
                onPress={handleSave}
                disabled={store.isLoading}
                className="bg-teal-proto py-3.5 rounded-xl items-center"
              >
                {store.isLoading ? (
                  <ActivityIndicator size="small" color="#0F1117" />
                ) : (
                  <Text className="text-navy-deep font-bold text-base">
                    {editingInjury ? "Save Changes" : "Add Injury"}
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
