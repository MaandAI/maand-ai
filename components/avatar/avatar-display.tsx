"use client"

import { motion } from "framer-motion"
import { Sparkles, Heart, Brain, Ear, Lightbulb } from "lucide-react"
import type { AvatarState } from "@/lib/mock/avatar-states"

interface AvatarDisplayProps {
  state: AvatarState
  enabled: boolean
  size?: "sm" | "md" | "lg"
}

const stateIcons = {
  calm: Sparkles,
  supportive: Heart,
  reflective: Brain,
  listening: Ear,
  thinking: Lightbulb,
}

const stateColors = {
  calm: "from-blue-500/40 to-cyan-500/40 border-blue-400/60",
  supportive: "from-pink-500/40 to-rose-500/40 border-pink-400/60",
  reflective: "from-purple-500/40 to-indigo-500/40 border-purple-400/60",
  listening: "from-green-500/40 to-emerald-500/40 border-green-400/60",
  thinking: "from-amber-500/40 to-yellow-500/40 border-amber-400/60",
}

const sizeClasses = {
  sm: { container: "h-24 w-24", icon: "h-10 w-10", badge: "h-8 w-8 -bottom-1 -right-1", emoji: "text-sm" },
  md: { container: "h-48 w-48", icon: "h-20 w-20", badge: "h-12 w-12 -bottom-2 -right-2", emoji: "text-2xl" },
  lg: { container: "h-64 w-64", icon: "h-28 w-28", badge: "h-16 w-16 -bottom-3 -right-3", emoji: "text-3xl" },
}

export function AvatarDisplay({ state, enabled, size = "md" }: AvatarDisplayProps) {
  const Icon = stateIcons[state] || Sparkles
  const classes = sizeClasses[size] || sizeClasses.md

  if (!enabled) {
    return (
      <div
        className={`${classes.container} rounded-full bg-muted/50 flex items-center justify-center border-2 border-dashed border-muted-foreground/20`}
      >
        <span className="text-muted-foreground/40 text-sm">Avatar Off</span>
      </div>
    )
  }

  return (
    <motion.div
      className="relative"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`${classes.container} rounded-full bg-gradient-to-br ${stateColors[state]} flex items-center justify-center border-4`}
        animate={{
          scale: [1, 1.02, 1],
          rotate: [0, 1, -1, 0],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      >
        <motion.div
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <Icon className={`${classes.icon} text-primary`} />
        </motion.div>
      </motion.div>

      {/* State Badge */}
      <motion.div
        className={`absolute ${classes.badge} rounded-full bg-primary flex items-center justify-center shadow-lg`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <span className={classes.emoji}>✨</span>
      </motion.div>

      {/* Pulse Effect */}
      <motion.div
        className={`absolute inset-0 rounded-full bg-primary/10`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        }}
      />
    </motion.div>
  )
}
