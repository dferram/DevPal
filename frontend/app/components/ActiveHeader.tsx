import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const GLASS = {
    bg: 'rgba(30, 41, 59, 0.7)',
    border: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    accent: '#22D3EE',
};

interface ActiveHeaderProps {
    title?: string;
    showSearch?: boolean;
    unreadNotifications?: number;
    userAvatarUrl?: string | null;
    onAccountPress: () => void;
}

export function ActiveHeader({
    title,
    showSearch = true,
    unreadNotifications = 0,
    userAvatarUrl,
    onAccountPress
}: ActiveHeaderProps) {
    const router = useRouter();

    const navigateToSearch = () => router.push('/search');
    const navigateToNotifications = () => router.push('/notifications');

    return (
        <BlurView intensity={20} tint="dark" style={styles.headerGlass}>
            <View style={styles.headerContent}>
                <View style={styles.searchRow}>
                    <Image
                        source={require('@/assets/images/devpal-mascot.png')}
                        style={styles.mascotIcon}
                        resizeMode="contain"
                    />

                    {showSearch ? (
                        <Pressable style={styles.searchContainer} onPress={navigateToSearch}>
                            <Ionicons name="search" size={18} color={GLASS.textSecondary} />
                            <Text style={styles.searchText}>Buscar eventos...</Text>
                        </Pressable>
                    ) : (
                        <View style={{ flex: 1 }} />
                    )}

                    <Pressable
                        style={[styles.iconButton, userAvatarUrl && styles.avatarButton]}
                        onPress={onAccountPress}
                    >
                        {userAvatarUrl ? (
                            <Image source={{ uri: userAvatarUrl }} style={styles.avatarImage} />
                        ) : (
                            <Ionicons name="person-circle-outline" size={28} color={GLASS.textPrimary} />
                        )}
                    </Pressable>

                    <Pressable style={styles.iconButton} onPress={navigateToNotifications}>
                        <Ionicons name="notifications-outline" size={24} color={GLASS.textPrimary} />
                        {unreadNotifications > 0 && <View style={styles.badge} />}
                    </Pressable>
                </View>
            </View>
        </BlurView>
    );
}

const styles = StyleSheet.create({
    headerGlass: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: GLASS.border,
        zIndex: 100,
    },
    headerContent: {},
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    mascotIcon: {
        width: 40,
        height: 40,
    },
    searchContainer: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: GLASS.border,
        gap: 10,
    },
    searchText: {
        color: GLASS.textSecondary,
        fontSize: 14,
    },
    iconButton: {
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: GLASS.border,
    },
    avatarButton: {
        padding: 4,
        borderRadius: 20,
        overflow: 'hidden',
    },
    avatarImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 1,
        borderColor: '#0F172A',
    },
});
