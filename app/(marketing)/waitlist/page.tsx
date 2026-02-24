"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Brain, Heart, Shield, Users, Sparkles, Clock } from "lucide-react"
import Link from "next/link"

export default function WaitlistPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1200))

    setIsLoading(false)
    setIsSubmitted(true)
  }

  const benefits = [
    {
      icon: Sparkles,
      title: "Early Access",
      description: "Be among the first to experience clinically validated AI therapy when we launch in 2026",
    },
    {
      icon: Users,
      title: "Priority Support",
      description: "Direct access to our clinical team during the beta testing phase",
    },
    {
      icon: Brain,
      title: "Exclusive Features",
      description: "Access to premium features and therapy modules at no additional cost",
    },
    {
      icon: Heart,
      title: "Shape the Future",
      description: "Your feedback will directly influence the development of our platform",
    },
  ]

  const stats = [
    { value: "10K+", label: "Waitlist Members" },
    { value: "50+", label: "Clinical Advisors" },
    { value: "2026", label: "Launch Year" },
  ]

  if (isSubmitted) {
    return (
      <div className="flex flex-col min-h-[80vh] items-center justify-center py-16">
        <div className="container max-w-2xl px-4 md:px-6">
          <Card className="border-2 border-primary">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">You're on the List!</h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                Thank you for joining our priority waitlist. We'll notify you at <strong>{email}</strong> when we're
                ready to launch.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-muted-foreground justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>Confirmation email sent</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>Priority access reserved</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>Updates will be sent monthly</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href="/">Return Home</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/modules">Explore Modules</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              <Badge variant="secondary" className="px-4 py-1">
                <Clock className="h-3 w-3 mr-1 inline" />
                Launching Feb 2026
              </Badge>
              <Badge variant="secondary" className="px-4 py-1">
                Limited Beta Access
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              Join the Future of
              <span className="block text-primary mt-2">Mental Wellness</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Be among the first to experience Maand's clinically validated AI therapy platform. Reserve your spot on
              our priority waitlist today.
            </p>
          </div>

          {/* Waitlist Form */}
          <Card className="border-2 mb-12">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Reserve Your Priority Access</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" size="lg" disabled={isLoading} className="sm:w-auto">
                    {isLoading ? "Joining..." : "Join Waitlist"}
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  By joining, you agree to receive updates about Maand. Unsubscribe anytime.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-6xl px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Join Our Waitlist?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Priority access members receive exclusive benefits and help shape the future of mental health technology
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 md:grid-cols-2">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-2">
                <CardHeader>
                  <benefit.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-16">
        <div className="container max-w-6xl px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What You'll Get</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Maand combines cutting-edge AI with evidence-based therapy to provide accessible mental health support
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Brain className="h-10 w-10 text-primary mb-4" />
                <CardTitle>AI Therapy Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>24/7 access to empathetic AI therapist</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>CBT-based conversational therapy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Personalized treatment plans</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Real-time mood tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Clinical Validation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>HIPAA compliant and secure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Supervised by licensed professionals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Evidence-based interventions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Rigorous clinical trials</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Accessibility First</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Voice navigation support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Screen reader compatible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Multilingual support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Affordable pricing options</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container max-w-4xl px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Mental Health Journey?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
            Join thousands of others who are waiting for ethical, accessible, and clinically validated AI therapy
          </p>
          <Button size="lg" variant="secondary" asChild>
            <a href="#" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Join Priority Waitlist
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}
