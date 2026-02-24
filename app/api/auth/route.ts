import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token;

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Verify token with Admin SDK
    await adminAuth.verifyIdToken(token);

    const response = NextResponse.json({ success: true }, { status: 200 });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 5,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
