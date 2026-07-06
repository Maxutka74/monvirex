import api from "../../../shared/api/instance.ts";

export type Notification = {
    id: string
    notification_type: string
    title: string
    message: string
    is_read: boolean
    created_at: string
}

export type NotificationsPaginate = {
    count: number
    next: string | null
    previous: string | null
    notifications: Notification[]
}


const getNotifications = async (): Promise<NotificationsPaginate> => {
    const response = await api.get('/notifications/')

    return response.data
}

const markNotificationAsRead= async (notificationId: string): Promise<void> => {
    await api.patch(`/notifications/${notificationId}/read/`)

}

const markAllNotificationsAsRead = async (): Promise<{updated_count: number}> => {
    const response = await api.patch('/notifications/read-all/')

    return response.data
}

const getUnreadCount = async (): Promise<{unread_count: number}> => {
    const response = await api.get('/notifications/unread-count/')

    return response.data
}



export default {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadCount
}