import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get("token")?.value ||
      request.cookies.get("__session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check role claim or fetch user doc to verify admin
    if (decodedToken.role !== "admin") {
      const userDoc = await adminDb
        .collection("users")
        .doc(decodedToken.uid)
        .get();
      if (!userDoc.exists || userDoc.data()?.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden. Admin access required." },
          { status: 403 },
        );
      }
    }

    // Example admin logic: get all mock users or real users list
    const usersSnapshot = await adminDb.collection("users").limit(50).get();
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Admin API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
