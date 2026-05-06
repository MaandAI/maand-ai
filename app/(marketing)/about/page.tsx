import React from "react";
import { SectionWrapper } from "@/components/features/shared/section-wrapper";
import { TeamSection } from "@/components/features/about/team-section";
import { MissionVision } from "@/components/features/about/mission-vision";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Users, FileCheck, Globe, CheckCircle2 } from "lucide-react";

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
  ];

  return (
    <div className="flex flex-col">
      <SectionWrapper>
        <div className="flex flex-col items-center text-center gap-6 md:gap-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge variant="secondary" className="px-4 py-1">Ethical AI</Badge>
            <Badge variant="secondary" className="px-4 py-1">Clinical Validation</Badge>
            <Badge variant="secondary" className="px-4 py-1">Human-Centered</Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl text-balance">
            About <span className="text-primary">Maand</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl text-balance leading-relaxed">
            We're building the future of mental health care through ethical AI, rigorous clinical validation, and an
            unwavering commitment to accessibility, privacy, and human oversight.
          </p>
        </div>
      </SectionWrapper>

      <MissionVision />

      <TeamSection />

      <SectionWrapper>
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
      </SectionWrapper>
    </div>
  );
}
