import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Switch, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/contexts/AuthContext';

const GLASS = {
    bg: 'rgba(30, 41, 59, 0.7)',
    border: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    accent: '#22D3EE',
    inputBg: 'rgba(15, 23, 42, 0.6)',
    danger: '#EF4444',
};

export default function SettingsScreen() {
    const router = useRouter();
    const { signOut } = useAuth();
    const [notifications, setNotifications] = useState(true);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const savedNotifs = await AsyncStorage.getItem('settings_notifications');
            if (savedNotifs !== null) {
                setNotifications(JSON.parse(savedNotifs));
            }
        } catch (e) {
            console.error("Failed to load settings", e);
        }
    };

    const toggleNotifications = async (value: boolean) => {
        try {
            setNotifications(value);
            await AsyncStorage.setItem('settings_notifications', JSON.stringify(value));
        } catch (e) {
            console.error("Failed to save settings", e);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro que deseas salir?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Salir",
                    style: "destructive",
                    onPress: async () => {
                        await signOut();
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.bgGradient} />
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            <BlurView intensity={30} tint="dark" style={styles.headerGlass}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={GLASS.textPrimary} />
                </Pressable>
                <Text style={styles.headerTitle}>Configuración</Text>
                <View style={{ width: 40 }} />
            </BlurView>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionTitle}>Cuenta</Text>
                <BlurView intensity={20} tint="dark" style={styles.sectionContainer}>
                    <Pressable style={styles.settingItem} onPress={() => router.push('/settings/edit-profile')}>
                        <View style={styles.settingRow}>
                            <View style={styles.iconBox}>
                                <Ionicons name="person-outline" size={20} color={GLASS.accent} />
                            </View>
                            <Text style={styles.settingText}>Editar Perfil</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={GLASS.textSecondary} />
                    </Pressable>
                    <View style={styles.divider} />
                    <Pressable style={styles.settingItem} onPress={() => router.push('/settings/change-password')}>
                        <View style={styles.settingRow}>
                            <View style={styles.iconBox}>
                                <Ionicons name="lock-closed-outline" size={20} color={GLASS.accent} />
                            </View>
                            <Text style={styles.settingText}>Cambiar Contraseña</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={GLASS.textSecondary} />
                    </Pressable>
                </BlurView>

                <Text style={styles.sectionTitle}>Preferencias</Text>
                <BlurView intensity={20} tint="dark" style={styles.sectionContainer}>
                    <View style={styles.settingItem}>
                        <View style={styles.settingRow}>
                            <View style={styles.iconBox}>
                                <Ionicons name="notifications-outline" size={20} color={GLASS.accent} />
                            </View>
                            <Text style={styles.settingText}>Notificaciones</Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={toggleNotifications}
                            trackColor={{ false: '#334155', true: GLASS.accent }}
                            thumbColor={'#FFF'}
                        />
                    </View>
                </BlurView>

                <Text style={styles.sectionTitle}>Acerca de</Text>
                <BlurView intensity={20} tint="dark" style={styles.sectionContainer}>
                    <Pressable style={styles.settingItem} onPress={() => router.push('/settings/terms')}>
                        <View style={styles.settingRow}>
                            <View style={styles.iconBox}>
                                <Ionicons name="document-text-outline" size={20} color={GLASS.accent} />
                            </View>
                            <Text style={styles.settingText}>Términos y Condiciones</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={GLASS.textSecondary} />
                    </Pressable>
                    <View style={styles.divider} />
                    <Pressable style={styles.settingItem} onPress={() => router.push('/settings/privacy')}>
                        <View style={styles.settingRow}>
                            <View style={styles.iconBox}>
                                <Ionicons name="shield-checkmark-outline" size={20} color={GLASS.accent} />
                            </View>
                            <Text style={styles.settingText}>Política de Privacidad</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={GLASS.textSecondary} />
                    </Pressable>
                </BlurView>

                <Pressable style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={GLASS.danger} />
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </Pressable>

                <Text style={styles.versionText}>DevPal v1.0.0</Text>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    bgGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0F172A' },
    bgCircle1: { position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: '#2563EB', opacity: 0.1, top: -100, right: -100 },
    bgCircle2: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#22D3EE', opacity: 0.08, bottom: 200, left: -100 },

    headerGlass: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: GLASS.border,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        zIndex: 10,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: GLASS.textPrimary,
    },
    scrollView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },

    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: GLASS.textSecondary,
        marginBottom: 10,
        marginTop: 20,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: GLASS.border,
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingText: {
        fontSize: 16,
        color: GLASS.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: GLASS.border,
        marginLeft: 64, // Align with text
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        padding: 16,
        borderRadius: 16,
        marginTop: 40,
        gap: 8,
    },
    logoutText: {
        color: GLASS.danger,
        fontSize: 16,
        fontWeight: 'bold',
    },
    versionText: {
        textAlign: 'center',
        color: GLASS.textSecondary,
        fontSize: 12,
        marginTop: 20,
        opacity: 0.5,
    },
});
