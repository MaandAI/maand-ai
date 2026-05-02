import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { deleteLegacyProfile } from "@/services/legacy.service";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Expecting profileId in query params
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json(
        { error: "Missing profileId parameter." },
        { status: 400 },
      );
    }

    await deleteLegacyProfile(userId, profileId);

    return NextResponse.json({
      success: true,
      message: "Legacy profile securely deleted and audited.",
    });
  } catch (error: any) {
    console.error("Legacy Delete Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
