import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { deleteLegacyProfile } from "@/services/legacy.service";

export async function DELETE(req: NextRequest) {
  try {
    const token =
      req.cookies.get("token")?.value || req.cookies.get("__session")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

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
