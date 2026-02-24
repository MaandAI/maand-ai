import { z } from "zod";

export const NotificationSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(["info", "success", "warning", "error"]),
  read: z.boolean().default(false),
  createdAt: z.union([z.string(), z.date()]).optional(),
});

export type Notification = z.infer<typeof NotificationSchema>;
