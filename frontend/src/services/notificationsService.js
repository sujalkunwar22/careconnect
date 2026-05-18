import client from "./httpClient";

const NotificationsService = {
    getNotifications: async () => {
        const response = await client.get('/notifications/');
        return response.data?.results ?? response.data;
    },

    markAsRead: async (id) => {
        const response = await client.patch(`/notifications/${id}/read/`);
        return response.data;
    },

    markAllRead: async () => {
        const response = await client.post('/notifications/read-all/');
        return response.data;
    },

    getUnreadCount: async () => {
        const response = await client.get('/notifications/unread-count/');
        return response.data;
    },
};

export default NotificationsService;
