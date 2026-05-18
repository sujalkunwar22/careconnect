import client from "./httpClient";

const JobsService = {
    // Public
    getJobs: async (params, config = {}) => {
        const response = await client.get('/jobs/', { params, ...config });
        return response.data?.results ?? response.data;
    },

    getJobDetail: async (id, config = {}) => {
        const response = await client.get(`/jobs/${id}/`, config);
        return response.data;
    },

    applyForJob: async (jobId, data, headers = {}) => {
        const response = await client.post(`/jobs/${jobId}/apply/`, data, { headers });
        return response.data;
    },

    // Professional
    getMyApplications: async (config = {}) => {
        const response = await client.get('/jobs/applications/me/', config);
        return response.data?.results ?? response.data;
    },

    // NGO
    postJob: async (jobData) => {
        const response = await client.post('/jobs/ngo/create/', jobData);
        return response.data;
    },

    getNgoJobs: async () => {
        const response = await client.get('/jobs/ngo/');
        return response.data?.results ?? response.data;
    },

    getNgoStats: async () => {
        const response = await client.get('/jobs/ngo/stats/');
        return response.data;
    },

    getNgoApplications: async (params) => {
        const response = await client.get('/jobs/ngo/applications/', { params });
        return response.data?.results ?? response.data;
    },

    getNgoApplicationDetail: async (id) => {
        const response = await client.get(`/jobs/ngo/applications/${id}/`);
        return response.data;
    },

    approveApplication: async (id, data) => {
        const response = await client.post(`/jobs/ngo/applications/${id}/approve/`, data);
        return response.data;
    },

    rejectApplication: async (id, data) => {
        const response = await client.post(`/jobs/ngo/applications/${id}/reject/`, data);
        return response.data;
    },

    updateNgoJob: async (id, data) => {
        const response = await client.patch(`/jobs/ngo/${id}/`, data);
        return response.data;
    },

    deleteNgoJob: async (id) => {
        const response = await client.delete(`/jobs/ngo/${id}/delete/`);
        return response.data;
    },
};

export default JobsService;
