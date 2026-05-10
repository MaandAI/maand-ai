"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api-client";
import { IModule } from "@/hooks/api/useModules";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  Lock,
  MessageSquare,
  Mic,
  Play,
  Sparkles,
  Wind,
  Zap,
  ClipboardList,
  Star,
} from "lucide-react";

const STAGE_TYPE_META: Record<
  string,
  { icon: typeof Brain; label: string; color: string; bg: string }
> = {
  ai_session: {
    icon: MessageSquare,
    label: "AI Session",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  exercise: {
    icon: Wind,
    label: "Exercise",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  reflection: {
    icon: Brain,
    label: "Reflection",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  voice_session: {
    icon: Mic,
    label: "Voice",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  assessment: {
    icon: ClipboardList,
    label: "Assessment",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
};

const CATEGORY_GRADIENT: Record<string, string> = {
  anxiety: "from-rose-500/30 via-orange-500/10 to-transparent",
  growth: "from-violet-500/30 via-blue-500/10 to-transparent",
  sleep: "from-indigo-500/30 via-slate-500/10 to-transparent",
  depression: "from-cyan-500/30 via-teal-500/10 to-transparent",
  regulation: "from-amber-500/30 via-yellow-500/10 to-transparent",
};

function StageNode({
  stage,
  idx,
  isCompleted,
  isCurrent,
  isLocked,
  slug,
}: {
  stage: any;
  idx: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  slug: string;
}) {
  const meta = STAGE_TYPE_META[stage.type] || STAGE_TYPE_META.ai_session;
  const Icon = meta.icon;
  const isLeft = idx % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08, duration: 0.5 }}
      className={cn(
        "flex items-center gap-6 md:gap-10",
        isLeft ? "flex-row" : "flex-row-reverse",
      )}
    >
      {/* Connector line + node */}
      <div className="flex flex-col items-center gap-0">
        {/* Node */}
        <div className="relative">
          <motion.div
            animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn(
              "relative h-16 w-16 rounded-[1.5rem] flex items-center justify-center border-2 transition-all duration-300 shadow-lg",
              isCompleted
                ? "bg-emerald-500 border-emerald-400 shadow-emerald-500/30"
                : isCurrent
                  ? "bg-primary border-primary shadow-primary/40"
                  : isLocked
                    ? "bg-muted/50 border-muted-foreground/10 shadow-none"
                    : "bg-card border-primary/20",
            )}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-7 w-7 text-white" />
            ) : isLocked ? (
              <Lock className="h-5 w-5 text-muted-foreground/30" />
            ) : (
              <Icon
                className={cn("h-7 w-7", isCurrent ? "text-white" : meta.color)}
              />
            )}
            {isCurrent && (
              <motion.div
                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-[1.5rem] bg-primary/30"
              />
            )}
          </motion.div>
          {isCurrent && (
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary border-2 border-background animate-pulse" />
          )}
        </div>
        {/* Vertical connector */}
        {idx < 100 && (
          <div
            className={cn(
              "w-0.5 h-12",
              isCompleted ? "bg-emerald-500/60" : "bg-primary/10",
            )}
          />
        )}
      </div>

      {/* Stage Card */}
      <motion.div
        whileHover={!isLocked ? { scale: 1.02 } : {}}
        className="flex-1 max-w-sm"
      >
        <Card
          className={cn(
            "rounded-[1.5rem] border transition-all duration-300 overflow-hidden",
            isLocked
              ? "opacity-40 grayscale border-muted/20 bg-muted/10"
              : isCurrent
                ? "border-primary/40 bg-primary/5 shadow-xl shadow-primary/10"
                : isCompleted
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-primary/10 bg-card/60 hover:border-primary/30 hover:shadow-lg",
          )}
        >
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest border rounded-lg px-2",
                  meta.bg,
                  meta.color,
                )}
              >
                {meta.label}
              </Badge>
              <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {stage.duration}m
              </span>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">
                Stage {idx + 1}
              </p>
              <h3
                className={cn(
                  "font-black text-lg leading-snug",
                  isCurrent && "text-primary",
                )}
              >
                {stage.title}
              </h3>
              <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed line-clamp-2">
                {stage.description}
              </p>
            </div>

            {!isLocked && (
              <Button
                asChild={!isLocked}
                size="sm"
                variant={
                  isCurrent ? "default" : isCompleted ? "outline" : "ghost"
                }
                className={cn(
                  "w-full rounded-xl h-9 font-black text-[10px] uppercase tracking-widest",
                  isCurrent && "shadow-lg shadow-primary/20",
                )}
              >
                <Link href={`/dashboard/modules/${slug}/stage/${stage.id}`}>
                  {isCompleted ? (
                    <>
                      <Star className="h-3 w-3 mr-1.5" />
                      Review
                    </>
                  ) : isCurrent ? (
                    <>
                      <Play className="h-3 w-3 mr-1.5 fill-current" />
                      Begin Stage
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-3 w-3 mr-1" />
                      Start
                    </>
                  )}
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Spacer for alternating alignment */}
      <div className="flex-1 max-w-sm hidden md:block" />
    </motion.div>
  );
}

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [module, setModule] = useState<IModule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        console.log("params.slug", params.slug);
        const res = await apiClient.get(`/modules/${params.slug}`);
        setModule(res.data.data);
      } catch (err) {
        console.error("[ModuleDetailPage] Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (params.slug) fetchModule();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-4"
        >
          <Brain className="h-12 w-12 text-primary/40" />
          <p className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/40">
            Syncing Journey
          </p>
        </motion.div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-center">
        <div className="space-y-4">
          <Brain className="h-12 w-12 text-muted-foreground/20 mx-auto" />
          <p className="font-black text-muted-foreground">Module not found</p>
          <Button variant="ghost" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { userProgress, stages = [] } = module;
  const completedCount = userProgress.completedStages?.length || 0;
  const progressPct = userProgress.progressPercentage || 0;
  const currentStageIdx = stages.findIndex(
    (s) => s.id === userProgress.currentStageId,
  );
  const currentStage = stages[currentStageIdx >= 0 ? currentStageIdx : 0];
  const gradient =
    CATEGORY_GRADIENT[module.category] ||
    "from-primary/30 via-primary/5 to-transparent";

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto pb-24 space-y-10">
        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-2xl h-10 w-10 hover:bg-primary/5"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
            <span>Modules</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary">{module.title}</span>
          </div>
        </div>

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-gradient-to-br p-10 md:p-14",
            gradient,
          )}
        >
          {/* Background orb */}
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-10">
            {/* Left: Info */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-black uppercase tracking-widest text-[9px]">
                  {module.category}
                </Badge>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {module.durationWeeks}w journey
                </span>
                {(userProgress.streak || 0) > 0 && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
                    <Flame className="h-3 w-3" />
                    {userProgress.streak} day streak
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] mb-3">
                  {module.title}
                </h1>
                <p className="text-muted-foreground font-medium leading-relaxed max-w-lg">
                  {module.description}
                </p>
              </div>

              {/* AI intro chip */}
              <div className="flex items-start gap-3 bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-primary/10 max-w-lg">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  "This pathway is clinically grounded in{" "}
                  <strong className="text-foreground">
                    {module.clinicalBasis}
                  </strong>
                  . Complete all {module.totalStages} stages to build lasting
                  resilience."
                </p>
              </div>

              {/* CTA buttons */}
              <div className="flex items-center gap-3 flex-wrap pt-2">
                {currentStage && (
                  <Button
                    asChild
                    className="rounded-2xl h-13 px-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                  >
                    <Link
                      href={`/dashboard/modules/${module.slug}/stage/${currentStage.id}`}
                    >
                      <Play className="h-4 w-4 mr-2 fill-current" />
                      {userProgress.status === "not_started"
                        ? "Begin Journey"
                        : "Continue Path"}
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Right: Progress ring */}
            <div className="relative h-44 w-44 shrink-0 flex items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="46%"
                  className="stroke-primary/10 fill-none"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="46%"
                  className="stroke-primary fill-none"
                  strokeWidth="8"
                  strokeDasharray="100 100"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - progressPct }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex flex-col items-center text-center">
                <span className="text-4xl font-black">{progressPct}%</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">
                  Complete
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {completedCount}/{module.totalStages} stages
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Pathway roadmap ── */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-black tracking-tight">
              Therapeutic Pathway
            </h2>
            <Badge
              variant="outline"
              className="text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary"
            >
              {stages.length} Stages
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground font-medium">
            Each stage unlocks progressively as you complete the previous one.
            Follow the path at your own pace.
          </p>

          {/* Roadmap */}
          <div className="relative space-y-0 pl-8 md:pl-0">
            {stages.map((stage, idx) => {
              const isCompleted =
                userProgress.completedStages?.includes(stage.id) || false;
              const isCurrent = stage.id === userProgress.currentStageId;
              const isLocked =
                !isCompleted &&
                !isCurrent &&
                idx > (currentStageIdx >= 0 ? currentStageIdx : 0);

              return (
                <StageNode
                  key={stage.id}
                  stage={stage}
                  idx={idx}
                  isCompleted={isCompleted}
                  isCurrent={isCurrent}
                  isLocked={isLocked}
                  slug={module.slug}
                />
              );
            })}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
