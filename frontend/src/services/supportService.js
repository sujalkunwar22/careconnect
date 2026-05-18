import { Platform } from "react-native";
import client from "./httpClient";

const SupportService = {
    getTickets: async () => {
        const response = await client.get('/support/tickets/');
        return response.data;
    },

    createTicket: async (ticketData) => {
        const formData = new FormData();
        
        // Handle fields
        Object.keys(ticketData).forEach(key => {
            if (key === 'attachment') return; // Handle separately
            if (ticketData[key] !== null && ticketData[key] !== undefined) {
                formData.append(key, ticketData[key]);
            }
        });

        // Handle attachment
        if (ticketData.attachment) {
            if (Platform.OS === 'web') {
                // On web, attachment should be a File or Blob
                // If it's the RN-style object, we need to convert it (though screen should handle it)
                if (ticketData.attachment.uri && !(ticketData.attachment instanceof Blob)) {
                    // Fallback if screen didn't convert
                    console.warn('[SupportService] Attachment is RN-style object on web, converting...');
                    const response = await fetch(ticketData.attachment.uri);
                    const blob = await response.blob();
                    formData.append('attachment', blob, ticketData.attachment.name || 'attachment.jpg');
                } else {
                    formData.append('attachment', ticketData.attachment);
                }
            } else {
                // On React Native, attachment is an object { uri, name, type }
                formData.append('attachment', ticketData.attachment);
            }
        }

        // On Web, we must NOT set Content-Type manually if we want the boundary.
        // On React Native, it's generally safer to let axios handle it too.
        // However, our global axios instance has application/json default.
        // We override it with an empty headers object or delete it.
        const response = await client.post('/support/tickets/', formData, {
            headers: {
                // By setting this to undefined, axios will remove the header
                // from the request and then its internal interceptor for FormData
                // will set the correct multipart/form-data with boundary.
                'Content-Type': undefined,
            }
        });
        return response.data;
    },

    getTicketDetail: async (id) => {
        const response = await client.get(`/support/tickets/${id}/`);
        return response.data;
    }
};

export default SupportService;
