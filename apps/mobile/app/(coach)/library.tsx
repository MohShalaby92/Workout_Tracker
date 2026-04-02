import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAuthStore } from "@/store/auth";
import { useLibraryStore } from "@/store/library";
import type { Exercise, ExerciseCategory, Video } from "@shared/types/database";
import { EXERCISE_CATEGORY_LABELS } from "@shared/constants";

const CATEGORIES: (ExerciseCategory | "all")[] = [
  "all",
  "olympic",
  "gymnastics",
  "conditioning",
  "strength",
  "accessory",
];

export default function LibraryScreen() {
  const { session } = useAuthStore();
  const store = useLibraryStore();

  // Video modal state
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoCategory, setVideoCategory] = useState("");

  // Exercise modal state
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseDesc, setExerciseDesc] = useState("");
  const [exerciseCategory, setExerciseCategory] =
    useState<ExerciseCategory>("strength");
  const [exerciseVideoUrl, setExerciseVideoUrl] = useState("");

  const coachId = session?.user.id;

  useEffect(() => {
    if (coachId) {
      store.fetchVideos(coachId);
      store.fetchExercises(coachId);
    }
  }, [coachId]);

  // ─── Video Handlers ──────────────────────────────────────────
  const openCreateVideo = useCallback(() => {
    setEditingVideo(null);
    setVideoTitle("");
    setVideoUrl("");
    setVideoCategory("");
    setVideoModalVisible(true);
  }, []);

  const openEditVideo = useCallback((video: Video) => {
    setEditingVideo(video);
    setVideoTitle(video.title);
    setVideoUrl(video.url);
    setVideoCategory(video.category ?? "");
    setVideoModalVisible(true);
  }, []);

  const handleSaveVideo = useCallback(async () => {
    if (!videoTitle.trim() || !videoUrl.trim()) {
      Alert.alert("Error", "Title and URL are required");
      return;
    }
    try {
      if (editingVideo) {
        await store.updateVideo(editingVideo.id, {
          title: videoTitle.trim(),
          url: videoUrl.trim(),
          category: videoCategory.trim() || null,
        });
      } else {
        await store.createVideo({
          title: videoTitle.trim(),
          url: videoUrl.trim(),
          category: videoCategory.trim() || null,
          exercise_id: null,
        });
      }
      setVideoModalVisible(false);
    } catch {
      Alert.alert("Error", "Failed to save video");
    }
  }, [videoTitle, videoUrl, videoCategory, editingVideo, store]);

  const handleDeleteVideo = useCallback(
    async (video: Video) => {
      const confirmed =
        Platform.OS === "web"
          ? window.confirm(`Delete "${video.title}"?`)
          : await new Promise<boolean>((resolve) =>
              Alert.alert("Delete Video", `Delete "${video.title}"?`, [
                { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
                { text: "Delete", style: "destructive", onPress: () => resolve(true) },
              ], { cancelable: true, onDismiss: () => resolve(false) })
            );
      if (!confirmed) return;
      try {
        await store.deleteVideo(video.id);
      } catch {
        Alert.alert("Error", "Failed to delete video");
      }
    },
    [store]
  );

  // ─── Exercise Handlers ───────────────────────────────────────
  const openCreateExercise = useCallback(() => {
    setEditingExercise(null);
    setExerciseName("");
    setExerciseDesc("");
    setExerciseCategory("strength");
    setExerciseVideoUrl("");
    setExerciseModalVisible(true);
  }, []);

  const openEditExercise = useCallback((exercise: Exercise) => {
    setEditingExercise(exercise);
    setExerciseName(exercise.name);
    setExerciseDesc(exercise.description ?? "");
    setExerciseCategory(exercise.category);
    setExerciseVideoUrl(exercise.video_url ?? "");
    setExerciseModalVisible(true);
  }, []);

  const handleSaveExercise = useCallback(async () => {
    if (!exerciseName.trim()) {
      Alert.alert("Error", "Exercise name is required");
      return;
    }
    try {
      if (editingExercise) {
        await store.updateExercise(editingExercise.id, {
          name: exerciseName.trim(),
          description: exerciseDesc.trim() || null,
          category: exerciseCategory,
          video_url: exerciseVideoUrl.trim() || null,
        });
      } else {
        await store.createExercise({
          name: exerciseName.trim(),
          description: exerciseDesc.trim() || null,
          category: exerciseCategory,
          video_url: exerciseVideoUrl.trim() || null,
        });
      }
      setExerciseModalVisible(false);
    } catch {
      Alert.alert("Error", "Failed to save exercise");
    }
  }, [exerciseName, exerciseDesc, exerciseCategory, exerciseVideoUrl, editingExercise, store]);

  const handleDeleteExercise = useCallback(
    async (exercise: Exercise) => {
      if (exercise.is_global) {
        Alert.alert("Error", "Cannot delete global exercises");
        return;
      }
      const confirmed =
        Platform.OS === "web"
          ? window.confirm(`Delete "${exercise.name}"?`)
          : await new Promise<boolean>((resolve) =>
              Alert.alert("Delete Exercise", `Delete "${exercise.name}"?`, [
                { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
                { text: "Delete", style: "destructive", onPress: () => resolve(true) },
              ], { cancelable: true, onDismiss: () => resolve(false) })
            );
      if (!confirmed) return;
      try {
        await store.deleteExercise(exercise.id);
      } catch {
        Alert.alert("Error", "Failed to delete exercise");
      }
    },
    [store]
  );

  // ─── Render Items ────────────────────────────────────────────
  const renderVideo = useCallback(
    ({ item }: { item: Video }) => (
      <View className="bg-white dark:bg-navy-card rounded-xl border border-gray-200 dark:border-navy-border overflow-hidden mb-3">
        <View className="bg-gray-100 dark:bg-navy-input h-[100px] items-center justify-center">
          <Ionicons name="videocam-outline" size={32} color="#9CA3AF" />
        </View>
        <View className="p-3.5">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-2">
              <Text className="font-semibold text-[13px] text-gray-900 dark:text-gray-200">
                {item.title}
              </Text>
              {item.category ? (
                <Text className="text-[11px] text-teal-proto mt-0.5">
                  {item.category}
                </Text>
              ) : null}
              <Text
                className="text-[10px] text-gray-400 mt-0.5"
                numberOfLines={1}
              >
                {item.url}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable onPress={() => openEditVideo(item)} hitSlop={8}>
                <Ionicons name="pencil-outline" size={16} color="#9CA3AF" />
              </Pressable>
              <Pressable onPress={() => handleDeleteVideo(item)} hitSlop={8}>
                <Ionicons name="trash-outline" size={16} color="#EF5350" />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    ),
    [openEditVideo, handleDeleteVideo]
  );

  const renderExercise = useCallback(
    ({ item }: { item: Exercise }) => (
      <View className="bg-white dark:bg-navy-card rounded-xl p-4 border border-gray-200 dark:border-navy-border mb-3">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-2">
            <Text className="font-semibold text-[13px] text-gray-900 dark:text-gray-200">
              {item.name}
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              <View className="bg-teal-muted rounded-full px-2 py-0.5">
                <Text className="text-[10px] text-teal-proto font-semibold">
                  {EXERCISE_CATEGORY_LABELS[item.category] ?? item.category}
                </Text>
              </View>
              {item.is_global ? (
                <Text className="text-[10px] text-gray-400">Global</Text>
              ) : null}
            </View>
            {item.description ? (
              <Text
                className="text-xs text-gray-500 dark:text-gray-400 mt-1.5"
                numberOfLines={2}
              >
                {item.description}
              </Text>
            ) : null}
          </View>
          {!item.is_global ? (
            <View className="flex-row gap-2">
              <Pressable onPress={() => openEditExercise(item)} hitSlop={8}>
                <Ionicons name="pencil-outline" size={16} color="#9CA3AF" />
              </Pressable>
              <Pressable onPress={() => handleDeleteExercise(item)} hitSlop={8}>
                <Ionicons name="trash-outline" size={16} color="#EF5350" />
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    ),
    [openEditExercise, handleDeleteExercise]
  );

  const filteredVideos = store.filteredVideos();
  const filteredExercises = store.filteredExercises();

  return (
    <View className="flex-1 bg-gray-100 dark:bg-navy-deep">
      <ScreenHeader title="Library" showDrawerToggle />

      <View className="flex-1 px-5 pt-5">
        {/* Tab bar */}
        <View className="flex-row rounded-xl overflow-hidden border border-gray-200 dark:border-navy-border mb-5">
          {(["video", "workout"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => store.setActiveTab(t)}
              className={`flex-1 py-3 items-center ${
                store.activeTab === t ? "bg-teal-proto" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-[13px] font-semibold ${
                  store.activeTab === t
                    ? "text-navy-deep"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {t === "video" ? "Video Library" : "Workout Library"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Video tab — always mounted, hidden when inactive */}
        <View className={`flex-1 ${store.activeTab !== "video" ? "hidden" : ""}`}>
          <View className="flex-row items-center gap-3 mb-4">
            <View className="flex-1 flex-row items-center bg-white dark:bg-navy-card border border-gray-200 dark:border-navy-border rounded-xl px-3">
              <Ionicons name="search-outline" size={18} color="#9CA3AF" />
              <TextInput
                value={store.videoSearch}
                onChangeText={store.setVideoSearch}
                placeholder="Search videos..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 py-2.5 px-2 text-gray-900 dark:text-gray-100 text-sm"
              />
            </View>
            <Pressable
              onPress={openCreateVideo}
              className="bg-teal-proto px-4 py-2.5 rounded-lg"
            >
              <Text className="text-navy-deep font-semibold text-[13px]">
                + Add Video
              </Text>
            </Pressable>
          </View>

          {store.videosLoading && !filteredVideos.length ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#00E5CC" />
            </View>
          ) : (
            <FlatList
              data={filteredVideos}
              keyExtractor={(item) => item.id}
              renderItem={renderVideo}
              contentContainerClassName="pb-8"
              ListEmptyComponent={
                <View className="items-center justify-center py-16">
                  <Ionicons
                    name="videocam-outline"
                    size={48}
                    color="#9CA3AF"
                  />
                  <Text className="font-semibold text-[15px] text-gray-900 dark:text-gray-200 mt-3">
                    No videos yet
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                    Add videos to build your coaching library.
                  </Text>
                </View>
              }
            />
          )}
        </View>

        {/* Workout tab — always mounted, hidden when inactive */}
        <View className={`flex-1 ${store.activeTab !== "workout" ? "hidden" : ""}`}>
          <View className="flex-row items-center gap-3 mb-3">
            <View className="flex-1 flex-row items-center bg-white dark:bg-navy-card border border-gray-200 dark:border-navy-border rounded-xl px-3">
              <Ionicons name="search-outline" size={18} color="#9CA3AF" />
              <TextInput
                value={store.exerciseSearch}
                onChangeText={store.setExerciseSearch}
                placeholder="Search exercises..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 py-2.5 px-2 text-gray-900 dark:text-gray-100 text-sm"
              />
            </View>
            <Pressable
              onPress={openCreateExercise}
              className="bg-teal-proto px-4 py-2.5 rounded-lg"
            >
              <Text className="text-navy-deep font-semibold text-[13px]">
                + Add Exercise
              </Text>
            </Pressable>
          </View>

          {/* Category filter */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() =>
                  store.setExerciseCategory(cat === "all" ? null : cat)
                }
                className={`px-3 py-1.5 rounded-md border ${
                  (cat === "all" && !store.exerciseCategory) ||
                  store.exerciseCategory === cat
                    ? "bg-teal-proto border-teal-proto"
                    : "bg-transparent border-gray-300 dark:border-navy-border"
                }`}
              >
                <Text
                  className={`text-xs capitalize ${
                    (cat === "all" && !store.exerciseCategory) ||
                    store.exerciseCategory === cat
                      ? "text-navy-deep font-semibold"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {cat === "all"
                    ? "All"
                    : EXERCISE_CATEGORY_LABELS[cat] ?? cat}
                </Text>
              </Pressable>
            ))}
          </View>

          {store.exercisesLoading && !filteredExercises.length ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#00E5CC" />
            </View>
          ) : (
            <FlatList
              data={filteredExercises}
              keyExtractor={(item) => item.id}
              renderItem={renderExercise}
              contentContainerClassName="pb-8"
              ListEmptyComponent={
                <View className="items-center justify-center py-16">
                  <Ionicons
                    name="fitness-outline"
                    size={48}
                    color="#9CA3AF"
                  />
                  <Text className="font-semibold text-[15px] text-gray-900 dark:text-gray-200 mt-3">
                    Build your exercise library
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                    Add template exercises with descriptions and video links.
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>

      {/* Video Modal */}
      <Modal
        visible={videoModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setVideoModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-navy-card rounded-t-2xl p-6">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-lg font-bold text-gray-900 dark:text-gray-200">
                {editingVideo ? "Edit Video" : "Add Video"}
              </Text>
              <Pressable
                onPress={() => setVideoModalVisible(false)}
                hitSlop={8}
              >
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </Text>
            <TextInput
              value={videoTitle}
              onChangeText={setVideoTitle}
              placeholder="Video title"
              placeholderTextColor="#9CA3AF"
              className="bg-gray-100 dark:bg-navy-input border border-gray-200 dark:border-navy-border rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 text-base mb-4"
            />

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL
            </Text>
            <TextInput
              value={videoUrl}
              onChangeText={setVideoUrl}
              placeholder="https://..."
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="url"
              className="bg-gray-100 dark:bg-navy-input border border-gray-200 dark:border-navy-border rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 text-base mb-4"
            />

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category (optional)
            </Text>
            <TextInput
              value={videoCategory}
              onChangeText={setVideoCategory}
              placeholder="e.g. Olympic Lifting"
              placeholderTextColor="#9CA3AF"
              className="bg-gray-100 dark:bg-navy-input border border-gray-200 dark:border-navy-border rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 text-base mb-6"
            />

            <Pressable
              onPress={handleSaveVideo}
              disabled={store.videosLoading}
              className="bg-teal-proto py-3.5 rounded-xl items-center"
            >
              {store.videosLoading ? (
                <ActivityIndicator size="small" color="#0F1117" />
              ) : (
                <Text className="text-navy-deep font-bold text-base">
                  {editingVideo ? "Save Changes" : "Add Video"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Exercise Modal */}
      <Modal
        visible={exerciseModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setExerciseModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-navy-card rounded-t-2xl p-6">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-lg font-bold text-gray-900 dark:text-gray-200">
                {editingExercise ? "Edit Exercise" : "Add Exercise"}
              </Text>
              <Pressable
                onPress={() => setExerciseModalVisible(false)}
                hitSlop={8}
              >
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </Text>
            <TextInput
              value={exerciseName}
              onChangeText={setExerciseName}
              placeholder="Exercise name"
              placeholderTextColor="#9CA3AF"
              className="bg-gray-100 dark:bg-navy-input border border-gray-200 dark:border-navy-border rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 text-base mb-4"
            />

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </Text>
            <TextInput
              value={exerciseDesc}
              onChangeText={setExerciseDesc}
              placeholder="Optional description"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              className="bg-gray-100 dark:bg-navy-input border border-gray-200 dark:border-navy-border rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 text-base mb-4"
            />

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
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
                  onPress={() => setExerciseCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg border ${
                    exerciseCategory === cat
                      ? "bg-teal-proto border-teal-proto"
                      : "bg-transparent border-gray-300 dark:border-navy-border"
                  }`}
                >
                  <Text
                    className={`text-xs ${
                      exerciseCategory === cat
                        ? "text-navy-deep font-semibold"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {EXERCISE_CATEGORY_LABELS[cat] ?? cat}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Video URL (optional)
            </Text>
            <TextInput
              value={exerciseVideoUrl}
              onChangeText={setExerciseVideoUrl}
              placeholder="https://..."
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="url"
              className="bg-gray-100 dark:bg-navy-input border border-gray-200 dark:border-navy-border rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 text-base mb-6"
            />

            <Pressable
              onPress={handleSaveExercise}
              disabled={store.exercisesLoading}
              className="bg-teal-proto py-3.5 rounded-xl items-center"
            >
              {store.exercisesLoading ? (
                <ActivityIndicator size="small" color="#0F1117" />
              ) : (
                <Text className="text-navy-deep font-bold text-base">
                  {editingExercise ? "Save Changes" : "Add Exercise"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
