import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useWorkoutBuilderStore } from "@/store/workoutBuilder";
import { useProgramsStore } from "@/store/programs";
import { useAuthStore } from "@/store/auth";
import { useLibraryStore } from "@/store/library";
import type {
  SectionFormat,
  SectionSettings,
  ExerciseCategory,
  Exercise,
  TemplateExercise,
} from "@shared/types/database";
import type { SectionWithExercises } from "@/services/workouts";
import type { InjuryWithClient } from "@/services/injuries";
import {
  SECTION_FORMAT_LABELS,
  REST_PRESETS_SECONDS,
  EXERCISE_CATEGORY_LABELS,
} from "@shared/constants";

// ─── Day Selector ────────────────────────────────────────────────

function DaySelector({
  templates,
  selectedDay,
  onSelectDay,
  onAddDay,
}: {
  templates: { day_number: number }[];
  selectedDay: number;
  onSelectDay: (day: number) => void;
  onAddDay: () => void;
}) {
  const dayNumbers = useMemo(() => {
    const days = templates.map((t) => t.day_number);
    if (!days.includes(selectedDay)) days.push(selectedDay);
    return [...new Set(days)].sort((a, b) => a - b);
  }, [templates, selectedDay]);

  return (
    <View className="flex-row gap-2 mb-4 px-5">
      {dayNumbers.map((day) => {
        const isSelected = day === selectedDay;
        return (
          <Pressable
            key={day}
            onPress={() => onSelectDay(day)}
            className={`px-3.5 py-1.5 rounded-md border ${
              isSelected
                ? "bg-teal-proto border-teal-proto"
                : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            }`}
          >
            <Text
              className={`text-xs ${
                isSelected
                  ? "text-navy-deep font-semibold"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Day {day}
            </Text>
          </Pressable>
        );
      })}
      <Pressable
        onPress={onAddDay}
        className="px-2 py-1.5 rounded-md border bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 items-center justify-center"
      >
        <Ionicons name="add" size={16} color="#9CA3AF" />
      </Pressable>
    </View>
  );
}

// ─── Format Settings ─────────────────────────────────────────────

function FormatSettingInput({
  label,
  value,
  placeholder,
  onCommit,
}: {
  label: string;
  value: string;
  placeholder: string;
  onCommit: (v: string) => void;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => { setLocal(value); }, [value]);
  return (
    <View className="flex-row items-center gap-2">
      <Text className="text-[11px] text-gray-600 dark:text-gray-400">{label}</Text>
      <TextInput
        value={local}
        onChangeText={setLocal}
        onBlur={() => onCommit(local)}
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-gray-900 dark:text-white text-xs w-14 text-center"
      />
    </View>
  );
}

function FormatSettings({
  format,
  settings,
  onUpdate,
}: {
  format: SectionFormat;
  settings: SectionSettings;
  onUpdate: (s: SectionSettings) => void;
}) {
  if (format === "sets") return null;

  const commitNum = (key: keyof SectionSettings, raw: string, multiplier = 1) => {
    const n = parseInt(raw, 10);
    onUpdate({ ...settings, [key]: isNaN(n) ? undefined : n * multiplier });
  };

  return (
    <View className="flex-row flex-wrap gap-3 mt-2">
      {(format === "amrap" || format === "fortime") && (
        <FormatSettingInput
          label="Time Cap (min)"
          value={settings.time_cap_sec ? String(Math.round(settings.time_cap_sec / 60)) : ""}
          placeholder="—"
          onCommit={(v) => commitNum("time_cap_sec", v, 60)}
        />
      )}

      {format === "emom" && (
        <>
          <FormatSettingInput
            label="Total Min"
            value={settings.time_cap_sec ? String(Math.round(settings.time_cap_sec / 60)) : ""}
            placeholder="—"
            onCommit={(v) => commitNum("time_cap_sec", v, 60)}
          />
          <FormatSettingInput
            label="Interval (sec)"
            value={settings.interval_sec ? String(settings.interval_sec) : ""}
            placeholder="60"
            onCommit={(v) => commitNum("interval_sec", v)}
          />
        </>
      )}

      {format === "tabata" && (
        <>
          <FormatSettingInput
            label="Rounds"
            value={settings.rounds ? String(settings.rounds) : ""}
            placeholder="8"
            onCommit={(v) => commitNum("rounds", v)}
          />
          <FormatSettingInput
            label="Work (sec)"
            value={settings.work_sec ? String(settings.work_sec) : ""}
            placeholder="20"
            onCommit={(v) => commitNum("work_sec", v)}
          />
          <FormatSettingInput
            label="Rest (sec)"
            value={settings.rest_sec ? String(settings.rest_sec) : ""}
            placeholder="10"
            onCommit={(v) => commitNum("rest_sec", v)}
          />
        </>
      )}

      {format === "superset" && (
        <>
          <FormatSettingInput
            label="Rounds"
            value={settings.rounds ? String(settings.rounds) : ""}
            placeholder="3"
            onCommit={(v) => commitNum("rounds", v)}
          />
          <FormatSettingInput
            label="Rest between (sec)"
            value={settings.rest_sec ? String(settings.rest_sec) : ""}
            placeholder="90"
            onCommit={(v) => commitNum("rest_sec", v)}
          />
        </>
      )}
    </View>
  );
}

// ─── Injury Conflict Detection ──────────────────────────────────

function checkInjuryConflicts(
  exerciseName: string,
  clientInjuries: InjuryWithClient[]
): InjuryWithClient[] {
  if (!exerciseName) return [];
  const name = exerciseName.toLowerCase();
  return clientInjuries.filter((injury) => {
    if (!injury.avoid) return false;
    // Split avoid text by commas and check each term
    const avoidTerms = injury.avoid.toLowerCase().split(/[,;]+/).map((t) => t.trim());
    return avoidTerms.some((term) => {
      if (!term) return false;
      // Check if exercise name contains the avoid term or vice versa
      return name.includes(term) || term.includes(name.split(" ")[0]);
    });
  });
}

// ─── Exercise Row ────────────────────────────────────────────────

function ExerciseRow({
  item,
  onUpdate,
  onRemove,
  injuryWarnings,
}: {
  item: SectionWithExercises["template_exercises"][0];
  onUpdate: (
    id: string,
    updates: Partial<
      Pick<TemplateExercise, "sets" | "reps" | "weight_kg" | "percentage_1rm" | "rpe" | "rest_sec" | "notes">
    >
  ) => void;
  onRemove: (id: string) => void;
  injuryWarnings?: InjuryWithClient[];
}) {
  const [usePercentage, setUsePercentage] = useState(
    item.percentage_1rm != null && item.percentage_1rm > 0
  );

  // Local state for all inputs — only sync to store on blur for responsiveness
  const [localSets, setLocalSets] = useState(item.sets != null ? String(item.sets) : "");
  const [localReps, setLocalReps] = useState(() => {
    if (item.reps != null) return String(item.reps);
    // Check notes for a "Reps: X-Y" range
    const match = item.notes?.match(/^Reps:\s*(\S+)/);
    return match ? match[1] : "";
  });
  const [localWeight, setLocalWeight] = useState(
    item.weight_kg != null ? String(item.weight_kg) : ""
  );
  const [localPercent, setLocalPercent] = useState(
    item.percentage_1rm != null ? String(item.percentage_1rm) : ""
  );
  const [localRpe, setLocalRpe] = useState(item.rpe != null ? String(item.rpe) : "");
  const [localRest, setLocalRest] = useState(item.rest_sec != null ? String(item.rest_sec) : "");
  const [localNotes, setLocalNotes] = useState(item.notes ?? "");

  return (
    <View className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-2">
      {/* Exercise name + delete */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm font-medium text-gray-900 dark:text-white flex-1">
          {item.exercise?.name ?? "Unknown Exercise"}
        </Text>
        <Pressable onPress={() => onRemove(item.id)} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color="#EF5350" />
        </Pressable>
      </View>

      {/* Sets / Reps / Weight row */}
      <View className="flex-row gap-2 mb-2">
        <View className="flex-1">
          <Text className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Sets</Text>
          <TextInput
            value={localSets}
            onChangeText={setLocalSets}
            onBlur={() => {
              const n = parseInt(localSets, 10);
              onUpdate(item.id, { sets: isNaN(n) ? null : n });
            }}
            keyboardType="numeric"
            placeholder="—"
            placeholderTextColor="#9CA3AF"
            className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-xs text-center"
          />
        </View>
        <View className="flex-1">
          <Text className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Reps</Text>
          <TextInput
            value={localReps}
            onChangeText={setLocalReps}
            onBlur={() => {
              const trimmed = localReps.trim();
              const isRange = /[^\d]/.test(trimmed);
              if (isRange) {
                // Range like "8-12" — store null in reps, persist text in notes
                const existingNotes = localNotes;
                const cleaned = existingNotes.replace(/^Reps:\s*\S+\s*\n?/, "");
                const newNotes = `Reps: ${trimmed}\n${cleaned}`.trim();
                setLocalNotes(newNotes);
                onUpdate(item.id, { reps: null, notes: newNotes || null });
              } else {
                const n = parseInt(trimmed, 10);
                onUpdate(item.id, { reps: isNaN(n) ? null : n });
              }
            }}
            placeholder="e.g. 8-12"
            placeholderTextColor="#9CA3AF"
            className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-xs text-center"
          />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-0.5">
            <Text className="text-[10px] text-gray-500 dark:text-gray-400">
              {usePercentage ? "% 1RM" : "Weight (kg)"}
            </Text>
            <Pressable
              onPress={() => setUsePercentage(!usePercentage)}
              hitSlop={4}
            >
              <Ionicons name="swap-horizontal" size={12} color="#9CA3AF" />
            </Pressable>
          </View>
          <TextInput
            value={usePercentage ? localPercent : localWeight}
            onChangeText={usePercentage ? setLocalPercent : setLocalWeight}
            onBlur={() => {
              if (usePercentage) {
                const n = parseFloat(localPercent);
                onUpdate(item.id, {
                  percentage_1rm: isNaN(n) ? null : n,
                  weight_kg: null,
                });
              } else {
                const n = parseFloat(localWeight);
                onUpdate(item.id, {
                  weight_kg: isNaN(n) ? null : n,
                  percentage_1rm: null,
                });
              }
            }}
            keyboardType="numeric"
            placeholder="—"
            placeholderTextColor="#9CA3AF"
            className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-xs text-center"
          />
        </View>
      </View>

      {/* RPE / Rest row */}
      <View className="flex-row gap-2 mb-2">
        <View className="w-16">
          <Text className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">RPE</Text>
          <TextInput
            value={localRpe}
            onChangeText={setLocalRpe}
            onBlur={() => {
              const n = parseFloat(localRpe);
              onUpdate(item.id, { rpe: isNaN(n) ? null : n });
            }}
            keyboardType="numeric"
            placeholder="—"
            placeholderTextColor="#9CA3AF"
            className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-xs text-center"
          />
        </View>
        <View className="flex-1">
          <Text className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Rest (sec)</Text>
          <View className="flex-row gap-1">
            <TextInput
              value={localRest}
              onChangeText={setLocalRest}
              onBlur={() => {
                const n = parseInt(localRest, 10);
                onUpdate(item.id, { rest_sec: isNaN(n) ? null : n });
              }}
              keyboardType="numeric"
              placeholder="—"
              placeholderTextColor="#9CA3AF"
              className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-900 dark:text-white text-xs text-center flex-1"
            />
            {REST_PRESETS_SECONDS.slice(0, 5).map((sec) => (
              <Pressable
                key={sec}
                onPress={() => {
                  setLocalRest(String(sec));
                  onUpdate(item.id, { rest_sec: sec });
                }}
                className={`px-1.5 py-1.5 rounded border ${
                  item.rest_sec === sec
                    ? "border-teal-proto bg-teal-proto"
                    : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                }`}
              >
                <Text
                  className={`text-[9px] ${
                    item.rest_sec === sec
                      ? "text-white font-semibold"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {sec}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Notes */}
      <TextInput
        value={localNotes}
        onChangeText={setLocalNotes}
        onBlur={() => onUpdate(item.id, { notes: localNotes || null })}
        placeholder="Notes (optional)"
        placeholderTextColor="#9CA3AF"
        multiline
        maxLength={250}
        className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 text-gray-900 dark:text-white text-xs min-h-[32px]"
      />

      {/* Injury warnings */}
      {injuryWarnings && injuryWarnings.length > 0 && (
        <View className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-2 mt-1">
          {injuryWarnings.map((injury) => (
            <View key={injury.id} className="flex-row items-start gap-1.5">
              <Ionicons name="warning-outline" size={14} color="#F59E0B" />
              <Text className="text-yellow-800 dark:text-yellow-200 text-xs flex-1">
                {injury.client?.name} has an injury ({injury.name} - {injury.area}) that may conflict. Avoid: {injury.avoid}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Section Card ────────────────────────────────────────────────

function SectionCard({
  section,
  onUpdateSection,
  onDeleteSection,
  onUpdateExercise,
  onRemoveExercise,
  onAddExercise,
  clientInjuries,
}: {
  section: SectionWithExercises;
  onUpdateSection: (
    id: string,
    updates: Partial<Pick<SectionWithExercises, "title" | "format" | "settings_json">>
  ) => void;
  onDeleteSection: (id: string) => void;
  onUpdateExercise: (
    id: string,
    updates: Partial<
      Pick<TemplateExercise, "sets" | "reps" | "weight_kg" | "percentage_1rm" | "rpe" | "rest_sec" | "notes">
    >
  ) => void;
  onRemoveExercise: (id: string) => void;
  onAddExercise: (sectionId: string) => void;
  clientInjuries?: InjuryWithClient[];
}) {
  const [showFormatPicker, setShowFormatPicker] = useState(false);
  const [localSectionTitle, setLocalSectionTitle] = useState(section.title);
  const formats = Object.entries(SECTION_FORMAT_LABELS) as [
    SectionFormat,
    string,
  ][];

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-4 overflow-hidden">
      {/* Section header */}
      <View className="flex-row items-center p-3 border-b border-gray-200 dark:border-gray-700">
        <View className="w-8 h-8 rounded-lg bg-teal-proto items-center justify-center mr-3">
          <Text className="text-navy-deep font-bold text-sm">
            {section.letter}
          </Text>
        </View>
        <TextInput
          value={localSectionTitle}
          onChangeText={setLocalSectionTitle}
          onBlur={() => {
            if (localSectionTitle !== section.title) {
              onUpdateSection(section.id, { title: localSectionTitle });
            }
          }}
          placeholder="Section title"
          placeholderTextColor="#6B7280"
          className="flex-1 text-gray-900 dark:text-white text-sm font-medium mr-2"
        />
        <Pressable
          onPress={() => setShowFormatPicker(true)}
          className="flex-row items-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-2.5 py-1.5 mr-2"
        >
          <Text className="text-[11px] text-teal-proto font-semibold mr-1">
            {SECTION_FORMAT_LABELS[section.format]}
          </Text>
          <Ionicons name="chevron-down" size={12} color="#00E5CC" />
        </Pressable>
        <Pressable onPress={() => onDeleteSection(section.id)} hitSlop={8}>
          <Ionicons name="trash-outline" size={16} color="#EF5350" />
        </Pressable>
      </View>

      {/* Format settings */}
      <View className="px-3">
        <FormatSettings
          format={section.format}
          settings={section.settings_json ?? {}}
          onUpdate={(s) =>
            onUpdateSection(section.id, { settings_json: s })
          }
        />
      </View>

      {/* Exercises */}
      <View className="px-3 pt-2 pb-3">
        {section.template_exercises.map((te) => (
          <ExerciseRow
            key={te.id}
            item={te}
            onUpdate={onUpdateExercise}
            onRemove={onRemoveExercise}
            injuryWarnings={clientInjuries ? checkInjuryConflicts(te.exercise?.name ?? "", clientInjuries) : undefined}
          />
        ))}

        <Pressable
          onPress={() => onAddExercise(section.id)}
          className="flex-row items-center justify-center gap-1.5 py-2.5 bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg mt-1"
        >
          <Ionicons name="add" size={14} color="#9CA3AF" />
          <Text className="text-xs text-gray-600 dark:text-gray-300 font-medium">
            Add Exercise
          </Text>
        </Pressable>
      </View>

      {/* Format picker modal */}
      <Modal
        visible={showFormatPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFormatPicker(false)}
      >
        <Pressable
          onPress={() => setShowFormatPicker(false)}
          className="flex-1 justify-center items-center bg-black/60"
        >
          <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-64 overflow-hidden">
            <Text className="text-gray-900 dark:text-white font-bold text-sm p-3 border-b border-gray-200 dark:border-gray-700">
              Section Format
            </Text>
            {formats.map(([key, label]) => (
              <Pressable
                key={key}
                onPress={() => {
                  onUpdateSection(section.id, {
                    format: key,
                    settings_json: {},
                  });
                  setShowFormatPicker(false);
                }}
                className={`px-3 py-2.5 border-b border-gray-200 dark:border-gray-700 ${
                  section.format === key ? "bg-teal-muted" : ""
                }`}
              >
                <Text
                  className={`text-sm ${
                    section.format === key
                      ? "text-teal-proto font-semibold"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Exercise Picker Modal ───────────────────────────────────────

function ExercisePickerModal({
  visible,
  onClose,
  onSelect,
  onCreateExercise,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  onCreateExercise: (name: string, category: ExerciseCategory) => void;
}) {
  const { session } = useAuthStore();
  const {
    exercises,
    exercisesLoading,
    fetchExercises,
    filteredExercises,
    exerciseCategory,
    setExerciseCategory,
    exerciseSearch,
    setExerciseSearch,
  } = useLibraryStore();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<ExerciseCategory>("strength");

  useEffect(() => {
    if (visible && session?.user.id && exercises.length === 0) {
      fetchExercises(session.user.id);
    }
  }, [visible, session?.user.id]);

  const categories: (ExerciseCategory | null)[] = [
    null,
    "olympic",
    "gymnastics",
    "conditioning",
    "strength",
    "accessory",
  ];

  const filtered = filteredExercises();

  const renderExercise = useCallback(
    ({ item }: { item: Exercise }) => (
      <Pressable
        onPress={() => {
          onSelect(item);
          onClose();
          setExerciseSearch("");
          setExerciseCategory(null);
        }}
        className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700"
      >
        <View className="flex-1">
          <Text className="text-sm text-gray-900 dark:text-white">{item.name}</Text>
          <Text className="text-[10px] text-gray-500 capitalize">
            {item.category}
          </Text>
        </View>
        <Ionicons name="add-circle-outline" size={20} color="#00E5CC" />
      </Pressable>
    ),
    [onSelect, onClose]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-gray-800 rounded-t-2xl h-[80%]">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              Add Exercise
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
                value={exerciseSearch}
                onChangeText={setExerciseSearch}
                placeholder="Search exercises..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 py-2.5 ml-2 text-gray-900 dark:text-white text-sm"
              />
            </View>
          </View>

          {/* Category tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-4 pb-2 gap-2"
          >
            {categories.map((cat) => (
              <Pressable
                key={cat ?? "all"}
                onPress={() => setExerciseCategory(cat)}
                className={`min-w-[48px] items-center px-3 py-1.5 rounded-full border ${
                  exerciseCategory === cat
                    ? "bg-teal-proto border-teal-proto"
                    : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    exerciseCategory === cat
                      ? "text-navy-deep"
                      : "text-gray-400"
                  }`}
                >
                  {cat
                    ? EXERCISE_CATEGORY_LABELS[cat] ?? cat
                    : "All"}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Exercise list */}
          {exercisesLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#00E5CC" />
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={renderExercise}
              contentContainerClassName="pb-4"
              ListEmptyComponent={
                <View className="items-center py-8">
                  <Text className="text-gray-400 text-sm">
                    No exercises found
                  </Text>
                </View>
              }
            />
          )}

          {/* Create new exercise */}
          {!showCreate ? (
            <Pressable
              onPress={() => setShowCreate(true)}
              className="mx-4 mb-4 py-3 border border-dashed border-gray-500 rounded-xl items-center"
            >
              <Text className="text-xs text-gray-400 font-medium">
                + Create New Exercise
              </Text>
            </Pressable>
          ) : (
            <View className="mx-4 mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Exercise name"
                placeholderTextColor="#9CA3AF"
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
                    "gymnastics",
                    "conditioning",
                    "strength",
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
                      className={`text-xs ${
                        newCategory === cat
                          ? "text-navy-deep font-semibold"
                          : "text-gray-400"
                      }`}
                    >
                      {EXERCISE_CATEGORY_LABELS[cat]}
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
                      onCreateExercise(newName.trim(), newCategory);
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

// ─── Format Picker Modal ─────────────────────────────────────────

function AddSectionModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (format: SectionFormat) => void;
}) {
  const formats = Object.entries(SECTION_FORMAT_LABELS) as [
    SectionFormat,
    string,
  ][];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 justify-center items-center bg-black/60"
      >
        <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-72 overflow-hidden">
          <Text className="text-gray-900 dark:text-white font-bold text-base p-4 border-b border-gray-200 dark:border-gray-700">
            Add Section
          </Text>
          {formats.map(([key, label]) => (
            <Pressable
              key={key}
              onPress={() => {
                onSelect(key);
                onClose();
              }}
              className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 active:bg-gray-100 dark:active:bg-gray-700"
            >
              <Text className="text-sm text-gray-700 dark:text-gray-300">{label}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuthStore();
  const { programs } = useProgramsStore();
  const {
    workoutTemplates,
    selectedDayNumber,
    currentTemplate,
    sections,
    isLoading,
    loadProgramWorkouts,
    selectDay,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    addSection,
    updateSection,
    deleteSection,
    addExercise,
    updateExercise,
    removeExercise,
    copyWorkout,
    clientInjuries,
    loadClientInjuries,
  } = useWorkoutBuilderStore();
  const { createExercise: createLibExercise, fetchExercises } =
    useLibraryStore();

  const program = programs.find((p) => p.id === id);

  const [exercisePickerVisible, setExercisePickerVisible] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [addSectionVisible, setAddSectionVisible] = useState(false);
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const [copyTargetDay, setCopyTargetDay] = useState(1);

  useEffect(() => {
    if (id) {
      loadProgramWorkouts(id);
      loadClientInjuries(id);
    }
  }, [id]);

  const handleAddDay = useCallback(() => {
    const maxDay = workoutTemplates.length
      ? Math.max(...workoutTemplates.map((t) => t.day_number))
      : 0;
    selectDay(maxDay + 1);
  }, [workoutTemplates, selectDay]);

  const handleCreateWorkout = useCallback(async () => {
    if (!id) return;
    try {
      await createWorkout(id, selectedDayNumber, `Day ${selectedDayNumber}`);
    } catch {
      Alert.alert("Error", "Failed to create workout");
    }
  }, [id, selectedDayNumber, createWorkout]);

  const handleDeleteWorkout = useCallback(async () => {
    if (!currentTemplate) return;
    const confirmed =
      Platform.OS === "web"
        ? window.confirm("Delete this workout?")
        : await new Promise<boolean>((resolve) =>
            Alert.alert(
              "Delete Workout",
              "This will remove the workout and all its sections/exercises.",
              [
                { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
                { text: "Delete", style: "destructive", onPress: () => resolve(true) },
              ],
              { cancelable: true, onDismiss: () => resolve(false) }
            )
          );
    if (!confirmed) return;
    try {
      await deleteWorkout(currentTemplate.id);
    } catch {
      Alert.alert("Error", "Failed to delete workout");
    }
  }, [currentTemplate, deleteWorkout]);

  const handleCopyWorkout = useCallback(async () => {
    if (!currentTemplate || !id) return;
    try {
      await copyWorkout(currentTemplate.id, id, copyTargetDay);
      setCopyModalVisible(false);
      // Reload and navigate to the new day
      await loadProgramWorkouts(id);
      selectDay(copyTargetDay);
      Alert.alert("Success", `Workout copied to Day ${copyTargetDay}`);
    } catch {
      Alert.alert("Error", "Failed to copy workout");
    }
  }, [currentTemplate, id, copyTargetDay, copyWorkout, loadProgramWorkouts, selectDay]);

  const handleOpenExercisePicker = useCallback((sectionId: string) => {
    setActiveSectionId(sectionId);
    setExercisePickerVisible(true);
  }, []);

  const handleSelectExercise = useCallback(
    async (exercise: Exercise) => {
      if (!activeSectionId) return;
      try {
        await addExercise(activeSectionId, exercise.id);
      } catch {
        Alert.alert("Error", "Failed to add exercise");
      }
    },
    [activeSectionId, addExercise]
  );

  const handleCreateExercise = useCallback(
    async (name: string, category: ExerciseCategory) => {
      try {
        await createLibExercise({
          name,
          description: null,
          category,
          video_url: null,
        });
        // Refresh exercise list
        if (session?.user.id) {
          await fetchExercises(session.user.id);
        }
      } catch {
        Alert.alert("Error", "Failed to create exercise");
      }
    },
    [createLibExercise, fetchExercises, session?.user.id]
  );

  const handleAddSection = useCallback(
    async (format: SectionFormat) => {
      try {
        await addSection(format);
      } catch {
        Alert.alert("Error", "Failed to add section");
      }
    },
    [addSection]
  );

  // Debounced update for workout title/notes
  const [localTitle, setLocalTitle] = useState("");
  const [localNotes, setLocalNotes] = useState("");

  useEffect(() => {
    setLocalTitle(currentTemplate?.title ?? "");
    setLocalNotes(currentTemplate?.notes ?? "");
  }, [currentTemplate?.id]);

  const handleTitleBlur = useCallback(() => {
    if (currentTemplate && localTitle !== currentTemplate.title) {
      updateWorkout(currentTemplate.id, { title: localTitle });
    }
  }, [currentTemplate, localTitle, updateWorkout]);

  const handleNotesBlur = useCallback(() => {
    if (currentTemplate && localNotes !== (currentTemplate.notes ?? "")) {
      updateWorkout(currentTemplate.id, {
        notes: localNotes || null,
      });
    }
  }, [currentTemplate, localNotes, updateWorkout]);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-navy-deep">
      <ScreenHeader
        title={program?.name ?? "Program"}
        showBack
        right={
          currentTemplate ? (
            <View className="flex-row items-center gap-3">
              <Pressable onPress={() => {
                const maxDay = workoutTemplates.length
                  ? Math.max(...workoutTemplates.map((t) => t.day_number))
                  : 0;
                setCopyTargetDay(maxDay + 1);
                setCopyModalVisible(true);
              }} hitSlop={8}>
                <Ionicons name="copy-outline" size={20} color="#9CA3AF" />
              </Pressable>
              <Pressable onPress={handleDeleteWorkout} hitSlop={8}>
                <Ionicons name="trash-outline" size={20} color="#EF5350" />
              </Pressable>
            </View>
          ) : undefined
        }
      />

      {/* Breadcrumb */}
      <View className="flex-row items-center gap-1 mb-3 px-5 pt-3">
        <Pressable onPress={() => router.back()}>
          <Text className="text-sm text-[#00E5CC]">Programs</Text>
        </Pressable>
        <Text className="text-sm text-gray-400 dark:text-gray-500 mx-1">{">"}</Text>
        <Text className="text-sm text-gray-900 dark:text-white font-medium">
          {program?.name ?? "Program"}
        </Text>
      </View>

      {/* Day selector */}
      <DaySelector
        templates={workoutTemplates}
        selectedDay={selectedDayNumber}
        onSelectDay={selectDay}
        onAddDay={handleAddDay}
      />

      {isLoading && !currentTemplate ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00E5CC" />
        </View>
      ) : !currentTemplate ? (
        /* Empty state — no workout for this day */
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="barbell-outline" size={48} color="#9CA3AF" />
          <Text className="font-semibold text-[15px] text-gray-900 dark:text-gray-200 mt-3">
            No workout for Day {selectedDayNumber}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center mb-5">
            Create a workout template to start building exercises for this day.
          </Text>
          <Pressable
            onPress={handleCreateWorkout}
            className="flex-row items-center gap-1.5 bg-teal-proto px-6 py-3 rounded-xl"
          >
            <Ionicons name="add" size={16} color="#0F1117" />
            <Text className="text-navy-deep font-bold text-sm">
              Create Workout
            </Text>
          </Pressable>
        </View>
      ) : (
        /* Workout builder */
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pt-4 pb-8"
          keyboardShouldPersistTaps="handled"
        >
          {/* Workout title */}
          <TextInput
            value={localTitle}
            onChangeText={setLocalTitle}
            onBlur={handleTitleBlur}
            placeholder="Workout title"
            placeholderTextColor="#9CA3AF"
            className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-lg font-bold text-gray-900 dark:text-white mb-2"
          />

          {/* Workout notes */}
          <TextInput
            value={localNotes}
            onChangeText={setLocalNotes}
            onBlur={handleNotesBlur}
            placeholder="Workout notes (optional)"
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={250}
            className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white mb-5 min-h-[40px]"
          />

          {/* Sections */}
          {sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              onUpdateSection={updateSection}
              onDeleteSection={deleteSection}
              onUpdateExercise={updateExercise}
              onRemoveExercise={removeExercise}
              onAddExercise={handleOpenExercisePicker}
              clientInjuries={clientInjuries}
            />
          ))}

          {/* Add section button */}
          <Pressable
            onPress={() => setAddSectionVisible(true)}
            className="flex-row items-center justify-center gap-2 py-3.5 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl"
          >
            <Ionicons name="add" size={18} color="#9CA3AF" />
            <Text className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
              Add Section
            </Text>
          </Pressable>
        </ScrollView>
      )}

      {/* Modals */}
      <ExercisePickerModal
        visible={exercisePickerVisible}
        onClose={() => setExercisePickerVisible(false)}
        onSelect={handleSelectExercise}
        onCreateExercise={handleCreateExercise}
      />

      <AddSectionModal
        visible={addSectionVisible}
        onClose={() => setAddSectionVisible(false)}
        onSelect={handleAddSection}
      />

      {/* Copy Workout Modal */}
      <Modal
        visible={copyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCopyModalVisible(false)}
      >
        <Pressable
          onPress={() => setCopyModalVisible(false)}
          className="flex-1 justify-center items-center bg-black/60"
        >
          <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-72 p-5">
            <Text className="text-gray-900 dark:text-white font-bold text-base mb-4">
              Copy Workout
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Copy "{currentTemplate?.title}" to:
            </Text>
            <View className="flex-row items-center gap-2 mb-5">
              <Text className="text-sm text-gray-700 dark:text-gray-300">Day</Text>
              <TextInput
                value={String(copyTargetDay)}
                onChangeText={(v) => {
                  const n = parseInt(v, 10);
                  if (!isNaN(n) && n > 0) setCopyTargetDay(n);
                }}
                keyboardType="numeric"
                className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm w-16 text-center"
              />
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setCopyModalVisible(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 items-center"
              >
                <Text className="text-sm text-gray-500">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleCopyWorkout}
                className="flex-1 py-2.5 rounded-lg bg-teal-proto items-center"
              >
                <Text className="text-sm text-navy-deep font-semibold">Copy</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
