import { z } from "zod";

export const UserRoleSchema = z.enum(["user", "admin"]);
export const UserSubscriptionSchema = z.enum([
  "free",
  "basic",
  "pro",
  "enterprise",
]);

export const UserProfileSchema = z.object({
  uid: z.string().min(1, "UID is required"),
  email: z.string().email("Invalid email format").nullable(),
  displayName: z.string().nullable(),
  photoURL: z.string().url("Invalid photo URL format").nullable().optional(),
  role: UserRoleSchema.default("user"),
  subscription: UserSubscriptionSchema.default("free"),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
