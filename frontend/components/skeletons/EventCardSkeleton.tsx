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

export function EventCardSkeleton() {
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
            <Animated.View style={[styles.image, animatedStyle]} />

            <View style={styles.content}>
                <Animated.View style={[styles.categoryBadge, animatedStyle]} />

                <Animated.View style={[styles.title, animatedStyle]} />
                <Animated.View style={[styles.titleShort, animatedStyle]} />

                <Animated.View style={[styles.description, animatedStyle]} />
                <Animated.View style={[styles.descriptionShort, animatedStyle]} />

                <View style={styles.footer}>
                    <Animated.View style={[styles.date, animatedStyle]} />
                    <Animated.View style={[styles.attendees, animatedStyle]} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.gray800,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: SPACING.md,
    },
    image: {
        width: '100%',
        height: 180,
        backgroundColor: COLORS.gray700,
    },
    content: {
        padding: SPACING.md,
    },
    categoryBadge: {
        width: 80,
        height: 24,
        backgroundColor: COLORS.gray700,
        borderRadius: 12,
        marginBottom: SPACING.sm,
    },
    title: {
        width: '90%',
        height: 20,
        backgroundColor: COLORS.gray700,
        borderRadius: 4,
        marginBottom: SPACING.xs,
    },
    titleShort: {
        width: '60%',
        height: 20,
        backgroundColor: COLORS.gray700,
        borderRadius: 4,
        marginBottom: SPACING.md,
    },
    description: {
        width: '100%',
        height: 14,
        backgroundColor: COLORS.gray700,
        borderRadius: 4,
        marginBottom: SPACING.xs,
    },
    descriptionShort: {
        width: '80%',
        height: 14,
        backgroundColor: COLORS.gray700,
        borderRadius: 4,
        marginBottom: SPACING.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    date: {
        width: 100,
        height: 16,
        backgroundColor: COLORS.gray700,
        borderRadius: 4,
    },
    attendees: {
        width: 60,
        height: 16,
        backgroundColor: COLORS.gray700,
        borderRadius: 4,
    },
});
