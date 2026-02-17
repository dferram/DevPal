import api from './api';
import { ENDPOINTS } from '../constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthStorage } from '@/utils/AuthStorage';

export const AuthService = {
    login: async (email: string, password: string, rememberMe: boolean = true) => {
        try {
            const response = await api.post(ENDPOINTS.AUTH.LOGIN, { email, password });

            if (response.data.user_id) {
                const userData = {
                    ...response.data,
                    email,
                };
                await AuthStorage.saveSession(userData, rememberMe);
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    register: async (nombre: string, apellidos: string, email: string, password: string) => {
        try {
            const response = await api.post(ENDPOINTS.AUTH.REGISTER, {
                nombre,
                apellidos,
                email,
                password
            });

            if (response.data.user_id) {
                const userData = {
                    ...response.data,
                    email,
                };
                await AuthStorage.saveSession(userData, true);
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getProfile: async () => {
        try {
            const userId = await AuthStorage.getUserId();
            if (!userId) throw new Error('No user ID found');

            const response = await api.get(ENDPOINTS.AUTH.ME(userId));
            const data = response.data;

            if (data.avatar_url && data.avatar_url.startsWith('/')) {
                const { BASE_URL } = require('../constants/Config');
                data.avatar_url = `${BASE_URL}${data.avatar_url}`;
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    addProject: async (projectData: {
        titulo: string;
        descripcion: string;
        tecnologias: string[];
        url_repositorio?: string;
        url_demo?: string;
    }) => {
        try {
            const userId = await AuthStorage.getUserId();
            if (!userId) throw new Error('No user ID found');

            const response = await api.post(`${ENDPOINTS.AUTH.ME(userId)}/projects`, projectData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        try {
            await AuthStorage.clearSession();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    },

    updateProfile: async (data: { nombre?: string; apellidos?: string; email?: string; avatar_url?: string }) => {
        try {
            const userId = await AuthStorage.getUserId();
            if (!userId) throw new Error('No user ID found');

            const response = await api.put(`${ENDPOINTS.AUTH.ME(userId)}`, data);

            if (session) {
                const updatedSession = { ...session, ...response.data.user };
            }

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
        try {
            const userId = await AuthStorage.getUserId();
            if (!userId) throw new Error('No user ID found');

            const response = await api.post(`${ENDPOINTS.AUTH.ME(userId)}/password`, {
                current_password: currentPassword,
                new_password: newPassword
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    uploadAvatar: async (imageUri: string) => {
        try {
            const userId = await AuthStorage.getUserId();
            if (!userId) throw new Error('No user ID found');

            const formData = new FormData();
            // @ts-ignore
            formData.append('file', {
                uri: imageUri,
                name: 'avatar.jpg',
                type: 'image/jpeg',
            });

            const response = await api.post(`${ENDPOINTS.AUTH.ME(userId)}/avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getNotifications: async () => {
        try {
            const userId = await AuthStorage.getUserId();
            if (!userId) throw new Error('No user ID found');

            const response = await api.get(`${ENDPOINTS.AUTH.ME(userId)}/notifications`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
