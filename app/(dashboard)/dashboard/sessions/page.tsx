"use client";

import { useEffect, useState } from "react";
import { useChatAPI } from "@/hooks/api/useChat";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageSquare, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  PlayCircle,
  FileText,
  Calendar,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { apiClient } from "@/lib/api-client";
import { DownloadPDFButton } from "@/components/reports/download-pdf-button";
import { useAuth } from "@/hooks/useAuth";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const statusFilter = activeTab === "all" ? "" : activeTab;
      const url = statusFilter ? `/chat/sessions?status=${statusFilter}` : "/chat/sessions";
      const res = await apiClient.get(url);
      setSessions(res.data.data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [activeTab]);

  const SessionCard = ({ session }: { session: any }) => (
    <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
              session.status === "active" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
            )}>
              {session.status === "active" ? <PlayCircle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{session.title}</h3>
                <Badge variant={session.status === "active" ? "default" : "secondary"} className="text-[10px] uppercase font-bold tracking-wider">
                  {session.status === "active" ? "Ongoing" : "Completed"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(session.createdAt), "PPP")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {session.durationMs ? `${Math.floor(session.durationMs / 60000)}m` : "New session"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-end md:self-center">
            {session.status === "completed" && session.reportId && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="gap-2 rounded-full border-primary/20 hover:bg-primary/5">
                  <Link href="/dashboard/reports">
                    <FileText className="h-4 w-4" />
                    View Report
                  </Link>
                </Button>
                <DownloadPDFButton
                  reportId={session.reportId}
                  user={profile}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  showText={false}
                />
              </div>
            )}
            <Button size="sm" asChild className="gap-2 rounded-full px-5 shadow-lg shadow-primary/10">
              <Link href={`/dashboard/therapy/chat?sessionId=${session.id}`}>
                {session.status === "active" ? "Continue Session" : "Review Chat"}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chat Sessions</h1>
        <p className="text-muted-foreground">Track and manage your therapeutic conversations</p>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:shadow-sm">All Sessions</TabsTrigger>
            <TabsTrigger value="active" className="rounded-lg data-[state=active]:shadow-sm">Ongoing</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg data-[state=active]:shadow-sm">Completed</TabsTrigger>
          </TabsList>
          
          <Button asChild className="rounded-xl">
            <Link href="/dashboard/therapy/chat">
              <PlayCircle className="mr-2 h-4 w-4" />
              Start New Journey
            </Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {loading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
          ) : sessions.length > 0 ? (
            sessions.map((session) => <SessionCard key={session.id} session={session} />)
          ) : (
            <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed bg-transparent border-muted-foreground/20">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="mb-2">No {activeTab !== "all" ? activeTab : ""} sessions found</CardTitle>
              <CardDescription className="mb-6">
                {activeTab === "completed" 
                  ? "Finish a chat session to see it here and generate a report."
                  : "Ready to start talking? Our AI therapists are here to listen."}
              </CardDescription>
              <Button asChild>
                <Link href="/dashboard/therapy/chat">Begin New Session</Link>
              </Button>
            </Card>
          )}
        </div>
      </Tabs>
    </div>
  );
}

import { cn } from "@/lib/utils";
