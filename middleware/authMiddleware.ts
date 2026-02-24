import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export interface DecodedToken {
  uid: string;
  role?: string;
  exp: number;
}

// Basic edge JWT decoder for Firebase ID Token structure
export function decodeJwtPayload(token: string): DecodedToken | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload) as DecodedToken;
  } catch (error) {
    return null;
  }
}

export function authMiddleware(request: NextRequest) {
  const token =
    request.cookies.get("__session")?.value ||
    request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  const isAuthPage =
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/auth");
  const isDashboardPage = path.startsWith("/dashboard");
  const isAdminPage = path.startsWith("/admin");

  // No token, redirect to login if trying to access protected paths
  if (!token && (isDashboardPage || isAdminPage)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If token is present and trying to hit admin, verify role
  if (token && isAdminPage) {
    const decoded = decodeJwtPayload(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // If token is present and user is on auth page, redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}
