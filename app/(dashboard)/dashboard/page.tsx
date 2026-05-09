"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageSquare, 
  FileText, 
  Activity, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  ChevronRight, 
  ArrowUpRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DashboardStats {
  stats: {
    totalSessions: number;
    activeSessions: number;
    totalReports: number;
    favoriteReports: number;
    unreadNotifications: number;
  };
  recentActivity: {
    sessions: any[];
    reports: any[];
  };
}

import { useUserStore } from "@/lib/store/user-store";
import { useDashboard } from "@/hooks/use-dashboard";
import { UI_TEXT } from "@/constants/ui-text";

export function DashboardContent() {
  const { user } = useUserStore();
  const { data, isLoading, error } = useDashboard();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Activity className="h-12 w-12 text-destructive/20 mb-4" />
        <h3 className="text-xl font-black">{UI_TEXT.COMMON.ERROR}</h3>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  const statsCards = data?.stats || [
    { label: "Total Sessions", value: "0", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10", href: "/dashboard/sessions" },
    { label: "Completed", value: "0", icon: Activity, color: "text-amber-500", bg: "bg-amber-500/10", href: "/dashboard/sessions?status=completed" },
    { label: "Reports", value: "0", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-500/10", href: "/dashboard/reports" },
    { label: "Alerts", value: "0", icon: Zap, color: "text-purple-500", bg: "bg-purple-500/10", href: "/dashboard/notifications" }
  ];

  // Helper to map icons back since they aren't serialized in JSON
  const getIcon = (label: string) => {
    switch (label) {
      case "Total Sessions": return MessageSquare;
      case "Completed": return CheckCircle2;
      case "Clinical Reports": return FileText;
      case "Notifications": return Zap;
      default: return Activity;
    }
  };

  const getColor = (label: string) => {
    switch (label) {
      case "Total Sessions": return { color: "text-blue-500", bg: "bg-blue-500/10" };
      case "Completed": return { color: "text-amber-500", bg: "bg-amber-500/10" };
      case "Clinical Reports": return { color: "text-emerald-500", bg: "bg-emerald-500/10" };
      case "Notifications": return { color: "text-purple-500", bg: "bg-purple-500/10" };
      default: return { color: "text-primary", bg: "bg-primary/10" };
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Hi, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            {UI_TEXT.DASHBOARD.DESCRIPTION}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="rounded-xl font-bold h-11 px-6 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
            <Link href="/dashboard/therapy/chat">
              <Zap className="h-4 w-4 mr-2" />
              Start Session
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {(isLoading ? Array(4).fill({}) : data?.stats).map((stat: any, i: number) => {
          const Icon = getIcon(stat.label);
          const { color, bg } = getColor(stat.label);
          
          return (
            <motion.div
              key={stat.label || i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden relative min-h-[160px] flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className={cn("p-2 rounded-xl", bg)}>
                    <Icon className={cn("h-5 w-5", color)} />
                  </div>
                  {stat.change && (
                    <Badge variant="outline" className="border-primary/20 text-primary text-[9px] font-black uppercase">
                      {stat.change}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-4xl font-black tracking-tight">
                    {isLoading ? <Skeleton className="h-10 w-16 rounded-lg" /> : stat.value}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {stat.label}
                  </p>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary group-hover:w-full transition-all duration-500" />
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black tracking-tight">{UI_TEXT.DASHBOARD.ACTIVITY_HEADER}</h3>
            <Button variant="link" asChild className="text-primary font-bold">
              <Link href="/dashboard/sessions">View All Activity</Link>
            </Button>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
            ) : data?.recentSessions.length ? (
              data.recentSessions.map((session: any, i: number) => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="group border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/5 group-hover:bg-primary group-hover:text-white transition-all">
                          <MessageSquare className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold truncate max-w-[200px] md:max-w-md">{session.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                            <Clock className="h-3.5 w-3.5" />
                            {format(new Date(session.createdAt), "MMM d, h:mm a")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={session.status === "completed" ? "secondary" : "default"} className="rounded-lg px-2 text-[10px] font-black uppercase tracking-widest">
                          {session.status}
                        </Badge>
                        <Button variant="ghost" size="icon" className="rounded-xl" asChild>
                          <Link href={`/dashboard/therapy/chat?sessionId=${session._id}`}>
                            <ChevronRight className="h-5 w-5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-primary/10 rounded-[2rem] bg-primary/5">
                <MessageSquare className="h-10 w-10 text-primary/20 mx-auto mb-4" />
                <p className="text-sm font-bold text-muted-foreground">{UI_TEXT.DASHBOARD.EMPTY_SESSIONS}</p>
                <Button className="mt-4 rounded-xl font-bold" asChild>
                  <Link href="/dashboard/therapy/chat">Begin your first reflection</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Clinical Health (Dynamic placeholder for safety) */}
        <div className="space-y-8">
           <div className="space-y-6">
              <h3 className="text-xl font-black tracking-tight">Clinical Health</h3>
              <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-[2rem] overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-32 w-32" />
                </div>
                <CardHeader>
                  <CardTitle className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">Safety Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-4xl font-black">Secure</p>
                    <p className="text-xs text-white/60">No immediate risk indicators detected in recent sessions.</p>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/80">Compliance v1.0</div>
                    <Badge className="bg-white/20 text-white border-none text-[9px] font-black uppercase">Verified</Badge>
                  </div>
                </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </div>
  );
}

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
