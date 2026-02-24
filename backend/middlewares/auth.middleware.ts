import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "../config/firebase-admin";

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, user: any) => Promise<NextResponse>,
  requireAdmin: boolean = false,
) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid token" },
        { status: 401 },
      );
    }

    const token = authHeader.split("Bearer ")[1];

    // Attempt verification using Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (requireAdmin && decodedToken.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admins only" },
        { status: 403 },
      );
    }

    return handler(req, decodedToken);
  } catch (error: any) {
    console.error("Auth Middleware Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
