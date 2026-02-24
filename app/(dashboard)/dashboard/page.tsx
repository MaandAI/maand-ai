"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle2, Clock, Activity } from "lucide-react";
import { useModulesAPI } from "@/hooks/api/useModules";
import { ProtectedRoute } from "@/components/auth/protected-route";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardContent() {
  const { modules, loading } = useModulesAPI();

  const stats = [
    {
      label: "Total Sessions",
      value: "24",
      icon: Activity,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      label: "Active Modules",
      value: "3",
      icon: Brain,
      change: "+2",
      changeType: "positive" as const,
    },
    {
      label: "Completed Goals",
      value: "8",
      icon: CheckCircle2,
      change: "+3",
      changeType: "positive" as const,
    },
    {
      label: "Hours This Week",
      value: "6.5",
      icon: Clock,
      change: "+1.2h",
      changeType: "positive" as const,
    },
  ];

  const recentModules = modules.slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
        <p className="text-muted-foreground">
          Here's an overview of your mental wellness journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
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

      {/* Active Modules */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full" />)
          : recentModules.map((module) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {module.description}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        module.status === "completed"
                          ? "default"
                          : module.status === "in-progress"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {module.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} className="h-2" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {module.sessionsCompleted} of {module.totalSessions}{" "}
                    sessions completed
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Continue your mental wellness journey
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/dashboard/modules">Browse All Modules</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/profile">Update Profile</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/billing">Upgrade Plan</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
