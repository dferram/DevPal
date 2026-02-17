import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Pressable,
    Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GamificationService, LeaderboardEntry, Badge, UserRanking } from '@/services/gamificationService';
import { LeaderboardCard } from '@/components/LeaderboardCard';
import { BadgeCard } from '@/components/BadgeCard';
import { TabbedLayout } from '@/components/TabbedLayout';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '@/constants/designTokens';

export default function LeaderboardScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [userRanking, setUserRanking] = useState<UserRanking | null>(null);

    const [badgesDesbloqueados, setBadgesDesbloqueados] = useState<Badge[]>([]);
    const [badgesProximos, setBadgesProximos] = useState<Badge[]>([]);

    const loadUserData = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            setCurrentUserId(userId);
            return userId;
        } catch (error) {
            console.error('Error loading user data:', error);
            return null;
        }
    };

    const loadLeaderboard = async () => {
        try {
            setLoading(true);
            const data = await GamificationService.getLeaderboard(100, 0);
            setLeaderboard(data);
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            Alert.alert('Error', 'No se pudo cargar el leaderboard');
        } finally {
            setLoading(false);
        }
    };

    const loadUserRanking = async (userId: string) => {
        try {
            const ranking = await GamificationService.getUserRanking(userId);
            setUserRanking(ranking);
        } catch (error) {
            console.error('Error loading user ranking:', error);
        }
    };

    const loadBadges = async (userId: string) => {
        try {
            const badges = await GamificationService.getUserBadges(userId);
            setBadgesDesbloqueados(badges.desbloqueados);
            setBadgesProximos(badges.proximos);
        } catch (error) {
            console.error('Error loading badges:', error);
            Alert.alert('Error', 'No se pudieron cargar los badges');
        }
    };

    const loadAllData = async () => {
        const userId = await loadUserData();
        await loadLeaderboard();

        if (userId) {
            await loadUserRanking(userId);
            await loadBadges(userId);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAllData();
        setRefreshing(false);
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const leaderboardTab = (
        <ScrollView
            style={styles.tabContent}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.scrollContent}
        >
            {userRanking && (
                <View style={styles.userRankingCard}>
                    <View style={styles.rankingHeader}>
                        <Ionicons name="analytics" size={24} color={COLORS.primary} />
                        <Text style={styles.rankingHeaderText}>Tu Posición</Text>
                    </View>

                    <View style={styles.rankingStats}>
                        <View style={styles.rankingStat}>
                            <Text style={styles.rankingStatLabel}>Ranking Global</Text>
                            <Text style={styles.rankingStatValue}>
                                #{userRanking.ranking_global || '?'}
                            </Text>
                        </View>

                        <View style={styles.rankingDivider} />

                        <View style={styles.rankingStat}>
                            <Text style={styles.rankingStatLabel}>XP Total</Text>
                            <Text style={styles.rankingStatValue}>
                                {userRanking.xp_total.toLocaleString()}
                            </Text>
                        </View>

                        <View style={styles.rankingDivider} />

                        <View style={styles.rankingStat}>
                            <Text style={styles.rankingStatLabel}>Percentil</Text>
                            <Text style={styles.rankingStatValue}>
                                Top {userRanking.percentil}%
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            <Text style={styles.sectionTitle}>🏆 Top 100 Developers</Text>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING['3xl'] }} />
            ) : leaderboard.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={64} color={COLORS.textTertiary} />
                    <Text style={styles.emptyText}>No hay usuarios en el ranking aún</Text>
                </View>
            ) : (
                leaderboard.map((entry) => (
                    <LeaderboardCard
                        key={entry.usuario_id}
                        {...entry}
                        isCurrentUser={entry.usuario_id === currentUserId}
                        onPress={() => {
                            console.log('Ver perfil:', entry.usuario_id);
                        }}
                    />
                ))
            )}
        </ScrollView>
    );

    const badgesTab = (
        <ScrollView
            style={styles.tabContent}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.badgesSection}>
                <View style={styles.badgesSectionHeader}>
                    <Ionicons name="ribbon" size={24} color={COLORS.primary} />
                    <Text style={styles.sectionTitle}>
                        Desbloqueados ({badgesDesbloqueados.length})
                    </Text>
                </View>

                {badgesDesbloqueados.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="lock-closed-outline" size={48} color={COLORS.textTertiary} />
                        <Text style={styles.emptyText}>
                            Aún no has desbloqueado badges
                        </Text>
                        <Text style={styles.emptySubtext}>
                            Completa desafíos y asiste a eventos para ganar badges
                        </Text>
                    </View>
                ) : (
                    badgesDesbloqueados.map((badge) => (
                        <BadgeCard
                            key={badge.id}
                            {...badge}
                            desbloqueado={true}
                        />
                    ))
                )}
            </View>

            {badgesProximos.length > 0 && (
                <View style={styles.badgesSection}>
                    <View style={styles.badgesSectionHeader}>
                        <Ionicons name="eye-outline" size={24} color={COLORS.textSecondary} />
                        <Text style={[styles.sectionTitle, { color: COLORS.textSecondary }]}>
                            Próximos Badges
                        </Text>
                    </View>

                    {badgesProximos.map((badge) => (
                        <BadgeCard
                            key={badge.id}
                            {...badge}
                            desbloqueado={false}
                        />
                    ))}
                </View>
            )}
        </ScrollView>
    );

    const tabs = [
        { key: 'leaderboard', title: 'Ranking', content: leaderboardTab },
        { key: 'badges', title: 'Mis Badges', content: badgesTab },
    ];

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Leaderboard</Text>
                    <Pressable style={styles.backButton}>
                        <Ionicons name="trophy" size={24} color="white" />
                    </Pressable>
                </View>
            </View>

            <TabbedLayout tabs={tabs} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 48,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.lg,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: SPACING.xs,
    },
    headerTitle: {
        color: COLORS.textInverse,
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    tabContent: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.xl,
        paddingBottom: 120,
    },
    userRankingCard: {
        backgroundColor: COLORS.backgroundLight,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
        ...SHADOWS.xl,
    },
    rankingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    rankingHeaderText: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.textPrimary,
    },
    rankingStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rankingStat: {
        flex: 1,
        alignItems: 'center',
    },
    rankingStatLabel: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    rankingStatValue: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.primary,
    },
    rankingDivider: {
        width: 1,
        backgroundColor: COLORS.gray200,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.lg,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING['3xl'],
        gap: SPACING.md,
    },
    emptyText: {
        fontSize: TYPOGRAPHY.sizes.base,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.textTertiary,
        textAlign: 'center',
    },
    badgesSection: {
        marginBottom: SPACING['3xl'],
    },
    badgesSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
});
