import { z } from "zod";

export const createProgramSchema = z.object({
  name: z.string().min(1, "Program name is required").max(100),
  description: z.string().max(1000).nullable(),
  type: z.enum(["template", "ongoing", "standard"]),
  image_url: z.string().url().nullable(),
});

export const templateSectionSchema = z.object({
  letter: z.string().length(1),
  title: z.string().min(1).max(100),
  format: z.enum(["sets", "amrap", "emom", "fortime", "tabata", "superset"]),
  settings_json: z.object({
    time_cap_sec: z.number().int().positive().optional(),
    interval_sec: z.number().int().positive().optional(),
    rounds: z.number().int().positive().optional(),
    work_sec: z.number().int().positive().optional(),
    rest_sec: z.number().int().positive().optional(),
  }).default({}),
  order_index: z.number().int().nonnegative(),
});

export const templateExerciseSchema = z.object({
  exercise_id: z.string().uuid(),
  order_index: z.number().int().nonnegative(),
  sets: z.number().int().min(1).max(20).nullable(),
  reps: z.number().int().positive().nullable(),
  weight_kg: z.number().nonnegative().nullable(),
  percentage_1rm: z.number().min(0).max(150).nullable(),
  rpe: z.number().min(1).max(10).nullable(),
  rest_sec: z.number().int().nonnegative().nullable(),
  notes: z.string().max(500).nullable(),
});

export const assignProgramSchema = z.object({
  program_id: z.string().uuid(),
  client_id: z.string().uuid(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type TemplateSectionInput = z.infer<typeof templateSectionSchema>;
export type TemplateExerciseInput = z.infer<typeof templateExerciseSchema>;
export type AssignProgramInput = z.infer<typeof assignProgramSchema>;
