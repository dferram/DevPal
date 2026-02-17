const DEFAULT_API_BASE_URL =
    'https://devpalbackend-f9ftf7epesfhacer.mexicocentral-01.azurewebsites.net';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `${API_BASE_URL}/api`;

export const BASE_URL = API_BASE_URL;
export { API_URL };

export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        ME: (id: string) => `/auth/me/${id}`,
    },
    NOTICIAS: {
        LIST: '/noticias/',
        GENERATE: '/noticias/generar',
    },
    EVENTOS: {
        LIST: '/eventos/',
        DETAIL: (id: string) => `/eventos/${id}`,
        GENERATE: '/eventos/generar',
        SAVE: (id: string) => `/eventos/${id}/guardar`,
        SAVED: '/eventos/guardados/',
        REGISTER: (id: string) => `/eventos/${id}/registrar`,
    },
    DESAFIOS: {
        TODAY: '/desafios/hoy',
        GENERATE: '/desafios/generar',
        HISTORY: '/desafios/historial',
        COMPLETE: (id: string) => `/desafios/${id}/completar`,
        ABANDON: (id: string) => `/desafios/${id}/abandonar`,
        EXECUTE: (id: string) => `/desafios/${id}/ejecutar`,

    },
    CODE_REVIEW: {
        REVIEW: '/code-review',
        HISTORY: '/code-review/historial',
        HINT: '/code-review/pistas/generar',
    }
};
