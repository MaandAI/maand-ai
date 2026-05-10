"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { THERAPIST_PERSONAS, type TherapistPersona } from "@/lib/therapist-personas";
import { useTherapistStore } from "@/lib/store/therapist-store";
import {
  Brain, Heart, Play, Sparkles, Star,
  CheckCircle2, Clock, Shield, Wind,
} from "lucide-react";

const THERAPISTS = Object.values(THERAPIST_PERSONAS);

// ── Compatibility Quiz ────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  {
    id: "goal",
    question: "What's your primary goal right now?",
    options: [
      { label: "Calm my anxiety or stress", scores: { ava: 3, ethan: 1, maya: 1 } },
      { label: "Challenge my negative thoughts", scores: { ava: 1, ethan: 3, maya: 1 } },
      { label: "Understand my emotions better", scores: { ava: 1, ethan: 1, maya: 3 } },
    ],
  },
  {
    id: "style",
    question: "What kind of support resonates with you most?",
    options: [
      { label: "Gentle, nurturing guidance", scores: { ava: 3, ethan: 0, maya: 2 } },
      { label: "Structured, practical tools", scores: { ava: 0, ethan: 3, maya: 1 } },
      { label: "Being deeply heard and understood", scores: { ava: 2, ethan: 0, maya: 3 } },
    ],
  },
  {
    id: "pace",
    question: "How do you prefer to move through sessions?",
    options: [
      { label: "Slowly, with lots of breathing space", scores: { ava: 3, ethan: 0, maya: 2 } },
      { label: "With clear exercises and milestones", scores: { ava: 0, ethan: 3, maya: 0 } },
      { label: "Wherever the conversation naturally leads", scores: { ava: 1, ethan: 0, maya: 3 } },
    ],
  },
];

// ── TherapistCard ────────────────────────────────────────────────
function TherapistCard({
  therapist,
  isSelected,
  isRecommended,
  onSelect,
}: {
  therapist: TherapistPersona;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
}) {
  const accentMap: Record<string, string> = {
    rose: "text-rose-400",
    blue: "text-blue-400",
    violet: "text-violet-400",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={onSelect}
      className={cn(
        "relative cursor-pointer rounded-[2rem] border overflow-hidden transition-all duration-300",
        isSelected
          ? "border-primary/60 shadow-2xl shadow-primary/10 ring-1 ring-primary/20"
          : "border-primary/10 hover:border-primary/30 hover:shadow-xl"
      )}
    >
      {/* Background gradient */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-25", `from-${therapist.accentColor}-500/30 to-${therapist.accentColor}-500/5`)} />
      <div className="absolute inset-0 bg-card/70 backdrop-blur-sm" />

      {/* Recommended badge */}
      {isRecommended && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest px-2 py-1 shadow-lg">
            <Sparkles className="h-2.5 w-2.5 mr-1" />
            Best Match
          </Badge>
        </div>
      )}

      {/* Selected tick */}
      {isSelected && (
        <div className="absolute top-4 left-4 z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-lg"
          >
            <CheckCircle2 className="h-4 w-4 text-white" />
          </motion.div>
        </div>
      )}

      <div className="relative z-10 p-7 space-y-5">
        {/* Avatar + name */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className={cn(
                "h-20 w-20 rounded-[1.75rem] flex items-center justify-center text-4xl shadow-xl border border-white/10 bg-gradient-to-br",
                therapist.gradient
              )}
            >
              {therapist.emoji}
            </motion.div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-background" />
          </div>

          <div>
            <h3 className={cn("text-2xl font-black", isSelected && "text-primary")}>
              {therapist.name}
            </h3>
            <p className="text-xs font-bold text-muted-foreground">{therapist.title}</p>
            <p className={cn("text-[10px] font-black uppercase tracking-widest mt-1", accentMap[therapist.accentColor] || "text-primary")}>
              {therapist.tagline}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {therapist.greeting}
        </p>

        {/* Approach */}
        <div className="flex items-start gap-2">
          <Brain className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
            {therapist.approach}
          </p>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5">
          {therapist.specialties.slice(0, 4).map((s) => (
            <span key={s} className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-primary/5 text-primary/70 border border-primary/10">
              {s}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 pt-1 border-t border-primary/5">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-black">4.9</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground/60">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs font-bold">
              {therapist.sessionStyle.pacing === "slow" ? "Slow-paced" :
               therapist.sessionStyle.pacing === "direct" ? "Goal-oriented" : "Moderate"}
            </span>
          </div>
        </div>

        {/* Tone preview */}
        <div className="bg-card/60 rounded-2xl p-3 border border-primary/5">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1.5">First Words</p>
          <p className="text-xs text-muted-foreground italic line-clamp-2">"{therapist.greeting}"</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Quiz Component ────────────────────────────────────────────────
function CompatibilityQuiz({
  onResult,
  onSkip,
}: {
  onResult: (therapistId: string) => void;
  onSkip: () => void;
}) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ ava: 0, ethan: 0, maya: 0 });

  const handleAnswer = (optionScores: Record<string, number>) => {
    const newScores = {
      ava: scores.ava + (optionScores.ava || 0),
      ethan: scores.ethan + (optionScores.ethan || 0),
      maya: scores.maya + (optionScores.maya || 0),
    };
    setScores(newScores);
    if (step + 1 >= QUIZ_QUESTIONS.length) {
      const best = Object.entries(newScores).sort((a, b) => b[1] - a[1])[0][0];
      onResult(best);
    } else {
      setStep(step + 1);
    }
  };

  const q = QUIZ_QUESTIONS[step];

  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="max-w-xl mx-auto space-y-8"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
          <span>Compatibility Quiz</span>
          <span>{step + 1} / {QUIZ_QUESTIONS.length}</span>
        </div>
        <div className="h-1 bg-primary/10 rounded-full">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${((step + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      <h3 className="text-2xl font-black text-center">{q.question}</h3>

      <div className="space-y-3">
        {q.options.map((opt, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAnswer(opt.scores)}
            className="w-full text-left px-6 py-5 rounded-2xl border border-primary/10 bg-card/50 hover:bg-primary/5 hover:border-primary/30 transition-all font-medium text-sm"
          >
            {opt.label}
          </motion.button>
        ))}
      </div>

      <button
        onClick={onSkip}
        className="w-full text-center text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors"
      >
        Skip quiz, browse all therapists
      </button>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function TherapyAvatarPage() {
  const router = useRouter();
  const { selectedTherapistId, selectTherapist } = useTherapistStore();

  const [phase, setPhase] = useState<"quiz" | "select">("quiz");
  // Initialise selectedId from the global store so returning users see their last choice
  const [selectedId, setSelectedId] = useState<string | null>(selectedTherapistId || null);
  const [recommendedId, setRecommendedId] = useState<string | null>(null);

  const handleQuizResult = (id: string) => {
    setRecommendedId(id);
    setSelectedId(id);
    setPhase("select");
  };

  /** Pick a therapist locally + write to global store instantly */
  const handleSelect = (id: string) => {
    setSelectedId(id);
    selectTherapist(id); // ← persists globally and to localStorage
  };

  const selected = THERAPISTS.find((t) => t.id === selectedId);

  return (
    <div className="max-w-5xl mx-auto pb-28 space-y-12">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/10 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-10 md:p-14 text-center">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-primary/5 blur-[100px]" />
        <div className="relative z-10 space-y-4 max-w-xl mx-auto">
          <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[9px] px-3 py-1">
            <Sparkles className="h-2.5 w-2.5 mr-1.5" />
            AI Therapy Companion
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Choose Your <span className="text-primary">Therapist</span>
          </h1>
          <p className="text-muted-foreground font-medium leading-relaxed">
            Every AI therapist has a unique personality, voice, and therapeutic approach.
            Take the quiz to find your best match.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === "quiz" ? (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CompatibilityQuiz
              onResult={handleQuizResult}
              onSkip={() => {
                // If we already have a stored therapist, pre-select them when skipping
                if (selectedTherapistId) setSelectedId(selectedTherapistId);
                setPhase("select");
              }}
            />
          </motion.div>
        ) : (
          <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            {recommendedId && (
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-sm font-black uppercase tracking-widest text-primary">Your Best Match</p>
                </div>
                <p className="text-muted-foreground text-sm">
                  Based on your answers, we recommend{" "}
                  <strong>{THERAPIST_PERSONAS[recommendedId]?.name}</strong>. You can always switch.
                </p>
              </div>
            )}

            {/* Therapist cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {THERAPISTS.map((t) => (
                <TherapistCard
                  key={t.id}
                  therapist={t}
                  isSelected={selectedId === t.id}
                  isRecommended={recommendedId === t.id}
                  onSelect={() => handleSelect(t.id)}
                />
              ))}
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Shield, label: "Clinically Inspired", desc: "Evidence-based therapeutic approaches" },
                { icon: Heart, label: "Emotionally Aware", desc: "Adapts to your emotional state in real time" },
                { icon: Brain, label: "Session Memory", desc: "Remembers your journey across sessions" },
                { icon: Wind, label: "Calming Design", desc: "Therapeutic UI designed to reduce anxiety" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="rounded-2xl border border-primary/10 bg-card/40 p-5 space-y-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="text-xs font-black">{label}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky CTA */}
      <AnimatePresence>
        {selected && phase === "select" && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-card/95 backdrop-blur-xl border border-primary/20 rounded-[2rem] p-4 flex items-center gap-5 shadow-2xl shadow-primary/15">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br shadow-lg",
                  selected.gradient
                )}>
                  {selected.emoji}
                </div>
                <div>
                  <p className="font-black text-sm">{selected.name}</p>
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                    {selected.sessionStyle.pacing === "slow" ? "Mindful · Slow-paced" :
                     selected.sessionStyle.pacing === "direct" ? "CBT · Goal-oriented" : "EFT · Relational"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-2xl font-black uppercase tracking-widest text-[9px] border-primary/20 hover:bg-primary/5 px-5 h-10"
                  onClick={() => router.push(`/dashboard/therapy/chat?therapist=${selected.id}`)}
                >
                  Chat Session
                </Button>
                <Button
                  size="sm"
                  className="rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20 px-7 h-10"
                  onClick={() => router.push(`/dashboard/therapy/session/${selected.id}`)}
                >
                  <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
                  Video Session
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
