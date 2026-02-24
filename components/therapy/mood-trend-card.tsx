"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { mockMoodHistory } from "@/lib/mock/therapy"
import { TrendingUp } from "lucide-react"

export function MoodTrendCard() {
  const chartData = mockMoodHistory.map((entry) => ({
    date: entry.date.toLocaleDateString("en-US", { weekday: "short" }),
    mood: entry.mood,
  }))

  const averageMood = (mockMoodHistory.reduce((sum, entry) => sum + entry.mood, 0) / mockMoodHistory.length).toFixed(1)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Mood Journey</CardTitle>
            <CardDescription>Noticing patterns in how you've been feeling this week</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="font-semibold">{averageMood} avg</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
              <YAxis
                domain={[0, 10]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">Mood</span>
                            <span className="font-bold text-foreground">{payload[0].value}/10</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center leading-relaxed">
          Mood fluctuations are natural—this is just information, not judgment.
        </p>
      </CardContent>
    </Card>
  )
}
