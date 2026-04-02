import { create } from "zustand";
import type { Exercise, ExerciseCategory, Video } from "@shared/types/database";
import * as exercisesService from "@/services/exercises";
import * as videosService from "@/services/videos";

type LibraryTab = "video" | "workout";

interface LibraryState {
  // Tab
  activeTab: LibraryTab;

  // Exercises
  exercises: Exercise[];
  exerciseCategory: ExerciseCategory | null;
  exerciseSearch: string;
  exercisesLoading: boolean;

  // Videos
  videos: Video[];
  videoSearch: string;
  videosLoading: boolean;

  error: string | null;

  // Tab
  setActiveTab: (tab: LibraryTab) => void;

  // Exercises
  fetchExercises: (coachId: string) => Promise<void>;
  createExercise: (input: {
    name: string;
    description: string | null;
    category: ExerciseCategory;
    video_url: string | null;
  }) => Promise<void>;
  updateExercise: (
    id: string,
    updates: Partial<Pick<Exercise, "name" | "description" | "category" | "video_url">>
  ) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  setExerciseCategory: (category: ExerciseCategory | null) => void;
  setExerciseSearch: (query: string) => void;
  filteredExercises: () => Exercise[];

  // Videos
  fetchVideos: (coachId: string) => Promise<void>;
  createVideo: (input: {
    title: string;
    url: string;
    category: string | null;
    exercise_id: string | null;
  }) => Promise<void>;
  updateVideo: (
    id: string,
    updates: Partial<Pick<Video, "title" | "url" | "category" | "exercise_id">>
  ) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  setVideoSearch: (query: string) => void;
  filteredVideos: () => Video[];
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  activeTab: "video",
  exercises: [],
  exerciseCategory: null,
  exerciseSearch: "",
  exercisesLoading: false,
  videos: [],
  videoSearch: "",
  videosLoading: false,
  error: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  // ─── Exercises ──────────────────────────────────────────────
  fetchExercises: async (coachId) => {
    set({ exercisesLoading: true, error: null });
    try {
      const exercises = await exercisesService.fetchExercises(coachId);
      set({ exercises });
    } catch (err: any) {
      set({ error: err.message ?? "Failed to load exercises" });
    } finally {
      set({ exercisesLoading: false });
    }
  },

  createExercise: async (input) => {
    set({ exercisesLoading: true, error: null });
    try {
      const exercise = await exercisesService.createExercise(input);
      set((state) => ({ exercises: [exercise, ...state.exercises] }));
    } catch (err: any) {
      set({ error: err.message ?? "Failed to create exercise" });
      throw err;
    } finally {
      set({ exercisesLoading: false });
    }
  },

  updateExercise: async (id, updates) => {
    set({ error: null });
    try {
      const updated = await exercisesService.updateExercise(id, updates);
      set((state) => ({
        exercises: state.exercises.map((e) => (e.id === id ? updated : e)),
      }));
    } catch (err: any) {
      set({ error: err.message ?? "Failed to update exercise" });
      throw err;
    }
  },

  deleteExercise: async (id) => {
    set({ error: null });
    try {
      await exercisesService.deleteExercise(id);
      set((state) => ({
        exercises: state.exercises.filter((e) => e.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message ?? "Failed to delete exercise" });
      throw err;
    }
  },

  setExerciseCategory: (category) => set({ exerciseCategory: category }),
  setExerciseSearch: (query) => set({ exerciseSearch: query }),

  filteredExercises: () => {
    const { exercises, exerciseCategory, exerciseSearch } = get();
    let result = exercises;

    if (exerciseCategory) {
      result = result.filter((e) => e.category === exerciseCategory);
    }

    if (exerciseSearch.trim()) {
      const q = exerciseSearch.toLowerCase();
      result = result.filter((e) => e.name.toLowerCase().includes(q));
    }

    return result;
  },

  // ─── Videos ─────────────────────────────────────────────────
  fetchVideos: async (coachId) => {
    set({ videosLoading: true, error: null });
    try {
      const videos = await videosService.fetchVideos(coachId);
      set({ videos });
    } catch (err: any) {
      set({ error: err.message ?? "Failed to load videos" });
    } finally {
      set({ videosLoading: false });
    }
  },

  createVideo: async (input) => {
    set({ videosLoading: true, error: null });
    try {
      const video = await videosService.createVideo(input);
      set((state) => ({ videos: [video, ...state.videos] }));
    } catch (err: any) {
      set({ error: err.message ?? "Failed to create video" });
      throw err;
    } finally {
      set({ videosLoading: false });
    }
  },

  updateVideo: async (id, updates) => {
    set({ error: null });
    try {
      const updated = await videosService.updateVideo(id, updates);
      set((state) => ({
        videos: state.videos.map((v) => (v.id === id ? updated : v)),
      }));
    } catch (err: any) {
      set({ error: err.message ?? "Failed to update video" });
      throw err;
    }
  },

  deleteVideo: async (id) => {
    set({ error: null });
    try {
      await videosService.deleteVideo(id);
      set((state) => ({
        videos: state.videos.filter((v) => v.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message ?? "Failed to delete video" });
      throw err;
    }
  },

  setVideoSearch: (query) => set({ videoSearch: query }),

  filteredVideos: () => {
    const { videos, videoSearch } = get();
    if (!videoSearch.trim()) return videos;
    const q = videoSearch.toLowerCase();
    return videos.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        (v.category?.toLowerCase().includes(q) ?? false)
    );
  },
}));
