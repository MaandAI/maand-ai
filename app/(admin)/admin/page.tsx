"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  Users,
  UserCheck,
  DollarSign,
  TrendingUp,
  Activity,
  Brain,
} from "lucide-react";
import { useDashboardAPI } from "@/hooks/api/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function AdminOverviewContent() {
  const { overview, activity, revenue, loading } = useDashboardAPI();

  const stats = overview
    ? [
        {
          label: "Total Users",
          value: overview.totalUsers.toLocaleString(),
          icon: Users,
          change: `+${overview.userGrowth}%`,
          changeType: "positive" as const,
        },
        {
          label: "Active Users",
          value: overview.activeUsers.toLocaleString(),
          icon: Activity,
          change: "+8.2%",
          changeType: "positive" as const,
        },
        {
          label: "Total Revenue",
          value: `$${overview.totalRevenue.toLocaleString()}`,
          icon: DollarSign,
          change: `+${overview.revenueGrowth}%`,
          changeType: "positive" as const,
        },
        {
          label: "Subscriptions",
          value: overview.subscriptions.toLocaleString(),
          icon: TrendingUp,
          change: "+15.3%",
          changeType: "positive" as const,
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">
          Monitor platform performance and user metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))
          : stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span
                      className={
                        stat.changeType === "positive"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {stat.change}
                    </span>{" "}
                    from last month
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="w-full h-[300px]" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activity}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="w-full h-[300px]" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenue}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Therapy Sessions</span>
              </div>
              <p className="text-2xl font-bold">45,234</p>
              <p className="text-xs text-muted-foreground">
                +18% from last month
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">
                  Avg. Session Duration
                </span>
              </div>
              <p className="text-2xl font-bold">42 min</p>
              <p className="text-xs text-muted-foreground">
                +5 min from last month
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">User Satisfaction</span>
              </div>
              <p className="text-2xl font-bold">4.8/5.0</p>
              <p className="text-xs text-muted-foreground">
                Based on 2,341 reviews
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminOverviewContent />
    </ProtectedRoute>
  );
}
