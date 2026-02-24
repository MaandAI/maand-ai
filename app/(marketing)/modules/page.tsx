import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Accessibility, Glasses, TrendingUp, Users, Lock, ArrowRight, Bot } from "lucide-react"

export default function ModulesPage() {
  const modules = [
    {
      icon: Brain,
      title: "AI-Assisted Therapy",
      description:
        "Our AI models are developed in collaboration with leading mental health professionals and validated through rigorous clinical trials. Experience empathetic, CBT-based conversations with progress tracking.",
      features: [
        "CBT-based conversations with empathetic AI",
        "Mood tracking and personalized interventions",
        "Crisis detection and escalation to human providers",
        "Progress monitoring with clinical outcome measures",
      ],
      status: "Active Development",
      learnMoreHref: "/modules/ai-therapy",
    },
    {
      icon: Bot,
      title: "Avatar Companion",
      description:
        "Personalized AI companion that adapts to your emotional state and provides consistent support through visual and emotional presence throughout your therapeutic journey.",
      features: [
        "Emotional state recognition and adaptive responses",
        "Customizable communication styles and tones",
        "Contextual reactions during therapy sessions",
        "Integrated experience across all platform features",
      ],
      status: "Active Development",
      learnMoreHref: "/modules/avatar-companion",
    },
    {
      icon: Glasses,
      title: "Immersive Therapy",
      description:
        "Evidence-based virtual reality environments for exposure therapy, mindfulness, and relaxation techniques. Designed to provide safe, controlled therapeutic experiences.",
      features: [
        "VR exposure therapy for anxiety disorders",
        "Guided meditation and mindfulness environments",
        "Social skills training in simulated environments",
        "Biofeedback-integrated relaxation exercises",
      ],
      status: "Coming 2026",
      learnMoreHref: "/modules/immersive",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Comprehensive analytics and progress monitoring with clinically validated assessment tools and outcome measures. Track your mental health journey with professional-grade tools.",
      features: [
        "PHQ-9 and GAD-7 clinical assessments",
        "Weekly mood trend visualization",
        "Therapy session progress analytics",
        "Personalized insights and recommendations",
      ],
      status: "Active Development",
      learnMoreHref: "/modules/progress",
    },
    {
      icon: Accessibility,
      title: "Accessibility Features",
      description:
        "Designed with input from disability advocates to ensure our platform is accessible to users with diverse needs and abilities. Mental health support for everyone.",
      features: [
        "Voice-controlled navigation and interactions",
        "Gesture-based controls for motor impairments",
        "High-contrast visuals and screen reader compatibility",
        "Multilingual support and cultural adaptation",
      ],
      status: "Active Development",
      learnMoreHref: "/modules/accessibility",
    },
    {
      icon: Users,
      title: "Human Oversight",
      description:
        "All AI interactions are supervised by licensed mental health professionals to ensure quality and safety. Technology that augments human care, never replaces it.",
      features: [
        "24/7 clinical team monitoring",
        "Seamless escalation to human providers",
        "Professional consultation scheduling",
        "Care coordination with your providers",
      ],
      status: "Active Development",
      learnMoreHref: "/modules/oversight",
    },
    {
      icon: Lock,
      title: "Privacy & Security",
      description:
        "End-to-end encryption, HIPAA compliance, and strict data governance to protect user privacy and confidentiality. Your mental health data is yours alone.",
      features: [
        "End-to-end encryption for all data",
        "HIPAA-compliant infrastructure",
        "Data minimization principles",
        "User-controlled data sharing",
      ],
      status: "Active Development",
      learnMoreHref: "/modules/security",
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-6">
              Product Modules
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              Comprehensive Mental Health Support
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed">
              Maand combines cutting-edge AI technology with evidence-based therapeutic approaches to provide effective,
              accessible mental health support across all dimensions of care.
            </p>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-7xl px-4 md:px-6">
          <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
            {modules.map((module, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <module.icon className="h-12 w-12 text-primary shrink-0" />
                    <Badge variant={module.status === "Coming 2026" ? "outline" : "secondary"}>{module.status}</Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">{module.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-sm">Key Features:</h4>
                    <ul className="space-y-2">
                      {module.features.map((feature, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full group bg-transparent" asChild>
                    <Link href={module.learnMoreHref}>
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container max-w-7xl px-4 md:px-6">
          <Card className="bg-primary text-primary-foreground border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl md:text-4xl mb-4">Experience Maand in 2026</CardTitle>
              <CardDescription className="text-primary-foreground/90 text-lg max-w-2xl mx-auto">
                Join our priority waitlist to get early access when we launch after completing our comprehensive
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
                <Link href="/about">Learn About Our Research</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
