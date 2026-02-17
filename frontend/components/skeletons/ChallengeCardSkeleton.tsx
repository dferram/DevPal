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

export function ChallengeCardSkeleton() {
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
            <View style={styles.header}>
                <Animated.View style={[styles.icon, animatedStyle]} />
                <View style={styles.headerText}>
                    <Animated.View style={[styles.title, animatedStyle]} />
                    <Animated.View style={[styles.subtitle, animatedStyle]} />
                </View>
            </View>

            <View style={styles.stats}>
                <Animated.View style={[styles.stat, animatedStyle]} />
                <Animated.View style={[styles.stat, animatedStyle]} />
                <Animated.View style={[styles.stat, animatedStyle]} />
            </View>

            <View style={styles.description}>
                <Animated.View style={[styles.textLine, animatedStyle]} />
                <Animated.View style={[styles.textLineShort, animatedStyle]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.gray800,
        borderRadius: 16,
        padding: SPACING.md,
        marginBottom: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    icon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.gray700,
        marginRight: SPACING.md,
    },
    headerText: {
        flex: 1,
    },
    title: {
        width: '70%',
        height: 18,
        backgroundColor: COLORS.gray700,
        borderRadius: 4,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        width: '50%',
        height: 14,
        backgroundColor: COLORS.gray700,
        borderRadius: 4,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    stat: {
        width: '30%',
        height: 32,
        backgroundColor: COLORS.gray700,
        borderRadius: 8,
    },
    description: {
        marginTop: SPACING.sm,
    },
    textLine: {
        width: '100%',
        height: 14,
        backgroundColor: COLORS.gray700,
        borderRadius: 4,
        marginBottom: SPACING.xs,
    },
    textLineShort: {
        width: '75%',
        height: 14,
        backgroundColor: COLORS.gray700,
        borderRadius: 4,
    },
});
