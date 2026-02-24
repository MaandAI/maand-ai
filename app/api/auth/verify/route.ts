import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 },
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    return NextResponse.json({
      valid: true,
      uid: decodedToken.uid,
      role: decodedToken.role,
    });
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: "Invalid token" },
      { status: 401 },
    );
  }
}
