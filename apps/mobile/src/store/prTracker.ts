import { create } from "zustand";
import * as prService from "@/services/personalRecords";
import type { PRWithClientAndExercise } from "@/services/personalRecords";

interface GroupedPR {
  clientId: string;
  clientName: string;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    records: PRWithClientAndExercise[];
  }[];
}

interface PRTrackerState {
  prs: PRWithClientAndExercise[];
  isLoading: boolean;
  error: string | null;

  fetch: (coachId: string) => Promise<void>;
  create: (
    clientId: string,
    input: {
      exercise_id: string;
      weight_kg: number | null;
      reps: number | null;
      achieved_at: string;
    }
  ) => Promise<void>;
  remove: (id: string) => Promise<void>;
  groupedByClient: () => GroupedPR[];
}

export const usePRTrackerStore = create<PRTrackerState>((set, get) => ({
  prs: [],
  isLoading: false,
  error: null,

  fetch: async (coachId) => {
    set({ isLoading: true, error: null });
    try {
      const prs = await prService.fetchAllCoachPRs(coachId);
      set({ prs });
    } catch (err: any) {
      set({ error: err.message ?? "Failed to load PRs" });
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (clientId, input) => {
    set({ isLoading: true, error: null });
    try {
      await prService.createPR(clientId, input);
      // Screen will re-fetch to get joined data
    } catch (err: any) {
      set({ error: err.message ?? "Failed to create PR" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ error: null });
    try {
      await prService.deletePR(id);
      set((state) => ({
        prs: state.prs.filter((p) => p.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message ?? "Failed to delete PR" });
      throw err;
    }
  },

  groupedByClient: () => {
    const { prs } = get();
    const clientMap = new Map<string, GroupedPR>();

    for (const pr of prs) {
      if (!clientMap.has(pr.client_id)) {
        clientMap.set(pr.client_id, {
          clientId: pr.client_id,
          clientName: pr.client?.name ?? "Unknown",
          exercises: [],
        });
      }

      const group = clientMap.get(pr.client_id)!;
      let exerciseGroup = group.exercises.find(
        (e) => e.exerciseId === pr.exercise_id
      );

      if (!exerciseGroup) {
        exerciseGroup = {
          exerciseId: pr.exercise_id,
          exerciseName: pr.exercise?.name ?? "Unknown",
          records: [],
        };
        group.exercises.push(exerciseGroup);
      }

      exerciseGroup.records.push(pr);
    }

    return Array.from(clientMap.values());
  },
}));
