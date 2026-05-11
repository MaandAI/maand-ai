"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, Mail, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) return;

    setError("");
    setIsLoading(true);
    setResendSuccess(false);

    try {
      await axios.post("/api/auth/verify-email", { email, otp });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login?verified=true");
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid or expired code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResendLoading(true);
    setResendSuccess(false);

    try {
      await axios.post("/api/auth/resend-verification", { email });
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    if (otp.length === 6) {
      handleSubmit();
    }
  }, [otp]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            M
          </div>
          <span>Maand</span>
        </Link>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader className="space-y-1 pt-8">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to <span className="font-bold text-foreground">{email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4 py-4">
              <Alert className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Email verified successfully! Redirecting you to login...
                </AlertDescription>
              </Alert>
              <Button asChild className="w-full h-11 rounded-xl font-bold">
                <Link href="/login">Go to Sign In Now</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6 py-2">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center py-4">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  disabled={isLoading}
                  autoFocus
                >
                  <InputOTPGroup className="gap-2 sm:gap-4">
                    <InputOTPSlot index={0} className="rounded-xl border-primary/20 h-12 w-10 sm:h-14 sm:w-12 text-lg font-bold" />
                    <InputOTPSlot index={1} className="rounded-xl border-primary/20 h-12 w-10 sm:h-14 sm:w-12 text-lg font-bold" />
                    <InputOTPSlot index={2} className="rounded-xl border-primary/20 h-12 w-10 sm:h-14 sm:w-12 text-lg font-bold" />
                    <InputOTPSlot index={3} className="rounded-xl border-primary/20 h-12 w-10 sm:h-14 sm:w-12 text-lg font-bold" />
                    <InputOTPSlot index={4} className="rounded-xl border-primary/20 h-12 w-10 sm:h-14 sm:w-12 text-lg font-bold" />
                    <InputOTPSlot index={5} className="rounded-xl border-primary/20 h-12 w-10 sm:h-14 sm:w-12 text-lg font-bold" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button 
                onClick={() => handleSubmit()}
                className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20" 
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {isLoading ? "Verifying..." : "Verify Account"}
              </Button>
              
              <div className="text-center space-y-4">
                <p className="text-xs text-muted-foreground">
                  Didn't receive the code?{" "}
                  <button 
                    onClick={handleResend}
                    disabled={resendLoading || isLoading}
                    className="text-primary font-bold hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {resendLoading ? "Resending..." : "Resend Code"}
                  </button>
                </p>
                
                {resendSuccess && (
                  <p className="text-xs text-emerald-600 font-medium animate-in fade-in slide-in-from-top-1">
                    A new code has been sent!
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="pb-8">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center w-full gap-2 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
