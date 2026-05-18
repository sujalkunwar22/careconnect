import client from "./httpClient";

const UserService = {
    getProfile: async (config = {}) => {
        const response = await client.get('/users/me/', config);
        return response.data;
    },

    updateProfile: async (data) => {
        const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
        const response = await client.patch('/users/me/', data, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
        });
        return response.data;
    },

    changePassword: async (data) => {
        const response = await client.post('/users/me/change-password/', data);
        return response.data;
    },

    submitKYC: async (formData) => {
        const response = await client.post('/users/kyc/submit/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // Backward-compatible alias used by existing screens.
    uploadKyc: async (formData) => {
        const response = await client.post('/users/kyc/submit/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getKYCStatus: async (config = {}) => {
        const response = await client.get('/users/kyc/status/', config);
        return response.data;
    },
};

export default UserService;
