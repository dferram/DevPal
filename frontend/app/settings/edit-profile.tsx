import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { AuthService } from '@/services/authService';
import { AuthStorage } from '@/utils/AuthStorage';

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

export default function EditProfileScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        email: '',
        avatar_url: ''
    });

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const userData = await AuthService.getProfile();
            if (userData) {
                setFormData({
                    nombre: userData.nombre || '',
                    apellidos: userData.apellidos || '',
                    email: userData.email || '',
                    avatar_url: userData.avatar_url || ''
                });
            }
        } catch (error) {
            console.error("Failed to load profile", error);
            Alert.alert("Error", "No se pudo cargar la información del perfil.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.nombre || !formData.apellidos || !formData.email) {
            Alert.alert("Error", "Todos los campos son obligatorios.");
            return;
        }

        setSaving(true);
        try {
            await AuthService.updateProfile(formData);
            Alert.alert("Éxito", "Perfil actualizado correctamente.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error("Failed to update profile", error);
            Alert.alert("Error", "No se pudo actualizar el perfil. Inténtalo de nuevo.");
        } finally {
            setSaving(false);
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
                <Text style={styles.headerTitle}>Editar Perfil</Text>
                <View style={{ width: 40 }} />
            </BlurView>

            <ScrollView contentContainerStyle={styles.contentParams}>
                {loading ? (
                    <ActivityIndicator size="large" color={GLASS.accent} style={{ marginTop: 50 }} />
                ) : (
                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Correo Electrónico</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholder="tu@email.com"
                            placeholderTextColor={GLASS.textSecondary}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>Nombre</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.nombre}
                            onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                            placeholder="Tu nombre"
                            placeholderTextColor={GLASS.textSecondary}
                        />

                        <Text style={styles.label}>Apellidos</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.apellidos}
                            onChangeText={(text) => setFormData({ ...formData, apellidos: text })}
                            placeholder="Tus apellidos"
                            placeholderTextColor={GLASS.textSecondary}
                        />

                        <Pressable
                            style={[styles.saveButton, saving && styles.disabledButton]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#0F172A" />
                            ) : (
                                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                            )}
                        </Pressable>
                    </View>
                )}
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
