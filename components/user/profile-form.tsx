"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, User, MapPin, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ProfileForm() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    phoneNumber: "",
    location: "",
    image: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      // Update NextAuth session
      await update({
        name: profile.name,
        image: profile.image,
      });

      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm rounded-[2rem] overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-xl font-black">Personal Information</CardTitle>
        <CardDescription className="font-medium">Maintain your clinical identity and metadata.</CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex flex-col items-center gap-6 shrink-0">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-background shadow-2xl transition-transform group-hover:scale-105 duration-500">
                  <AvatarImage src={profile.image} />
                  <AvatarFallback className="bg-primary text-white text-3xl font-black">
                    {profile.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]">
                   <Upload className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center">
                JPG, PNG OR GIF <br/> MAX 2MB
              </p>
            </div>

            <div className="flex-1 grid gap-8 w-full">
              <div className="grid gap-3">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Full Identity Name</Label>
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
                <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Professional Biography</Label>
                <Textarea 
                  id="bio" 
                  value={profile.bio} 
                  placeholder="Share your background or therapeutic focus..."
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })} 
                  className="min-h-[120px] rounded-2xl bg-background/50 border-primary/10 focus:border-primary/30 resize-none p-5 font-medium leading-relaxed transition-all" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="grid gap-3">
                  <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Contact Identifier</Label>
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
                  <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Primary Workspace</Label>
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
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-primary/5">
            <Button type="submit" className="w-full md:w-auto px-10 h-12 rounded-xl font-bold shadow-xl shadow-primary/20 hover:shadow-none transition-all" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {isLoading ? "Synchronizing..." : "Commit Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
