"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionWrapper } from "@/components/features/shared/section-wrapper";
import { CheckCircle2, Loader2, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TherapistOnboardingPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialization: "",
    licenseNumber: "",
    experience: 0,
    bio: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/therapist/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to submit request");
      
      setIsSuccess(true);
      toast({ title: "Request submitted", description: "We will review your application soon." });
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <SectionWrapper className="min-h-[70vh] flex items-center justify-center">
        <Card className="max-w-2xl w-full text-center p-8">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl mb-4">Request Submitted Successfully!</CardTitle>
          <CardDescription className="text-lg leading-relaxed">
            Thank you for your interest in joining Maand. Our clinical board will review your credentials and contact you via email within 3-5 business days.
          </CardDescription>
          <Button className="mt-8" asChild>
            <a href="/">Back to Home</a>
          </Button>
        </Card>
      </SectionWrapper>
    );
  }

  return (
    <div className="flex flex-col">
      <SectionWrapper>
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="outline" className="mb-4">Join Our Network</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Become a Maand Therapist</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Join the future of mental health care. Help us provide ethical, AI-assisted therapy to users worldwide while maintaining clinical excellence.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto border-2">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              <CardTitle>Professional Information</CardTitle>
            </div>
            <CardDescription>
              Please provide your clinical credentials. All information will be verified by our board.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Dr. John Doe" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Professional Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@hospital.com" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input 
                    id="specialization" 
                    placeholder="e.g. Clinical Psychology" 
                    required 
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">License Number</Label>
                  <Input 
                    id="license" 
                    placeholder="e.g. PSY-123456" 
                    required 
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input 
                  id="experience" 
                  type="number" 
                  required 
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio & Motivation</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell us about your background and why you want to join Maand..." 
                  className="min-h-[120px]"
                  required 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </SectionWrapper>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
