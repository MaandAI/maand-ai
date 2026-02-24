"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { moodOptions, type Mood } from "@/lib/mock/therapy"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function MoodCheckIn({ onComplete }: { onComplete?: (mood: Mood, note?: string) => void }) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!selectedMood) return

    setIsSubmitting(true)
    setTimeout(() => {
      onComplete?.(selectedMood, note)
      setIsSubmitting(false)
    }, 500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you showing up today?</CardTitle>
        <CardDescription>
          All feelings are valid. Tracking your emotional experience helps us understand patterns over time—no judgment,
          just awareness.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Selector */}
        <div className="grid grid-cols-5 gap-3">
          {moodOptions.map((mood) => (
            <motion.button
              key={mood.id}
              onClick={() => setSelectedMood(mood)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                selectedMood?.id === mood.id
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border hover:border-primary/50 hover:bg-muted",
              )}
            >
              <span className="text-4xl">{mood.emoji}</span>
              <span className="text-sm font-medium">{mood.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Optional Note */}
        <div className="space-y-2">
          <label htmlFor="mood-note" className="text-sm font-medium">
            Anything you'd like to share? (completely optional)
          </label>
          <Textarea
            id="mood-note"
            placeholder="You can share more context if it feels helpful, but there's no pressure..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <Button onClick={handleSubmit} disabled={!selectedMood || isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Continue to Chat"}
        </Button>
      </CardContent>
    </Card>
  )
}
