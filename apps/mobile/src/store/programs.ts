import { create } from "zustand";
import type { Program, ProgramType } from "@shared/types/database";
import * as programsService from "@/services/programs";

interface ProgramsState {
  programs: Program[];
  selectedProgram: Program | null;
  isLoading: boolean;
  error: string | null;

  fetch: (coachId: string) => Promise<void>;
  create: (input: {
    name: string;
    description: string | null;
    type: ProgramType;
    image_url: string | null;
  }) => Promise<void>;
  update: (
    id: string,
    updates: Partial<Pick<Program, "name" | "description" | "type" | "image_url">>
  ) => Promise<void>;
  remove: (id: string) => Promise<void>;
  select: (program: Program | null) => void;
}

export const useProgramsStore = create<ProgramsState>((set, get) => ({
  programs: [],
  selectedProgram: null,
  isLoading: false,
  error: null,

  fetch: async (coachId) => {
    set({ isLoading: true, error: null });
    try {
      const programs = await programsService.fetchPrograms(coachId);
      set({ programs });
    } catch (err: any) {
      set({ error: err.message ?? "Failed to load programs" });
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const program = await programsService.createProgram(input);
      set((state) => ({ programs: [program, ...state.programs] }));
    } catch (err: any) {
      set({ error: err.message ?? "Failed to create program" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, updates) => {
    set({ error: null });
    try {
      const updated = await programsService.updateProgram(id, updates);
      set((state) => ({
        programs: state.programs.map((p) => (p.id === id ? updated : p)),
        selectedProgram:
          state.selectedProgram?.id === id ? updated : state.selectedProgram,
      }));
    } catch (err: any) {
      set({ error: err.message ?? "Failed to update program" });
      throw err;
    }
  },

  remove: async (id) => {
    set({ error: null });
    try {
      await programsService.deleteProgram(id);
      set((state) => ({
        programs: state.programs.filter((p) => p.id !== id),
        selectedProgram:
          state.selectedProgram?.id === id ? null : state.selectedProgram,
      }));
    } catch (err: any) {
      set({ error: err.message ?? "Failed to delete program" });
      throw err;
    }
  },

  select: (program) => set({ selectedProgram: program }),
}));
