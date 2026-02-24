"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserProfile } from "@/types";
import { getUserProfile } from "@/services/user.service";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Firebase User: ", firebaseUser);
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch user profile from Firestore to get roles
        const userProfile = await getUserProfile(firebaseUser.uid);
        console.log("User Profile: ", userProfile);
        setProfile(userProfile);

        // Sync token cookie for middleware & server components
        const token = await firebaseUser.getIdToken();
        fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }).catch(console.error);
      } else {
        setProfile(null);
        // Sync logout across edge network
        fetch("/api/auth/logout", { method: "POST" }).catch(console.error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
