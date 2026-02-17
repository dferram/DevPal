import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    ScrollView,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CodeReviewService } from "@/services/codeReviewService";

const COLORS = {
    darkBg: '#0F172A',
    primaryBlue: '#2563EB',
    codeBg: '#1E293B',
    white: '#FFFFFF',
    textMuted: '#94A3B8',
    success: '#10B981',
};

export default function CodeReviewScreen() {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [review, setReview] = useState<any>(null);

    const handleSubmit = async () => {
        if (!code.trim()) {
            Alert.alert("Campo vacío", "Por favor pega tu código para revisar.");
            return;
        }

        try {
            setLoading(true);
            const language = "python";
            const data = await CodeReviewService.submitReview(code, language);

            if (data.status === "success" && data.review) {
                setReview(data.review);
            }
        } catch (error) {
            console.error("Error submitting code:", error);
            Alert.alert("Error", "No se pudo realizar la revisión.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <StatusBar style="light" />

            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text style={styles.headerTitle}>AI Code Review</Text>
                    <View style={{ width: 24 }} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.instruction}>
                    Pega tu código aquí y obtén retroalimentación instantánea:
                </Text>

                <TextInput
                    style={styles.codeInput}
                    multiline
                    placeholder="// Tu código aquí..."
                    placeholderTextColor={COLORS.textMuted}
                    value={code}
                    onChangeText={setCode}
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <Pressable
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Analizar Código</Text>
                    )}
                </Pressable>

                {review && (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultTitle}>Resultados de la Revisión</Text>

                        <View style={styles.scoreCard}>
                            <Text style={styles.scoreLabel}>Calidad</Text>
                            <Text style={styles.scoreValue}>{review.calidad_codigo}/10</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionHeader}>Análisis</Text>
                            <Text style={styles.sectionText}>{review.comentarios}</Text>
                        </View>

                        {review.sugerencias_optimizacion && (
                            <View style={styles.section}>
                                <Text style={styles.sectionHeader}>Sugerencias</Text>
                                <Text style={styles.sectionText}>{review.sugerencias_optimizacion}</Text>
                            </View>
                        )}

                        {review.codigo_corregido && (
                            <View style={styles.section}>
                                <Text style={styles.sectionHeader}>Código Corregido</Text>
                                <View style={styles.codeBlock}>
                                    <Text style={styles.codeText}>{review.codigo_corregido}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        backgroundColor: COLORS.primaryBlue,
        paddingTop: 48,
        paddingBottom: 16,
        paddingHorizontal: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    instruction: {
        fontSize: 16,
        color: '#334155',
        marginBottom: 12,
    },
    codeInput: {
        backgroundColor: COLORS.codeBg,
        color: COLORS.textMuted,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        padding: 16,
        borderRadius: 12,
        height: 200,
        textAlignVertical: 'top',
        marginBottom: 20,
        fontSize: 14,
    },
    button: {
        backgroundColor: COLORS.primaryBlue,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    resultContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.darkBg,
        marginBottom: 20,
        textAlign: 'center',
    },
    scoreCard: {
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
    },
    scoreLabel: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 4,
    },
    scoreValue: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.primaryBlue,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.darkBg,
        marginBottom: 8,
    },
    sectionText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
    },
    codeBlock: {
        backgroundColor: COLORS.codeBg,
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    codeText: {
        color: '#E2E8F0',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 12,
    },
});
