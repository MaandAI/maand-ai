import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Shield,
  Heart,
  Users,
  Lock,
  FileCheck,
  Globe,
  Accessibility,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"

export const metadata = {
  title: "About Maand - Ethical AI Mental Health",
  description:
    "Learn about Maand's mission to make clinically-validated mental health support accessible to everyone through ethical AI and rigorous clinical validation.",
}

export default function AboutPage() {
  const ethicalCommitments = [
    {
      icon: Lock,
      title: "Privacy First",
      description: "Data minimization and end-to-end encryption",
      detail: "We prioritize your privacy with industry-leading security standards and HIPAA compliance.",
    },
    {
      icon: Users,
      title: "Clinical Oversight",
      description: "All AI interactions supervised by professionals",
      detail: "Licensed mental health professionals oversee every aspect of our AI-assisted care.",
    },
    {
      icon: FileCheck,
      title: "Evidence-Based",
      description: "Rigorous clinical validation of all interventions",
      detail: "Every feature undergoes randomized controlled trials before launch.",
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "Designed for users with diverse abilities",
      detail: "Built with input from disability advocates to ensure inclusive design.",
    },
  ]

  const validationSteps = [
    {
      number: "1",
      title: "Research & Development",
      description:
        "Collaboration with leading mental health researchers and clinicians to develop evidence-based interventions.",
    },
    {
      number: "2",
      title: "Pilot Studies",
      description: "Small-scale studies to refine our approach and ensure safety and usability before larger trials.",
    },
    {
      number: "3",
      title: "RCTs",
      description:
        "Randomized controlled trials to establish efficacy compared to standard care and waitlist controls.",
    },
    {
      number: "4",
      title: "Regulatory Approval",
      description: "Submission to regulatory bodies for approval as a clinical mental health intervention.",
    },
  ]

  const problemStats = [
    { value: "970M+", label: "People worldwide with mental disorders (WHO 2019)" },
    { value: "727K", label: "Annual deaths by suicide globally" },
    { value: "8.9", label: "Suicide rate per 100,000 in Pakistan" },
  ]

  const coreValues = [
    {
      icon: Brain,
      title: "Clinically Validated AI",
      description:
        "Our AI models are developed in collaboration with leading mental health professionals and validated through rigorous clinical trials.",
    },
    {
      icon: Accessibility,
      title: "Accessibility First",
      description:
        "Designed with input from disability advocates to ensure our platform is accessible to users with diverse needs and abilities.",
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description:
        "End-to-end encryption, HIPAA compliance, and strict data governance to protect user privacy and confidentiality.",
    },
    {
      icon: Heart,
      title: "Human Oversight",
      description:
        "All AI interactions are supervised by licensed mental health professionals to ensure quality and safety.",
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-7xl px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-6 md:gap-8">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Badge variant="secondary" className="px-4 py-1">
                Ethical AI
              </Badge>
              <Badge variant="secondary" className="px-4 py-1">
                Clinical Validation
              </Badge>
              <Badge variant="secondary" className="px-4 py-1">
                Human-Centered
              </Badge>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl text-balance">
              About <span className="text-primary">Maand</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl text-balance leading-relaxed">
              We're building the future of mental health care through ethical AI, rigorous clinical validation, and an
              unwavering commitment to accessibility, privacy, and human oversight.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-7xl px-4 md:px-6">
          <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  To make clinically-validated mental health support accessible to everyone, everywhere, while
                  maintaining the highest standards of ethical AI development, privacy protection, and therapeutic
                  efficacy.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We believe that mental health care is a fundamental human right, not a privilege. Our mission is to
                  bridge the global mental health care gap through technology that respects human dignity and autonomy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  A world where quality mental health care is accessible to all, powered by ethical AI that augments
                  human care rather than replacing it, with technology that respects user privacy and autonomy.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We envision a future where mental health support is available 24/7, culturally sensitive,
                  linguistically diverse, and accessible to people of all abilities and backgrounds.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* The Problem We're Solving */}
      <section className="py-16">
        <div className="container max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Problem We're Solving</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Mental health disorders affect nearly one billion people worldwide, yet most lack access to quality care.
              The gap between need and available services continues to grow.
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 md:grid-cols-3 mb-12">
            {problemStats.map((stat, index) => (
              <Card key={index} className="border-2">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-4xl md:text-5xl font-bold text-primary">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-sm text-muted-foreground leading-relaxed">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-card">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">The Care Gap</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    <strong>Limited Access:</strong> Shortage of mental health professionals in most regions,
                    particularly in developing countries
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    <strong>High Costs:</strong> Traditional therapy is often unaffordable for those who need it most
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    <strong>Stigma Barriers:</strong> Cultural stigma prevents many from seeking help through
                    traditional channels
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    <strong>Accessibility Issues:</strong> Existing solutions often fail to accommodate people with
                    disabilities or diverse needs
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Maand Exists */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Maand Exists</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We believe technology can help bridge the mental health care gap—but only if it's built ethically,
              validated clinically, and designed with compassion.
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 lg:grid-cols-2 mb-12">
            {coreValues.map((value, index) => (
              <Card key={index} className="border-2">
                <CardHeader>
                  <value.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-center mb-6">Our Approach</h3>
              <p className="text-center leading-relaxed mb-8 max-w-3xl mx-auto opacity-90">
                Unlike other mental health apps, we refuse to launch until our platform has been thoroughly validated
                through randomized controlled trials. We're committed to doing this right—not fast.
              </p>
              <div className="flex justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/#waitlist">
                    Join Our Waitlist
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Ethical Commitments */}
      <section className="py-16">
        <div className="container max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Ethical Commitments</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Every decision we make is guided by our commitment to ethical AI development, user privacy, clinical
              excellence, and universal accessibility.
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
            {ethicalCommitments.map((commitment, index) => (
              <Card key={index} className="border-2">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <commitment.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{commitment.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{commitment.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{commitment.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Clinical Validation Process */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Clinical Validation Process</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We follow a rigorous, multi-stage validation process to ensure our platform meets the highest standards of
              safety, efficacy, and clinical excellence.
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 lg:grid-cols-4">
            {validationSteps.map((step, index) => (
              <Card key={index} className="border-2">
                <CardHeader>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                    {step.number}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="inline-block bg-card">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  <strong>Current Status:</strong> We are currently in the pilot studies phase, refining our approach
                  based on early user feedback and preparing for large-scale randomized controlled trials in 2025.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container max-w-7xl px-4 md:px-6">
          <Card className="border-2">
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Join Us on This Journey</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
                Be part of the future of mental health care. Join our priority waitlist to get early access when we
                launch in February 2026.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/#waitlist">Join Priority Waitlist</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/#contact">Contact Us</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
