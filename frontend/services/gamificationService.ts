import api from './api';

export interface LeaderboardEntry {
    ranking: number;
    usuario_id: string;
    nombre: string;
    apellidos: string;
    avatar_url: string | null;
    nivel: number;
    xp_total: number;
    racha_dias: number;
    badges_count: number;
    eventos_asistidos: number;
}

export interface Badge {
    id: string;
    nombre: string;
    descripcion: string;
    icono: string;
    color: string;
    rareza: string;
    xp_bonus?: number;
    desbloqueado_at?: string;
    progreso_actual?: number;
    progreso_total?: number;
}

export interface UserRanking {
    ranking_global: number | null;
    xp_total: number;
    nivel: number;
    percentil: number;
}

export const GamificationService = {
    getLeaderboard: async (limite: number = 100, offset: number = 0, lenguaje?: string): Promise<LeaderboardEntry[]> => {
        try {
            const params: any = { limite, offset };
            if (lenguaje) params.lenguaje = lenguaje;

            const response = await api.get('/gamification/leaderboard', { params });
            return response.data.leaderboard;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            throw error;
        }
    },

    getUserRanking: async (userId: string): Promise<UserRanking> => {
        try {
            const response = await api.get(`/gamification/ranking/${userId}`);
            return response.data.ranking;
        } catch (error) {
            console.error('Error fetching user ranking:', error);
            throw error;
        }
    },

    getUserBadges: async (userId: string): Promise<{ desbloqueados: Badge[], proximos: Badge[] }> => {
        try {
            const response = await api.get(`/gamification/badges/${userId}`);
            return {
                desbloqueados: response.data.desbloqueados,
                proximos: response.data.proximos
            };
        } catch (error) {
            console.error('Error fetching badges:', error);
            throw error;
        }
    },

    verificarBadges: async (userId: string): Promise<Badge[]> => {
        try {
            const response = await api.post(`/gamification/badges/verificar/${userId}`);
            return response.data.nuevos_badges;
        } catch (error) {
            console.error('Error verifying badges:', error);
            throw error;
        }
    },

    getGlobalStats: async (): Promise<any> => {
        try {
            const response = await api.get('/gamification/stats/global');
            return response.data.stats;
        } catch (error) {
            console.error('Error fetching global stats:', error);
            throw error;
        }
    }
};
