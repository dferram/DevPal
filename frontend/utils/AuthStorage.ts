import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    USER_ID: 'user_id',
    USER_EMAIL: 'user_email',
    USER_INFO: 'user_info',
    REMEMBER_ME: 'remember_me',
    ASYNC_USER_ID: 'userId',
};

export const AuthStorage = {
    saveSession: async (userData: any, rememberMe: boolean = true) => {
        try {
            await SecureStore.setItemAsync(KEYS.USER_ID, userData.user_id);

            await AsyncStorage.setItem(KEYS.ASYNC_USER_ID, userData.user_id);

            if (rememberMe && userData.email) {
                await SecureStore.setItemAsync(KEYS.USER_EMAIL, userData.email);
            }

            await AsyncStorage.setItem(KEYS.USER_INFO, JSON.stringify(userData));

            await AsyncStorage.setItem(KEYS.REMEMBER_ME, rememberMe.toString());

            console.log('✅ Sesión guardada exitosamente');
        } catch (error) {
            console.error('Error saving session:', error);
            throw error;
        }
    },

    getUserId: async (): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(KEYS.USER_ID);
        } catch (error) {
            console.error('Error getting userId:', error);
            return null;
        }
    },

    getUserEmail: async (): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(KEYS.USER_EMAIL);
        } catch (error) {
            console.error('Error getting email:', error);
            return null;
        }
    },

    getUserInfo: async () => {
        try {
            const userInfoStr = await AsyncStorage.getItem(KEYS.USER_INFO);
            return userInfoStr ? JSON.parse(userInfoStr) : null;
        } catch (error) {
            console.error('Error getting user info:', error);
            return null;
        }
    },

    hasActiveSession: async (): Promise<boolean> => {
        try {
            const userId = await AuthStorage.getUserId();
            return userId !== null;
        } catch (error) {
            return false;
        }
    },

    shouldRemember: async (): Promise<boolean> => {
        try {
            const remember = await AsyncStorage.getItem(KEYS.REMEMBER_ME);
            return remember === 'true';
        } catch (error) {
            return false;
        }
    },

    clearSession: async () => {
        try {
            await SecureStore.deleteItemAsync(KEYS.USER_ID);
            await SecureStore.deleteItemAsync(KEYS.USER_EMAIL);

            await AsyncStorage.removeItem(KEYS.USER_INFO);
            await AsyncStorage.removeItem(KEYS.REMEMBER_ME);
            await AsyncStorage.removeItem(KEYS.ASYNC_USER_ID);

            console.log('✅ Sesión cerrada exitosamente');
        } catch (error) {
            console.error('Error clearing session:', error);
        }
    },
};
