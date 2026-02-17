import React, { useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, ScrollView, Easing } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/designTokens';
import { HapticManager } from '@/utils/HapticManager';

interface Tab {
    key: string;
    title: string;
    content: React.ReactNode;
}

interface TabbedLayoutProps {
    tabs: Tab[];
}

export function TabbedLayout({ tabs }: TabbedLayoutProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const animation = useRef(new Animated.Value(0)).current;

    const handleTabPress = (index: number) => {
        HapticManager.light();
        setActiveIndex(index);
        Animated.timing(animation, {
            toValue: index,
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true, // ✅ Ahora sí funcionará bien con transform
        }).start();
    };

    const tabWidth = containerWidth / tabs.length;

    const translateX = animation.interpolate({
        inputRange: tabs.map((_, i) => i),
        outputRange: tabs.map((_, i) => i * tabWidth),
    });

    return (
        <View style={styles.container}>
            <View
                style={styles.tabBar}
                onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
            >
                {tabs.map((tab, index) => (
                    <Pressable
                        key={tab.key}
                        style={[
                            styles.tab,
                            activeIndex === index && styles.tabActive
                        ]}
                        onPress={() => handleTabPress(index)}
                    >
                        <Text style={[
                            styles.tabText,
                            activeIndex === index && styles.tabTextActive
                        ]}>
                            {tab.title}
                        </Text>
                    </Pressable>
                ))}

                {containerWidth > 0 && (
                    <Animated.View
                        style={[
                            styles.indicator,
                            {
                                width: tabWidth,
                                transform: [{ translateX }],
                            },
                        ]}
                    />
                )}
            </View>

            <View style={styles.contentContainer}>
                {tabs[activeIndex].content}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.backgroundLight,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray200,
        position: 'relative',
    },
    tab: {
        flex: 1,
        paddingVertical: SPACING.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabActive: {
    },
    tabText: {
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.regular,
        color: COLORS.textSecondary,
    },
    tabTextActive: {
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.primary,
    },
    indicator: {
        position: 'absolute',
        bottom: 0,
        height: 3,
        backgroundColor: COLORS.primary,
        borderTopLeftRadius: RADIUS.sm,
        borderTopRightRadius: RADIUS.sm,
    },
    contentContainer: {
        flex: 1,
    },
});
