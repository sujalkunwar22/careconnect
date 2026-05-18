import client from "./httpClient";

const PortfolioService = {
    getPortfolio: async (config = {}) => {
        const response = await client.get('/portfolio/', config);
        return response.data;
    },

    // Experience
    getExperiences: async () => {
        const response = await client.get('/portfolio/experiences/');
        return response.data?.results ?? response.data;
    },
    // Helper to normalize data for backend
    _normalize: (data, type) => {
        const normalized = { ...data };
        
        // Handle Years (Education)
        if (type === 'education') {
            if (normalized.startYear) normalized.start_year = parseInt(normalized.startYear);
            if (normalized.endYear) normalized.end_year = parseInt(normalized.endYear);
            if (normalized.start_year) normalized.start_year = parseInt(normalized.start_year);
            if (normalized.end_year) normalized.end_year = parseInt(normalized.end_year);
        }

        // Handle Dates (Experience, Certification)
        const dateFields = ['start_date', 'end_date', 'startDate', 'endDate', 'issue_date', 'date'];
        dateFields.forEach(field => {
            if (normalized[field] && typeof normalized[field] === 'string') {
                const val = normalized[field].trim();
                // If it's just a year "2023", make it "2023-01-01"
                if (/^\d{4}$/.test(val)) {
                    normalized[field] = `${val}-01-01`;
                }
                // If it's "Month YYYY", try to guess or just leave it for now
                // A better fix would be a date picker, but let's at least handle years.
            }
        });

        return normalized;
    },

    addExperience: async (data) => {
        const response = await client.post('/portfolio/experiences/', PortfolioService._normalize(data, 'experience'));
        return response.data;
    },
    updateExperience: async (id, data) => {
        const response = await client.patch(`/portfolio/experiences/${id}/`, PortfolioService._normalize(data, 'experience'));
        return response.data;
    },
    deleteExperience: async (id) => {
        const response = await client.delete(`/portfolio/experiences/${id}/`);
        return response.data;
    },

    // Education
    getEducation: async () => {
        const response = await client.get('/portfolio/education/');
        return response.data?.results ?? response.data;
    },
    addEducation: async (data) => {
        const response = await client.post('/portfolio/education/', PortfolioService._normalize(data, 'education'));
        return response.data;
    },
    updateEducation: async (id, data) => {
        const response = await client.patch(`/portfolio/education/${id}/`, PortfolioService._normalize(data, 'education'));
        return response.data;
    },
    deleteEducation: async (id) => {
        const response = await client.delete(`/portfolio/education/${id}/`);
        return response.data;
    },

    // Certifications
    getCertifications: async () => {
        const response = await client.get('/portfolio/certifications/');
        return response.data?.results ?? response.data;
    },
    addCertification: async (data) => {
        const response = await client.post('/portfolio/certifications/', PortfolioService._normalize(data, 'certification'));
        return response.data;
    },
    updateCertification: async (id, data) => {
        const response = await client.patch(`/portfolio/certifications/${id}/`, PortfolioService._normalize(data, 'certification'));
        return response.data;
    },
    deleteCertification: async (id) => {
        const response = await client.delete(`/portfolio/certifications/${id}/`);
        return response.data;
    },

    // Activities (care logs)
    getActivities: async (config = {}) => {
        const response = await client.get('/portfolio/activities/', config);
        return response.data?.results ?? response.data;
    },
    addActivity: async (data) => {
        const response = await client.post('/portfolio/activities/', data);
        return response.data;
    },
    getPendingActivities: async () => {
        const response = await client.get('/portfolio/activities/pending/');
        return response.data?.results ?? response.data;
    },
    verifyActivity: async (id, action) => {
        const response = await client.post(`/portfolio/activities/${id}/${action}/`);
        return response.data;
    },
    getSummaryStats: async () => {
        const response = await client.get('/portfolio/activities/stats/');
        return response.data;
    },

    // Screen compatibility alias
    getCertificates: async () => {
        const response = await client.get('/portfolio/certifications/');
        const rows = response.data?.results ?? response.data ?? [];
        if (!Array.isArray(rows)) return [];
        return rows.map((row) => ({
            ...row,
            title: row.title || row.name,
            issued_by: row.issued_by || row.issuing_organization,
        }));
    },
};

export default PortfolioService;
