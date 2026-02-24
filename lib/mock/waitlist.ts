// Mock waitlist data
export interface WaitlistEntry {
  id: string
  name: string
  email: string
  interest: string
  message?: string
  joinedAt: string
  priority: "high" | "medium" | "low"
  status: "pending" | "contacted" | "converted"
}

export const mockWaitlist: WaitlistEntry[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    interest: "Individual Use",
    message: "Looking forward to the launch!",
    joinedAt: "2024-03-15",
    priority: "high",
    status: "contacted",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    email: "dr.chen@clinic.com",
    interest: "Professional/Clinical Use",
    joinedAt: "2024-03-18",
    priority: "high",
    status: "pending",
  },
  {
    id: "3",
    name: "Prof. Emma Williams",
    email: "e.williams@university.edu",
    interest: "Research Partnership",
    message: "Interested in collaboration opportunities",
    joinedAt: "2024-03-20",
    priority: "high",
    status: "contacted",
  },
]
