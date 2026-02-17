import api from './api';
import { ENDPOINTS } from '../constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const EventsService = {
    getAll: async (category: string | null = null, limit: number = 50, skip: number = 0) => {
        try {
            const params: any = { limite: limit, skip };
            if (category) params.categoria = category;

            const response = await api.get(ENDPOINTS.EVENTOS.LIST, { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getDetail: async (id: string) => {
        try {
            const response = await api.get(ENDPOINTS.EVENTOS.DETAIL(id));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getSaved: async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) throw new Error('User not logged in');

            const response = await api.get(ENDPOINTS.EVENTOS.SAVED, {
                params: { usuario_id: userId }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    generate: async (limit = 15) => {
        try {
            const response = await api.post(ENDPOINTS.EVENTOS.GENERATE, null, {
                params: { limite: limit }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    save: async (id: string) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) throw new Error('User not logged in');

            const response = await api.post(ENDPOINTS.EVENTOS.SAVE(id), null, {
                params: { usuario_id: userId }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    unsave: async (id: string) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) throw new Error('User not logged in');

            const response = await api.delete(ENDPOINTS.EVENTOS.SAVE(id), {
                params: { usuario_id: userId }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    register: async (id: string) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) throw new Error('User not logged in');

            const response = await api.post(ENDPOINTS.EVENTOS.REGISTER(id), null, {
                params: { usuario_id: userId }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
