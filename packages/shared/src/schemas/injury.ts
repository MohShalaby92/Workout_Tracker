import { z } from "zod";

export const createInjurySchema = z.object({
  name: z.string().min(1, "Injury name is required").max(200),
  area: z.string().min(1, "Body area is required").max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  status: z.enum(["active", "recovering", "resolved"]),
  avoid: z.string().max(1000).nullable(),
  notes: z.string().max(1000).nullable(),
  doctor_notes: z.string().max(1000).nullable(),
});

export const updateInjurySchema = createInjurySchema.partial();

export type CreateInjuryInput = z.infer<typeof createInjurySchema>;
export type UpdateInjuryInput = z.infer<typeof updateInjurySchema>;
