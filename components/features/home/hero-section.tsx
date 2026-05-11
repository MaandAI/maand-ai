import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionWrapper } from "@/components/features/shared/section-wrapper";

export function HeroSection() {
  return (
    <SectionWrapper className="relative py-16 md:py-24 overflow-hidden min-h-screen mt-10">
      <div className="flex flex-col items-center text-center gap-6 md:gap-8">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Badge variant="secondary" className="px-4 py-1">
            Ethical AI
          </Badge>
          <Badge variant="secondary" className="px-4 py-1">
            HIPAA Compliant
          </Badge>
          <Badge variant="secondary" className="px-4 py-1">
            Privacy First
          </Badge>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl text-balance">
          The Future of
          <span className="block text-primary mt-2">Mental Wellness</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-balance leading-relaxed">
          Maand is an ethical AI mental health platform featuring empathetic
          virtual psychologists and immersive therapeutic environments.
          Launching in 2026 after rigorous clinical validation.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild>
            <Link href="/about">Learn More</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contact">Clinical Research</Link>
          </Button>
        </div>
      </div>
    </SectionWrapper>
  );
}
