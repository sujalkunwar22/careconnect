import client from "./httpClient";

const AdminService = {
    getStats: async () => {
        const response = await client.get('/admin/stats/');
        return response.data;
    },

    // Alias for backward compat
    getVerifierStats: async () => {
        const response = await client.get('/admin/stats/');
        return response.data;
    },

    getUsers: async (params) => {
        const response = await client.get('/admin/users/', { params });
        return response.data?.results ?? response.data;
    },

    updateUser: async (id, data) => {
        const response = await client.patch(`/admin/users/${id}/`, data);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await client.delete(`/admin/users/${id}/delete/`);
        return response.data;
    },

    toggleUserStatus: async (id) => {
        const response = await client.post(`/admin/users/${id}/toggle-status/`);
        return response.data;
    },

    // KYC
    getPendingKYCs: async () => {
        const response = await client.get('/admin/kyc/');
        const payload = response.data;
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.results)) return payload.results;
        return [];
    },

    getKYCDetail: async (id) => {
        const response = await client.get(`/admin/kyc/${id}/`);
        return response.data;
    },

    getUser: async (id) => {
        const response = await client.get(`/admin/users/${id}/`);
        return response.data;
    },

    getUserById: async (id) => {
        return AdminService.getUser(id);
    },

    approveKYC: async (id) => {
        const response = await client.post(`/admin/kyc/${id}/approve/`);
        return response.data;
    },

    rejectKYC: async (id, reason) => {
        const response = await client.post(`/admin/kyc/${id}/reject/`, { rejection_reason: reason });
        return response.data;
    },

    requestKYCInfo: async (id, notes) => {
        const response = await client.post(`/admin/kyc/${id}/request-info/`, { admin_notes: notes });
        return response.data;
    },

    // Jobs
    getJobs: async () => {
        const response = await client.get('/jobs/admin/');
        return response.data?.results ?? response.data;
    },

    toggleJob: async (id) => {
        const response = await client.post(`/jobs/admin/${id}/toggle/`);
        return response.data;
    },

    deleteJob: async (id) => {
        const response = await client.delete(`/jobs/admin/${id}/delete/`);
        return response.data;
    },

    updateJob: async (id, data) => {
        const response = await client.patch(`/jobs/ngo/${id}/`, data);
        return response.data;
    },

    sendNotification: async (data) => {
        const response = await client.post('/admin/notifications/send/', data);
        return response.data;
    },
    // Support Tickets
    getTickets: async (params) => {
        const response = await client.get('/support/admin/tickets/', { params });
        return response.data?.results ?? response.data;
    },
    updateTicket: async (id, data) => {
        const response = await client.patch(`/support/admin/tickets/${id}/`, data);
        return response.data;
    },
    deleteTicket: async (id) => {
        const response = await client.delete(`/support/admin/tickets/${id}/`);
        return response.data;
    },
};

export default AdminService;
