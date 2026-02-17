import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/designTokens';

interface ProgressCircleProps {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    color?: string;
    label?: string;
    value?: string | number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ProgressCircle({
    progress,
    size = 80,
    strokeWidth = 6,
    color = COLORS.primary,
    label,
    value,
}: ProgressCircleProps) {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: progress,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, [progress]);

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0],
    });

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={COLORS.gray200}
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>

            <View style={styles.labelContainer}>
                {value && <Text style={styles.value}>{value}</Text>}
                {label && <Text style={styles.label}>{label}</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    labelContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    value: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.textPrimary,
    },
    label: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },
});
