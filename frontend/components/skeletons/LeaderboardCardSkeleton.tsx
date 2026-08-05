import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence
} from 'react-native-reanimated';
import { COLORS, SPACING } from '@/constants/designTokens';

export function LeaderboardCardSkeleton() {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 800 }),
                withTiming(0.3, { duration: 800 })
            ),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value
    }));

    return (
        <View style={styles.card}>
            <Animated.View style={[styles.ranking, animatedStyle]} />

            <Animated.View style={[styles.avatar, animatedStyle]} />

            <View style={styles.userInfo}>
                <Animated.View style={[styles.name, animatedStyle]} />
                <View style={styles.stats}>
                    <Animated.View style={[styles.stat, animatedStyle]} />
                    <Animated.View style={[styles.stat, animatedStyle]} />
                    <Animated.View style={[styles.stat, animatedStyle]} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray800,
        borderRadius: 12,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
    },
    ranking: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.gray700,
        marginRight: SPACING.md,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.gray700,
        marginRight: SPACING.md,
    },
    userInfo: {
        flex: 1,
    },
    name: {
        width: '60%',
        height: 18,
        backgroundColor: COLORS.gray700,
        borderRadius: 4,
        marginBottom: SPACING.sm,
    },
    stats: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    stat: {
        width: 60,
        height: 14,
        backgroundColor: COLORS.gray700,
        borderRadius: 4,
    },
});
