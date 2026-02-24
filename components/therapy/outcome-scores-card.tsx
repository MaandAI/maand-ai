"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { mockPHQ9Scores, mockGAD7Scores, getSeverityColor, type OutcomeScore } from "@/lib/mock/therapy"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, TrendingUp, Minus } from "lucide-react"

function ScoreDisplay({ score }: { score: OutcomeScore }) {
  const percentage = (score.score / score.maxScore) * 100
  const severityColor = getSeverityColor(score.severity)

  const getTrendComponent = () => {
    switch (score.trend) {
      case "improving":
        return <TrendingDown className="h-4 w-4 text-green-500" />
      case "worsening":
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case "stable":
        return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{score.type}</h4>
            {getTrendComponent()}
          </div>
          <p className="text-sm text-muted-foreground">
            Last assessed {score.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            {score.score}/{score.maxScore}
          </div>
          <Badge variant="outline" style={{ borderColor: severityColor, color: severityColor }}>
            {score.severity}
          </Badge>
        </div>
      </div>
      <Progress value={percentage} className="h-2" style={{ backgroundColor: `${severityColor}20` }} />
    </div>
  )
}

export function OutcomeScoresCard() {
  const latestPHQ9 = mockPHQ9Scores[0]
  const latestGAD7 = mockGAD7Scores[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Markers</CardTitle>
        <CardDescription>
          Clinical scales that help track changes over time—not labels, just helpful data points
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ScoreDisplay score={latestPHQ9} />
        <div className="border-t" />
        <ScoreDisplay score={latestGAD7} />

        <div className="pt-2 text-xs text-muted-foreground border-t leading-relaxed space-y-2">
          <p>
            <strong>PHQ-9:</strong> A questionnaire that measures depression symptoms—helps us understand patterns, not
            define you.
          </p>
          <p>
            <strong>GAD-7:</strong> Tracks anxiety-related experiences to see how things shift over time.
          </p>
          <p className="pt-1 text-muted-foreground/80">
            These scores are tools for awareness, not judgments about your progress or worth.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
