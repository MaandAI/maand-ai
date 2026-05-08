import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { TwoFactorService } from "@/services/two-factor.service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
    }

    await dbConnect();
    const userId = (session.user as any).id;
    const user = await User.findById(userId).select("+twoFactorSecret +backupCodes");

    if (!user || !user.twoFactorEnabled) {
      return NextResponse.json({ error: "2FA is not enabled for this account" }, { status: 400 });
    }

    // Check TOTP
    const isValid = TwoFactorService.verifyToken(code, user.twoFactorSecret);
    
    // Check Backup Codes if TOTP fails
    let isBackupValid = false;
    if (!isValid && user.backupCodes.includes(code)) {
      isBackupValid = true;
      // Remove used backup code
      user.backupCodes = user.backupCodes.filter((c: string) => c !== code);
      await user.save();
    }

    if (!isValid && !isBackupValid) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    // Success: Return a flag to update the session/JWT via client-side update()
    return NextResponse.json({
      success: true,
      message: "2FA verified successfully"
    });
  } catch (error: any) {
    console.error("2FA Verification Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
