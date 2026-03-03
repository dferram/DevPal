import api from './api';
import { ENDPOINTS } from '../constants/Config';
import { handleApiError, ensureArray } from '../utils/errorHandler';

export const NewsService = {
    getAll: async (limit = 50, skip = 0) => {
        try {
            const response = await api.get(ENDPOINTS.NOTICIAS.LIST, {
                params: { limite: limit, skip }
            });
            return ensureArray(response.data);
        } catch (error) {
            throw handleApiError(error);
        }
    },

    generate: async (limit = 50) => {
        try {
            const response = await api.post(ENDPOINTS.NOTICIAS.GENERATE, null, {
                params: { limite: limit }
            });
            return ensureArray(response.data);
        } catch (error) {
            throw handleApiError(error);
        }
    }
};
