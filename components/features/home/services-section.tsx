import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionWrapper } from "@/components/features/shared/section-wrapper";
import { CheckCircle2, Shield, Lock, Heart } from "lucide-react";
import { CountdownTimer } from "@/components/features/shared/countdown-timer";

const services = [
  {
    title: "AI-Assisted Therapy",
    items: [
      "CBT-based conversations with empathetic AI",
      "Mood tracking and personalized interventions",
      "Crisis detection and escalation to human providers",
      "Progress monitoring with clinical outcome measures",
    ],
  },
  {
    title: "Accessibility Features",
    items: [
      "Voice-controlled navigation and interactions",
      "Gesture-based controls for motor impairments",
      "High-contrast visuals and screen reader compatibility",
      "Multilingual support and cultural adaptation",
    ],
  },
  {
    title: "Immersive Therapy Environments",
    items: [
      "VR exposure therapy for anxiety disorders",
      "Guided meditation and mindfulness environments",
      "Social skills training in simulated environments",
      "Biofeedback-integrated relaxation exercises",
    ],
  },
];

export function ServicesSection() {
  return (
    <SectionWrapper id="services" backgroundColor="muted">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Comprehensive mental health support powered by cutting-edge technology
          and compassionate, clinically-validated AI.
        </p>
      </div>

      <div className="grid gap-6 md:gap-8 lg:grid-cols-3 mb-12">
        {services.map((service, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-xl">{service.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {service.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Our Commitment to Ethical Launch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:gap-8 md:grid-cols-3 mb-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Clinical Validation</h4>
              <p className="text-sm text-muted-foreground">
                Rigorous testing to ensure safety and efficacy
              </p>
            </div>
            <div className="text-center">
              <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Privacy Protection</h4>
              <p className="text-sm text-muted-foreground">
                End-to-end encryption and data governance
              </p>
            </div>
            <div className="text-center">
              <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Ethical AI</h4>
              <p className="text-sm text-muted-foreground">
                Transparent algorithms with human oversight
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </SectionWrapper>
  );
}
