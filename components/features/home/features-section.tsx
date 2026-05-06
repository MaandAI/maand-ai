import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionWrapper } from "@/components/features/shared/section-wrapper";
import { Brain, Accessibility, Glasses, Lock, TrendingUp, Users } from "lucide-react";

const features = [
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
    icon: Glasses,
    title: "Immersive Therapy",
    description:
      "Evidence-based virtual reality environments for exposure therapy, mindfulness, and relaxation techniques.",
  },
  {
    icon: Lock,
    title: "Privacy & Security",
    description:
      "End-to-end encryption, HIPAA compliance, and strict data governance to protect user privacy and confidentiality.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Comprehensive analytics and progress monitoring with clinically validated assessment tools and outcome measures.",
  },
  {
    icon: Users,
    title: "Human Oversight",
    description:
      "All AI interactions are supervised by licensed mental health professionals to ensure quality and safety.",
  },
];

export function FeaturesSection() {
  return (
    <SectionWrapper id="features">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Clinical-Grade Mental Health Technology
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          We combine cutting-edge technology with evidence-based therapeutic
          approaches to provide effective, accessible mental health support.
        </p>
      </div>

      <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="border-2">
            <CardHeader>
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}
