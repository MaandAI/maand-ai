"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"
import { SectionWrapper } from "@/components/features/shared/section-wrapper"

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      description: "Essential support for everyone",
      price: "$0",
      period: "forever",
      features: [
        "Basic AI Mood Tracking",
        "Limited Chat Sessions",
        "Community Support Access",
        "Mental Health Assessments",
        "Standard Encryption"
      ],
      buttonText: "Get Started",
      variant: "outline"
    },
    {
      name: "Pro",
      description: "Comprehensive therapeutic experience",
      price: "$19",
      period: "per month",
      popular: true,
      features: [
        "Unlimited AI Therapy Chat",
        "Personalized Mood Analytics",
        "Priority Support Access",
        "Custom Coping Strategies",
        "Advanced Security Features",
        "Early Access to Modules"
      ],
      buttonText: "Start Free Trial",
      variant: "default"
    },
    {
      name: "Enterprise",
      description: "For organizations & clinics",
      price: "Custom",
      period: "per user/mo",
      features: [
        "Clinician Dashboard Access",
        "Team Management Tools",
        "HIPAA Compliance Package",
        "Dedicated Account Manager",
        "Custom API Integration",
        "White-label Options"
      ],
      buttonText: "Contact Sales",
      variant: "outline"
    }
  ]

  return (
    <div className="flex flex-col">
      <SectionWrapper>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Choose the plan that best fits your journey to mental wellness. All plans include our core ethical AI commitments.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative border-2 ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <Badge className="px-3 py-1">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.variant as any} asChild>
                  <Link href="/signup">{plan.buttonText}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper backgroundColor="muted">
        <div className="container max-w-4xl px-4 md:px-6 text-center mx-auto">
          <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our team is here to help you choose the right plan for your needs.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">Contact Our Team</Link>
          </Button>
        </div>
      </SectionWrapper>
    </div>
  )
}
