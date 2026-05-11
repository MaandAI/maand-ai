import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;

  // Define public routes (Marketing & Auth)
  const isPublicRoute =
    path === "/" ||
    path.startsWith("/about") ||
    path.startsWith("/pricing") ||
    path.startsWith("/modules") ||
    path.startsWith("/contact") ||
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/verify-email") ||
    path.startsWith("/api/modules"); // Specifically requested public modules endpoint

  const isAuthPage = path.startsWith("/login") || path.startsWith("/signup");
  const isAdminPage =
    path.startsWith("/admin") || path.startsWith("/api/admin");
  const isTherapistPage =
    path.startsWith("/therapist") || path.startsWith("/api/therapist");
  const isDashboardPage =
    path.startsWith("/dashboard") || path.startsWith("/api/chat");

  // 1. Redirect unauthenticated users from protected routes
  if (!token && !isPublicRoute) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. 2FA Enforcement: If 2FA is required, redirect to 2FA verification page
  if (
    token &&
    (token as any).requires2FA &&
    path !== "/auth/2fa" &&
    !path.startsWith("/api/auth")
  ) {
    // Allow logout during 2FA
    if (path !== "/api/auth/signout") {
      return NextResponse.redirect(new URL("/auth/2fa", req.url));
    }
  }

  // 3. Redirect authenticated users away from auth pages
  if (token && isAuthPage && !(token as any).requires2FA) {
    const redirectUrl = token.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  // 4. RBAC: Only Admin can access /admin
  if (token && isAdminPage && token.role !== "admin") {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 5. RBAC: Therapist and Admin can access /therapist
  if (
    token &&
    isTherapistPage &&
    token.role !== "therapist" &&
    token.role !== "admin"
  ) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)",
  ],
};
