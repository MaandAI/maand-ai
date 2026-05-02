import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createLegacyProfile } from "@/services/legacy.service";
import { z } from "zod";

const LegacyInputSchema = z.object({
  name: z.string().min(2, "Name is too short").max(100),
  relationship: z.string(),
  personalityTraits: z.array(z.string()).max(10),
  allowedTopics: z.array(z.string()).max(20),
  consentGiven: z.literal(true),
  expiresAt: z.string().datetime(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const bodyRaw = await req.json();

    const parsed = LegacyInputSchema.safeParse(bodyRaw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const profileId = await createLegacyProfile(userId, parsed.data);

    return NextResponse.json({
      success: true,
      message: "Legacy profile created securely.",
      profileId,
    });
  } catch (error: any) {
    console.error("Legacy Create Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
