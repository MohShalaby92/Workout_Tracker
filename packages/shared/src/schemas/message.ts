import { z } from "zod";

export const sendMessageSchema = z.object({
  recipient_id: z.string().uuid(),
  content: z.string().min(1, "Message cannot be empty").max(2000),
  workout_log_id: z.string().uuid().nullable(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
