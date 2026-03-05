"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface Notification {
  id: string
  type: "milestone" | "model" | "data" | "system"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "read" | "timestamp">) => void
  markAsRead: (id: string) => void
  dismissNotification: (id: string) => void
  clearAll: () => void
  unreadCount: number
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Initialize with some demo notifications
  useEffect(() => {
    const initialNotifications: Notification[] = [
      {
        id: "1",
        type: "milestone",
        title: "Daily Sales Target Achieved!",
        message: "Congratulations! Today's sales exceeded the target by 15%. Great performance!",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false
      },
      {
        id: "2", 
        type: "model",
        title: "Model Performance Updated",
        message: "XGBoost model accuracy maintained at 94.8% with latest training data.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false
      },
      {
        id: "3",
        type: "data",
        title: "New Sales Data Available",
        message: "Latest sales data has been processed and is now available in the dashboard.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        read: true
      },
      {
        id: "4",
        type: "system",
        title: "Dashboard Updated Successfully",
        message: "System has been updated with new features and improvements.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true
      }
    ]
    setNotifications(initialNotifications)
  }, [])

  const addNotification = (notification: Omit<Notification, "id" | "read" | "timestamp">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      timestamp: new Date()
    }
    
    setNotifications(prev => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      dismissNotification,
      clearAll,
      unreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
