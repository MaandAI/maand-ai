import { z } from "zod";

export const TherapyModuleSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  totalSessions: z.number().positive(),
  createdAt: z.union([z.string(), z.date()]).optional(),
});

export const UserModuleProgressSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  moduleId: z.string().min(1),
  status: z.enum(["active", "in-progress", "completed"]),
  progress: z.number().min(0).max(100),
  sessionsCompleted: z.number().nonnegative(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});

export type TherapyModule = z.infer<typeof TherapyModuleSchema>;
export type UserModuleProgress = z.infer<typeof UserModuleProgressSchema>;

// Combined type for frontend consumption
export type TherapyModuleWithProgress = TherapyModule &
  Omit<UserModuleProgress, "id" | "userId" | "moduleId">;
