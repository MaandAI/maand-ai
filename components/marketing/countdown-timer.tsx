"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function CountdownTimer() {
  const launchDate = new Date("2026-02-26T00:00:00").getTime()

  const calculateTimeLeft = (): TimeLeft => {
    const now = new Date().getTime()
    const difference = launchDate - now

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-wrap justify-center gap-4">
      <Card className="flex flex-col items-center justify-center p-6 min-w-[100px]">
        <span className="text-4xl font-bold text-primary">{String(timeLeft.days).padStart(3, "0")}</span>
        <span className="text-sm text-muted-foreground mt-2">Days</span>
      </Card>
      <Card className="flex flex-col items-center justify-center p-6 min-w-[100px]">
        <span className="text-4xl font-bold text-primary">{String(timeLeft.hours).padStart(2, "0")}</span>
        <span className="text-sm text-muted-foreground mt-2">Hours</span>
      </Card>
      <Card className="flex flex-col items-center justify-center p-6 min-w-[100px]">
        <span className="text-4xl font-bold text-primary">{String(timeLeft.minutes).padStart(2, "0")}</span>
        <span className="text-sm text-muted-foreground mt-2">Minutes</span>
      </Card>
      <Card className="flex flex-col items-center justify-center p-6 min-w-[100px]">
        <span className="text-4xl font-bold text-primary">{String(timeLeft.seconds).padStart(2, "0")}</span>
        <span className="text-sm text-muted-foreground mt-2">Seconds</span>
      </Card>
    </div>
  )
}
