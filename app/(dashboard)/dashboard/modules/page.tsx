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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModulesAPI } from "@/hooks/api/useModules";
import { useChatAPI } from "@/hooks/api/useChat";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Search, Play, MessageSquare, Clock, Brain } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";

function ModulesContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { modules, loading, error } = useModulesAPI();
  const { getSessions, loading: sessionsLoading } = useChatAPI();
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    getSessions().then(setSessions).catch(console.error);
  }, [getSessions]);

  const filteredModules = modules.filter((module) => {
    const matchesSearch = module.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || module.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Therapy Modules</h1>
        <p className="text-muted-foreground">
          Explore and engage with therapeutic interventions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Recent Sessions Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Recent Chat Sessions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessionsLoading ? (
            [1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))
          ) : sessions.length > 0 ? (
            sessions.slice(0, 3).map((session) => (
              <Link
                key={session.id}
                href={`/dashboard/therapy/chat?sessionId=${session.id}`}
              >
                <Card className="hover:border-primary transition-all hover:shadow-md cursor-pointer group rounded-2xl bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                        {session.title || "Therapy Session"}
                      </p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.createdAt
                          ? new Date(session.createdAt).toLocaleDateString()
                          : "Just now"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No recent sessions.
            </p>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-primary/5" />

      {/* Modules Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : filteredModules.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No modules found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredModules.map((module) => (
            <Card
              key={module.id}
              className="group hover:border-primary/50 transition-all hover:shadow-lg rounded-3xl overflow-hidden border-primary/10 bg-card/50 backdrop-blur-sm"
            >
              <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5 p-6 flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-background/80 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                  <Brain className="h-6 w-6" />
                </div>
                <Badge
                  className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                    module.status === "completed"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-primary/10 text-primary border-primary/20",
                  )}
                  variant="outline"
                >
                  {module.status}
                </Badge>
              </div>
              <CardHeader className="pt-4">
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {module.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-2">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Course Progress</span>
                    <span className="text-foreground">{module.progress}%</span>
                  </div>
                  <Progress value={module.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-bold"
                      >
                        {i}
                      </div>
                    ))}
                    <div className="h-6 w-6 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                      +{module.totalSessions - 3}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    asChild
                    className="rounded-full px-6 shadow-md shadow-primary/10"
                  >
                    <Link
                      href={`/dashboard/therapy/chat?module=${encodeURIComponent(module.name)}`}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {module.status === "active"
                        ? "Start Module"
                        : "Continue Path"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ModulesPage() {
  return (
    <ProtectedRoute>
      <ModulesContent />
    </ProtectedRoute>
  );
}
