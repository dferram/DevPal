import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '@/constants/designTokens';

interface BadgeCardProps {
    nombre: string;
    descripcion: string;
    icono: string;
    color: string;
    rareza: string;
    xp_bonus?: number;
    desbloqueado?: boolean;
    progreso_actual?: number;
    progreso_total?: number;
}

export function BadgeCard({
    nombre,
    descripcion,
    icono,
    color,
    rareza,
    xp_bonus,
    desbloqueado = false,
    progreso_actual = 0,
    progreso_total = 100
}: BadgeCardProps) {

    const getRarezaStyle = () => {
        switch (rareza) {
            case 'Legendario':
                return { backgroundColor: '#FFD700', borderColor: '#FFA500' };
            case 'Épico':
                return { backgroundColor: '#8B5CF6', borderColor: '#7C3AED' };
            case 'Raro':
                return { backgroundColor: '#3B82F6', borderColor: '#2563EB' };
            default:
                return { backgroundColor: '#10B981', borderColor: '#059669' };
        }
    };

    const progresoPercent = progreso_total > 0 ? (progreso_actual / progreso_total) * 100 : 0;

    return (
        <View style={[
            styles.card,
            !desbloqueado && styles.cardLocked
        ]}>

            <View style={[
                styles.iconContainer,
                { backgroundColor: color + '20', borderColor: color }
            ]}>
                <Ionicons
                    name={icono as any}
                    size={32}
                    color={desbloqueado ? color : COLORS.gray400}
                />
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.nombre} numberOfLines={1}>{nombre}</Text>
                <Text style={styles.descripcion} numberOfLines={2}>{descripcion}</Text>

                <View style={[styles.rarezaBadge, getRarezaStyle()]}>
                    <Text style={styles.rarezaText}>{rareza}</Text>
                </View>

                {desbloqueado && xp_bonus && xp_bonus > 0 && (
                    <View style={styles.xpBonus}>
                        <Ionicons name="star" size={12} color={COLORS.warning} />
                        <Text style={styles.xpBonusText}>+{xp_bonus} XP</Text>
                    </View>
                )}

                {!desbloqueado && progreso_total > 0 && (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${progresoPercent}%`, backgroundColor: color }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {progreso_actual} / {progreso_total}
                        </Text>
                    </View>
                )}
            </View>

            {!desbloqueado && (
                <View style={styles.lockContainer}>
                    <Ionicons name="lock-closed" size={20} color={COLORS.textTertiary} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.backgroundLight,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.md,
        gap: SPACING.md,
        ...SHADOWS.soft,
    },
    cardLocked: {
        opacity: 0.7,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    infoContainer: {
        flex: 1,
        gap: SPACING.xs,
    },
    nombre: {
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.textPrimary,
    },
    descripcion: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    rarezaBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
        borderWidth: 1,
    },
    rarezaText: {
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.textInverse,
    },
    xpBonus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        marginTop: SPACING.xs,
    },
    xpBonusText: {
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.warning,
    },
    progressContainer: {
        marginTop: SPACING.xs,
        gap: SPACING.xs,
    },
    progressBar: {
        height: 6,
        backgroundColor: COLORS.gray200,
        borderRadius: RADIUS.sm,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: RADIUS.sm,
    },
    progressText: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.textSecondary,
        textAlign: 'right',
    },
    lockContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: SPACING.sm,
    },
});
