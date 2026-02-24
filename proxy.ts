import { authMiddleware } from "@/middleware/authMiddleware";

export default authMiddleware;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/auth/:path*",
  ],
};
