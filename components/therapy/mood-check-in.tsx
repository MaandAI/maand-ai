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
    <Card className="border-none shadow-none bg-transparent max-w-2xl mx-auto w-full">
      <CardHeader className="text-center pb-4 md:pb-8 px-2">
        <CardTitle className="text-xl md:text-3xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
          How are you showing up today?
        </CardTitle>
        <CardDescription className="text-sm md:text-base mt-1 md:mt-2">
          All feelings are valid. Take a moment to check in with yourself.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 md:space-y-10 p-2 md:p-6">
        {/* Mood Selector */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-4 lg:gap-6">
          {moodOptions.map((mood) => (
            <motion.button
              key={mood.id}
              onClick={() => setSelectedMood(mood)}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex flex-col items-center gap-1.5 md:gap-3 p-3 md:p-6 rounded-2xl md:rounded-[2rem] border transition-all duration-300 relative group",
                selectedMood?.id === mood.id
                  ? "border-primary bg-primary/20 shadow-xl shadow-primary/10 scale-105"
                  : "border-primary/20 bg-card/60 hover:border-primary/40 hover:bg-card/80",
              )}
            >
              {selectedMood?.id === mood.id && (
                <motion.div 
                  layoutId="activeMood"
                  className="absolute inset-0 rounded-2xl md:rounded-[2rem] ring-2 ring-primary ring-offset-2 ring-offset-background z-0"
                />
              )}
              <span className="text-2xl md:text-5xl drop-shadow-sm group-hover:drop-shadow-md transition-all z-10">
                {mood.emoji}
              </span>
              <span className={cn(
                "text-[8px] md:text-xs font-black uppercase tracking-widest transition-colors z-10 text-center",
                selectedMood?.id === mood.id ? "text-primary" : "text-foreground/60 group-hover:text-foreground"
              )}>
                {mood.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Optional Note */}
        <div className="space-y-3 md:space-y-4 max-w-xl mx-auto w-full">
          <label htmlFor="mood-note" className="text-[9px] md:text-[10px] font-black text-center block text-foreground/50 uppercase tracking-[0.2em]">
            Anything on your mind? (Optional)
          </label>
          <Textarea
            id="mood-note"
            placeholder="Feel free to share..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[80px] md:min-h-[120px] rounded-2xl md:rounded-3xl border-primary/20 bg-background/60 focus-visible:ring-primary/30 p-4 md:p-6 resize-none text-center text-sm md:text-lg placeholder:text-muted-foreground/30 shadow-inner w-full"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-2 md:pt-4">
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedMood || isSubmitting} 
            size="lg"
            className="rounded-full px-8 md:px-12 h-12 md:h-14 text-sm md:text-base font-bold shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
          >
            {isSubmitting ? "Saving..." : "Start Reflection"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
