import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;

  const isAuthPage = path.startsWith("/login") || path.startsWith("/signup");
  const isDashboardPage = path.startsWith("/dashboard");
  const isAdminPage = path.startsWith("/admin");

  if (!token && (isDashboardPage || isAdminPage)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token && isAuthPage) {
    const redirectUrl = token.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  if (token && isAdminPage && token.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
  ],
};
