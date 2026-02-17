import api from './api';
import { ENDPOINTS } from '../constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CodeReviewService = {
    submitReview: async (code: string, language: string) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const currentUserId = userId || 'temp_user_id';

            const response = await api.post(ENDPOINTS.CODE_REVIEW.REVIEW, {
                codigo: code,
                lenguaje: language,
                usuario_id: currentUserId
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getHistory: async (limit = 20, language = null) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) throw new Error('User not logged in');

            const params: any = { usuario_id: userId, limite: limit };
            if (language) params.lenguaje = language;

            const response = await api.get(ENDPOINTS.CODE_REVIEW.HISTORY, { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getHint: async (code: string, language: string) => {
        try {
            const response = await api.post(ENDPOINTS.CODE_REVIEW.HINT, {
                codigo: code,
                lenguaje: language
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
