import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionWrapper } from "@/components/features/shared/section-wrapper";

export function MissionVision() {
  return (
    <SectionWrapper backgroundColor="muted">
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
    </SectionWrapper>
  );
}
