import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/Config';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000,
});

api.interceptors.request.use(
    async (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        if (__DEV__) {
            console.log('API Response:', response.config.method?.toUpperCase(), response.config.url);
        }
        return response;
    },
    (error) => {
        if (error.response) {
            console.error('API Error:', {
                status: error.response.status,
                url: error.config?.url,
                data: error.response.data
            });

            if (error.response.status === 401) {
                console.error('No autorizado - Verifica tus credenciales');
            } else if (error.response.status === 404) {
                console.error('Endpoint no encontrado - Verifica la URL');
            } else if (error.response.status === 500) {
                console.error('Error del servidor - Revisa los logs del backend');
            } else if (error.response.status === 503) {
                console.error('Servicio no disponible - ¿Está corriendo el backend?');
            }
        } else if (error.request) {
            console.error('Network Error - No se pudo conectar al backend');
            console.error('Detalles del error:', {
                message: error.message,
                baseURL: API_URL,
            });
            console.error('');
            console.error('SOLUCIONES POSIBLES:');
            console.error('  1. ¿Está corriendo el backend? (uvicorn app.main:app --reload --host 0.0.0.0)');
            console.error('  2. ¿La IP en Config.ts es correcta?');
            console.error('  3. ¿Tu dispositivo está en la misma red WiFi?');
            console.error('  4. ¿El firewall está bloqueando el puerto 8000?');
            console.error('');

            if (error.code === 'ECONNABORTED') {
                console.error('Timeout - El servidor tardó demasiado en responder');
            }
            if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
                console.error('Conexión rechazada - Backend no disponible en:', API_URL);
            }
        } else {
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
