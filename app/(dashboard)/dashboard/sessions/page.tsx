"use client";

import { useEffect, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare, Clock, ChevronRight, CheckCircle2,
  PlayCircle, FileText, Calendar, Video, Brain, Download, Eye
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { THERAPIST_PERSONAS } from "@/lib/therapist-personas";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return m ? `${m}m ${s % 60}s` : `${s}s`;
}

// ── Chat Session Card ─────────────────────────────────────────────
function ChatCard({ s, onViewTranscript }: { s: any; onViewTranscript?: (s: any) => void }) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl border border-primary/10 bg-card/50 hover:bg-card/70 transition-all group">
      <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0",
        s.status === "active" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500")}>
        {s.status === "active" ? <PlayCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-bold truncate group-hover:text-primary transition-colors">{s.title}</p>
          <Badge variant={s.status === "active" ? "default" : "secondary"}
            className="text-[9px] uppercase font-black tracking-wider shrink-0">
            {s.status === "active" ? "Live" : "Done"}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(s.createdAt), "MMM d, yyyy")}
          </span>
          {s.durationMs && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />{Math.floor(s.durationMs / 60000)}m
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {s.status === "completed" && onViewTranscript && (
          <Button variant="outline" size="sm" className="rounded-xl border-primary/15 text-xs hidden sm:flex" onClick={() => onViewTranscript(s)}>
            <Eye className="h-3.5 w-3.5 mr-1" />Transcript
          </Button>
        )}
        <Button size="sm" asChild className="rounded-xl">
          <Link href={`/dashboard/therapy/chat?sessionId=${s.id || s._id}`}>
            {s.status === "active" ? "Continue" : "Review"}
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ── Video Session Card ────────────────────────────────────────────
function VideoCard({ s, onViewTranscript }: { s: any; onViewTranscript?: (s: any) => void }) {
  const p = THERAPIST_PERSONAS[s.therapistId];
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl border border-primary/10 bg-card/50 hover:bg-card/70 transition-all group">
      <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-gradient-to-br shadow-md",
        p?.gradient || "from-primary/30 to-primary/10")}>
        {p?.emoji || "🤖"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-bold truncate group-hover:text-primary transition-colors">
            Session with {s.therapistName || "AI Therapist"}
          </p>
          <Badge variant={s.status === "completed" ? "secondary" : "default"}
            className="text-[9px] uppercase font-black tracking-wider shrink-0">
            {s.status}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(s.createdAt), "MMM d, yyyy")}
          </span>
          {s.durationSeconds > 0 && (
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{fmt(s.durationSeconds)}</span>
          )}
          {s.transcript?.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />{s.transcript.length} exchanges
            </span>
          )}
        </div>
        {s.emotionalSummary && (
          <p className="text-[10px] text-muted-foreground/60 italic mt-1 truncate">"{s.emotionalSummary}"</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {s.transcript?.length > 0 && onViewTranscript && (
          <Button variant="outline" size="sm" className="rounded-xl border-primary/15 text-xs hidden sm:flex" onClick={() => onViewTranscript(s)}>
            <Eye className="h-3.5 w-3.5 mr-1" />Transcript
          </Button>
        )}
        {s.keyTopics?.length > 0 && (
          <Button asChild variant="outline" size="sm" className="rounded-xl border-primary/15 text-xs hidden sm:flex">
            <Link href="/dashboard/reports"><FileText className="h-3.5 w-3.5 mr-1" />Report</Link>
          </Button>
        )}
        {s.status === "active" && (
          <Button size="sm" asChild className="rounded-xl">
            <Link href={`/dashboard/therapy/session/${s.therapistId}`}>
              Rejoin<ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function SessionsPage() {
  const [tab, setTab] = useState("chat");
  const [chatSessions, setChatSessions]   = useState<any[]>([]);
  const [videoSessions, setVideoSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const fetchChat = async () => {
    const res = await apiClient.get("/chat/sessions");
    setChatSessions(res.data?.data || []);
  };

  const fetchVideo = async () => {
    const res = await apiClient.get("/therapy/video-sessions");
    setVideoSessions(res.data?.data || []);
  };

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([fetchChat(), fetchVideo()]).finally(() => setLoading(false));
  }, []);

  const list = tab === "chat" ? chatSessions : videoSessions;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Session History</h1>
          <p className="text-muted-foreground mt-1">All your chat and video therapy sessions</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/dashboard/therapy/chat"><MessageSquare className="h-4 w-4 mr-2" />New Chat</Link>
          </Button>
          <Button asChild className="rounded-xl">
            <Link href="/dashboard/avatar"><Video className="h-4 w-4 mr-2" />Video Session</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Chat Sessions", value: chatSessions.length, icon: MessageSquare, color: "text-blue-400" },
          { label: "Video Sessions", value: videoSessions.length, icon: Video, color: "text-violet-400" },
          { label: "Completed Chat", value: chatSessions.filter(s => s.status === "completed").length, icon: CheckCircle2, color: "text-emerald-400" },
          { label: "AI Therapists Used", value: new Set(videoSessions.map(s => s.therapistId)).size, icon: Brain, color: "text-primary" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-primary/10 bg-card/50 p-5">
            <Icon className={cn("h-5 w-5 mb-3", color)} />
            <p className="text-2xl font-black">{value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/50 rounded-xl">
          <TabsTrigger value="chat" className="rounded-lg gap-2">
            <MessageSquare className="h-3.5 w-3.5" />Chat Sessions
            {chatSessions.length > 0 && (
              <span className="ml-1 text-[9px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                {chatSessions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="video" className="rounded-lg gap-2">
            <Video className="h-3.5 w-3.5" />Video Sessions
            {videoSessions.length > 0 && (
              <span className="ml-1 text-[9px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                {videoSessions.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              {tab === "chat" ? <MessageSquare className="h-7 w-7 text-muted-foreground/40" /> : <Video className="h-7 w-7 text-muted-foreground/40" />}
            </div>
            <p className="font-bold text-muted-foreground mb-2">No {tab} sessions yet</p>
            <p className="text-sm text-muted-foreground/60 mb-6">
              {tab === "chat" ? "Start a text chat with an AI therapist." : "Choose a therapist and begin a video session."}
            </p>
            <Button asChild className="rounded-xl">
              <Link href={tab === "chat" ? "/dashboard/therapy/chat" : "/dashboard/avatar"}>
                Get Started
              </Link>
            </Button>
          </div>
        ) : (
          list.map((s: any) =>
            tab === "chat"
              ? <ChatCard key={s._id || s.id} s={s} onViewTranscript={setSelectedTx} />
              : <VideoCard key={s._id || s.id} s={s} onViewTranscript={setSelectedTx} />
          )
        )}
      </div>

      <Dialog open={!!selectedTx} onOpenChange={(o) => !o && setSelectedTx(null)}>
        <DialogContent className="max-w-2xl bg-card border-primary/10 rounded-3xl p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 pb-2 border-b border-primary/10">
            <DialogTitle className="text-xl font-black">Session Transcript</DialogTitle>
            <DialogDescription>
              {selectedTx?.therapistName ? `Session with ${selectedTx.therapistName}` : selectedTx?.title}
              {" · "}
              {selectedTx?.createdAt && format(new Date(selectedTx.createdAt), "PPP")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="p-6 space-y-4">
              {selectedTx?.transcript?.length ? selectedTx.transcript.map((msg: any, i: number) => (
                <div key={i} className={cn("text-sm leading-relaxed", msg.speaker === "user" ? "text-primary font-medium" : "text-muted-foreground")}>
                  <span className="block text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">
                    {msg.speaker === "user" ? "You" : selectedTx.therapistName || "Therapist"}
                  </span>
                  {msg.text}
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-10">No transcript recorded for this session.</p>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-primary/10 bg-muted/20 flex justify-end">
            <Button variant="outline" className="rounded-xl text-xs font-bold uppercase tracking-widest" onClick={() => {
              if(!selectedTx?.transcript) return;
              const text = selectedTx.transcript.map((m: any) => `${m.speaker}: ${m.text}`).join('\n\n');
              const blob = new Blob([text], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `transcript-${selectedTx._id || selectedTx.id}.txt`;
              a.click();
            }}>
              <Download className="h-4 w-4 mr-2" /> Download TXT
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
