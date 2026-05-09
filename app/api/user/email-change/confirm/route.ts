import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendEmailChangeNotification } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", process.env.NEXTAUTH_URL!)
      );
    }

    await dbConnect();
    const user = await User.findOne({
      emailChangeToken: token,
      emailChangeTokenExpiry: { $gt: new Date() },
    }).select("+emailChangeToken +emailChangeTokenExpiry +pendingEmail");

    if (!user || !user.pendingEmail) {
      return NextResponse.redirect(
        new URL("/login?error=expired_token", process.env.NEXTAUTH_URL!)
      );
    }

    const oldEmail = user.email;
    const newEmail = user.pendingEmail;

    // Check the new email isn't taken by another account
    const conflict = await User.findOne({ email: newEmail, _id: { $ne: user._id } });
    if (conflict) {
      await User.findByIdAndUpdate(user._id, {
        $unset: { pendingEmail: "", emailChangeToken: "", emailChangeTokenExpiry: "" },
      });
      return NextResponse.redirect(
        new URL("/dashboard/profile?error=email_taken", process.env.NEXTAUTH_URL!)
      );
    }

    // Apply the email change
    await User.findByIdAndUpdate(user._id, {
      $set: {
        email: newEmail,
        isEmailVerified: true,
        authVersion: (user.authVersion || 0) + 1, // Invalidate other sessions
      },
      $unset: {
        pendingEmail: "",
        emailChangeToken: "",
        emailChangeTokenExpiry: "",
      },
    });

    // Notify old address
    await sendEmailChangeNotification(oldEmail, user.name, newEmail);

    // Redirect to profile with success
    return NextResponse.redirect(
      new URL("/dashboard/profile?success=email_changed", process.env.NEXTAUTH_URL!)
    );
  } catch (error: any) {
    console.error("[Email Change Confirm]", error?.message);
    return NextResponse.redirect(
      new URL("/login?error=server_error", process.env.NEXTAUTH_URL!)
    );
  }
}
