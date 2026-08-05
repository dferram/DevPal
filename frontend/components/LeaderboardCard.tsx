import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '@/constants/designTokens';

interface LeaderboardCardProps {
    ranking: number;
    nombre: string;
    apellidos: string;
    avatar_url: string | null;
    nivel: number;
    xp_total: number;
    racha_dias: number;
    badges_count: number;
    isCurrentUser?: boolean;
    onPress?: () => void;
}

export function LeaderboardCard({
    ranking,
    nombre,
    apellidos,
    avatar_url,
    nivel,
    xp_total,
    racha_dias,
    badges_count,
    isCurrentUser = false,
    onPress
}: LeaderboardCardProps) {

    const getRankingColor = () => {
        if (ranking === 1) return '#FFD700'; // Gold
        if (ranking === 2) return '#C0C0C0'; // Silver
        if (ranking === 3) return '#CD7F32'; // Bronze
        return COLORS.textSecondary;
    };

    const getRankingIcon = () => {
        if (ranking === 1) return 'trophy';
        if (ranking === 2) return 'medal';
        if (ranking === 3) return 'medal-outline';
        return null;
    };

    return (
        <Pressable
            style={[
                styles.card,
                isCurrentUser && styles.cardHighlighted,
                ranking <= 3 && styles.cardPodium
            ]}
            onPress={onPress}
        >
            <View style={[styles.rankingBadge, { borderColor: getRankingColor() }]}>
                {getRankingIcon() ? (
                    <Ionicons name={getRankingIcon() as any} size={20} color={getRankingColor()} />
                ) : (
                    <Text style={[styles.rankingText, { color: getRankingColor() }]}>
                        #{ranking}
                    </Text>
                )}
            </View>

            <View style={styles.avatarContainer}>
                {avatar_url ? (
                    <Image source={{ uri: avatar_url }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={24} color={COLORS.textSecondary} />
                    </View>
                )}
                <View style={styles.nivelBadge}>
                    <Text style={styles.nivelText}>{nivel}</Text>
                </View>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.nombre} numberOfLines={1}>
                    {nombre} {apellidos}
                    {isCurrentUser && <Text style={styles.youTag}> (Tú)</Text>}
                </Text>

                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Ionicons name="star" size={14} color={COLORS.warning} />
                        <Text style={styles.statText}>{xp_total.toLocaleString()} XP</Text>
                    </View>

                    {racha_dias > 0 && (
                        <View style={styles.stat}>
                            <Ionicons name="flame" size={14} color={COLORS.error} />
                            <Text style={styles.statText}>{racha_dias} días</Text>
                        </View>
                    )}

                    {badges_count > 0 && (
                        <View style={styles.stat}>
                            <Ionicons name="ribbon" size={14} color={COLORS.accent} />
                            <Text style={styles.statText}>{badges_count}</Text>
                        </View>
                    )}
                </View>
            </View>

            <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundLight,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.md,
        gap: SPACING.md,
        ...SHADOWS.soft,
    },
    cardHighlighted: {
        backgroundColor: COLORS.primaryAlpha,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    cardPodium: {
        ...SHADOWS.xl,
    },
    rankingBadge: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.full,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.backgroundLight,
    },
    rankingText: {
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.gray200,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.gray200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nivelBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.full,
        minWidth: 24,
        height: 24,
        paddingHorizontal: SPACING.xs,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.backgroundLight,
    },
    nivelText: {
        color: COLORS.textInverse,
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    infoContainer: {
        flex: 1,
        gap: SPACING.xs,
    },
    nombre: {
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.textPrimary,
    },
    youTag: {
        color: COLORS.primary,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    statsRow: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    statText: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.textSecondary,
    },
});
