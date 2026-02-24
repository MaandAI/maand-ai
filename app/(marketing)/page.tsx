import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CountdownTimer } from "@/components/marketing/countdown-timer";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import {
  Brain,
  Shield,
  Heart,
  Users,
  TrendingUp,
  CheckCircle2,
  Accessibility,
  Lock,
  FileCheck,
  Globe,
  Glasses,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export default function HomePage() {
  const stats = [
    {
      value: "970M+",
      label: "People worldwide with mental disorders (WHO 2019)",
    },
    { value: "727K", label: "Annual deaths by suicide globally" },
    { value: "8.9", label: "Suicide rate per 100,000 in Pakistan" },
  ];

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

  const ethicalCommitments = [
    {
      icon: Lock,
      title: "Privacy First",
      description: "Data minimization and end-to-end encryption",
    },
    {
      icon: Users,
      title: "Clinical Oversight",
      description: "All AI interactions supervised by professionals",
    },
    {
      icon: FileCheck,
      title: "Evidence-Based",
      description: "Rigorous clinical validation of all interventions",
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "Designed for users with diverse abilities",
    },
  ];

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
      description:
        "Small-scale studies to refine our approach and ensure safety and usability before larger trials.",
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
      description:
        "Submission to regulatory bodies for approval as a clinical mental health intervention.",
    },
  ];

  return (
    <div className="flex flex-col items-center w-full space-y-24">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden h-full">
        <div className="container max-w-7xl px-4 md:px-6 relative z-10">
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
                <Link href="#waitlist">Join Priority Waitlist</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#about">Clinical Research</Link>
              </Button>
            </div>

            <div className="mt-8 md:mt-10 w-full">
              <div className="mb-4 md:mb-6 text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Launching February 26, 2026
                </h3>
              </div>
              <CountdownTimer />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-7xl px-4 md:px-6">
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
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container max-w-7xl px-4 md:px-6">
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
        </div>
      </section>

      {/* Ethical Commitment Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container max-w-7xl px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Our Ethical Commitment
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {ethicalCommitments.map((commitment, index) => (
              <div key={index} className="text-center">
                <commitment.icon className="h-12 w-12 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  {commitment.title}
                </h3>
                <p className="text-sm opacity-90">{commitment.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16">
        <div className="container max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">About Maand</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We're building the future of mental health care through ethical
              AI, clinical validation, and a commitment to accessibility and
              privacy.
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 md:grid-cols-2 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To make clinically-validated mental health support accessible
                  to everyone, everywhere, while maintaining the highest
                  standards of ethical AI development, privacy protection, and
                  therapeutic efficacy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  A world where quality mental health care is accessible to all,
                  powered by ethical AI that augments human care rather than
                  replacing it, with technology that respects user privacy and
                  autonomy.
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Clinical Validation Process
            </h3>
            <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
              {validationSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold shrink-0">
                      {step.number}
                    </div>
                    <h4 className="font-semibold text-lg">{step.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-muted/30">
        <div className="container max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Services
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Comprehensive mental health support powered by cutting-edge
              technology and compassionate, clinically-validated AI.
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
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-6">
                  Launching after completion of our comprehensive clinical
                  validation process
                </p>
                <CountdownTimer />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact & Waitlist Section */}
      <section id="contact" className="py-16">
        <div className="container max-w-7xl px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get In Touch
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Interested in Maand? Join our priority waitlist for early access
              or reach out to discuss partnerships.
            </p>
          </div>

          <div id="waitlist" className="mb-12">
            <WaitlistForm />
          </div>

          <div className="grid gap-6 md:gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Phone</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  +92 309 827 3508
                </p>
                <p className="text-xs text-muted-foreground">
                  Available for partnership inquiries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Email</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  mr.faizan.asim@gmail.com
                </p>
                <p className="text-xs text-muted-foreground">
                  We'll respond within 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Research Office</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">Canary Wharf</p>
                <p className="text-sm text-muted-foreground">London, UK</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
