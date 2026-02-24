// Mock authentication utilities
// In production, replace with real authentication (Supabase Auth, NextAuth, etc.)

import { mockUsers, type User } from "./mock/users"

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

export async function login(email: string, password: string): Promise<AuthResult> {
  // Mock delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Simple mock validation - in production, this would verify against real backend
  const user = mockUsers.find((u) => u.email === email)

  if (!user) {
    return { success: false, error: "Invalid email or password" }
  }

  // In production, verify password hash here
  if (password.length < 6) {
    return { success: false, error: "Invalid email or password" }
  }

  // Store user session (mock implementation)
  if (typeof window !== "undefined") {
    sessionStorage.setItem("userId", user.id)
    sessionStorage.setItem("userRole", user.role)
  }

  return { success: true, user }
}

export async function signup(name: string, email: string, password: string): Promise<AuthResult> {
  // Mock delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Check if user already exists
  const existingUser = mockUsers.find((u) => u.email === email)
  if (existingUser) {
    return { success: false, error: "An account with this email already exists" }
  }

  // Create new user (mock - in production, this would save to database)
  const newUser: User = {
    id: String(mockUsers.length + 1),
    email,
    name,
    role: "user",
    createdAt: new Date().toISOString(),
    subscription: "free",
    status: "active",
  }

  // Store user session
  if (typeof window !== "undefined") {
    sessionStorage.setItem("userId", newUser.id)
    sessionStorage.setItem("userRole", newUser.role)
  }

  return { success: true, user: newUser }
}

export async function logout(): Promise<void> {
  // Mock delay to simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Clear session
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("userId")
    sessionStorage.removeItem("userRole")
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem("userId") !== null
}

export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem("userId")
}

export function getCurrentUserRole(): "user" | "admin" | null {
  if (typeof window === "undefined") return null
  const role = sessionStorage.getItem("userRole")
  return role as "user" | "admin" | null
}
