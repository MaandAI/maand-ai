// Mock user data for development
export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
  avatar?: string
  createdAt: string
  subscription: "free" | "basic" | "pro" | "enterprise"
  status: "active" | "inactive" | "suspended"
}

export const mockUsers: User[] = [
  {
    id: "1",
    email: "john.doe@example.com",
    name: "John Doe",
    role: "user",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: "2024-01-15",
    subscription: "pro",
    status: "active",
  },
  {
    id: "2",
    email: "jane.smith@example.com",
    name: "Jane Smith",
    role: "user",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: "2024-02-20",
    subscription: "basic",
    status: "active",
  },
  {
    id: "3",
    email: "admin@maand.tech",
    name: "Admin User",
    role: "admin",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: "2023-12-01",
    subscription: "enterprise",
    status: "active",
  },
]

export const getCurrentUser = (): User | null => {
  // Mock: Returns null if not logged in, or a user if logged in
  // In real app, this would check session/token
  if (typeof window !== "undefined") {
    const userId = sessionStorage.getItem("userId")
    return mockUsers.find((u) => u.id === userId) || null
  }
  return null
}
