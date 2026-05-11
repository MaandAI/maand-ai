"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api-client";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { GestureRecognition } from "@/components/therapy/gesture-recognition";
import { CrisisAlertBanner } from "@/components/therapy/crisis-alert-banner";
import { AvatarDisplay } from "@/components/avatar/avatar-display";
import { GoalSetting } from "@/components/therapy/goal-setting";
import { useUnifiedMedia } from "@/hooks/use-unified-media";
import { getPersona, THERAPIST_PERSONAS } from "@/lib/therapist-personas";
import { useTherapistStore } from "@/lib/store/therapist-store";
import { useToast } from "@/hooks/use-toast";
import type { Message, AvatarState } from "@/types/therapy";
import type { GestureResult } from "@/utils/gesture-detection";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Brain,
  CheckCircle2,
  Clock,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  PanelLeftOpen,
  PanelLeftClose,
  Plus,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ChatSidebar } from "@/components/therapy/chat-ui/chat-sidebar";
import type { ChatSession } from "@/types/therapy";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const SESSION_PHASES = [
  "Opening",
  "Check-In",
  "Exploration",
  "Intervention",
  "Reflection",
  "Closing",
];

const CRISIS_KEYWORDS = [
  "hurt myself",
  "can't go on",
  "end it",
  "suicide",
  "no point",
  "disappear",
  "kill myself",
  "not worth living",
];

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function TherapistPresence({
  persona,
  avatarState,
  isSpeaking,
  sessionTime,
}: {
  persona: ReturnType<typeof getPersona>;
  avatarState: AvatarState;
  isSpeaking: boolean;
  sessionTime: number;
}) {
  const mins = Math.floor(sessionTime / 60);
  const secs = String(sessionTime % 60).padStart(2, "0");
  return (
    <div className="flex flex-col items-center gap-5 p-6">
      <div className="relative">
        <motion.div
          animate={{ scale: isSpeaking ? [1, 1.06, 1] : [1, 1.02, 1] }}
          transition={{ duration: isSpeaking ? 0.5 : 3, repeat: Infinity }}
          className={cn(
            "h-28 w-28 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl border-2 bg-gradient-to-br",
            persona.gradient,
            isSpeaking
              ? "border-white/40 shadow-primary/30"
              : "border-white/10",
          )}
        >
          {persona.emoji}
        </motion.div>
        {isSpeaking && (
          <>
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-[2rem] border border-primary/20"
                animate={{ scale: [1, 1 + i * 0.15], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
              />
            ))}
          </>
        )}
        <div
          className={cn(
            "absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-background",
            isSpeaking ? "bg-emerald-400 animate-pulse" : "bg-emerald-500",
          )}
        />
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-lg font-black">{persona.name}</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
          {isSpeaking ? "Speaking..." : avatarState}
        </p>
      </div>
      <div className="flex items-center gap-1.5 bg-card/50 border border-primary/10 rounded-xl px-3 py-1.5">
        <Clock className="h-3 w-3 text-muted-foreground/40" />
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
          {mins}:{secs}
        </span>
      </div>
      <div className="opacity-60">
        <AvatarDisplay state={avatarState} enabled size="sm" />
      </div>
      <div className="w-full space-y-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">
          Approach
        </p>
        <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
          {persona.approach}
        </p>
        <div className="flex flex-wrap gap-1 pt-1">
          {persona.specialties.slice(0, 3).map((s) => (
            <span
              key={s}
              className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/5 text-primary/50 border border-primary/10"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  msg,
  persona,
}: {
  msg: Message;
  persona: ReturnType<typeof getPersona>;
}) {
  const isUser = msg.sender === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 group",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div
        className={cn(
          "h-8 w-8 shrink-0 rounded-xl flex items-center justify-center text-sm shadow-md mt-1",
          isUser
            ? "bg-primary/20 border border-primary/20"
            : `bg-gradient-to-br ${persona.gradient}`,
        )}
      >
        {isUser ? "👤" : persona.emoji}
      </div>
      <div
        className={cn(
          "max-w-[78%] space-y-1",
          isUser && "items-end flex flex-col",
        )}
      >
        <div
          className={cn(
            "rounded-3xl px-5 py-3.5 text-sm leading-relaxed shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-lg"
              : "bg-card/80 backdrop-blur border border-primary/8 rounded-bl-lg",
          )}
        >
          {!isUser && (
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">
                {persona.name}
              </span>
            </div>
          )}
          <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>
        <span className="text-[9px] text-muted-foreground/30 font-medium px-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(msg.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

function TherapyChatInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ── Therapist identity — URL param wins, falls back to global store ──
  const {
    selectedTherapistId,
    startSession,
    endSession: endStoreSession,
    setAvatarState: setStoreAvatarState,
    setActiveSessionId,
  } = useTherapistStore();
  const therapistId =
    searchParams.get("therapist") || selectedTherapistId || "ava";
  const urlSessionId = searchParams.get("sessionId");
  const persona = getPersona(therapistId);
  const { toast } = useToast();

  const {
    isSpeaking,
    speak,
    stopSpeaking,
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    initMedia,
  } = useUnifiedMedia({
    voice: persona.voice,
    onTranscript: (text) => setInput((prev) => prev + text + " "),
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(urlSessionId);
  const [sessionStatus, setSessionStatus] = useState<"active" | "completed">(
    "active",
  );
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const sessionStartRef = useRef(Date.now());

  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>("calm");
  const [showCrisis, setShowCrisis] = useState(false);
  const [showGesture, setShowGesture] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  // Left sidebar: open by default on lg+, closed on smaller. Right sidebar: always starts closed.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  // Open left sidebar on large screens after mount (avoids SSR mismatch)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const isSpeakingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await apiClient.get("/chat/sessions");
      setSessions(res.data?.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Soft session switch — no full page reload
  const loadSession = useCallback(
    async (id: string) => {
      if (id === sessionId) return; // already active
      setLoadingMessages(true);
      setMessages([]);
      setSessionId(id);
      setSessionStatus("active");
      router.replace(`/dashboard/therapy/chat?sessionId=${id}`, {
        scroll: false,
      });
      try {
        const res = await apiClient.get(`/chat/messages?sessionId=${id}`);
        const msgs: Message[] = (res.data?.data || []).map((m: any) => ({
          id: m.id || m._id,
          content: m.content,
          sender: m.sender === "ai" ? "ai" : "user",
          timestamp: new Date(m.timestamp || m.createdAt),
        }));
        setMessages(
          msgs.length > 0
            ? msgs
            : [
                {
                  id: "greeting",
                  content: persona.greeting,
                  sender: "ai",
                  timestamp: new Date(),
                },
              ],
        );
      } catch {
        setMessages([
          {
            id: "greeting",
            content: persona.greeting,
            sender: "ai",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoadingMessages(false);
      }
    },
    [sessionId, persona.greeting, router],
  );

  // ── Called by ChatSidebar after a session is deleted ──
  // Redirects to the clean chat URL so no stale sessionId lingers in the URL
  const handleSessionDeleted = useCallback(
    (deletedId: string) => {
      fetchSessions();
      if (deletedId === sessionId) {
        // Clear local state and navigate to the base chat page (no sessionId)
        setSessionId(null);
        setMessages([
          {
            id: "greeting",
            content: persona.greeting,
            sender: "ai",
            timestamp: new Date(),
          },
        ]);
        setSessionStatus("active");
        setActiveSessionId(null);
        router.replace("/dashboard/therapy/chat", { scroll: false });
      }
    },
    [sessionId, persona.greeting, fetchSessions, router, setActiveSessionId],
  );

  useEffect(() => {
    const t = setInterval(
      () =>
        setSessionTime(
          Math.floor((Date.now() - sessionStartRef.current) / 1000),
        ),
      1000,
    );
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isTyping) {
      setAvatarState("thinking");
      setStoreAvatarState("thinking");
      isSpeakingRef.current = false;
      return;
    }
    if (isSpeaking) {
      setAvatarState("supportive");
      setStoreAvatarState("speaking");
      isSpeakingRef.current = true;
      return;
    }
    isSpeakingRef.current = false;
    const n = messages.filter((m) => m.sender === "user").length;
    const next: AvatarState =
      n === 0 ? "calm" : n % 3 === 0 ? "reflective" : "listening";
    setAvatarState(next);
    setStoreAvatarState(next as any);
  }, [isTyping, isSpeaking, messages, setStoreAvatarState]);

  useEffect(() => {
    const n = messages.filter((m) => m.sender === "user").length;
    setPhaseIdx(Math.min(Math.floor(n / 2), SESSION_PHASES.length - 1));
  }, [messages]);

  const toggleListening = () => {
    if (isRecording) {
      stopRecording();
    } else {
      initMedia().then(() => startRecording());
    }
  };

  // ── Init: load existing session OR just show greeting — never auto-create ──
  useEffect(() => {
    const init = async () => {
      if (urlSessionId) {
        // A specific session was requested — load its messages
        setSessionId(urlSessionId);
        setActiveSessionId(urlSessionId);
        setLoadingMessages(true);
        try {
          const res = await apiClient.get(
            `/chat/messages?sessionId=${urlSessionId}`,
          );
          const msgs: Message[] = (res.data?.data || []).map((m: any) => ({
            id: m.id || m._id,
            content: m.content,
            sender: m.sender === "ai" ? "ai" : "user",
            timestamp: new Date(m.timestamp || m.createdAt),
          }));
          if (msgs.length > 0) {
            setMessages(msgs);
            startSession("chat", urlSessionId);
            return;
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingMessages(false);
        }
      }

      // No sessionId in URL — show greeting only, DO NOT create a session yet.
      // The session will be created lazily on the first message send.
      // Do NOT auto-speak — user hasn't started a session yet.
      setMessages([
        {
          id: "greeting",
          content: persona.greeting,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    };

    init();

    return () => {
      stopSpeaking();
      endStoreSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGesture = useCallback(
    (result: GestureResult) => {
      if (result.intent === "User feeling stressed or tense")
        setInput((p) =>
          p
            ? p + " Let's do a breathing exercise."
            : "Let's do a breathing exercise.",
        );
      else if (result.intent === "User needs a break") stopSpeaking();
      else if (result.intent === "Positive emotional response")
        setInput((p) =>
          p
            ? p + " I'm starting to feel a bit better."
            : "I'm starting to feel a bit better.",
        );
      else if (result.intent === "User agrees/understands")
        setInput((p) =>
          p ? p + " Yes, I agree with that." : "Yes, I agree with that.",
        );
      else if (result.intent === "User wants to respond")
        setInput((p) =>
          p ? p + " I have something to add..." : "I have something to add...",
        );
    },
    [stopSpeaking],
  );

  const sendMessage = async () => {
    if (!input.trim() || isTyping || sessionStatus === "completed") return;

    // Interrupt if AI is speaking
    if (isSpeaking) stopSpeaking();

    const text = input.trim();
    setInput("");
    if (CRISIS_KEYWORDS.some((k) => text.toLowerCase().includes(k)))
      setShowCrisis(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      content: text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((p) => [...p, userMsg]);
    setIsTyping(true);

    // ── Lazy session creation: only create a session on the very first message ──
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      try {
        const sessionRes = await apiClient.post("/chat/sessions", {
          title: `Session with ${persona.name}`,
          persona: { description: persona.systemPrompt },
        });
        const newId =
          sessionRes.data?.data?.id || sessionRes.data?.data?._id || null;
        if (newId) {
          activeSessionId = newId;
          setSessionId(newId);
          setActiveSessionId(newId);
          startSession("chat", newId);
          // Update the URL so the session is bookmarkable without a page reload
          router.replace(`/dashboard/therapy/chat?sessionId=${newId}`, {
            scroll: false,
          });
          // Refresh sidebar so the new session appears immediately
          fetchSessions();
        }
      } catch (err) {
        console.error("Failed to create session", err);
      }
    }

    try {
      const res = await apiClient.post("/chat", {
        message: text,
        sessionId: activeSessionId,
        persona: { description: persona.systemPrompt },
      });
      const reply: string =
        res.data?.response || "I hear you. Let's sit with that for a moment.";
      const newSid: string | undefined = res.data?.sessionId;
      if (newSid && !activeSessionId) {
        setSessionId(newSid);
        setActiveSessionId(newSid);
      }
      if (res.data?.isCrisis) setShowCrisis(true);
      setMessages((p) => [
        ...p,
        {
          id: (Date.now() + 1).toString(),
          content: reply,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
      if (voiceEnabled) speak(reply);
    } catch {
      const fallback =
        "Thank you for sharing that. What comes up for you as you sit with it?";
      setMessages((p) => [
        ...p,
        {
          id: (Date.now() + 1).toString(),
          content: fallback,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
      if (voiceEnabled) speak(fallback);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4.5rem)] overflow-hidden relative">
      {/* ── LEFT SIDEBAR ──
          On lg+: inline, pushes content.
          On < lg: fixed overlay with backdrop, slides in from left. */}

      {/* Backdrop for mobile/tablet left sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="left-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Left sidebar — always mounted, translated off-screen when closed on small screens */}
      <div
        className={cn(
          // Mobile/tablet: fixed overlay
          "fixed top-[4.5rem] bottom-0 left-0 z-40 w-56 transition-transform duration-300 ease-in-out",
          // Large screens: relative inline (not fixed), always in flow
          "lg:static lg:z-auto lg:translate-x-0 lg:transition-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:hidden",
        )}
      >
        <ChatSidebar
          sessions={sessions}
          currentSessionId={sessionId}
          onSelectSession={(id) => {
            loadSession(id);
            // Auto-close drawer on small screens after selecting
            if (window.innerWidth < 1024) setSidebarOpen(false);
          }}
          onRefresh={fetchSessions}
          onSessionDeleted={handleSessionDeleted}
          className="flex h-full w-full"
        />
      </div>

      <div className="flex flex-1 min-w-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-primary/10 bg-card/30 backdrop-blur">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
                onClick={() => setSidebarOpen((v) => !v)}
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeftOpen className="h-4 w-4" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56 p-2 rounded-2xl border-primary/10 shadow-2xl"
                >
                  <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    New Session With
                  </div>
                  <DropdownMenuSeparator className="bg-primary/5" />
                  {Object.values(THERAPIST_PERSONAS).map((t) => (
                    <DropdownMenuItem
                      key={t.id}
                      className="rounded-xl cursor-pointer py-2 gap-3 focus:bg-primary/5"
                      onClick={() => {
                        setActiveSessionId(null);
                        router.push(
                          `/dashboard/therapy/chat?therapist=${t.id}`,
                        );
                      }}
                    >
                      <div
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center text-sm shadow-sm bg-gradient-to-br",
                          t.gradient,
                        )}
                      >
                        {t.emoji}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{t.name}</span>
                        <span className="text-[9px] text-muted-foreground">
                          {t.title}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-primary/5" />
                  <DropdownMenuItem
                    className="rounded-xl cursor-pointer justify-center text-xs font-bold text-primary focus:bg-primary/5"
                    onClick={() => {
                      setActiveSessionId(null);
                      router.push("/dashboard/therapy/chat");
                    }}
                  >
                    Auto-select Best Fit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* Compact therapist avatar */}
              <div className="flex items-center gap-2.5">
                <motion.div
                  animate={{ scale: isSpeaking ? [1, 1.08, 1] : [1, 1.02, 1] }}
                  transition={{
                    duration: isSpeaking ? 0.6 : 3,
                    repeat: Infinity,
                  }}
                  className={cn(
                    "h-9 w-9 rounded-xl flex items-center justify-center text-xl shadow-lg bg-gradient-to-br border",
                    persona.gradient,
                    isSpeaking ? "border-primary/40" : "border-white/10",
                  )}
                >
                  {persona.emoji}
                </motion.div>
                <div>
                  <h1 className="text-sm font-black leading-tight">
                    {persona.name}
                  </h1>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isSpeaking
                          ? "bg-primary animate-pulse"
                          : "bg-emerald-500",
                      )}
                    />
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
                      {isSpeaking ? "Speaking" : SESSION_PHASES[phaseIdx]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1">
                {SESSION_PHASES.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-full transition-all",
                      i <= phaseIdx
                        ? "h-1.5 w-4 bg-primary"
                        : "h-1.5 w-1.5 bg-primary/15",
                    )}
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-[10px] font-black uppercase tracking-widest h-8"
                onClick={() => setShowGesture((g) => !g)}
              >
                <Brain className="h-3.5 w-3.5 mr-1.5" />
                Gestures
              </Button>
              {sessionStatus === "active" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-primary/20 text-[10px] font-black uppercase tracking-widest h-8 min-w-[110px]"
                  disabled={isEndingSession}
                  onClick={async () => {
                    if (!sessionId) {
                      toast({
                        title: "No active session",
                        description: "Send a message first.",
                        variant: "destructive",
                      });
                      return;
                    }
                    const numMessages = messages.filter(
                      (m) => m.sender === "user",
                    ).length;
                    if (numMessages < 5) {
                      toast({
                        title: "Session Too Short",
                        description:
                          "Please have at least 5 exchanges before ending to generate a meaningful report.",
                        variant: "destructive",
                      });
                      return;
                    }
                    setIsEndingSession(true);
                    try {
                      const res = await apiClient.post(
                        `/chat/${sessionId}/complete`,
                      );
                      setSessionStatus("completed");
                      stopSpeaking();
                      fetchSessions();
                      const reportId = res.data?.reportId;
                      toast({
                        title: "✓ Session complete",
                        description: "Report generated. Redirecting…",
                      });
                      setTimeout(() => {
                        router.push(
                          reportId
                            ? `/dashboard/clinical-reports?highlight=${reportId}`
                            : "/dashboard/clinical-reports",
                        );
                      }, 1200);
                    } catch (err: any) {
                      toast({
                        title: "Error ending session",
                        description:
                          err?.response?.data?.error || "Please try again.",
                        variant: "destructive",
                      });
                      setIsEndingSession(false);
                    }
                  }}
                >
                  {isEndingSession ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                      End Session
                    </>
                  )}
                </Button>
              )}
              {/* Right sidebar toggle — always at far right */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full h-8 w-8",
                  rightSidebarOpen && "bg-primary/10",
                )}
                onClick={() => setRightSidebarOpen((v) => !v)}
                title="Toggle Avatar & Goals"
              >
                <PanelLeftClose className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          </div>

          {/* Crisis banner */}
          <AnimatePresence>
            {showCrisis && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="px-4 pt-3"
              >
                <CrisisAlertBanner
                  onConnectProvider={() => window.open("tel:988")}
                  onGroundingExercise={() => {
                    setInput("Can we do a breathing exercise right now?");
                    setShowCrisis(false);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gesture panel */}
          <AnimatePresence>
            {showGesture && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden px-4 pt-2"
              >
                <GestureRecognition onGestureDetected={handleGesture} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5 relative">
            {loadingMessages && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs font-bold text-muted-foreground">
                    Loading messages…
                  </p>
                </div>
              </div>
            )}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} persona={persona} />
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center text-sm bg-gradient-to-br shadow-md",
                    persona.gradient,
                  )}
                >
                  {persona.emoji}
                </div>
                <div className="bg-card/80 border border-primary/8 rounded-3xl rounded-bl-lg px-5 py-3.5 flex gap-1.5 items-center">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-2 w-2 rounded-full bg-primary/40"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.7,
                        delay: i * 0.15,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
            {[
              "I'm feeling anxious",
              "Help me breathe",
              "I need to talk",
              "I'm overwhelmed",
            ].map((p) => (
              <button
                key={p}
                onClick={() => setInput(p)}
                className="shrink-0 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-primary/10 bg-card/40 hover:bg-primary/5 hover:border-primary/25 transition-all whitespace-nowrap"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input bar */}
          <div className="shrink-0 border-t border-primary/10 bg-card/30 backdrop-blur px-4 py-3">
            <div className="flex gap-2 items-end">
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                className="rounded-full h-11 w-11 shrink-0"
                onClick={toggleListening}
                disabled={
                  isTyping || sessionStatus === "completed" || isProcessing
                }
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4 text-primary" />
                )}
              </Button>
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isRecording
                      ? "Listening..."
                      : isProcessing
                        ? "Processing..."
                        : sessionStatus === "completed"
                          ? "Session ended"
                          : "Share what's on your mind..."
                  }
                  disabled={
                    isTyping || sessionStatus === "completed" || isProcessing
                  }
                  className="min-h-[44px] max-h-28 bg-background/40 border-primary/10 rounded-2xl resize-none text-sm focus-visible:ring-primary/20 pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute right-2 bottom-1.5 h-8 w-8 rounded-full",
                    voiceEnabled && "text-primary",
                  )}
                  onClick={() => {
                    setVoiceEnabled((v) => !v);
                    if (isSpeaking) stopSpeaking();
                  }}
                >
                  {voiceEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                size="icon"
                className="rounded-2xl h-11 w-11 shrink-0 shadow-lg shadow-primary/20"
                onClick={sendMessage}
                disabled={
                  !input.trim() || isTyping || sessionStatus === "completed"
                }
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              {voiceEnabled && (
                <span
                  className={cn(
                    "text-[9px] font-black uppercase tracking-widest",
                    isSpeaking
                      ? "text-primary animate-pulse"
                      : "text-muted-foreground/30",
                  )}
                >
                  {isSpeaking ? `${persona.name} is speaking...` : "Voice on"}
                </span>
              )}
              <p className="text-[9px] text-muted-foreground/25 ml-auto font-bold">
                Private &amp; encrypted · Safe space
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ──
            On lg+: inline, pushes content.
            On < lg: fixed overlay with backdrop, slides in from right. */}

        {/* Backdrop for mobile/tablet right sidebar */}
        <AnimatePresence>
          {rightSidebarOpen && (
            <motion.div
              key="right-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden"
              onClick={() => setRightSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Right sidebar panel */}
        <div
          className={cn(
            // Mobile/tablet: fixed overlay from right
            "fixed top-[4.5rem] bottom-0 right-0 z-40 w-80 transition-transform duration-300 ease-in-out",
            // Large screens: relative inline
            "lg:static lg:z-auto lg:translate-x-0 lg:transition-none lg:w-80 xl:w-96",
            rightSidebarOpen ? "translate-x-0" : "translate-x-full lg:hidden",
          )}
        >
          <div className="flex flex-col items-center justify-start h-full border-l border-primary/10 bg-card/90 lg:bg-card/5 relative overflow-hidden">
            {/* Ambient background effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            <div className="flex flex-col items-center justify-center w-full gap-6 relative z-10 py-6 px-6 border-b border-primary/10">
              <AvatarDisplay
                state={avatarState}
                enabled={true}
                size="lg"
                therapistId={persona.id}
                showLabel={true}
              />

              <div className="text-center space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                  Current Status
                </p>
                <div className="bg-background/80 backdrop-blur-sm border border-primary/10 px-4 py-2 rounded-full inline-flex items-center gap-2 shadow-sm">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full animate-pulse",
                      isSpeaking ? "bg-primary" : "bg-emerald-500",
                    )}
                  />
                  <span className="text-xs font-bold capitalize">
                    {isTyping
                      ? "Thinking..."
                      : isSpeaking
                        ? "Speaking..."
                        : avatarState}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full flex-1 overflow-y-auto custom-scrollbar pt-6 px-6 relative z-10">
              <GoalSetting />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TherapyChatPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <motion.p
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/40"
            >
              Preparing your session...
            </motion.p>
          </div>
        }
      >
        <TherapyChatInner />
      </Suspense>
    </ProtectedRoute>
  );
}
