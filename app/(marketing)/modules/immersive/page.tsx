import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Glasses, ArrowLeft, CheckCircle2, Sparkles, Users, Brain } from "lucide-react"
import { SectionWrapper } from "@/components/features/shared/section-wrapper"

export default function ImmersiveTherapyPage() {
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
      <SectionWrapper>
        <div className="max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <Glasses className="h-16 w-16 text-primary" />
            <Badge variant="outline" className="text-sm">
              Coming 2026
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">Immersive Therapy</h1>
          <p className="text-lg md:text-xl text-muted-foreground text-balance leading-relaxed">
            Evidence-based virtual reality environments for exposure therapy, mindfulness, and relaxation techniques.
            Designed to provide safe, controlled therapeutic experiences that complement traditional mental health
            treatment.
          </p>
        </div>
      </SectionWrapper>

      {/* Who It's For */}
      <SectionWrapper backgroundColor="muted">
        <div className="max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Who It's For</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Immersive Therapy is designed for individuals working through anxiety disorders, seeking deep relaxation
            and mindfulness practice, or developing social skills in a safe environment. These evidence-based VR
            experiences provide controlled exposure and practice opportunities under professional guidance.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Brain className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl">Anxiety & Phobia Treatment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  People working through specific phobias, social anxiety, or PTSD who benefit from graduated exposure
                  in controlled environments.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl">Social Skills Development</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Individuals seeking to practice social interactions, public speaking, or interpersonal skills in
                  low-pressure simulated scenarios.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </SectionWrapper>

      {/* Key Capabilities */}
      <SectionWrapper>
        <div className="max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Key Capabilities</h2>
          <div className="space-y-6">
            {[
              {
                title: "VR Exposure Therapy for Anxiety Disorders",
                description: "Gradual exposure to anxiety-provoking situations in safe, controlled virtual environments. Work through specific phobias, social anxiety, or PTSD triggers with professional oversight and adjustable intensity levels."
              },
              {
                title: "Guided Meditation & Mindfulness Environments",
                description: "Immerse yourself in calming virtual spaces designed for meditation, mindfulness practice, and deep relaxation. Experience nature scenes, peaceful environments, and guided breathing exercises in fully immersive settings."
              },
              {
                title: "Social Skills Training in Simulated Environments",
                description: "Practice social interactions, conversations, and public speaking in realistic simulated scenarios. Receive real-time feedback and guidance to build confidence in social situations before facing them in real life."
              },
              {
                title: "Biofeedback-Integrated Relaxation Exercises",
                description: "Connect biofeedback sensors to track your physiological responses during VR exercises. Learn to control stress responses through real-time feedback on heart rate, breathing patterns, and muscle tension."
              }
            ].map((capability, index) => (
              <div key={index} className="flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-xl mb-2">{capability.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {capability.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Evidence-Based Approach */}
      <SectionWrapper backgroundColor="muted">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-10 w-10 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold">Evidence-Based Design</h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            All immersive therapy environments are developed in collaboration with clinical researchers and validated
            through rigorous testing. Our VR experiences follow established therapeutic protocols and are designed to
            complement—not replace—traditional mental health treatment.
          </p>
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground italic">
                "Immersive Therapy experiences are intended for use under professional guidance. They are currently
                undergoing clinical validation and will be available after our comprehensive research process is
                complete in 2026."
              </p>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper>
        <Card className="bg-primary text-primary-foreground border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl md:text-4xl mb-4">Experience Immersive Therapy in 2026</CardTitle>
            <CardDescription className="text-primary-foreground/90 text-lg max-w-2xl mx-auto">
              Our research team is currently conducting pilot studies to ensure safety and therapeutic efficacy in VR.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">Contact Our Team</Link>
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
      </SectionWrapper>
    </div>
  )
}
