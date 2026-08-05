import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const GLASS = {
    bg: 'rgba(30, 41, 59, 0.7)',
    border: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    accent: '#22D3EE',
};

export default function PrivacyScreen() {
    const router = useRouter();

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
                <Text style={styles.headerTitle}>Política de Privacidad</Text>
                <View style={{ width: 40 }} />
            </BlurView>

            <ScrollView contentContainerStyle={styles.contentParams}>
                <BlurView intensity={20} tint="dark" style={styles.textContent}>
                    <Text style={styles.paragraph}>
                        En DevPal, valoramos tu privacidad. Esta política describe cómo recopilamos, usamos y protegemos tu información personal.
                    </Text>

                    <Text style={styles.heading}>1. Información que Recopilamos</Text>
                    <Text style={styles.paragraph}>
                        Recopilamos información que nos proporcionas directamente, como tu nombre, dirección de correo electrónico y contraseña al registrarte.
                    </Text>

                    <Text style={styles.heading}>2. Uso de la Información</Text>
                    <Text style={styles.paragraph}>
                        Utilizamos la información para operar, mantener y mejorar nuestras funciones, así como para comunicarnos contigo.
                    </Text>

                    <Text style={styles.heading}>3. Compartir Información</Text>
                    <Text style={styles.paragraph}>
                        No compartimos tu información personal con terceros, excepto cuando es necesario para cumplir con la ley o proteger nuestros derechos.
                    </Text>

                    <Text style={styles.heading}>4. Seguridad</Text>
                    <Text style={styles.paragraph}>
                        Implementamos medidas de seguridad para proteger tu información contra acceso no autorizado, alteración o destrucción.
                    </Text>

                    <Text style={styles.footer}>
                        Última actualización: Febrero 2026
                    </Text>
                </BlurView>
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
    textContent: {
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: GLASS.border,
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        color: GLASS.textPrimary,
        marginTop: 20,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 16,
        color: GLASS.textSecondary,
        lineHeight: 24,
        marginBottom: 10,
    },
    footer: {
        fontSize: 14,
        color: GLASS.textSecondary,
        marginTop: 30,
        fontStyle: 'italic',
        opacity: 0.7,
    }
});
