import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Simplified fetch after removing select:false from model
    const user = await User.findOne({ email: email.toLowerCase() });

    console.log(`[VerifyEmail] Attempt for ${email}`);
    
    if (!user) {
      console.log(`[VerifyEmail] User not found: ${email}`);
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Manual validation for better debugging
    const isOtpMatch = user.emailVerificationOTP === otp;
    const now = new Date();
    const isNotExpired = user.emailVerificationExpires && user.emailVerificationExpires > now;

    console.log(`[VerifyEmail] DB OTP: "${user.emailVerificationOTP}", User OTP: "${otp}"`);
    console.log(`[VerifyEmail] DB Expiry: ${user.emailVerificationExpires}, Now: ${now}`);
    console.log(`[VerifyEmail] Match: ${isOtpMatch}, Not Expired: ${isNotExpired}`);

    if (!isOtpMatch || !isNotExpired) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Mark as verified
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error: any) {
    console.error("[Verify Email API Error]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
