import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, RADIUS, SPACING, ANIMATION } from '@/constants/designTokens';

interface AnimatedToggleProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    activeColor?: string;
    inactiveColor?: string;
    disabled?: boolean;
}

export function AnimatedToggle({
    value,
    onValueChange,
    activeColor = COLORS.primary,
    inactiveColor = COLORS.gray300,
    disabled = false,
}: AnimatedToggleProps) {
    const animation = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.spring(animation, {
            toValue: value ? 1 : 0,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
        }).start();
    }, [value]);

    const handlePress = () => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onValueChange(!value);
    };

    const backgroundColor = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [inactiveColor, activeColor],
    });

    const translateX = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 26],
    });

    return (
        <Pressable
            onPress={handlePress}
            disabled={disabled}
            style={[styles.container, disabled && styles.disabled]}
        >
            <Animated.View style={[styles.track, { backgroundColor }]}>
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            transform: [{ translateX }],
                        },
                    ]}
                />
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 52,
        height: 28,
    },
    track: {
        width: '100%',
        height: '100%',
        borderRadius: RADIUS.full,
        padding: 2,
    },
    thumb: {
        width: 24,
        height: 24,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.backgroundLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    disabled: {
        opacity: 0.5,
    },
});
