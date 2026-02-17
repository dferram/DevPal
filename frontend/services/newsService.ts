import api from './api';
import { ENDPOINTS } from '../constants/Config';

export const NewsService = {
    getAll: async (limit = 50, skip = 0) => {
        try {
            const response = await api.get(ENDPOINTS.NOTICIAS.LIST, {
                params: { limite: limit, skip }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    generate: async (limit = 50) => {
        try {
            const response = await api.post(ENDPOINTS.NOTICIAS.GENERATE, null, {
                params: { limite: limit }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
