import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { AuthService } from '@/services/authService';

const GLASS = {
    bg: 'rgba(30, 41, 59, 0.7)',
    border: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    accent: '#22D3EE',
    inputBg: 'rgba(15, 23, 42, 0.6)',
    danger: '#EF4444',
    success: '#10B981',
};

export default function ChangePasswordScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChangePassword = async () => {
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            Alert.alert("Error", "Todos los campos son obligatorios.");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            Alert.alert("Error", "Las contraseñas nuevas no coinciden.");
            return;
        }

        if (formData.newPassword.length < 6) {
            Alert.alert("Error", "La nueva contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setLoading(true);
        try {
            await AuthService.changePassword(formData.currentPassword, formData.newPassword);
            Alert.alert("Éxito", "Contraseña actualizada correctamente. Por favor inicia sesión nuevamente.", [
                {
                    text: "OK",
                    onPress: async () => {
                        await AuthService.logout();
                        router.replace('/(auth)/login');
                    }
                }
            ]);
        } catch (error: any) {
            console.error("Failed to change password", error);
            const msg = error.response?.data?.detail || "No se pudo cambiar la contraseña. Verifica tu contraseña actual.";
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
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
                <Text style={styles.headerTitle}>Cambiar Contraseña</Text>
                <View style={{ width: 40 }} />
            </BlurView>

            <ScrollView contentContainerStyle={styles.contentParams}>
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Contraseña Actual</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.currentPassword}
                        onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
                        placeholder="********"
                        placeholderTextColor={GLASS.textSecondary}
                        secureTextEntry
                    />

                    <Text style={styles.label}>Nueva Contraseña</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.newPassword}
                        onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
                        placeholder="********"
                        placeholderTextColor={GLASS.textSecondary}
                        secureTextEntry
                    />

                    <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.confirmPassword}
                        onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                        placeholder="********"
                        placeholderTextColor={GLASS.textSecondary}
                        secureTextEntry
                    />

                    <Pressable
                        style={[styles.saveButton, loading && styles.disabledButton]}
                        onPress={handleChangePassword}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#0F172A" />
                        ) : (
                            <Text style={styles.saveButtonText}>Actualizar Contraseña</Text>
                        )}
                    </Pressable>
                </View>
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
    contentParams: {
        padding: 20,
    },
    formContainer: {
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: GLASS.border,
    },
    label: {
        color: GLASS.textSecondary,
        fontSize: 14,
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: GLASS.inputBg,
        borderWidth: 1,
        borderColor: GLASS.border,
        borderRadius: 12,
        padding: 16,
        color: GLASS.textPrimary,
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: GLASS.accent,
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 10,
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#0F172A',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
