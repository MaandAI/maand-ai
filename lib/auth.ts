import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async profile(profile) {
        await dbConnect();
        let user = await User.findOne({ email: profile.email });

        if (!user) {
          // Check for disclaimer acceptance here or later in onboarding
          user = await User.create({
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            googleId: profile.sub,
            isEmailVerified: true, // Google emails are pre-verified
            role: "user",
            status: "active",
            password: Math.random().toString(36).slice(-16), // Dummy password for OAuth users
          });
        } else if (!user.googleId) {
          user.googleId = profile.sub;
          if (!user.image) user.image = profile.picture;
          await user.save();
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          twoFactorEnabled: user.twoFactorEnabled,
          authVersion: user.authVersion,
          settings: user.settings,
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email }).select(
          "+password +twoFactorSecret +authVersion +settings"
        );

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (user.status !== "active") {
          throw new Error(`Your account is ${user.status}. Please contact support.`);
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
          authVersion: user.authVersion,
          settings: user.settings,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.twoFactorEnabled = (user as any).twoFactorEnabled;
        token.authVersion = (user as any).authVersion;
        // If 2FA is enabled, we mark it as required until verified
        token.requires2FA = (user as any).twoFactorEnabled;
        token.settings = (user as any).settings;
      }

      // Handle session updates (e.g., after profile update or 2FA verification)
      if (trigger === "update" && session) {
        if (session.requires2FA !== undefined) token.requires2FA = session.requires2FA;
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
        if (session.role) token.role = session.role;
        if (session.settings) token.settings = session.settings;
      }

      // Check for global logout (authVersion change)
      // This part usually requires a DB check in production if you want immediate invalidation
      // For this implementation, we'll assume the client will handle it via middleware or session updates
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).twoFactorEnabled = token.twoFactorEnabled;
        (session.user as any).requires2FA = token.requires2FA;
        (session.user as any).authVersion = token.authVersion;
        (session.user as any).settings = token.settings;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/onboarding", // Redirect new users here for disclaimer acceptance
  },
  secret: process.env.NEXTAUTH_SECRET,
};
