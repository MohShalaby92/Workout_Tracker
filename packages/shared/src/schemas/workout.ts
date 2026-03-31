import { z } from "zod";

export const loggedSetSchema = z.object({
  template_exercise_id: z.string().uuid().nullable(),
  set_number: z.number().int().positive(),
  reps: z.number().int().positive().nullable(),
  weight_kg: z.number().nonnegative().nullable(),
  rpe: z.number().min(1).max(10).nullable(),
  notes: z.string().max(500).nullable(),
});

export const startWorkoutSchema = z.object({
  workout_template_id: z.string().uuid().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const completeWorkoutSchema = z.object({
  workout_log_id: z.string().uuid(),
  sets: z.array(loggedSetSchema),
  comment: z.string().max(1000).nullable(),
  duration_sec: z.number().int().positive().nullable(),
});

export type LoggedSetInput = z.infer<typeof loggedSetSchema>;
export type StartWorkoutInput = z.infer<typeof startWorkoutSchema>;
export type CompleteWorkoutInput = z.infer<typeof completeWorkoutSchema>;
