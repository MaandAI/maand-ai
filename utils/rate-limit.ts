import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter using a sliding window
// In production with multiple instances, use Redis (e.g., Upstash)

interface RateLimitStore {
  [ip: string]: number[];
}

const store: RateLimitStore = {};

export function enforceRateLimit(
  req: NextRequest,
  limit: number,
  windowMs: number,
) {
  // Try to get IP, fallback to a general bucket (dangerous in prod without better IP detection)
  const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";

  const now = Date.now();

  if (!store[ip]) {
    store[ip] = [];
  }

  // Filter out timestamps older than the window
  store[ip] = store[ip].filter((timestamp) => now - timestamp < windowMs);

  if (store[ip].length >= limit) {
    return NextResponse.json(
      { error: "Too many requests, please try again later." },
      {
        status: 429,
        headers: { "Retry-After": Math.ceil(windowMs / 1000).toString() },
      },
    );
  }

  // Add current request timestamp
  store[ip].push(now);

  return null; // Passed
}
