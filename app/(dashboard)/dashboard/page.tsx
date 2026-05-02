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
import {
  Brain,
  CheckCircle2,
  Clock,
  Activity,
  MessageSquare,
} from "lucide-react";
import { useModulesAPI } from "@/hooks/api/useModules";
import { ProtectedRoute } from "@/components/auth/protected-route";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

import { useChatAPI } from "@/hooks/api/useChat";
import { useEffect, useState } from "react";
import type { ChatSession } from "@/backend/validators/chat.schema";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function DashboardContent() {
  const { modules, loading: modulesLoading } = useModulesAPI();
  const { getSessions, loading: sessionsLoading } = useChatAPI();
  const [recentSessions, setRecentSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    getSessions()
      .then((data) => {
        setRecentSessions(data.slice(0, 4));
      })
      .catch(console.error);
  }, [getSessions]);

  const stats = [
    {
      label: "Total Sessions",
      value: "24",
      icon: Activity,
      change: "+12%",
      changeType: "positive" as const,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Active Modules",
      value: "3",
      icon: Brain,
      change: "+2",
      changeType: "positive" as const,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Completed Goals",
      value: "8",
      icon: CheckCircle2,
      change: "+3",
      changeType: "positive" as const,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Hours This Week",
      value: "6.5",
      icon: Clock,
      change: "+1.2h",
      changeType: "positive" as const,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-lg mt-1">
            Your mental wellness journey is progressing beautifully.
          </p>
        </div>
        <Button asChild className="rounded-full shadow-lg shadow-primary/20">
          <Link href="/dashboard/therapy/chat">
            <MessageSquare className="mr-2 h-4 w-4" />
            Start New Session
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                  {stat.label}
                </CardTitle>
                <div className={cn("p-2 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-bold border-none px-0",
                      stat.changeType === "positive"
                        ? "text-emerald-500"
                        : "text-red-500",
                    )}
                  >
                    {stat.change}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    vs last month
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Active Modules */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">Active Modules</h3>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-primary hover:text-primary hover:bg-primary/5"
            >
              <Link href="/dashboard/modules">View All</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {modulesLoading
              ? [1, 2].map((i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-2xl" />
                ))
              : modules.slice(0, 2).map((module) => (
                  <Card
                    key={module.id}
                    className="group border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {module.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {module.description}
                          </CardDescription>
                        </div>
                        <Badge
                          className={cn(
                            "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                            module.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : module.status === "in-progress"
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-muted text-muted-foreground border-muted-foreground/20",
                          )}
                          variant="outline"
                        >
                          {module.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          <span>Overall Progress</span>
                          <span className="text-foreground">
                            {module.progress}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${module.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-primary rounded-full"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/30 p-3 rounded-xl border border-muted-foreground/5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {module.sessionsCompleted} of {module.totalSessions}{" "}
                          sessions completed
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">
              Recent Sessions
            </h3>
          </div>
          <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              {sessionsLoading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : recentSessions.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {recentSessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/dashboard/therapy/chat?sessionId=${session.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-primary/5 transition-colors group"
                    >
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                          {session.title || "Therapy Session"}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {session.updatedAt
                            ? format(
                                new Date(session.updatedAt),
                                "MMM d, h:mm a",
                              )
                            : "Recently"}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full text-[10px] uppercase font-bold"
                      >
                        Continue
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground opacity-50">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold">No sessions yet</p>
                    <p className="text-xs text-muted-foreground">
                      Start your first session today.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-full"
                  >
                    <Link href="/dashboard/therapy/chat">Start Chat</Link>
                  </Button>
                </div>
              )}
            </CardContent>
            {recentSessions.length > 0 && (
              <div className="p-3 border-t bg-muted/5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary"
                  asChild
                >
                  <Link href="/dashboard/therapy/chat">View All Sessions</Link>
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
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
