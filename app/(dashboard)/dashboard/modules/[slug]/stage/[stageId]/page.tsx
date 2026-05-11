"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api-client";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Brain, CheckCircle2, ChevronRight, Mic,
  MicOff, Play, Pause, RotateCcw, Send, Sparkles, Wind,
  MessageSquare, ClipboardList,
} from "lucide-react";

// ── Breathing Exercise ──────────────────────────────────────────────
function BreathingExercise({ onComplete }: { onComplete: () => void }) {
  const phases = ["Inhale", "Hold", "Exhale", "Rest"] as const;
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(false);
  const [rounds, setRounds] = useState(0);
  const TOTAL = 4;

  useEffect(() => {
    if (!running || rounds >= TOTAL) return;
    const t = setInterval(() => {
      setTick((p) => {
        if (p >= 99) {
          setPhaseIdx((pi) => {
            const next = (pi + 1) % 4;
            if (next === 0) setRounds((r) => r + 1);
            return next;
          });
          return 0;
        }
        return p + 1;
      });
    }, 40);
    return () => clearInterval(t);
  }, [running, rounds]);

  useEffect(() => {
    if (rounds >= TOTAL) { setRunning(false); setTimeout(onComplete, 1500); }
  }, [rounds, onComplete]);

  const scale = phaseIdx === 0 ? 1.35 : phaseIdx === 2 ? 0.9 : 1.1;

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-14">
      <div className="relative flex items-center justify-center">
        <motion.div className="absolute rounded-full bg-primary/10 blur-[80px] h-72 w-72"
          animate={{ scale }} transition={{ duration: 4, ease: "easeInOut" }} />
        <motion.div
          animate={{ scale }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="relative h-52 w-52 rounded-full border-2 border-primary/30 bg-card/40 backdrop-blur-xl flex flex-col items-center justify-center shadow-2xl"
        >
          <svg className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="50%" cy="50%" r="48%" className="stroke-primary/10 fill-none" strokeWidth="3" />
            <circle cx="50%" cy="50%" r="48%" className="stroke-primary fill-none" strokeWidth="3"
              strokeDasharray="100 100" strokeDashoffset={100 - tick} strokeLinecap="round" />
          </svg>
          <Wind className="h-8 w-8 text-primary mb-2" />
          <p className="text-lg font-black">{phases[phaseIdx]}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mt-1">
            {rounds + 1} / {TOTAL}
          </p>
        </motion.div>
      </div>

      <div className="flex items-center gap-5">
        <Button size="icon" variant="outline" className="rounded-full h-12 w-12"
          onClick={() => { setRounds(0); setTick(0); setPhaseIdx(0); setRunning(false); }}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button size="icon" className="rounded-full h-16 w-16 shadow-xl shadow-primary/30"
          onClick={() => setRunning((r) => !r)}>
          {running ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
        </Button>
        {rounds >= TOTAL && <CheckCircle2 className="h-8 w-8 text-emerald-500 animate-bounce" />}
      </div>

      <p className="text-sm text-muted-foreground/60 font-medium italic max-w-sm text-center">
        Let each breath anchor you to the present moment.
      </p>
    </div>
  );
}

// ── AI Chat Interface ───────────────────────────────────────────────
function AIChatSession({ stage, moduleSlug, onComplete }: { stage: any; moduleSlug: string; onComplete: () => void }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: stage.description ||
        "Welcome. I'm here to guide you through this therapeutic session. What's on your mind today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setSending(true);
    try {
      const res = await apiClient.post("/modules/chat", {
        message: userMsg,
        moduleSlug,
        stageTitle: stage.title,
        stageDescription: stage.description,
        history: messages,
      });
      const reply = res.data?.reply || "Thank you for sharing that. Let's continue exploring this together.";
      const isComplete = res.data?.isComplete || false;
      
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      if (isComplete) setReady(true);
    } catch {
      setMessages((m) => [...m, {
        role: "assistant",
        content: "I'm reflecting on what you've shared. Could you elaborate a bit more on how that relates to this stage's purpose?",
      }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[60vh] max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              <div className={cn(
                "max-w-[80%] rounded-3xl px-5 py-3.5 text-sm leading-relaxed font-medium",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-lg"
                  : "bg-card/80 backdrop-blur border border-primary/10 rounded-bl-lg"
              )}>
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/70">AI Therapist</span>
                  </div>
                )}
                {msg.content}
              </div>
            </motion.div>
          ))}
          {sending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-card/80 border border-primary/10 rounded-3xl rounded-bl-lg px-5 py-3.5 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="h-2 w-2 rounded-full bg-primary/50"
                    animate={{ y: [0, -6, 0] }} transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <div className="border-t border-primary/10 pt-4 space-y-3">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Share your thoughts openly..."
            className="min-h-[52px] max-h-32 bg-card/50 border-primary/10 rounded-2xl resize-none text-sm"
          />
          <Button size="icon" className="rounded-2xl h-[52px] w-[52px] shrink-0 shadow-lg shadow-primary/20" onClick={send} disabled={!input.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {ready && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button className="w-full rounded-2xl h-11 font-black uppercase tracking-widest text-[10px]" onClick={onComplete}>
              Complete Stage <ChevronRight className="h-4 w-4 ml-1.5" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Reflection Journal ──────────────────────────────────────────────
function ReflectionJournal({ stage, onComplete }: { stage: any; onComplete: (text: string) => void }) {
  const [text, setText] = useState("");
  const MIN = 80;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-3">
        <div className="h-14 w-14 rounded-[1.5rem] bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20">
          <Brain className="h-7 w-7" />
        </div>
        <h3 className="text-2xl font-black">Guided Reflection</h3>
        <p className="text-muted-foreground font-medium italic max-w-sm mx-auto">
          "{stage.description}"
        </p>
      </div>

      <div className="relative rounded-[2rem] border border-primary/10 bg-card/50 backdrop-blur-sm p-6 shadow-xl">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Begin writing your reflection here. There are no right answers — only honest ones..."
          className="min-h-[220px] bg-transparent border-none focus-visible:ring-0 text-base leading-relaxed placeholder:text-muted-foreground/30 resize-none"
        />
        <div className="border-t border-primary/5 pt-4 flex items-center justify-between">
          <span className={cn("text-[10px] font-black uppercase tracking-widest",
            text.length >= MIN ? "text-emerald-500" : "text-muted-foreground/40"
          )}>
            {text.length < MIN ? `${MIN - text.length} more chars to unlock` : "✓ Ready to complete"}
          </span>
          <Button
            className="rounded-2xl h-11 px-8 font-black uppercase tracking-widest text-[10px]"
            disabled={text.length < MIN}
            onClick={() => onComplete(text)}
          >
            Complete <ChevronRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Assessment ──────────────────────────────────────────────────────
function AssessmentStage({ stage, onComplete }: { stage: any; onComplete: () => void }) {
  const [q, setQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const questions = [
    "How would you describe your emotional state compared to when you started this module?",
    "What was the most impactful insight or exercise for you?",
    "What do you still find challenging that you'd like to continue working on?",
  ];

  const answer = (a: string) => {
    const next = [...answers, a];
    setAnswers(next);
    if (q + 1 < questions.length) setQ(q + 1);
    else onComplete();
  };

  return (
    <div className="max-w-xl mx-auto space-y-10 py-12 text-center">
      <div className="h-16 w-16 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
        <ClipboardList className="h-8 w-8" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">
          Question {q + 1} of {questions.length}
        </p>
        <h3 className="text-xl font-black leading-snug">{questions[q]}</h3>
      </div>
      <div className="space-y-3 text-left">
        {["Much better", "Somewhat better", "About the same", "Still challenging"].map((opt) => (
          <button key={opt} onClick={() => answer(opt)}
            className="w-full text-left px-6 py-4 rounded-2xl border border-primary/10 bg-card/50 hover:bg-primary/5 hover:border-primary/30 transition-all font-medium text-sm">
            {opt}
          </button>
        ))}
      </div>
      <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(q / questions.length) * 100}%` }} />
      </div>
    </div>
  );
}

// ── Main Stage Page ─────────────────────────────────────────────────
export default function StagePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [stage, setStage] = useState<any>(null);
  const [moduleSlug, setModuleSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiClient.get(`/modules/${params.slug}`);
        const mod = res.data.data;
        setModuleSlug(mod.slug);
        const found = mod.stages?.find((s: any) => s.id === params.stageId);
        setStage(found || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (params.slug && params.stageId) fetch();
  }, [params.slug, params.stageId]);

  const handleComplete = async (reflection?: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await apiClient.post(`/modules/${params.slug}/progress`, {
        completedStageId: params.stageId,
        reflection,
      });
      setCompleted(true);
      toast({ title: "Stage Complete ✓", description: "Your progress has been saved." });
      setTimeout(() => router.push(`/dashboard/modules/${params.slug}`), 2000);
    } catch (e) {
      toast({ title: "Error", description: "Could not save progress.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const STAGE_TYPE_LABELS: Record<string, string> = {
    ai_session: "AI Session",
    exercise: "Breathing Exercise",
    reflection: "Guided Reflection",
    voice_session: "Voice Therapy",
    assessment: "Self-Assessment",
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
          className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/40">
          Loading stage...
        </motion.div>
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-center">
        <div className="space-y-4">
          <p className="font-black text-muted-foreground">Stage not found.</p>
          <Button variant="ghost" onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto pb-24 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-10 w-10 hover:bg-primary/5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary mb-1">
              {STAGE_TYPE_LABELS[stage.type] || stage.type}
            </Badge>
            <h2 className="text-lg font-black">{stage.title}</h2>
          </div>
          <div className="w-10" />
        </div>

        {/* Completion overlay */}
        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl"
            >
              <div className="text-center space-y-6">
                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.6 }}>
                  <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto" />
                </motion.div>
                <div>
                  <h2 className="text-3xl font-black">Stage Complete</h2>
                  <p className="text-muted-foreground mt-2">Returning to your pathway...</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activity Engine */}
        <div className="rounded-[2.5rem] border border-primary/10 bg-card/40 backdrop-blur-xl overflow-hidden shadow-2xl p-6 md:p-10">
          {stage.type === "exercise" && (
            <BreathingExercise onComplete={() => handleComplete()} />
          )}
          {stage.type === "ai_session" && (
            <AIChatSession stage={stage} moduleSlug={moduleSlug} onComplete={() => handleComplete()} />
          )}
          {stage.type === "reflection" && (
            <ReflectionJournal stage={stage} onComplete={(text) => handleComplete(text)} />
          )}
          {stage.type === "assessment" && (
            <AssessmentStage stage={stage} onComplete={() => handleComplete()} />
          )}
          {stage.type === "voice_session" && (
            <div className="flex flex-col items-center justify-center py-20 space-y-8 text-center">
              <div className="h-24 w-24 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center">
                <Mic className="h-10 w-10 text-amber-400" />
              </div>
              <div className="space-y-3 max-w-sm">
                <h3 className="text-2xl font-black">Voice Therapy Session</h3>
                <p className="text-muted-foreground font-medium">{stage.description}</p>
              </div>
              <Button className="rounded-2xl h-13 px-10 font-black uppercase tracking-widest" onClick={() => handleComplete()}>
                Mark as Complete <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
