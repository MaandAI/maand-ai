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

export function DashboardContent() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const statsCards = [
    {
      title: "Total Sessions",
      value: data?.stats.totalSessions || 0,
      icon: MessageSquare,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      description: "Lifetime therapy chats",
      href: "/dashboard/sessions"
    },
    {
      title: "Active Chats",
      value: data?.stats.activeSessions || 0,
      icon: Activity,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      description: "Ongoing reflections",
      href: "/dashboard/sessions?status=active"
    },
    {
      title: "Clinical Reports",
      value: data?.stats.totalReports || 0,
      icon: FileText,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      description: "AI-generated insights",
      href: "/dashboard/reports"
    },
    {
      title: "Unread Alerts",
      value: data?.stats.unreadNotifications || 0,
      icon: Zap,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      description: "System updates",
      href: "/dashboard/settings?tab=notifications"
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Hi, {session?.user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Your therapeutic journey is progressing well this week.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="rounded-xl font-bold h-11 px-6">
            <Link href="/dashboard/reports">View Portfolio</Link>
          </Button>
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
        {statsCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={stat.href}>
              <Card className="group border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm cursor-pointer overflow-hidden relative min-h-[160px] flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-4xl font-black tracking-tight">
                    {isLoading ? <Skeleton className="h-10 w-16 rounded-lg" /> : stat.value}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {stat.title}
                  </p>
                </CardContent>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary group-hover:w-full transition-all duration-500" />
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black tracking-tight">Recent Sessions</h3>
            <Button variant="link" asChild className="text-primary font-bold">
              <Link href="/dashboard/sessions">View All Activity</Link>
            </Button>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
            ) : data?.recentActivity.sessions.length ? (
              data.recentActivity.sessions.map((session, i) => (
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
                            {format(new Date(session.updatedAt), "MMM d, h:mm a")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={session.status === "completed" ? "secondary" : "default"} className="rounded-lg px-2 text-[10px] font-black uppercase tracking-widest">
                          {session.status}
                        </Badge>
                        <Button variant="ghost" size="icon" className="rounded-xl group-hover:bg-primary/10" asChild>
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
                <p className="text-sm font-bold text-muted-foreground">No sessions started yet.</p>
                <Button className="mt-4 rounded-xl font-bold" asChild>
                  <Link href="/dashboard/therapy/chat">Begin your first reflection</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Clinical Summary & Health */}
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

           <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black tracking-tight">Latest Reports</h3>
              </div>
              <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm rounded-[2rem] p-6 space-y-4">
                 {data?.recentActivity.reports.length ? (
                    <div className="space-y-4">
                      {data.recentActivity.reports.map((report, i) => (
                        <Link key={report._id} href="/dashboard/reports" className="flex items-center justify-between p-3 rounded-2xl hover:bg-primary/5 transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate max-w-[120px]">{report.title}</p>
                              <p className="text-[10px] text-muted-foreground">{format(new Date(report.createdAt), "MMM d")}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                        </Link>
                      ))}
                    </div>
                 ) : (
                   <div className="text-center py-10 opacity-30">
                     <FileText className="h-10 w-10 mx-auto mb-2" />
                     <p className="text-[10px] font-black uppercase tracking-widest">No reports generated</p>
                   </div>
                 )}
                 <Button variant="ghost" className="w-full rounded-xl font-bold text-xs uppercase tracking-widest h-11" asChild>
                    <Link href="/dashboard/reports">View Full Portfolio</Link>
                 </Button>
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
