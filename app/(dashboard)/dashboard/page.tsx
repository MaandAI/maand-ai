"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  CheckCircle2,
  Clock,
  Activity,
  MessageSquare,
  FileText,
  ChevronRight,
} from "lucide-react";
import { useModulesAPI } from "@/hooks/api/useModules";
import { ProtectedRoute } from "@/components/auth/protected-route";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useDashboardSummary } from "@/hooks/api/useDashboardSummary";

import { useChatAPI } from "@/hooks/api/useChat";
import { useEffect, useState } from "react";
import type { ChatSession } from "@/backend/validators/chat.schema";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function DashboardContent() {
  const { summary, loading: summaryLoading } = useDashboardSummary();
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
      value: summary?.totalSessions || "0",
      icon: MessageSquare,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      href: "/dashboard/sessions"
    },
    {
      label: "Ongoing Sessions",
      value: summary?.activeSessions || "0",
      icon: Activity,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      href: "/dashboard/sessions?status=active"
    },
    {
      label: "Completed",
      value: summary?.completedSessions || "0",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      href: "/dashboard/sessions?status=completed"
    },
    {
      label: "Clinical Reports",
      value: summary?.totalReports || "0",
      icon: FileText,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      href: "/dashboard/reports"
    },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Wellness Dashboard
          </h1>
          <p className="text-muted-foreground text-lg mt-1">
            Real-time insights into your therapeutic journey.
          </p>
        </div>
        <Button asChild className="rounded-full shadow-lg shadow-primary/20">
          <Link href="/dashboard/therapy/chat">
            <MessageSquare className="mr-2 h-4 w-4" />
            New Session
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
            <Link href={stat.href}>
              <Card className="group border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                    {stat.label}
                  </CardTitle>
                  <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", stat.bg)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold tracking-tight">
                      {summaryLoading ? <Skeleton className="h-9 w-12" /> : stat.value}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Activity / Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">Recent Sessions</h3>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-primary hover:text-primary hover:bg-primary/5"
            >
              <Link href="/dashboard/sessions">View All</Link>
            </Button>
          </div>
          <div className="grid gap-4">
            {sessionsLoading ? (
              [1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
            ) : recentSessions.length > 0 ? (
              recentSessions.map((session) => (
                <Card key={session.id} className="group border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-lg group-hover:text-primary transition-colors">{session.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(session.updatedAt || session.createdAt || new Date()), "PPP")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={session.status === "completed" ? "secondary" : "default"} className="capitalize">
                        {session.status === "active" ? "Ongoing" : session.status}
                      </Badge>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/therapy/chat?sessionId=${session.id}`}>
                          <ChevronRight className="h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center border-dashed bg-transparent">
                <p className="text-muted-foreground">No recent sessions found.</p>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/therapy/chat">Start your first session</Link>
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Clinical Reports Preview */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">Latest Reports</h3>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-primary hover:text-primary hover:bg-primary/5"
            >
              <Link href="/dashboard/reports">See All</Link>
            </Button>
          </div>
          <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden p-2">
            <CardContent className="p-4 space-y-4">
              {summaryLoading ? (
                 <Skeleton className="h-20 w-full" />
              ) : summary?.totalReports === 0 ? (
                <div className="text-center py-10 opacity-50">
                  <FileText className="h-10 w-10 mx-auto mb-2" />
                  <p className="text-xs uppercase font-bold tracking-widest">No reports yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You have {summary?.totalReports} generated clinical reports ready for review.
                  </p>
                  <Button variant="outline" className="w-full justify-between group" asChild>
                    <Link href="/dashboard/reports">
                      View Clinical Portfolio
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
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
