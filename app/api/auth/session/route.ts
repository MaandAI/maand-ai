import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const token =
      request.headers
        .get("cookie")
        ?.split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1] ||
      request.headers
        .get("cookie")
        ?.split("; ")
        .find((row) => row.startsWith("__session="))
        ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);

    return NextResponse.json({
      authenticated: true,
      user: decodedToken,
    });
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, error: "Invalid session" },
      { status: 401 },
    );
  }
}
