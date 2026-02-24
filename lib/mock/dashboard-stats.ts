// Mock dashboard statistics
export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  subscriptions: number
  userGrowth: number
  revenueGrowth: number
}

export const mockDashboardStats: DashboardStats = {
  totalUsers: 12847,
  activeUsers: 9234,
  totalRevenue: 487250,
  subscriptions: 8456,
  userGrowth: 12.5,
  revenueGrowth: 23.8,
}

export interface UserActivity {
  date: string
  users: number
  sessions: number
}

export const mockUserActivity: UserActivity[] = [
  { date: "2024-01", users: 4200, sessions: 8400 },
  { date: "2024-02", users: 5100, sessions: 10200 },
  { date: "2024-03", users: 6300, sessions: 12600 },
  { date: "2024-04", users: 7800, sessions: 15600 },
  { date: "2024-05", users: 9234, sessions: 18468 },
]

export interface RevenueData {
  month: string
  revenue: number
  subscriptions: number
}

export const mockRevenueData: RevenueData[] = [
  { month: "Jan", revenue: 285000, subscriptions: 5200 },
  { month: "Feb", revenue: 320000, subscriptions: 6100 },
  { month: "Mar", revenue: 365000, subscriptions: 6800 },
  { month: "Apr", revenue: 425000, subscriptions: 7600 },
  { month: "May", revenue: 487250, subscriptions: 8456 },
]
