import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendEmailChangeNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { otp } = await req.json();

    if (!otp) {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
    }

    await dbConnect();
    const userId = (session.user as any).id;

    const user = await User.findById(userId).select("+emailChangeOTP +emailChangeOTPExpiry +pendingEmail");

    if (!user || !user.pendingEmail) {
      return NextResponse.json({ error: "No pending email change found" }, { status: 400 });
    }

    if (user.emailChangeOTP !== otp || user.emailChangeOTPExpiry < new Date()) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    const oldEmail = user.email;
    const newEmail = user.pendingEmail;

    // Check the new email isn't taken by another account
    const conflict = await User.findOne({ email: newEmail, _id: { $ne: user._id } });
    if (conflict) {
      user.pendingEmail = undefined;
      user.emailChangeOTP = undefined;
      user.emailChangeOTPExpiry = undefined;
      await user.save();
      return NextResponse.json({ error: "That email address is already in use by another account." }, { status: 400 });
    }

    // Apply the email change
    user.email = newEmail;
    user.isEmailVerified = true;
    user.pendingEmail = undefined;
    user.emailChangeOTP = undefined;
    user.emailChangeOTPExpiry = undefined;
    user.authVersion = (user.authVersion || 0) + 1; // Invalidate other sessions
    
    await user.save();

    // Notify old address
    await sendEmailChangeNotification(oldEmail, user.name, newEmail);

    return NextResponse.json({
      success: true,
      message: "Email address updated successfully.",
    });
  } catch (error: any) {
    console.error("[Email Change Confirm]", error?.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
