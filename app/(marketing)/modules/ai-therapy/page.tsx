import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, ArrowLeft, CheckCircle2, Users, Shield, TrendingUp } from "lucide-react"

export default function AITherapyPage() {
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
              <Brain className="h-16 w-16 text-primary" />
              <Badge variant="secondary" className="text-sm">
                Active Development
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">AI-Assisted Therapy</h1>
            <p className="text-lg md:text-xl text-muted-foreground text-balance leading-relaxed">
              Our AI models are developed in collaboration with leading mental health professionals and validated
              through rigorous clinical trials. Experience empathetic, CBT-based conversations with comprehensive
              progress tracking and clinical outcome measures.
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
              AI-Assisted Therapy is designed for individuals seeking accessible, evidence-based mental health support.
              Whether you're managing daily stress, working through anxiety or depression, or simply looking for tools
              to support your emotional wellbeing, our AI companion provides a judgment-free space for reflection and
              growth.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-xl">Individuals Seeking Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Those who want immediate access to therapeutic support without wait times or scheduling barriers.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-xl">People in Active Therapy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    A complement to traditional therapy, offering support between sessions with your human therapist.
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
                  <h3 className="font-semibold text-xl mb-2">CBT-Based Conversations</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Engage with an empathetic AI trained in Cognitive Behavioral Therapy techniques. Our system helps
                    you identify thought patterns, challenge negative beliefs, and develop healthier coping strategies.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-xl mb-2">Mood Tracking & Personalized Interventions</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Track your emotional state before and after sessions. Our system learns your patterns and suggests
                    personalized interventions tailored to your specific needs and goals.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-xl mb-2">Crisis Detection & Escalation</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Advanced safety systems detect signs of crisis and provide immediate resources, including connection
                    to human providers when needed. Your safety is our highest priority.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-xl mb-2">Progress Monitoring with Clinical Measures</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Track your progress using validated clinical outcome measures like PHQ-9 and GAD-7. Visualize trends
                    over time and share insights with your healthcare providers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Oversight */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-7xl px-4 md:px-6">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-10 w-10 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold">Clinical Oversight</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              All AI interactions are supervised by licensed mental health professionals. Our clinical team reviews
              conversations, monitors safety flags, and ensures the highest standards of care. AI augments human
              expertise—it never replaces it.
            </p>
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground italic">
                  "AI-Assisted Therapy is not a replacement for professional mental health treatment. If you are in
                  crisis or experiencing severe symptoms, please contact emergency services or a licensed mental health
                  provider immediately."
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
              <CardTitle className="text-3xl md:text-4xl mb-4">Experience AI-Assisted Therapy in 2026</CardTitle>
              <CardDescription className="text-primary-foreground/90 text-lg max-w-2xl mx-auto">
                Join our priority waitlist to access AI-Assisted Therapy after we complete our comprehensive clinical
                validation process.
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
