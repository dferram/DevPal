import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '@/constants/designTokens';

interface ExpandableEventCardProps {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    category: string;
    onViewDetails?: () => void;
}

export function ExpandableEventCard({
    id,
    title,
    date,
    time,
    location,
    category,
    onViewDetails,
}: ExpandableEventCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [animation] = useState(new Animated.Value(0));

    const toggleExpand = () => {
        const toValue = isExpanded ? 0 : 1;
        Animated.spring(animation, {
            toValue,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
        }).start();
        setIsExpanded(!isExpanded);
    };

    const expandHeight = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 180],
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="calendar" size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                </View>

                <Pressable style={styles.expandButton} onPress={toggleExpand}>
                    <Text style={styles.expandText}>Más info</Text>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={COLORS.textSecondary}
                    />
                </Pressable>
            </View>

            <Animated.View style={[styles.expandedContent, { height: expandHeight, opacity: animation }]}>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.detailText}>{date}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.detailText}>{time}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.detailText}>{location}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="pricetag-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.detailText}>{category}</Text>
                </View>

                {onViewDetails && (
                    <Pressable style={styles.viewButton} onPress={onViewDetails}>
                        <Text style={styles.viewButtonText}>Ver evento</Text>
                    </Pressable>
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS['2xl'],
        marginBottom: SPACING.md,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: SPACING.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.backgroundLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        flex: 1,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.textInverse,
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundLight,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.xl,
        gap: SPACING.xs,
    },
    expandText: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.textSecondary,
        fontWeight: TYPOGRAPHY.weights.regular,
    },
    expandedContent: {
        backgroundColor: COLORS.backgroundLight,
        paddingHorizontal: SPACING.lg,
        overflow: 'hidden',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.sm,
    },
    detailText: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.textPrimary,
    },
    viewButton: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.md,
        paddingVertical: SPACING.md,
        alignItems: 'center',
        marginTop: SPACING.sm,
        marginBottom: SPACING.md,
    },
    viewButtonText: {
        color: COLORS.textInverse,
        fontWeight: TYPOGRAPHY.weights.semibold,
        fontSize: TYPOGRAPHY.sizes.sm,
    },
});
