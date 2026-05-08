"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  ShieldCheck,
  Loader2,
  Key,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Step = "idle" | "loading" | "qr" | "verify" | "success";

export function SecuritySettings({ user }: { user: any }) {
  const { update: updateSession } = useSession();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("idle");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [otpInput, setOtpInput] = useState("");
  const [disabling, setDisabling] = useState(false);

  const is2FAEnabled = user?.twoFactorEnabled;

  const start2FA = async () => {
    setStep("loading");
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Setup failed");
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setStep("qr");
    } catch (err: any) {
      toast({ title: "Setup failed", description: err.message, variant: "destructive" });
      setStep("idle");
    }
  };

  const verify2FA = async () => {
    if (otpInput.length !== 6) return;
    setStep("loading");
    try {
      const res = await fetch("/api/auth/2fa/setup", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otpInput, secret, backupCodes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setStep("success");
      toast({ title: "2FA enabled successfully!" });
      // Refresh session so twoFactorEnabled reflects
      await updateSession({}).catch(() => {});
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" });
      setStep("verify");
    }
  };

  const disable2FA = async () => {
    if (!confirm("Are you sure you want to disable two-factor authentication?")) return;
    setDisabling(true);
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disable 2FA");
      toast({ title: "2FA disabled" });
      await updateSession({}).catch(() => {});
    } catch (err: any) {
      toast({ title: "Failed to disable 2FA", description: err.message, variant: "destructive" });
    } finally {
      setDisabling(false);
    }
  };

  // ── Already enabled ─────────────────────────────────────────
  if (is2FAEnabled && step === "idle") {
    return (
      <Card className="p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold">Two-Factor Authentication</p>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-none text-[10px]">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your account has an extra layer of protection.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-xs text-rose-500 border-rose-200 hover:bg-rose-50"
            onClick={disable2FA}
            disabled={disabling}
          >
            {disabling && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
            Disable
          </Button>
        </div>
      </Card>
    );
  }

  // ── Setup flow ───────────────────────────────────────────────
  return (
    <Card className="p-6 rounded-2xl border border-border/60">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold">Two-Factor Authentication</p>
          <p className="text-xs text-muted-foreground">
            {step === "idle" ? "Add an extra layer of security to your account." : "Complete the setup steps below."}
          </p>
        </div>
      </div>

      {/* Step: idle */}
      {step === "idle" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            When enabled, you&apos;ll need a 6-digit code from an authenticator app (e.g., Google Authenticator) each time you sign in.
          </p>
          <Button onClick={start2FA} className="rounded-xl h-10 gap-2 text-sm">
            <Shield className="h-4 w-4" />
            Enable 2FA
          </Button>
        </div>
      )}

      {/* Step: loading */}
      {step === "loading" && (
        <div className="flex items-center gap-3 py-4 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Processing…</span>
        </div>
      )}

      {/* Step: QR code */}
      {step === "qr" && (
        <div className="space-y-5">
          <div className="bg-white p-4 rounded-2xl border-2 border-primary/10 flex justify-center w-fit mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCode} alt="2FA QR Code" className="h-44 w-44" />
          </div>
          <div className="bg-muted/50 rounded-xl p-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Manual entry secret</p>
            <code className="text-xs font-mono break-all text-foreground">{secret}</code>
          </div>
          <p className="text-sm text-muted-foreground">
            Scan the QR code with your authenticator app, then click Continue.
          </p>
          <Button onClick={() => setStep("verify")} className="rounded-xl h-10 w-full">
            Continue to Verification →
          </Button>
        </div>
      )}

      {/* Step: verify */}
      {step === "verify" && (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Enter 6-digit code from your app
            </Label>
            <Input
              placeholder="000 000"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="text-center text-2xl tracking-[0.4em] h-14 rounded-2xl font-bold"
              maxLength={6}
            />
          </div>

          {backupCodes.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Save your backup codes</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mb-3">
                Store these securely — they let you access your account if you lose your phone.
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {backupCodes.map((code, i) => (
                  <code
                    key={i}
                    className="text-[11px] font-mono bg-white dark:bg-amber-900/30 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-700 text-center"
                  >
                    {code}
                  </code>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep("qr")}
              className="rounded-xl h-10 flex-1"
            >
              ← Back
            </Button>
            <Button
              onClick={verify2FA}
              disabled={otpInput.length !== 6}
              className="rounded-xl h-10 flex-1"
            >
              Verify & Enable
            </Button>
          </div>
        </div>
      )}

      {/* Step: success */}
      {step === "success" && (
        <div className="text-center py-6 space-y-4">
          <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg">2FA Enabled!</h3>
            <p className="text-sm text-muted-foreground mt-1">Your account is now protected with 2-factor authentication.</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">
            Done
          </Button>
        </div>
      )}
    </Card>
  );
}
