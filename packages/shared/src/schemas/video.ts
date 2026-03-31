import { z } from "zod";

export const videoSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().url(),
  category: z.string().max(100).nullable(),
  exercise_id: z.string().uuid().nullable(),
});

export type VideoInput = z.infer<typeof videoSchema>;
