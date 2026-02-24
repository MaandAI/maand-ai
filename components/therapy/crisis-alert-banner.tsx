"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, Phone, Heart } from "lucide-react"
import { motion } from "framer-motion"

interface CrisisAlertBannerProps {
  onConnectProvider: () => void
  onGroundingExercise: () => void
}

export function CrisisAlertBanner({ onConnectProvider, onGroundingExercise }: CrisisAlertBannerProps) {
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Alert className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
        <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-500" />
        <AlertTitle className="text-orange-900 dark:text-orange-400">You're not alone in this</AlertTitle>
        <AlertDescription className="text-orange-800 dark:text-orange-300 mt-2">
          <p className="mb-3 leading-relaxed">
            I notice you might be struggling right now, and I want you to know that's okay. While I'm here to listen,
            connecting with a trained human provider could offer you the deeper support you deserve. You can also try a
            grounding exercise to help find some calm in this moment.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onConnectProvider}
              variant="default"
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Phone className="h-3.5 w-3.5 mr-1.5" />
              Talk to a Human Provider
            </Button>
            <Button
              onClick={onGroundingExercise}
              variant="outline"
              size="sm"
              className="border-orange-600/50 bg-transparent"
            >
              <Heart className="h-3.5 w-3.5 mr-1.5" />
              Try a Grounding Exercise
            </Button>
          </div>
          <p className="text-xs mt-3 text-orange-700 dark:text-orange-400 leading-relaxed">
            <strong>If you need immediate support:</strong> Call or text 988 (Suicide & Crisis Lifeline) anytime, or
            text HOME to 741741 (Crisis Text Line). Real people are available 24/7.
          </p>
        </AlertDescription>
      </Alert>
    </motion.div>
  )
}
