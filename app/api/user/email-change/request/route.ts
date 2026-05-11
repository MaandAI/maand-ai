import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendEmailVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newEmail, currentPassword } = await req.json();

    if (!newEmail || !currentPassword) {
      return NextResponse.json({ error: "New email and current password are required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    await dbConnect();
    const userId = (session.user as any).id;

    // Verify current password
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 400 });
    }

    const normalizedEmail = newEmail.toLowerCase().trim();

    // Check if the new email is already taken
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: "That email address is already in use by another account." },
        { status: 400 }
      );
    }

    if (normalizedEmail === user.email) {
      return NextResponse.json({ error: "New email is the same as your current email." }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.findByIdAndUpdate(userId, {
      $set: {
        pendingEmail: normalizedEmail,
        emailChangeOTP: otp,
        emailChangeOTPExpiry: expiry,
      },
    });

    await sendEmailVerificationEmail(normalizedEmail, user.name, otp);

    return NextResponse.json({
      success: true,
      message: `A verification code has been sent to ${normalizedEmail}. Please check your inbox.`,
    });
  } catch (error: any) {
    console.error("[Email Change Request]", error?.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
