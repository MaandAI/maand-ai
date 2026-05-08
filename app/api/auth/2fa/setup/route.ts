import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { TwoFactorService } from "@/services/two-factor.service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = TwoFactorService.generateSecret();
    const qrCode = await TwoFactorService.generateQRCode(session.user.email!, secret);
    const backupCodes = TwoFactorService.generateBackupCodes();

    return NextResponse.json({ success: true, secret, qrCode, backupCodes });
  } catch (error: any) {
    console.error("[2FA Setup POST]", error?.message ?? error);
    return NextResponse.json(
      { error: error?.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, secret, backupCodes } = await req.json();
    if (!code || !secret) {
      return NextResponse.json({ error: "code and secret are required" }, { status: 400 });
    }

    const isValid = TwoFactorService.verifyToken(code, secret);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    await dbConnect();
    await User.findByIdAndUpdate((session.user as any).id, {
      $set: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        backupCodes: backupCodes ?? [],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[2FA Setup PATCH]", error?.message ?? error);
    return NextResponse.json(
      { error: error?.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    await User.findByIdAndUpdate((session.user as any).id, {
      $set: { twoFactorEnabled: false, twoFactorSecret: null, backupCodes: [] },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[2FA Setup DELETE]", error?.message ?? error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
