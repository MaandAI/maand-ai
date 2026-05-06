import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Glasses, Lock, Waves, Users, Activity, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ImmersivePage() {
  const features = [
    {
      icon: Glasses,
      title: "VR Exposure Therapy",
      description:
        "Gradual, controlled exposure to anxiety-inducing situations in a safe virtual environment. Build confidence at your own pace with evidence-based protocols.",
      benefits: ["Phobia treatment", "Social anxiety", "PTSD support", "Safe controlled exposure"],
    },
    {
      icon: Waves,
      title: "Guided Mindfulness Environments",
      description:
        "Immersive 3D spaces designed for meditation and relaxation. Experience calming nature scenes, guided breathing exercises, and ambient soundscapes.",
      benefits: ["Stress reduction", "Deep relaxation", "Focus training", "Sleep preparation"],
    },
    {
      icon: Users,
      title: "Social Skills Simulations",
      description:
        "Practice real-world social interactions in a judgment-free virtual space. Receive real-time feedback and build confidence for everyday situations.",
      benefits: ["Interview preparation", "Conflict resolution", "Public speaking", "Relationship skills"],
    },
    {
      icon: Activity,
      title: "Biofeedback-Based Relaxation",
      description:
        "Connect wearable devices to visualize your physiological responses in real-time. Learn to control stress through interactive biofeedback training.",
      benefits: ["Heart rate control", "Breathing optimization", "Stress management", "Body awareness"],
    },
  ]

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Glasses className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Immersive Experiences</h1>
              <p className="text-muted-foreground">Next-generation therapy through VR and biofeedback</p>
            </div>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5">
          <Lock className="h-3 w-3" />
          Coming Soon
        </Badge>
      </div>

      {/* Coming Soon Notice */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Launching in 2026</CardTitle>
          </div>
          <CardDescription>
            We're building the future of mental health therapy with cutting-edge immersive technologies. These features
            are currently in development and will be available with our official launch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">FDA-Cleared Devices</Badge>
            <Badge variant="outline">Clinical Validation</Badge>
            <Badge variant="outline">Privacy-First Design</Badge>
            <Badge variant="outline">Accessibility Features</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title} className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Key Benefits:</p>
                <div className="grid grid-cols-2 gap-2">
                  {feature.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Support CTA */}
      <Card className="border-primary/20">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-1">Learn more about our immersive research</h3>
            <p className="text-sm text-muted-foreground">
              Discover how we're validating these technologies for clinical use.
            </p>
          </div>
          <Button size="lg" variant="outline" className="shrink-0" asChild>
            <Link href="/about">Learn More</Link>
          </Button>
        </CardContent>
      </Card>

    </div>
  )
}
