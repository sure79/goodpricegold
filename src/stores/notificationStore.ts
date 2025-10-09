import { create } from 'zustand'
import type { Notification } from '@/types'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(n => !n.is_read).length
    set({ notifications, unreadCount })
  },
  addNotification: (notification) => {
    const { notifications } = get()
    const newNotifications = [notification, ...notifications]
    const unreadCount = newNotifications.filter(n => !n.is_read).length
    set({ notifications: newNotifications, unreadCount })
  },
  markAsRead: (id) => {
    const { notifications } = get()
    const updatedNotifications = notifications.map(n =>
      n.id === id ? { ...n, is_read: true } : n
    )
    const unreadCount = updatedNotifications.filter(n => !n.is_read).length
    set({ notifications: updatedNotifications, unreadCount })
  },
  markAllAsRead: () => {
    const { notifications } = get()
    const updatedNotifications = notifications.map(n => ({ ...n, is_read: true }))
    set({ notifications: updatedNotifications, unreadCount: 0 })
  },
}))