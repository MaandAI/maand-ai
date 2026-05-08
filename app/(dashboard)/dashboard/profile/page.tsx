"use client";

import { ProfileForm } from "@/components/user/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Shield, Key, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <ProtectedRoute>
      <div className="space-y-8 max-w-5xl mx-auto pb-10">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-full hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Public Profile</h1>
            <p className="text-muted-foreground">Manage your identity and personal clinical data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ProfileForm />
            
            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Account Security
                </CardTitle>
                <CardDescription>Update your credentials and sign-in methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-primary/5">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Email Address</p>
                    <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl font-bold">Change Email</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-primary/5">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Password</p>
                    <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl font-bold" onClick={() => router.push("/dashboard/settings?tab=security")}>
                    Manage Security
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-primary/5 border-l-4 border-l-primary overflow-hidden">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Identity Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-xs">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="font-bold">Email Verified</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="font-bold">Google Connected</span>
                </div>
                <p className="text-[10px] text-muted-foreground/60 leading-relaxed pt-2">
                  Verified identities help us ensure clinical safety and data integrity throughout your therapeutic sessions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
               <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Account Status</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Joined</span>
                      <span className="font-bold">May 2024</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Plan</span>
                      <span className="text-primary font-bold">Professional</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Sessions</span>
                      <span className="font-bold">12 Total</span>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
