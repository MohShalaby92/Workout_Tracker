import { z } from "zod";

export const createSkillSchema = z.object({
  name: z.string().min(1, "Skill name is required").max(100),
  status: z.enum(["locked", "in_progress", "unlocked", "blocked"]),
  current_level: z.string().max(200).nullable(),
  notes: z.string().max(1000).nullable(),
});

export const updateSkillSchema = createSkillSchema.partial();

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
