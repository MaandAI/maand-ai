import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, user: any) => Promise<NextResponse>,
  requireAdmin: boolean = false,
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = session.user as any;

    if (requireAdmin && user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admins only" },
        { status: 403 },
      );
    }

    return handler(req, user);
  } catch (error: any) {
    console.error("Auth Middleware Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
