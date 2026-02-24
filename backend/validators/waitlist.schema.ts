import { z } from "zod";

export const WaitlistEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  interest: z.string(),
  message: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  status: z.enum(["pending", "contacted", "converted"]).default("pending"),
  joinedAt: z.union([z.string(), z.date()]).optional(),
});

export type WaitlistEntry = z.infer<typeof WaitlistEntrySchema>;
