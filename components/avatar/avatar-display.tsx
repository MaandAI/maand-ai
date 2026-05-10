"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Ear, Lightbulb, Heart, Brain, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTherapistStore } from "@/lib/store/therapist-store"
import { getPersona } from "@/lib/therapist-personas"
import type { AvatarState } from "@/types/therapy"

interface AvatarDisplayProps {
  state: AvatarState
  enabled: boolean
  size?: "sm" | "md" | "lg"
  /** Override therapist ID — defaults to the globally selected one */
  therapistId?: string
  /** Show therapist name + title below the avatar */
  showLabel?: boolean
}

const stateIcons = {
  calm: Sparkles,
  supportive: Heart,
  reflective: Brain,
  listening: Ear,
  thinking: Lightbulb,
}

const sizeClasses = {
  sm: {
    container: "h-24 w-24",
    emoji: "text-3xl",
    ring: "inset-[-6px]",
    badge: "h-7 w-7 -bottom-1 -right-1 text-xs",
    pulse: "inset-[-8px]",
    label: "text-[9px]",
    name: "text-xs",
  },
  md: {
    container: "h-40 w-40",
    emoji: "text-6xl",
    ring: "inset-[-8px]",
    badge: "h-10 w-10 -bottom-1.5 -right-1.5 text-base",
    pulse: "inset-[-12px]",
    label: "text-[9px]",
    name: "text-sm",
  },
  lg: {
    container: "h-56 w-56",
    emoji: "text-8xl",
    ring: "inset-[-10px]",
    badge: "h-14 w-14 -bottom-2 -right-2 text-xl",
    pulse: "inset-[-16px]",
    label: "text-[10px]",
    name: "text-base",
  },
}

/** Per-state ring colour */
const stateRingColor: Record<string, string> = {
  calm:       "border-blue-400/50",
  supportive: "border-pink-400/50",
  reflective: "border-purple-400/50",
  listening:  "border-emerald-400/50",
  thinking:   "border-amber-400/50",
}

/** Per-state glow color for pulse */
const stateGlow: Record<string, string> = {
  calm:       "bg-blue-400/10",
  supportive: "bg-pink-400/10",
  reflective: "bg-purple-400/10",
  listening:  "bg-emerald-400/10",
  thinking:   "bg-amber-400/10",
}

const stateEmoji: Record<string, string> = {
  calm:       "✨",
  supportive: "💜",
  reflective: "🔮",
  listening:  "👂",
  thinking:   "💭",
}

/**
 * AvatarDisplay
 * Renders the AI therapist's animated presence, automatically using the
 * globally-selected therapist unless `therapistId` prop overrides it.
 *
 * States: calm | supportive | reflective | listening | thinking
 * Sizes:  sm | md | lg
 */
export function AvatarDisplay({
  state,
  enabled,
  size = "md",
  therapistId,
  showLabel = false,
}: AvatarDisplayProps) {
  // Resolve therapist from global store or prop
  const globalTherapistId = useTherapistStore((s) => s.selectedTherapistId)
  const resolvedId = therapistId || globalTherapistId || "ava"
  const persona = getPersona(resolvedId)

  const classes = sizeClasses[size] || sizeClasses.md
  const isSpeaking = state === "supportive"
  const isThinking = state === "thinking"
  const isListening = state === "listening"

  if (!enabled) {
    return (
      <div
        className={cn(
          classes.container,
          "rounded-[2rem] bg-muted/30 flex items-center justify-center border-2 border-dashed border-muted-foreground/20 flex-col gap-2"
        )}
      >
        <span className="text-2xl opacity-30">{persona.emoji}</span>
        <span className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest">Offline</span>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", showLabel && "gap-4")}>
      {/* Avatar core */}
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {/* Outer pulse ring — visible during speaking/listening */}
        <AnimatePresence>
          {(isSpeaking || isListening) && (
            <>
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "absolute rounded-[2rem] border",
                    classes.ring,
                    stateRingColor[state] || "border-primary/30"
                  )}
                  animate={{ scale: [1, 1 + i * 0.12], opacity: [0.6, 0] }}
                  transition={{
                    duration: 1.6,
                    delay: i * 0.28,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Core avatar */}
        <motion.div
          className={cn(
            classes.container,
            "rounded-[2rem] flex items-center justify-center shadow-2xl border-2 bg-gradient-to-br relative overflow-hidden",
            persona.gradient,
            isSpeaking ? "border-white/30" : "border-white/10"
          )}
          animate={{
            scale: isSpeaking
              ? [1, 1.05, 1]
              : isThinking
              ? [1, 1.015, 1]
              : [1, 1.02, 1],
            rotate: isThinking ? [0, 0.5, -0.5, 0] : 0,
          }}
          transition={{
            duration: isSpeaking ? 0.55 : isThinking ? 1.5 : 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          {/* Shimmer overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />

          {/* Emoji */}
          <motion.span
            className={cn("relative z-10 select-none", classes.emoji)}
            animate={
              isListening
                ? { y: [0, -3, 0] }
                : isThinking
                ? { y: [0, -4, 0], rotate: [-2, 2, -2] }
                : { y: [0, -3, 0] }
            }
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            {persona.emoji}
          </motion.span>
        </motion.div>

        {/* State badge */}
        <motion.div
          className={cn(
            "absolute rounded-full flex items-center justify-center shadow-lg z-20",
            classes.badge,
            "bg-background border-2 border-primary/20"
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 260 }}
        >
          <span>{stateEmoji[state] || "✨"}</span>
        </motion.div>

        {/* Ambient glow pulse */}
        <motion.div
          className={cn(
            "absolute rounded-[2rem] -z-10",
            classes.pulse,
            stateGlow[state] || "bg-primary/10"
          )}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Thinking dots */}
        <AnimatePresence>
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-2 w-2 rounded-full bg-amber-400/60"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Listening wave bars */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-0.5"
            >
              {[3, 5, 8, 6, 4].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-emerald-400/70"
                  animate={{ height: [h * 2, h * 4, h * 2] }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.08,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  style={{ height: h * 2 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Optional label */}
      <AnimatePresence>
        {showLabel && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-0.5"
          >
            <p className={cn("font-black", classes.name)}>{persona.name}</p>
            <p className={cn("text-muted-foreground/50 font-bold", classes.label)}>
              {persona.title}
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  state === "thinking"
                    ? "bg-amber-400 animate-pulse"
                    : state === "listening"
                    ? "bg-emerald-400 animate-pulse"
                    : state === "supportive"
                    ? "bg-blue-400 animate-pulse"
                    : "bg-emerald-500"
                )}
              />
              <span
                className={cn(
                  "font-black uppercase tracking-widest",
                  classes.label,
                  "text-muted-foreground/40"
                )}
              >
                {state === "thinking"
                  ? "Thinking…"
                  : state === "listening"
                  ? "Listening…"
                  : state === "supportive"
                  ? "Speaking…"
                  : state === "calm"
                  ? "Present"
                  : state}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
