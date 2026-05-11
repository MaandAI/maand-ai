"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Upload,
  Trash2,
  User,
  MapPin,
  Phone,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserStore } from "@/lib/store/user-store";
import { UI_TEXT } from "@/constants/ui-text";

export function ProfileForm() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    phoneNumber: "",
    location: "",
    image: "",
  });

  // Email change form state
  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    currentPassword: "",
  });
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState("");
  const [emailChangeSent, setEmailChangeSent] = useState(false);
  const [emailChangeOtp, setEmailChangeOtp] = useState("");
  const [emailVerifyLoading, setEmailVerifyLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (data.success) {
        setProfile({
          name: data.data.name || "",
          bio: data.data.bio || "",
          phoneNumber: data.data.phoneNumber || "",
          location: data.data.location || "",
          image: data.data.image || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const { updateUser } = useUserStore();

  // ── Avatar Upload ────────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be under 5MB.", variant: "destructive" });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const newImageUrl = data.data.imageUrl;
      setProfile((p) => ({ ...p, image: newImageUrl }));

      // Update NextAuth session & Global Store
      await update({ image: newImageUrl });
      updateUser({ image: newImageUrl });

      toast({ title: "Avatar updated", description: "Your profile picture has been updated." });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile.image) return;
    setIsUploadingAvatar(true);
    try {
      const res = await fetch("/api/user/avatar", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile((p) => ({ ...p, image: "" }));
      await update({ image: "" });
      updateUser({ image: "" });
      toast({ title: "Avatar removed" });
    } catch (err: any) {
      toast({ title: "Failed to remove avatar", description: err.message, variant: "destructive" });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // ── Profile Save ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          bio: profile.bio,
          phoneNumber: profile.phoneNumber,
          location: profile.location,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || UI_TEXT.PROFILE.SAVE_ERROR);

      await update({ name: profile.name });
      updateUser({ name: profile.name });

      toast({ title: "Profile updated", description: UI_TEXT.PROFILE.SAVE_SUCCESS });
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Email Change ─────────────────────────────────────────────────────────────
  const handleEmailChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailChangeError("");
    setEmailChangeLoading(true);

    try {
      const res = await fetch("/api/user/email-change/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setEmailChangeError(data.error || "Failed to initiate email change.");
      } else {
        setEmailChangeSent(true);
      }
    } catch {
      setEmailChangeError("An unexpected error occurred. Please try again.");
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const handleEmailChangeVerify = async (otpValue?: string) => {
    const finalOtp = otpValue || emailChangeOtp;
    if (finalOtp.length !== 6) return;

    setEmailChangeError("");
    setEmailVerifyLoading(true);

    try {
      const res = await fetch("/api/user/email-change/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: finalOtp }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEmailChangeError(data.error || "Verification failed.");
      } else {
        toast({ title: "Email updated", description: "Your email address has been successfully changed." });
        await update({ email: emailForm.newEmail });
        setShowEmailModal(false);
      }
    } catch {
      setEmailChangeError("An unexpected error occurred.");
    } finally {
      setEmailVerifyLoading(false);
    }
  };

  return (
    <>
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-black">Personal Information</CardTitle>
          <CardDescription className="font-medium">
            Maintain your clinical identity and metadata.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Avatar */}
            <div className="flex flex-col md:flex-row gap-12 items-start">
              <div className="flex flex-col items-center gap-4 shrink-0">
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-2xl transition-transform group-hover:scale-105 duration-500">
                    <AvatarImage src={profile.image} />
                    <AvatarFallback className="bg-primary text-white text-3xl font-black">
                      {profile.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-[2px]">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                  id="avatar-upload"
                />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-8 gap-1.5 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    <Upload className="h-3 w-3" />
                    Upload
                  </Button>
                  {profile.image && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl h-8 gap-1.5 text-xs text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={handleRemoveAvatar}
                      disabled={isUploadingAvatar}
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center">
                  JPG, PNG, GIF, WEBP <br /> MAX 5MB
                </p>
              </div>

              <div className="flex-1 grid gap-8 w-full">
                <div className="grid gap-3">
                  <Label
                    htmlFor="name"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                  >
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                    <Input
                      id="name"
                      value={profile.name}
                      placeholder="Enter your name"
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="pl-11 h-12 rounded-2xl bg-background/50 border-primary/10 focus:border-primary/30 transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label
                    htmlFor="bio"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                  >
                    Biography
                  </Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    placeholder="Share your background or therapeutic focus..."
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="min-h-[100px] rounded-2xl bg-background/50 border-primary/10 focus:border-primary/30 resize-none p-5 font-medium leading-relaxed transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-3">
                    <Label
                      htmlFor="phone"
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                    >
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                      <Input
                        id="phone"
                        value={profile.phoneNumber}
                        placeholder="+1 (555) 000-0000"
                        onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                        className="pl-11 h-12 rounded-2xl bg-background/50 border-primary/10 focus:border-primary/30 transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Label
                      htmlFor="location"
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                    >
                      Location
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                      <Input
                        id="location"
                        value={profile.location}
                        placeholder="City, Country"
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        className="pl-11 h-12 rounded-2xl bg-background/50 border-primary/10 focus:border-primary/30 transition-all font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Email change shortcut */}
                <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-primary/5">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-primary/40" />
                    <div>
                      <p className="text-sm font-bold">Email Address</p>
                      <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl font-bold shrink-0"
                    onClick={() => {
                      setShowEmailModal(true);
                      setEmailChangeSent(false);
                      setEmailChangeError("");
                      setEmailForm({ newEmail: "", currentPassword: "" });
                    }}
                  >
                    Change Email
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-primary/5">
              <Button
                type="submit"
                className="w-full md:w-auto px-10 h-12 rounded-xl font-bold shadow-xl shadow-primary/20 hover:shadow-none transition-all"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Email Change Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold">Change Email Address</DialogTitle>
            <DialogDescription>
              Enter your new email and current password. We'll send a verification link to your new
              address.
            </DialogDescription>
          </DialogHeader>

          {emailChangeSent ? (
            <div className="py-6 text-center space-y-6">
              <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <p className="font-bold text-sm">Verification code sent!</p>
                <p className="text-xs text-muted-foreground px-4">
                  Enter the 6-digit code we sent to <strong>{emailForm.newEmail}</strong>.
                </p>
              </div>

              {emailChangeError && (
                <Alert variant="destructive" className="text-left">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{emailChangeError}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={emailChangeOtp}
                  onChange={(v) => {
                    setEmailChangeOtp(v);
                    if (v.length === 6) handleEmailChangeVerify(v);
                  }}
                  disabled={emailVerifyLoading}
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="rounded-lg h-10 w-9 font-bold" />
                    <InputOTPSlot index={1} className="rounded-lg h-10 w-9 font-bold" />
                    <InputOTPSlot index={2} className="rounded-lg h-10 w-9 font-bold" />
                    <InputOTPSlot index={3} className="rounded-lg h-10 w-9 font-bold" />
                    <InputOTPSlot index={4} className="rounded-lg h-10 w-9 font-bold" />
                    <InputOTPSlot index={5} className="rounded-lg h-10 w-9 font-bold" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full rounded-xl font-bold"
                  onClick={() => handleEmailChangeVerify()}
                  disabled={emailVerifyLoading || emailChangeOtp.length !== 6}
                >
                  {emailVerifyLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {emailVerifyLoading ? "Verifying..." : "Confirm Email Change"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-primary"
                  onClick={() => setEmailChangeSent(false)}
                  disabled={emailVerifyLoading}
                >
                  Back to request
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEmailChangeRequest} className="space-y-4">
              {emailChangeError && (
                <Alert variant="destructive">
                  <AlertDescription>{emailChangeError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="newEmail">New Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newEmail"
                    type="email"
                    placeholder="your.new@email.com"
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm((f) => ({ ...f, newEmail: e.target.value }))}
                    required
                    disabled={emailChangeLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Confirm your current password"
                    value={emailForm.currentPassword}
                    onChange={(e) =>
                      setEmailForm((f) => ({ ...f, currentPassword: e.target.value }))
                    }
                    required
                    disabled={emailChangeLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowEmailModal(false)}
                  disabled={emailChangeLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={emailChangeLoading}
                  className="rounded-xl font-bold"
                >
                  {emailChangeLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {emailChangeLoading ? "Sending..." : "Send Verification"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
