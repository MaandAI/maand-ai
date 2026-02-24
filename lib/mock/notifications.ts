// Mock notifications
export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: string
}

export const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Welcome to Maand",
    message: "Your account has been successfully created",
    type: "success",
    read: false,
    createdAt: "2024-03-25T10:00:00Z",
  },
  {
    id: "2",
    title: "New Module Available",
    message: "Check out the new Immersive Therapy Environments module",
    type: "info",
    read: false,
    createdAt: "2024-03-24T15:30:00Z",
  },
  {
    id: "3",
    title: "Session Reminder",
    message: "You have a scheduled session in 1 hour",
    type: "warning",
    read: true,
    createdAt: "2024-03-23T09:00:00Z",
  },
]
