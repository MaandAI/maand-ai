"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user && (session.user as any).disclaimerAccepted) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleCompleteOnboarding = async () => {
    if (!disclaimerAccepted) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disclaimerAccepted: true }),
      });

      if (res.ok) {
        await update({ disclaimerAccepted: true });
        toast({ title: "Welcome to Maand!", description: "Your journey begins now." });
        router.push("/dashboard");
      }
    } catch (err) {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-2xl w-full border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="text-center pt-12 pb-8">
          <div className="h-20 w-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight">One last thing...</CardTitle>
          <CardDescription className="text-base mt-2">
            To ensure your safety, please review our clinical AI disclaimer.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-10">
          <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-200/50 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              AI Clinical Disclaimer
            </h4>
            <div className="space-y-3 text-sm leading-relaxed text-amber-900/80">
              <p>
                Maand is an AI-powered guided reflection platform. 
                <strong> Our AI is not a licensed therapist, psychologist, or medical doctor.</strong>
              </p>
              <p>
                The insights provided are for educational and self-reflection purposes. 
                They should not be used to diagnose or treat any mental health condition.
              </p>
              <p className="font-bold">
                If you are in immediate danger or having thoughts of self-harm, please stop using this app and call emergency services or a crisis hotline.
              </p>
            </div>
            
            <div className="flex items-start gap-3 pt-4 border-t border-amber-200/30">
              <Checkbox
                id="disclaimer-onboarding"
                checked={disclaimerAccepted}
                onCheckedChange={(checked) => setDisclaimerAccepted(checked === true)}
                className="mt-1 border-amber-400 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
              />
              <label
                htmlFor="disclaimer-onboarding"
                className="text-xs font-bold text-amber-950 leading-tight cursor-pointer"
              >
                I have read and understand that Maand is an AI assistant and does not provide professional medical advice.
              </label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-10 pb-12 pt-6">
          <Button 
            onClick={handleCompleteOnboarding} 
            disabled={!disclaimerAccepted || isLoading}
            className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20"
          >
            {isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : "Complete Setup & Begin"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
