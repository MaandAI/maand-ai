import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, ArrowLeft, CheckCircle2, Heart, Sparkles } from "lucide-react"

export default function AvatarCompanionPage() {
  return (
    <div className="flex flex-col">
      {/* Back Navigation */}
      <section className="py-6 border-b">
        <div className="container max-w-7xl px-4 md:px-6">
          <Button variant="ghost" asChild>
            <Link href="/modules" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Modules
            </Link>
          </Button>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-7xl px-4 md:px-6">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <Bot className="h-16 w-16 text-primary" />
              <Badge variant="secondary" className="text-sm">
                Active Development
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">Therapy Avatar Companion</h1>
            <p className="text-lg md:text-xl text-muted-foreground text-balance leading-relaxed">
              A personalized AI companion that adapts to your emotional state, providing consistent support through
              visual and emotional presence. Your avatar learns your preferences and responds with empathy throughout
              your therapeutic journey.
            </p>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-7xl px-4 md:px-6">
          <div className="max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Who It's For</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              The Therapy Avatar Companion is designed for individuals who benefit from consistent emotional support and
              visual representation. Whether you find comfort in having a caring presence during difficult moments or
              prefer personalized interaction styles, your avatar companion provides reliable support tailored to your
              needs.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <Heart className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-xl">Those Seeking Emotional Connection</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    People who find comfort in having a consistent, caring presence throughout their mental health
                    journey.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Sparkles className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-xl">Users Wanting Personalization</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Individuals who prefer customized communication styles and therapeutic approaches that adapt to
                    their preferences.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Key Capabilities */}
      <section className="py-16">
        <div className="container max-w-7xl px-4 md:px-6">
          <div className="max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Key Capabilities</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-xl mb-2">Emotional State Recognition</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Your avatar responds to your emotional state in real-time, displaying calm, supportive, or
                    reflective expressions that mirror therapeutic presence and provide visual emotional validation.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-xl mb-2">Personalized Communication Styles</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Choose between supportive, neutral, or motivating tones. Your avatar adapts its communication style
                    to match your preferences and adjusts based on your feedback over time.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-xl mb-2">Contextual Reactions</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    During challenging moments, your avatar provides gentle, supportive presence. It reacts to crisis
                    situations with appropriate concern and guides you to additional resources when needed.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-xl mb-2">Integrated Therapy Experience</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Your avatar accompanies you throughout your therapy sessions, mood check-ins, and progress reviews,
                    creating a cohesive and supportive experience across all platform features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customization */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-7xl px-4 md:px-6">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-10 w-10 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold">Fully Customizable</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Tailor your avatar companion to your preferences. Adjust communication style, empathy level, and
              interaction frequency. You can enable or disable your avatar at any time, giving you complete control over
              your therapeutic experience.
            </p>
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground italic">
                  "Your Therapy Avatar Companion is designed to enhance your experience, not replace human connection.
                  It works alongside our AI-Assisted Therapy module and human clinical oversight to provide
                  comprehensive support."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container max-w-7xl px-4 md:px-6">
          <Card className="bg-primary text-primary-foreground border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl md:text-4xl mb-4">Meet Your Avatar Companion in 2026</CardTitle>
              <CardDescription className="text-primary-foreground/90 text-lg max-w-2xl mx-auto">
                Join our priority waitlist to experience personalized avatar support when we launch after completing our
                clinical validation process.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/#waitlist">Join Priority Waitlist</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/modules">View All Modules</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
