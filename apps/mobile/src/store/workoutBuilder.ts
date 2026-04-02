import { create } from "zustand";
import type {
  WorkoutTemplate,
  TemplateSection,
  TemplateExercise,
  SectionFormat,
  SectionSettings,
} from "@shared/types/database";
import type { SectionWithExercises } from "@/services/workouts";
import * as workoutService from "@/services/workouts";
import * as injuriesService from "@/services/injuries";
import type { InjuryWithClient } from "@/services/injuries";

interface WorkoutBuilderState {
  currentProgramId: string | null;
  workoutTemplates: WorkoutTemplate[];
  selectedDayNumber: number;
  currentTemplate: WorkoutTemplate | null;
  sections: SectionWithExercises[];
  isLoading: boolean;
  error: string | null;

  loadProgramWorkouts: (programId: string) => Promise<void>;
  selectDay: (dayNumber: number) => Promise<void>;
  createWorkout: (
    programId: string,
    dayNumber: number,
    title: string
  ) => Promise<void>;
  updateWorkout: (
    templateId: string,
    updates: Partial<Pick<WorkoutTemplate, "title" | "notes">>
  ) => Promise<void>;
  deleteWorkout: (templateId: string) => Promise<void>;
  addSection: (format: SectionFormat) => Promise<void>;
  updateSection: (
    sectionId: string,
    updates: Partial<Pick<TemplateSection, "title" | "format" | "settings_json">>
  ) => Promise<void>;
  deleteSection: (sectionId: string) => Promise<void>;
  addExercise: (
    sectionId: string,
    exerciseId: string,
    config?: Partial<
      Pick<
        TemplateExercise,
        "sets" | "reps" | "weight_kg" | "percentage_1rm" | "rpe" | "rest_sec" | "notes"
      >
    >
  ) => Promise<void>;
  updateExercise: (
    templateExerciseId: string,
    updates: Partial<
      Pick<
        TemplateExercise,
        "sets" | "reps" | "weight_kg" | "percentage_1rm" | "rpe" | "rest_sec" | "notes"
      >
    >
  ) => Promise<void>;
  removeExercise: (templateExerciseId: string) => Promise<void>;
  copyWorkout: (
    templateId: string,
    targetProgramId: string,
    targetDay: number
  ) => Promise<void>;
  clientInjuries: InjuryWithClient[];
  loadClientInjuries: (programId: string) => Promise<void>;
}

function nextLetter(sections: SectionWithExercises[]): string {
  if (sections.length === 0) return "A";
  const lastCode = sections[sections.length - 1].letter.charCodeAt(0);
  return String.fromCharCode(lastCode + 1);
}

export const useWorkoutBuilderStore = create<WorkoutBuilderState>(
  (set, get) => ({
    currentProgramId: null,
    workoutTemplates: [],
    selectedDayNumber: 1,
    currentTemplate: null,
    sections: [],
    isLoading: false,
    error: null,
    clientInjuries: [],

    loadProgramWorkouts: async (programId) => {
      set({ isLoading: true, error: null, currentProgramId: programId });
      try {
        const templates =
          await workoutService.fetchWorkoutTemplates(programId);
        set({ workoutTemplates: templates });

        // Auto-select first day if templates exist
        if (templates.length > 0) {
          const firstDay = templates[0].day_number;
          const firstTemplate = templates[0];
          const sections = await workoutService.fetchTemplateSections(
            firstTemplate.id
          );
          set({
            selectedDayNumber: firstDay,
            currentTemplate: firstTemplate,
            sections,
          });
        } else {
          set({
            selectedDayNumber: 1,
            currentTemplate: null,
            sections: [],
          });
        }
      } catch (err: any) {
        set({ error: err.message ?? "Failed to load workouts" });
      } finally {
        set({ isLoading: false });
      }
    },

    selectDay: async (dayNumber) => {
      const { workoutTemplates } = get();
      set({ selectedDayNumber: dayNumber, error: null });

      const template = workoutTemplates.find(
        (t) => t.day_number === dayNumber
      );
      if (template) {
        set({ isLoading: true });
        try {
          const sections = await workoutService.fetchTemplateSections(
            template.id
          );
          set({ currentTemplate: template, sections });
        } catch (err: any) {
          set({ error: err.message ?? "Failed to load sections" });
        } finally {
          set({ isLoading: false });
        }
      } else {
        set({ currentTemplate: null, sections: [] });
      }
    },

    createWorkout: async (programId, dayNumber, title) => {
      set({ isLoading: true, error: null });
      try {
        const template = await workoutService.createWorkoutTemplate(
          programId,
          { day_number: dayNumber, title }
        );
        set((state) => ({
          workoutTemplates: [...state.workoutTemplates, template].sort(
            (a, b) => a.day_number - b.day_number
          ),
          currentTemplate: template,
          sections: [],
          selectedDayNumber: dayNumber,
        }));
      } catch (err: any) {
        set({ error: err.message ?? "Failed to create workout" });
        throw err;
      } finally {
        set({ isLoading: false });
      }
    },

    updateWorkout: async (templateId, updates) => {
      set({ error: null });
      try {
        const updated = await workoutService.updateWorkoutTemplate(
          templateId,
          updates
        );
        set((state) => ({
          workoutTemplates: state.workoutTemplates.map((t) =>
            t.id === templateId ? updated : t
          ),
          currentTemplate:
            state.currentTemplate?.id === templateId
              ? updated
              : state.currentTemplate,
        }));
      } catch (err: any) {
        set({ error: err.message ?? "Failed to update workout" });
        throw err;
      }
    },

    deleteWorkout: async (templateId) => {
      set({ error: null });
      try {
        await workoutService.deleteWorkoutTemplate(templateId);
        set((state) => {
          const filtered = state.workoutTemplates.filter(
            (t) => t.id !== templateId
          );
          const isCurrent = state.currentTemplate?.id === templateId;
          return {
            workoutTemplates: filtered,
            currentTemplate: isCurrent ? null : state.currentTemplate,
            sections: isCurrent ? [] : state.sections,
          };
        });
      } catch (err: any) {
        set({ error: err.message ?? "Failed to delete workout" });
        throw err;
      }
    },

    addSection: async (format) => {
      const { currentTemplate, sections } = get();
      if (!currentTemplate) return;

      set({ error: null });
      try {
        const letter = nextLetter(sections);
        const section = await workoutService.createTemplateSection(
          currentTemplate.id,
          {
            letter,
            title: "",
            format,
            settings_json: {},
            order_index: sections.length,
          }
        );
        const sectionWithExercises: SectionWithExercises = {
          ...section,
          template_exercises: [],
        };
        set((state) => ({
          sections: [...state.sections, sectionWithExercises],
        }));
      } catch (err: any) {
        set({ error: err.message ?? "Failed to add section" });
        throw err;
      }
    },

    updateSection: async (sectionId, updates) => {
      set({ error: null });
      try {
        const updated = await workoutService.updateTemplateSection(
          sectionId,
          updates
        );
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === sectionId
              ? { ...s, ...updated }
              : s
          ),
        }));
      } catch (err: any) {
        set({ error: err.message ?? "Failed to update section" });
        throw err;
      }
    },

    deleteSection: async (sectionId) => {
      set({ error: null });
      try {
        await workoutService.deleteTemplateSection(sectionId);
        set((state) => ({
          sections: state.sections.filter((s) => s.id !== sectionId),
        }));
      } catch (err: any) {
        set({ error: err.message ?? "Failed to delete section" });
        throw err;
      }
    },

    addExercise: async (sectionId, exerciseId, config) => {
      set({ error: null });
      try {
        const section = get().sections.find((s) => s.id === sectionId);
        const orderIndex = section?.template_exercises.length ?? 0;

        const templateExercise = await workoutService.addExerciseToSection(
          sectionId,
          {
            exercise_id: exerciseId,
            order_index: orderIndex,
            ...config,
          }
        );

        // Re-fetch sections to get the exercise join data
        const { currentTemplate } = get();
        if (currentTemplate) {
          const sections = await workoutService.fetchTemplateSections(
            currentTemplate.id
          );
          set({ sections });
        }
      } catch (err: any) {
        set({ error: err.message ?? "Failed to add exercise" });
        throw err;
      }
    },

    updateExercise: async (templateExerciseId, updates) => {
      set({ error: null });
      try {
        await workoutService.updateTemplateExercise(
          templateExerciseId,
          updates
        );
        set((state) => ({
          sections: state.sections.map((s) => ({
            ...s,
            template_exercises: s.template_exercises.map((te) =>
              te.id === templateExerciseId ? { ...te, ...updates } : te
            ),
          })),
        }));
      } catch (err: any) {
        set({ error: err.message ?? "Failed to update exercise" });
        throw err;
      }
    },

    removeExercise: async (templateExerciseId) => {
      set({ error: null });
      try {
        await workoutService.removeExerciseFromSection(templateExerciseId);
        set((state) => ({
          sections: state.sections.map((s) => ({
            ...s,
            template_exercises: s.template_exercises.filter(
              (te) => te.id !== templateExerciseId
            ),
          })),
        }));
      } catch (err: any) {
        set({ error: err.message ?? "Failed to remove exercise" });
        throw err;
      }
    },

    copyWorkout: async (templateId, targetProgramId, targetDay) => {
      set({ error: null });
      try {
        await workoutService.copyWorkoutTemplate(
          templateId,
          targetProgramId,
          targetDay
        );
      } catch (err: any) {
        set({ error: err.message ?? "Failed to copy workout" });
        throw err;
      }
    },

    loadClientInjuries: async (programId) => {
      try {
        const assignments = await workoutService.fetchProgramAssignments(programId);
        const clientIds = assignments.map((a) => a.client_id);
        if (clientIds.length === 0) {
          set({ clientInjuries: [] });
          return;
        }
        const injuries = await injuriesService.fetchInjuriesForClients(clientIds);
        set({ clientInjuries: injuries });
      } catch {
        // Non-critical — don't block the builder
        set({ clientInjuries: [] });
      }
    },
  })
);
