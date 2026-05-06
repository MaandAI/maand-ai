import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionWrapper } from "@/components/features/shared/section-wrapper";

const stats = [
  {
    value: "970M+",
    label: "People worldwide with mental disorders (WHO 2019)",
  },
  { value: "727K", label: "Annual deaths by suicide globally" },
  { value: "8.9", label: "Suicide rate per 100,000 in Pakistan" },
];

export function StatsSection() {
  return (
    <SectionWrapper backgroundColor="muted">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Addressing the Global Mental Health Crisis
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          We're committed to making clinically-validated mental health
          support accessible to everyone, everywhere
        </p>
      </div>

      <div className="grid gap-6 md:gap-8 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-4xl md:text-5xl font-bold text-primary">
                {stat.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}
