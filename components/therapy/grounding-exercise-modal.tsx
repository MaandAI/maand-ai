"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GROUNDING_EXERCISES } from "@/lib/mock/crisis-detection"
import { useState } from "react"
import { Check, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface GroundingExerciseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GroundingExerciseModal({ open, onOpenChange }: GroundingExerciseModalProps) {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const exercise = GROUNDING_EXERCISES.find((ex) => ex.id === selectedExercise)

  const handleSelectExercise = (id: string) => {
    setSelectedExercise(id)
    setCurrentStep(0)
    setCompletedSteps([])
  }

  const handleCompleteStep = () => {
    if (!exercise) return

    setCompletedSteps([...completedSteps, currentStep])

    if (currentStep < exercise.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleReset = () => {
    setSelectedExercise(null)
    setCurrentStep(0)
    setCompletedSteps([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Find Your Ground</DialogTitle>
          <DialogDescription>
            Gentle exercises to help you reconnect with the present moment when things feel overwhelming. Take your
            time—there's no rush.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!selectedExercise ? (
            // Exercise selection view
            <div className="grid gap-4">
              {GROUNDING_EXERCISES.map((ex) => (
                <Card
                  key={ex.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectExercise(ex.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{ex.name}</CardTitle>
                        <CardDescription>{ex.description}</CardDescription>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">{ex.steps.length} steps</Badge>
                  </CardContent>
                </Card>
              ))}
              <p className="text-xs text-muted-foreground text-center pt-2 leading-relaxed">
                Choose whichever exercise feels right for you right now. You can switch at any time.
              </p>
            </div>
          ) : (
            // Exercise detail view
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold">{exercise?.name}</h3>
                <p className="text-muted-foreground text-sm mt-1">{exercise?.description}</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Move through these steps at your own pace. If it doesn't feel right, that's okay—you can try another
                  exercise.
                </p>
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="wait">
                  {exercise?.steps.map((step, index) => {
                    const isActive = index === currentStep
                    const isCompleted = completedSteps.includes(index)
                    const isPast = index < currentStep

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card
                          className={isActive ? "border-primary shadow-sm" : isCompleted ? "border-green-500/50" : ""}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div
                                className={`
                                  flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                                  ${isCompleted ? "bg-green-500 text-white" : isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                                `}
                              >
                                {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
                              </div>
                              <p
                                className={`text-sm leading-relaxed flex-1 ${isActive ? "font-medium" : isPast ? "text-muted-foreground" : ""}`}
                              >
                                {step}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              <div className="flex gap-2 pt-4">
                {currentStep < (exercise?.steps.length || 0) - 1 ? (
                  <Button onClick={handleCompleteStep} className="flex-1">
                    Continue to Next Step
                  </Button>
                ) : completedSteps.length === (exercise?.steps.length || 0) ? (
                  <Button onClick={handleReset} className="flex-1" variant="default">
                    <Check className="h-4 w-4 mr-2" />
                    Well Done
                  </Button>
                ) : (
                  <Button onClick={handleCompleteStep} className="flex-1">
                    Finish Exercise
                  </Button>
                )}
                <Button onClick={handleReset} variant="outline">
                  Back to Exercises
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
