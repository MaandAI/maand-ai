"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ShieldAlert, Loader2, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TwoFactorPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (data.success) {
        // Clear the requires2FA flag in the session/JWT
        await update({ requires2FA: false });
        toast({ title: "Verification successful", description: "Welcome back!" });
        router.push("/dashboard");
      } else {
        toast({ title: "Invalid code", description: data.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Verification failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden">
        <CardHeader className="text-center pt-10 pb-6">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Two-Factor Verification</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app or a backup code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="000 000"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="text-center text-3xl tracking-[0.5em] h-16 rounded-2xl font-black bg-muted/50 border-primary/10 focus-visible:ring-primary/20"
                  maxLength={10} // Allow for backup codes
                  required
                />
              </div>
              <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest">
                Check your mobile app
              </p>
            </div>
            
            <Button type="submit" className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="pb-10 pt-2 flex justify-center">
          <Button variant="ghost" onClick={() => router.push("/login")} className="text-xs font-bold text-muted-foreground hover:text-primary">
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
