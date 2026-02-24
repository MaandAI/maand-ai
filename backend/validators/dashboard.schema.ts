import { z } from "zod";

export const DashboardStatsSchema = z.object({
  id: z.string().optional(),
  totalUsers: z.number().nonnegative(),
  activeUsers: z.number().nonnegative(),
  totalRevenue: z.number().nonnegative(),
  subscriptions: z.number().nonnegative(),
  userGrowth: z.number(),
  revenueGrowth: z.number(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});

export const UserActivitySchema = z.object({
  id: z.string().optional(),
  date: z.string(), // YYYY-MM
  users: z.number().nonnegative(),
  sessions: z.number().nonnegative(),
});

export const RevenueDataSchema = z.object({
  id: z.string().optional(),
  month: z.string(),
  revenue: z.number().nonnegative(),
  subscriptions: z.number().nonnegative(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
export type UserActivity = z.infer<typeof UserActivitySchema>;
export type RevenueData = z.infer<typeof RevenueDataSchema>;
