"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wind, Play, Pause, RotateCcw, CheckCircle2 } from "lucide-react";

interface BreathingExerciseProps {
  type: "box_breathing" | "grounding_54321" | "custom";
  onComplete: () => void;
}

export function BreathingExercise({ type, onComplete }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [progress, setProgress] = useState(0);
  const [rounds, setRounds] = useState(0);
  const totalRounds = 4;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && rounds < totalRounds) {
      interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            // Cycle phases
            if (phase === "inhale") setPhase("hold");
            else if (phase === "hold") setPhase("exhale");
            else if (phase === "exhale") setPhase("rest");
            else {
              setPhase("inhale");
              setRounds((r) => r + 1);
            }
            return 0;
          }
          return p + 1; // 4 seconds per phase (approx 40ms interval)
        });
      }, 40);
    }
    return () => clearInterval(interval);
  }, [isActive, phase, rounds]);

  useEffect(() => {
    if (rounds >= totalRounds) {
      setIsActive(false);
      setTimeout(onComplete, 2000);
    }
  }, [rounds, onComplete]);

  const phaseText = {
    inhale: "Inhale Slowly...",
    hold: "Hold and Pause...",
    exhale: "Exhale Gently...",
    rest: "Rest and Relax..."
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-16 py-20">
      <div className="relative flex items-center justify-center">
        {/* Breathing Circle */}
        <motion.div
          className="absolute rounded-full bg-primary/20 blur-[100px]"
          animate={{
            scale: phase === "inhale" ? 1.5 : phase === "exhale" ? 0.8 : 1.2,
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />
        
        <div className="relative z-10">
          <motion.div
            className="h-48 w-48 md:h-64 md:w-64 rounded-full border-4 border-primary/20 flex items-center justify-center bg-card/30 backdrop-blur-xl shadow-2xl"
            animate={{
              scale: phase === "inhale" ? 1.4 : phase === "exhale" ? 1.0 : 1.2,
              borderColor: phase === "inhale" ? "rgba(var(--primary), 0.6)" : "rgba(var(--primary), 0.2)",
            }}
            transition={{ duration: 4, ease: "easeInOut" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center space-y-2"
              >
                <Wind className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-xl font-black tracking-tight">{phaseText[phase]}</p>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Round {rounds + 1} of {totalRounds}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Progress ring around the circle */}
          <svg className="absolute inset-0 h-full w-full transform -rotate-90 pointer-events-none">
             <circle
               cx="50%" cy="50%" r="48%"
               className="stroke-primary fill-none"
               strokeWidth="4"
               strokeDasharray="100 100"
               style={{ strokeDashoffset: 100 - progress }}
               strokeLinecap="round"
             />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full h-16 w-16 border-primary/20 hover:bg-primary/5"
          onClick={() => {
            setRounds(0);
            setProgress(0);
            setPhase("inhale");
          }}
        >
          <RotateCcw className="h-6 w-6" />
        </Button>

        <Button
          size="lg"
          className="rounded-full h-20 w-20 shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90"
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 fill-current ml-1" />}
        </Button>

        {rounds >= totalRounds ? (
           <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Complete</span>
           </div>
        ) : (
           <div className="h-16 w-16" />
        )}
      </div>

      <div className="max-w-md text-center">
         <p className="text-sm text-muted-foreground font-medium italic">
           Focus on the expansion and contraction. Let the rhythm guide your nervous system into a state of safety.
         </p>
      </div>
    </div>
  );
}
