import { create } from "zustand";
import type { WorkoutLog, LoggedSet } from "@shared/types/database";

interface ActiveSet extends Omit<LoggedSet, "id" | "workout_log_id" | "timestamp"> {
  tempId: string; // local-only ID before server sync
}

interface WorkoutState {
  activeWorkout: WorkoutLog | null;
  activeSets: ActiveSet[];
  isLoading: boolean;

  startWorkout: (templateId?: string) => Promise<void>;
  addSet: (set: Omit<ActiveSet, "tempId">) => void;
  updateSet: (tempId: string, updates: Partial<ActiveSet>) => void;
  removeSet: (tempId: string) => void;
  finishWorkout: (comment?: string) => Promise<void>;
  discardWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeWorkout: null,
  activeSets: [],
  isLoading: false,

  startWorkout: async (templateId) => {
    set({ isLoading: true });
    try {
      // TODO: POST to workout_logs via Supabase
      // const { data } = await supabase.from('workout_logs').insert({...}).select().single();
      // set({ activeWorkout: data, activeSets: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  addSet: (setData) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    set((state) => ({
      activeSets: [...state.activeSets, { ...setData, tempId }],
    }));
  },

  updateSet: (tempId, updates) => {
    set((state) => ({
      activeSets: state.activeSets.map((s) =>
        s.tempId === tempId ? { ...s, ...updates } : s
      ),
    }));
  },

  removeSet: (tempId) => {
    set((state) => ({
      activeSets: state.activeSets.filter((s) => s.tempId !== tempId),
    }));
  },

  finishWorkout: async (comment) => {
    const { activeWorkout, activeSets } = get();
    if (!activeWorkout) return;
    set({ isLoading: true });
    try {
      // TODO: bulk insert activeSets, update workout_logs status to 'complete'
    } finally {
      set({ isLoading: false, activeWorkout: null, activeSets: [] });
    }
  },

  discardWorkout: () => {
    set({ activeWorkout: null, activeSets: [] });
  },
}));
