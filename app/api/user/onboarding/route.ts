import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { disclaimerAccepted } = await req.json();

    if (!disclaimerAccepted) {
      return NextResponse.json({ error: "Disclaimer must be accepted" }, { status: 400 });
    }

    await dbConnect();
    await User.findByIdAndUpdate((session.user as any).id, {
      disclaimerAccepted: true,
      disclaimerAcceptedAt: new Date(),
      disclaimerVersion: "1.0",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
