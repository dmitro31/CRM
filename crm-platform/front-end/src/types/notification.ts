export interface AppNotification {
  id: string
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  link: string | null
  isRead: boolean
  createdAt: string
}