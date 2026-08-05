import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { HapticManager } from '@/utils/HapticManager';

interface BentoCardProps {
    title: string;
    subtitle?: string;
    icon: keyof typeof Ionicons.glyphMap;
    backgroundColor?: string;
    iconColor?: string;
    onPress?: () => void;
    variant?: '1x1' | '2x1' | '1x2';
    style?: ViewStyle;
}

export function BentoCard({
    title,
    subtitle,
    icon,
    backgroundColor = COLORS.backgroundLight,
    iconColor = COLORS.primary,
    onPress,
    variant = '1x1',
    style,
}: BentoCardProps) {
    const handlePress = () => {
        HapticManager.medium();
        onPress?.();
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                variant === '2x1' && styles.wide,
                variant === '1x2' && styles.tall,
                { backgroundColor },
                pressed && styles.pressed,
                style,
            ]}
            onPress={handlePress}
        >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.primaryAlpha }]}>
                <Ionicons name={icon} size={24} color={iconColor} />
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: RADIUS['2xl'],
        padding: SPACING.lg,
        ...SHADOWS.soft,
        minHeight: 120,
        justifyContent: 'space-between',
    },
    wide: {
        minWidth: '100%',
    },
    tall: {
        minHeight: 240,
    },
    pressed: {
        ...SHADOWS.xl,
        transform: [{ scale: 0.98 }],
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    content: {
        gap: SPACING.xs,
    },
    title: {
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.textSecondary,
    },
});
