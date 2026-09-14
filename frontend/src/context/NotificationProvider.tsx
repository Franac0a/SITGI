import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

export interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  type: 'critical' | 'warning' | 'info' | 'success' | 'inventario'
  read: boolean
  createdAt: string
}

export type NewNotificationInput = {
  id?: string
  title: string
  description: string
  type?: 'critical' | 'warning' | 'info' | 'success' | 'inventario'
  time?: string
  read?: boolean
}

export interface NotificationContextType {
  notifications: NotificationItem[]
  unreadCount: number
  addNotification: (notification: NewNotificationInput) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

const STORAGE_KEY = 'sitgi_notifications'

function formatNotificationTime(date: Date = new Date()): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `Hoy ${hours}:${minutes}`
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // Ignorar errores de parsing inicial
    }
    return []
  })

  // Sincronizar con localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    } catch {
      // Ignorar errores de almacenamiento local
    }
  }, [notifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  const addNotification = (item: NewNotificationInput) => {
    const now = new Date()
    const newNotif: NotificationItem = {
      id:
        item.id ||
        `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: item.title,
      description: item.description,
      time: item.time || formatNotificationTime(now),
      type: item.type || 'success',
      read: item.read ?? false,
      createdAt: now.toISOString(),
    }

    setNotifications((prev) => [newNotif, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error(
      'useNotifications debe ser usado dentro de un NotificationProvider',
    )
  }
  return context
}
