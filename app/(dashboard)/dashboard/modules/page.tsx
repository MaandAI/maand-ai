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
import { Search, Play, MessageSquare, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

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
            [1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
          ) : sessions.length > 0 ? (
            sessions.slice(0, 3).map((session) => (
              <Link key={session.id} href={`/dashboard/therapy/chat?sessionId=${session.id}`}>
                <Card className="hover:border-primary transition-all hover:shadow-md cursor-pointer group rounded-2xl bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{session.title || "Therapy Session"}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : "Just now"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic">No recent sessions.</p>
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
              className="hover:border-primary transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl">{module.name}</CardTitle>
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
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{module.progress}%</span>
                  </div>
                  <Progress value={module.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {module.sessionsCompleted} of {module.totalSessions}{" "}
                    sessions
                  </span>
                  <Button size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    {module.status === "active" ? "Start" : "Continue"}
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
