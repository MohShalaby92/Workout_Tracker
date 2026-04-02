import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  SectionList,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAuthStore } from "@/store/auth";
import { usePRTrackerStore } from "@/store/prTracker";
import { useClientsStore } from "@/store/clients";
import { useLibraryStore } from "@/store/library";
import type { PRWithClientAndExercise } from "@/services/personalRecords";
import type { Exercise, ExerciseCategory } from "@shared/types/database";

// ─── PR Movement Definitions ────────────────────────────────────
// These are shown directly in the picker — no DB lookup needed to display.
// Each movement has a name and a default category for auto-creation.

interface PRMovement {
  name: string;
  defaultCategory: ExerciseCategory;
}

interface PRMovementGroup {
  title: string;
  data: PRMovement[];
}

interface PRCategory {
  label: string;
  groups: PRMovementGroup[];
}

const PR_CATEGORIES: PRCategory[] = [
  {
    label: "Lifting",
    groups: [
      {
        title: "Squats",
        data: [
          { name: "Back Squat", defaultCategory: "strength" },
          { name: "Front Squat", defaultCategory: "strength" },
          { name: "Overhead Squat", defaultCategory: "olympic" },
        ],
      },
      {
        title: "Cleans",
        data: [
          { name: "Squat Clean", defaultCategory: "olympic" },
          { name: "Power Clean", defaultCategory: "olympic" },
          { name: "Clean & Split Jerk", defaultCategory: "olympic" },
          { name: "Clean & Push Jerk", defaultCategory: "olympic" },
        ],
      },
      {
        title: "Snatches",
        data: [
          { name: "Squat Snatch", defaultCategory: "olympic" },
          { name: "Power Snatch", defaultCategory: "olympic" },
        ],
      },
      {
        title: "Presses & Jerks",
        data: [
          { name: "Strict Press", defaultCategory: "strength" },
          { name: "Push Press", defaultCategory: "olympic" },
          { name: "Push Jerk", defaultCategory: "olympic" },
          { name: "Split Jerk", defaultCategory: "olympic" },
          { name: "Bench Press", defaultCategory: "strength" },
        ],
      },
      {
        title: "Deadlift",
        data: [{ name: "Deadlift", defaultCategory: "strength" }],
      },
    ],
  },
  {
    label: "Aerobic",
    groups: [
      {
        title: "Aerobic",
        data: [
          { name: "Assault Bike", defaultCategory: "conditioning" },
          { name: "Assault Row", defaultCategory: "conditioning" },
          { name: "Ski Erg", defaultCategory: "conditioning" },
          { name: "Running", defaultCategory: "conditioning" },
        ],
      },
    ],
  },
  {
    label: "Gymnastics",
    groups: [
      {
        title: "Gymnastics",
        data: [
          { name: "Strict Pull-up", defaultCategory: "gymnastics" },
          { name: "Kipping Pull-up", defaultCategory: "gymnastics" },
          { name: "Butterfly Pull-up", defaultCategory: "gymnastics" },
          { name: "Chest-to-Bar Pull-up", defaultCategory: "gymnastics" },
          { name: "Bar Muscle-Up", defaultCategory: "gymnastics" },
          { name: "Ring Muscle-Up", defaultCategory: "gymnastics" },
          { name: "Kipping HSPU", defaultCategory: "gymnastics" },
        ],
      },
    ],
  },
];

// ─── Exercise Picker for PR ──────────────────────────────────────

function PRExercisePicker({
  visible,
  exercises,
  onSelect,
  onCreateAndSelect,
  onClose,
}: {
  visible: boolean;
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  onCreateAndSelect: (name: string, category: ExerciseCategory) => void;
  onClose: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<ExerciseCategory>("strength");

  // Build sections from hardcoded PR_CATEGORIES — always shows all movements
  const sectionData = useMemo(() => {
    const q = search.toLowerCase().trim();
    const cat = PR_CATEGORIES[activeCategory];
    const sections: { title: string; data: PRMovement[] }[] = [];

    for (const group of cat.groups) {
      const filtered = q
        ? group.data.filter((m) => m.name.toLowerCase().includes(q))
        : group.data;
      if (filtered.length > 0) {
        sections.push({ title: group.title, data: filtered });
      }
    }

    return sections;
  }, [activeCategory, search]);

  // When a movement is tapped, find the DB exercise or trigger creation
  const handleSelect = useCallback(
    (movement: PRMovement) => {
      const dbExercise = exercises.find(
        (e) => e.name.toLowerCase() === movement.name.toLowerCase()
      );
      if (dbExercise) {
        onSelect(dbExercise);
      } else {
        // Exercise doesn't exist in DB yet — create it, then select
        onCreateAndSelect(movement.name, movement.defaultCategory);
      }
      onClose();
      setSearch("");
      setActiveCategory(0);
    },
    [exercises, onSelect, onCreateAndSelect, onClose]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-gray-800 rounded-t-2xl h-[85%]">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              Select Movement
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Search */}
          <View className="px-4 py-3">
            <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3">
              <Ionicons name="search" size={16} color="#9CA3AF" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search movements..."
                placeholderTextColor="#6B7280"
                className="flex-1 py-2.5 ml-2 text-gray-900 dark:text-white text-sm"
              />
            </View>
          </View>

          {/* Category tabs — Lifting / Aerobic / Gymnastics */}
          <View className="flex-row px-4 pb-3 gap-2">
            {PR_CATEGORIES.map((cat, idx) => (
              <Pressable
                key={cat.label}
                onPress={() => setActiveCategory(idx)}
                className={`flex-1 items-center py-2 rounded-lg border ${
                  activeCategory === idx
                    ? "bg-teal-proto border-teal-proto"
                    : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    activeCategory === idx
                      ? "text-navy-deep"
                      : "text-gray-400"
                  }`}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Movement list — shown from hardcoded data, always visible */}
          <SectionList
            sections={sectionData}
            keyExtractor={(item) => item.name}
            renderSectionHeader={({ section }) => (
              <View className="bg-gray-50 dark:bg-gray-900 px-4 py-1.5">
                <Text className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">
                  {section.title}
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelect(item)}
                className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700"
              >
                <Text className="text-sm text-gray-900 dark:text-white flex-1">
                  {item.name}
                </Text>
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color="#00E5CC"
                />
              </Pressable>
            )}
            contentContainerClassName="pb-4"
          />

          {/* Create new exercise */}
          {!showCreate ? (
            <Pressable
              onPress={() => setShowCreate(true)}
              className="mx-4 mb-4 py-3 border border-dashed border-gray-500 rounded-xl items-center"
            >
              <Text className="text-xs text-gray-400 font-medium">
                + Add New Movement
              </Text>
            </Pressable>
          ) : (
            <View className="mx-4 mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Movement name"
                placeholderTextColor="#6B7280"
                className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm mb-2"
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2 mb-2"
              >
                {(
                  [
                    "olympic",
                    "strength",
                    "conditioning",
                    "gymnastics",
                    "accessory",
                  ] as ExerciseCategory[]
                ).map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setNewCategory(cat)}
                    className={`px-3 py-1.5 rounded-full border ${
                      newCategory === cat
                        ? "bg-teal-proto border-teal-proto"
                        : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    <Text
                      className={`text-xs capitalize ${
                        newCategory === cat
                          ? "text-navy-deep font-semibold"
                          : "text-gray-400"
                      }`}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => {
                    setShowCreate(false);
                    setNewName("");
                  }}
                  className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-600 items-center"
                >
                  <Text className="text-xs text-gray-400">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (newName.trim()) {
                      onCreateAndSelect(newName.trim(), newCategory);
                      onClose();
                      setShowCreate(false);
                      setNewName("");
                    }
                  }}
                  className="flex-1 py-2 rounded-lg bg-teal-proto items-center"
                >
                  <Text className="text-xs text-navy-deep font-semibold">
                    Create
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────

export default function PRTrackerScreen() {
  const { session } = useAuthStore();
  const {
    prs,
    isLoading,
    fetch: fetchPRs,
    create,
    remove,
  } = usePRTrackerStore();
  const { clients, fetch: fetchClients } = useClientsStore();
  const {
    exercises,
    fetchExercises,
    createExercise: createLibExercise,
  } = useLibraryStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [exercisePickerVisible, setExercisePickerVisible] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [weightKg, setWeightKg] = useState("");
  const [reps, setReps] = useState("");
  const [achievedAt, setAchievedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // Client filter for PR list
  const [filterClientId, setFilterClientId] = useState<string | null>(null);

  const coachId = session?.user.id;

  useEffect(() => {
    if (coachId) {
      fetchPRs(coachId);
      fetchClients(coachId);
      fetchExercises(coachId);
    }
  }, [coachId]);

  const filteredPRs = useMemo(() => {
    if (!filterClientId) return prs;
    return prs.filter((pr) => pr.client_id === filterClientId);
  }, [prs, filterClientId]);

  const openCreate = useCallback(() => {
    setSelectedClientId("");
    setSelectedExercise(null);
    setWeightKg("");
    setReps("");
    setAchievedAt(new Date().toISOString().slice(0, 10));
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedClientId || !selectedExercise) {
      Alert.alert("Error", "Please select a client and exercise");
      return;
    }
    try {
      await create(selectedClientId, {
        exercise_id: selectedExercise.id,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        reps: reps ? parseInt(reps, 10) : null,
        achieved_at: achievedAt,
      });
      setModalVisible(false);
      if (coachId) fetchPRs(coachId);
    } catch {
      Alert.alert("Error", "Failed to create PR");
    }
  }, [
    selectedClientId,
    selectedExercise,
    weightKg,
    reps,
    achievedAt,
    create,
    coachId,
    fetchPRs,
  ]);

  const handleDelete = useCallback(
    (pr: PRWithClientAndExercise) => {
      const doDelete = () =>
        remove(pr.id).catch(() =>
          Alert.alert("Error", "Failed to delete PR")
        );

      if (Platform.OS === "web") {
        if (window.confirm("Are you sure you want to delete this PR?")) {
          doDelete();
        }
        return;
      }
      Alert.alert("Delete PR", "Are you sure you want to delete this PR?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: doDelete },
      ]);
    },
    [remove]
  );

  const handleCreateAndSelect = useCallback(
    async (name: string, category: ExerciseCategory) => {
      try {
        // Check if exercise already exists in the loaded list
        const existing = exercises.find(
          (e) => e.name.toLowerCase() === name.toLowerCase()
        );
        if (existing) {
          setSelectedExercise(existing);
          setExercisePickerVisible(false);
          return;
        }
        // Create new exercise
        await createLibExercise({
          name,
          description: null,
          category,
          video_url: null,
        });
        if (coachId) await fetchExercises(coachId);
        // Find the newly created exercise after refresh
        const { exercises: refreshed } = useLibraryStore.getState();
        const created = refreshed.find(
          (e) => e.name.toLowerCase() === name.toLowerCase()
        );
        if (created) setSelectedExercise(created);
        setExercisePickerVisible(false);
      } catch {
        Alert.alert("Error", "Failed to create exercise");
      }
    },
    [createLibExercise, fetchExercises, coachId, exercises]
  );

  // Unique clients from PR data for the filter
  const clientsInPRs = useMemo(() => {
    const map = new Map<string, string>();
    for (const pr of prs) {
      if (!map.has(pr.client_id)) {
        map.set(pr.client_id, pr.client?.name ?? "Unknown");
      }
    }
    return Array.from(map.entries()); // [id, name][]
  }, [prs]);

  const renderPR = useCallback(
    ({ item }: { item: PRWithClientAndExercise }) => (
      <View className="bg-white dark:bg-navy-card rounded-xl p-4 border border-gray-200 dark:border-gray-600 mb-3">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-3">
            <Text className="text-[11px] text-gray-400 mb-0.5">
              {item.client?.name ?? "Unknown"}
            </Text>
            <Text className="font-bold text-[15px] text-gray-900 dark:text-gray-200">
              {item.exercise?.name ?? "Unknown"}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {item.weight_kg != null ? `${item.weight_kg} kg` : "—"}
              {item.reps != null ? ` x${item.reps} reps` : ""} ·{" "}
              {new Date(item.achieved_at).toLocaleDateString()}
              {item.auto_detected ? " · Auto-detected" : ""}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            {item.estimated_1rm != null ? (
              <View className="rounded-full px-2.5 py-0.5 bg-teal-muted">
                <Text className="text-[10px] font-semibold text-teal-proto">
                  1RM: {item.estimated_1rm} kg
                </Text>
              </View>
            ) : null}
            <Pressable onPress={() => handleDelete(item)} hitSlop={8}>
              <Ionicons name="trash-outline" size={16} color="#EF5350" />
            </Pressable>
          </View>
        </View>
      </View>
    ),
    [handleDelete]
  );

  return (
    <View className="flex-1 bg-gray-100 dark:bg-navy-deep">
      <ScreenHeader title="PR Tracker" showDrawerToggle />

      <View className="flex-1 px-5 pt-5">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl font-bold text-gray-900 dark:text-gray-200">
            PR Tracking & Analytics
          </Text>
          <Pressable
            onPress={openCreate}
            className="bg-teal-proto px-5 py-2.5 rounded-lg"
          >
            <Text className="text-navy-deep font-semibold text-[13px]">
              + Add PR
            </Text>
          </Pressable>
        </View>

        {/* Client filter */}
        {clientsInPRs.length > 0 && (
          <View className="flex-row gap-2 mb-4">
            <Pressable
              onPress={() => setFilterClientId(null)}
              className={`px-3.5 py-1.5 rounded-md border ${
                filterClientId === null
                  ? "bg-teal-proto border-teal-proto"
                  : "bg-transparent border-gray-300 dark:border-gray-600"
              }`}
            >
              <Text
                className={`text-xs ${
                  filterClientId === null
                    ? "text-navy-deep font-semibold"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                All
              </Text>
            </Pressable>
            {clientsInPRs.map(([id, name]) => (
              <Pressable
                key={id}
                onPress={() =>
                  setFilterClientId(filterClientId === id ? null : id)
                }
                className={`px-3.5 py-1.5 rounded-md border ${
                  filterClientId === id
                    ? "bg-teal-proto border-teal-proto"
                    : "bg-transparent border-gray-300 dark:border-gray-600"
                }`}
              >
                <Text
                  className={`text-xs ${
                    filterClientId === id
                      ? "text-navy-deep font-semibold"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {isLoading && !prs.length ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#00E5CC" />
          </View>
        ) : (
          <FlatList
            data={filteredPRs}
            keyExtractor={(item) => item.id}
            renderItem={renderPR}
            contentContainerClassName="pb-8"
            ListEmptyComponent={
              <View className="items-center justify-center py-16">
                <Ionicons name="trophy-outline" size={48} color="#9CA3AF" />
                <Text className="font-semibold text-[15px] text-gray-900 dark:text-gray-200 mt-3">
                  {filterClientId
                    ? "No PRs for this client"
                    : "No PRs recorded yet"}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  Personal records will appear here as clients log workouts or
                  you add them manually.
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Add PR Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-navy-card rounded-t-2xl p-6">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-lg font-bold text-gray-900 dark:text-gray-200">
                Add PR
              </Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            {/* Client selector */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Client
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 mb-4"
            >
              {clients.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedClientId(item.client_id)}
                  className={`px-2.5 py-1 rounded-lg border ${
                    selectedClientId === item.client_id
                      ? "bg-teal-proto border-teal-proto"
                      : "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <Text
                    className={`text-[11px] ${
                      selectedClientId === item.client_id
                        ? "text-navy-deep font-semibold"
                        : "text-gray-900 dark:text-gray-400"
                    }`}
                  >
                    {item.user.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Exercise selector — tap to open picker */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Movement
            </Text>
            <Pressable
              onPress={() => setExercisePickerVisible(true)}
              className="flex-row items-center justify-between bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 mb-4"
            >
              <Text
                className={`text-sm ${
                  selectedExercise
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-400"
                }`}
              >
                {selectedExercise?.name ?? "Tap to select movement..."}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </Pressable>

            {/* Weight & Reps */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Weight (kg)
                </Text>
                <TextInput
                  value={weightKg}
                  onChangeText={setWeightKg}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 text-base"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reps
                </Text>
                <TextInput
                  value={reps}
                  onChangeText={setReps}
                  placeholder="1"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 text-base"
                />
              </View>
            </View>

            {/* Date */}
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date (YYYY-MM-DD)
            </Text>
            <TextInput
              value={achievedAt}
              onChangeText={setAchievedAt}
              placeholder="2026-04-01"
              placeholderTextColor="#9CA3AF"
              className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 text-base mb-6"
            />

            <Pressable
              onPress={handleSave}
              disabled={isLoading}
              className="bg-teal-proto py-3.5 rounded-xl items-center"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#0F1117" />
              ) : (
                <Text className="text-navy-deep font-bold text-base">
                  Save PR
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Exercise Picker Modal */}
      <PRExercisePicker
        visible={exercisePickerVisible}
        exercises={exercises}
        onSelect={(ex) => setSelectedExercise(ex)}
        onCreateAndSelect={handleCreateAndSelect}
        onClose={() => setExercisePickerVisible(false)}
      />
    </View>
  );
}
