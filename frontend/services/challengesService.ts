import api from './api';
import { ENDPOINTS } from '../constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ChallengesService = {
    getToday: async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) throw new Error('User not logged in');

            const response = await api.get(ENDPOINTS.DESAFIOS.TODAY, {
                params: { usuario_id: userId }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    generate: async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) throw new Error('User not logged in');

            const response = await api.post(ENDPOINTS.DESAFIOS.GENERATE, null, {
                params: { usuario_id: userId }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getHistory: async (limit = 20, state = null) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) throw new Error('User not logged in');

            const params: any = { usuario_id: userId, limite: limit };
            if (state) params.estado = state;

            const response = await api.get(ENDPOINTS.DESAFIOS.HISTORY, { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    complete: async (id: string) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) throw new Error('User not logged in');

            const response = await api.post(ENDPOINTS.DESAFIOS.COMPLETE(id), null, {
                params: { usuario_id: userId }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    abandon: async (id: string) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) throw new Error('User not logged in');

            const response = await api.post(ENDPOINTS.DESAFIOS.ABANDON(id), null, {
                params: { usuario_id: userId }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    executeCode: async (id: string, codigo: string, lenguaje: string) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) throw new Error('User not logged in');

            const response = await api.post(ENDPOINTS.DESAFIOS.EXECUTE(id),
                { codigo, lenguaje },
                { params: { usuario_id: userId } }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
