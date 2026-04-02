import { create } from "zustand";
import type { InjuryStatus } from "@shared/types/database";
import * as injuriesService from "@/services/injuries";
import type { InjuryWithClient } from "@/services/injuries";

interface InjuriesState {
  injuries: InjuryWithClient[];
  filter: InjuryStatus | "all";
  isLoading: boolean;
  error: string | null;

  fetch: (coachId: string) => Promise<void>;
  create: (
    clientId: string,
    input: {
      name: string;
      area: string;
      date: string;
      status: InjuryStatus;
      avoid: string | null;
      notes: string | null;
      doctor_notes: string | null;
    }
  ) => Promise<void>;
  update: (
    id: string,
    updates: Partial<
      Pick<
        InjuryWithClient,
        "name" | "area" | "date" | "status" | "avoid" | "notes" | "doctor_notes"
      >
    >
  ) => Promise<void>;
  remove: (id: string) => Promise<void>;
  setFilter: (filter: InjuryStatus | "all") => void;
  filteredInjuries: () => InjuryWithClient[];
}

export const useInjuriesStore = create<InjuriesState>((set, get) => ({
  injuries: [],
  filter: "all",
  isLoading: false,
  error: null,

  fetch: async (coachId) => {
    set({ isLoading: true, error: null });
    try {
      const injuries = await injuriesService.fetchAllCoachInjuries(coachId);
      set({ injuries });
    } catch (err: any) {
      set({ error: err.message ?? "Failed to load injuries" });
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (clientId, input) => {
    set({ isLoading: true, error: null });
    try {
      await injuriesService.createInjury(clientId, input);
      // Re-fetch to get joined client data
      const coachId = get().injuries[0]?.client?.id;
      // The screen will re-fetch after creation
    } catch (err: any) {
      set({ error: err.message ?? "Failed to create injury" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, updates) => {
    set({ error: null });
    try {
      const updated = await injuriesService.updateInjury(id, updates);
      set((state) => ({
        injuries: state.injuries.map((i) =>
          i.id === id ? { ...i, ...updated } : i
        ),
      }));
    } catch (err: any) {
      set({ error: err.message ?? "Failed to update injury" });
      throw err;
    }
  },

  remove: async (id) => {
    set({ error: null });
    try {
      await injuriesService.deleteInjury(id);
      set((state) => ({
        injuries: state.injuries.filter((i) => i.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message ?? "Failed to delete injury" });
      throw err;
    }
  },

  setFilter: (filter) => set({ filter }),

  filteredInjuries: () => {
    const { injuries, filter } = get();
    if (filter === "all") return injuries;
    return injuries.filter((i) => i.status === filter);
  },
}));
