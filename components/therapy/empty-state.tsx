import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Heart, Sparkles } from "lucide-react"

interface TherapyEmptyStateProps {
  message: string
  variant?: "default" | "gentle" | "encouraging"
}

export function TherapyEmptyState({ message, variant = "default" }: TherapyEmptyStateProps) {
  const getIcon = () => {
    switch (variant) {
      case "gentle":
        return <Heart className="h-8 w-8 text-muted-foreground" />
      case "encouraging":
        return <Sparkles className="h-8 w-8 text-muted-foreground" />
      default:
        return <MessageSquare className="h-8 w-8 text-muted-foreground" />
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-muted p-4 mb-4">{getIcon()}</div>
        <p className="text-muted-foreground text-center max-w-md leading-relaxed">{message}</p>
        <p className="text-xs text-muted-foreground/70 text-center max-w-sm mt-3">
          Take your time—there's no rush or expectation here.
        </p>
      </CardContent>
    </Card>
  )
}
