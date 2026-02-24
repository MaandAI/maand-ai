"use client"

import { Badge } from "@/components/ui/badge"
import { type AvatarState, AVATAR_STATE_DESCRIPTIONS } from "@/lib/mock/avatar-states"
import { motion } from "framer-motion"

interface StateIndicatorProps {
  state: AvatarState
}

const stateColors = {
  calm: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  supportive: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  reflective: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  listening: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  thinking: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
}

export function StateIndicator({ state }: StateIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center space-y-2"
    >
      <Badge variant="secondary" className={`${stateColors[state]} capitalize`}>
        {state}
      </Badge>
      <p className="text-sm text-muted-foreground leading-relaxed">{AVATAR_STATE_DESCRIPTIONS[state]}</p>
    </motion.div>
  )
}
