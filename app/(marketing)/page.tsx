import { HeroSection } from "@/components/features/home/hero-section";
import { FeaturesSection } from "@/components/features/home/features-section";
// import { StatsSection } from "@/components/features/home/stats-section";
import { ServicesSection } from "@/components/features/home/services-section";
import { SectionWrapper } from "@/components/features/shared/section-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center w-full">
      <HeroSection />

      {/* Stats Section commented out as per refactoring requirements */}
      {/* <StatsSection /> */}

      <FeaturesSection />

      <ServicesSection />

      <SectionWrapper id="contact">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Interested in Maand? Reach out to discuss partnerships or clinical collaborations.
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 md:grid-cols-2 max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Email</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                support@maand.tech
              </p>
              <p className="text-xs text-muted-foreground">
                We'll respond within 24 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Support</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Contact via Email
              </p>
              <p className="text-xs text-muted-foreground">
                Priority support for clinical partners
              </p>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>
    </div>
  );
}
