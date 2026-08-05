import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    Animated,
    Easing
} from "react-native";
import { BlurView } from 'expo-blur';
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ChallengesService } from "@/services/challengesService";
import { CodeReviewService } from "@/services/codeReviewService";
import { TabbedLayout } from "@/components/TabbedLayout";
import { CodeEditor } from "@/components/CodeEditor";
import { AIReviewBottomSheet } from "@/components/AIReviewBottomSheet";
import { TestResultsBottomSheet } from "@/components/TestResultsBottomSheet";
import { LanguageSelector } from "@/components/LanguageSelector";
import { HapticManager } from "@/utils/HapticManager";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from "@/constants/designTokens";

export default function ChallengesScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [challenge, setChallenge] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    const [code, setCode] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState<string>("python");
    const [showAIReview, setShowAIReview] = useState(false);
    const [review, setReview] = useState<any>(null);
    const [reviewing, setReviewing] = useState(false);

    const [executing, setExecuting] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [executionResults, setExecutionResults] = useState<any>(null);

    const [activeTab, setActiveTab] = useState(0);
    const indicatorPosition = useRef(new Animated.Value(0)).current;

    const loadChallenge = async () => {
        try {
            setLoading(true);
            const data = await ChallengesService.getToday();
            setChallenge(data);
            const recommendedLang = data.lenguaje_recomendado || "python";
            setSelectedLanguage(recommendedLang);

            const templates = data.templates_lenguajes || {};
            const template = templates[recommendedLang] || "// Tu código aquí";
            setCode(template);
        } catch (error) {
            console.error("Error loading challenge:", error);
            Alert.alert("Error", "No se pudo cargar el desafío del día.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadChallenge();
    }, []);

    const handleComplete = async () => {
        console.log("handleComplete triggered");
        HapticManager.success();
        if (!challenge) return;
        if (!code.trim()) {
            Alert.alert("Campo vacío", "Por favor escribe código antes de enviar.");
            return;
        }

        try {
            setSubmitting(true);
            const executionData = await ChallengesService.executeCode(
                challenge.id,
                code,
                selectedLanguage
            );

            if (executionData.status !== "success" || !executionData.resultados.exito) {
                const { casos_pasados, casos_totales, error_compilacion } = executionData.resultados;
                if (error_compilacion) {
                    Alert.alert("Error en el código", `Tu código tiene errores:\n\n${error_compilacion.substring(0, 200)}...`);
                } else {
                    Alert.alert("Casos de prueba fallidos", `Tu código pasó ${casos_pasados} de ${casos_totales} casos.\n\nRevisa tu solución y vuelve a intentarlo.`);
                }
                setSubmitting(false);
                return;
            }

            await ChallengesService.complete(challenge.id);
            Alert.alert("¡Felicidades!", `Has completado el desafío de hoy.\n\nTodos los casos de prueba pasaron correctamente.`);
            loadChallenge();
        } catch (error) {
            console.error("Error completing challenge:", error);
            Alert.alert("Error", "No se pudo validar el código.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRunCode = async () => {
        console.log("handleRunCode triggered");
        HapticManager.medium();
        if (!code.trim()) {
            Alert.alert("Campo vacío", "Por favor escribe código para ejecutar.");
            return;
        }
        if (!challenge) return;

        try {
            setExecuting(true);
            const data = await ChallengesService.executeCode(
                challenge.id,
                code,
                selectedLanguage
            );

            setExecutionResults(data.resultados);
            setShowResults(true);
        } catch (error) {
            console.error("Error executing code:", error);
            Alert.alert("Error", "No se pudo ejecutar el código.");
        } finally {
            setExecuting(false);
        }
    };

    const handleAIReview = async () => {
        console.log("handleAIReview triggered");
        HapticManager.medium();
        if (!code.trim()) {
            Alert.alert("Campo vacío", "Por favor escribe código para revisar.");
            return;
        }

        try {
            setReviewing(true);
            const data = await CodeReviewService.submitReview(code, selectedLanguage);
            if (data.status === "success" && data.review) {
                setReview(data.review);
                setShowAIReview(true);
            } else if (data.review) {
                setReview(data.review);
                setShowAIReview(true);
            } else {
                Alert.alert("Sin respuesta", "El servicio de IA no devolvió una revisión. Intenta de nuevo.");
            }
        } catch (error: any) {
            console.error("Error reviewing code:", error);
            const errorMessage = error?.response?.data?.detail || 
                error?.message || 
                "No se pudo conectar con el servicio de IA. Verifica tu conexión.";
            Alert.alert("Error de Revisión", errorMessage);
        } finally {
            setReviewing(false);
        }
    };

    const handleLanguageChange = (language: string) => {
        setSelectedLanguage(language);
        const templates = challenge?.templates_lenguajes || {};
        const template = templates[language] || `// Tu código aquí (${language})`;
        setCode(template);
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <StatusBar style="light" />
                <View style={styles.bgGradient} />
                <View style={styles.bgCircle1} />
                <BlurView intensity={30} tint="dark" style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={GLASS.textPrimary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Desafío Diario</Text>
                    <View style={{ width: 40 }} />
                </BlurView>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={GLASS.accent} />
                    <Text style={styles.loadingText}>Generando tu desafío con IA...</Text>
                </View>
            </View>
        );
    }

    if (!challenge) {
        return (
            <View style={styles.container}>
                <StatusBar style="light" />
                <View style={styles.bgGradient} />
                <BlurView intensity={30} tint="dark" style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={GLASS.textPrimary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Desafío Diario</Text>
                    <View style={{ width: 40 }} />
                </BlurView>
                <View style={styles.centerContainer}>
                    <Ionicons name="calendar-outline" size={64} color={GLASS.textSecondary} />
                    <Text style={styles.errorText}>No hay desafío disponible por ahora.</Text>
                </View>
            </View>
        );
    }

    if (challenge.estado === "completado") {
        return (
            <View style={styles.container}>
                <StatusBar style="light" />
                <View style={styles.bgGradient} />
                <View style={styles.bgCircle1} />
                <View style={styles.bgCircle2} />
                <BlurView intensity={30} tint="dark" style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={GLASS.textPrimary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Desafío Diario</Text>
                    <View style={{ width: 40 }} />
                </BlurView>
                <View style={styles.centerContainer}>
                    <View style={styles.completedBanner}>
                        <Ionicons name="checkmark-circle" size={80} color={GLASS.success} />
                        <Text style={styles.completedTitle}>¡Desafío Completado!</Text>
                        <Text style={styles.completedSubtitle}>Ya resolviste el desafío de hoy.{"\n"}Vuelve mañana para un nuevo reto.</Text>
                        <Pressable
                            style={styles.goHomeButton}
                            onPress={() => router.replace('/(tabs)')}
                        >
                            <Ionicons name="home" size={20} color="#FFF" />
                            <Text style={styles.goHomeButtonText}>Ir al Inicio</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    }

    const problemTab = (
        <ScrollView
            style={styles.tabContent}
            contentContainerStyle={styles.tabContentInner}
            showsVerticalScrollIndicator={true}
            bounces={true}
        >
            <BlurView intensity={20} tint="dark" style={styles.glassCard}>
                <View style={styles.problemHeader}>
                    <View style={styles.titleRow}>
                        <Ionicons name="trophy" size={24} color={GLASS.accent} />
                        <Text style={styles.problemTitle}>{challenge.titulo}</Text>
                    </View>

                    <View style={styles.badgesRow}>
                        <View style={[styles.badge, getDifficultyColor(challenge.dificultad)]}>
                            <Text style={styles.badgeText}>{challenge.dificultad}</Text>
                        </View>
                        <View style={styles.xpBadge}>
                            <Ionicons name="star" size={14} color={GLASS.warning} />
                            <Text style={[styles.badgeText, { color: GLASS.warning }]}>
                                +{challenge.xp_recompensa} XP
                            </Text>
                        </View>
                    </View>
                </View>

                {challenge.contexto_negocio && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contexto</Text>
                        <Text style={styles.description}>{challenge.contexto_negocio}</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Problema</Text>
                    <Text style={styles.description}>{challenge.definicion_problema}</Text>
                </View>

                {challenge.casos_prueba?.map((caso: any, index: number) => (
                    <View key={index} style={styles.testCaseCard}>
                        <View style={styles.testCaseHeader}>
                            <Text style={styles.testCaseLabel}>Ejemplo {index + 1}</Text>
                            {caso.tipo === "Edge Case" && (
                                <View style={styles.testTypeEdge}>
                                    <Text style={styles.testTypeText}>{caso.tipo}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.testCaseContent}>
                            <Text style={styles.testCaseKey}>Entrada:</Text>
                            <Text style={styles.testCaseValue}>{caso.input}</Text>
                        </View>
                        <View style={styles.testCaseContent}>
                            <Text style={styles.testCaseKey}>Salida:</Text>
                            <Text style={styles.testCaseValue}>{caso.output}</Text>
                        </View>
                        {caso.explicacion && (
                            <View style={styles.testCaseContent}>
                                <Text style={styles.testCaseKey}>Explicación:</Text>
                                <Text style={styles.testCaseExplanation}>{caso.explicacion}</Text>
                            </View>
                        )}
                    </View>
                ))}

                {challenge.restricciones && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Restricciones</Text>
                        <View style={styles.constraintsRow}>
                            {challenge.restricciones.tiempo && (
                                <View style={styles.constraintCard}>
                                    <Ionicons name="time-outline" size={20} color={GLASS.textSecondary} />
                                    <Text style={styles.constraintLabel}>Tiempo</Text>
                                    <Text style={styles.constraintValue}>{challenge.restricciones.tiempo}</Text>
                                </View>
                            )}
                            {challenge.restricciones.memoria && (
                                <View style={styles.constraintCard}>
                                    <Ionicons name="hardware-chip-outline" size={20} color={GLASS.accent} />
                                    <Text style={styles.constraintLabel}>Memoria</Text>
                                    <Text style={styles.constraintValue}>{challenge.restricciones.memoria}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </BlurView>
        </ScrollView>
    );

    const editorTab = (
        <View style={styles.editorTab}>
            <View style={styles.editorContainer}>
                <CodeEditor
                    code={code}
                    onCodeChange={setCode}
                    language={selectedLanguage}
                    placeholder="// Tu código aquí..."
                    onLanguageChange={handleLanguageChange}
                    availableLanguages={Object.keys(challenge.templates_lenguajes || { 'python': '', 'javascript': '' })}
                />
            </View>

            <BlurView intensity={40} tint="dark" style={styles.actionBar}>
                <Pressable
                    style={({ pressed }) => [styles.actionButton, styles.reviewButton, pressed && { opacity: 0.7 }]}
                    onPress={handleAIReview}
                    disabled={reviewing}
                >
                    {reviewing ? <ActivityIndicator color="#FFF" /> : (
                        <>
                            <Ionicons name="scan-outline" size={18} color="#FFF" />
                            <Text style={styles.actionButtonText}>Analizar</Text>
                        </>
                    )}
                </Pressable>

                <Pressable
                    style={({ pressed }) => [styles.actionButton, styles.runButton, pressed && { opacity: 0.7 }]}
                    onPress={handleRunCode}
                    disabled={executing}
                >
                    {executing ? <ActivityIndicator color="#FFF" /> : (
                        <>
                            <Ionicons name="play" size={18} color="#FFF" />
                            <Text style={styles.actionButtonText}>Ejecutar</Text>
                        </>
                    )}
                </Pressable>

                <Pressable
                    style={({ pressed }) => [styles.actionButton, styles.submitButton, pressed && { opacity: 0.7 }]}
                    onPress={handleComplete}
                    disabled={submitting || challenge.estado === "completado"}
                >
                    {submitting ? <ActivityIndicator color="#FFF" /> : (
                        <>
                            <Ionicons name="checkmark" size={18} color="#FFF" />
                            <Text style={styles.actionButtonText}>Enviar</Text>
                        </>
                    )}
                </Pressable>
            </BlurView>
        </View>
    );

    const tabs = [
        { key: "problem", title: "Problema", content: problemTab },
        { key: "editor", title: "Editor", content: editorTab },
    ];

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style="light" />
            <View style={styles.bgGradient} />
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            <BlurView intensity={30} tint="dark" style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={GLASS.textPrimary} />
                </Pressable>
                <Text style={styles.headerTitle}>Desafío Diario</Text>
                <View style={{ width: 40 }} />
            </BlurView>

            <TabbedLayout tabs={tabs} />

            <AIReviewBottomSheet
                visible={showAIReview}
                onClose={() => setShowAIReview(false)}
                review={review}
            />

            <TestResultsBottomSheet
                visible={showResults}
                onClose={() => setShowResults(false)}
                results={executionResults}
            />
        </KeyboardAvoidingView>
    );
}

const GLASS = {
    bg: 'rgba(30, 41, 59, 0.7)',
    border: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    accent: '#22D3EE',
    inputBg: 'rgba(15, 23, 42, 0.6)',
    danger: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
};

function getDifficultyColor(difficulty: string) {
    switch (difficulty?.toLowerCase()) {
        case "fácil": return { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: GLASS.success };
        case "medio": return { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: GLASS.warning };
        case "difícil": return { backgroundColor: 'rgba(239, 68, 68, 0.2)', borderColor: GLASS.danger };
        default: return { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: GLASS.textSecondary };
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    bgGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0F172A' },
    bgCircle1: { position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: '#2563EB', opacity: 0.1, top: -100, right: -100 },
    bgCircle2: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#22D3EE', opacity: 0.08, bottom: 0, left: -50 },

    header: {
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: GLASS.border,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: GLASS.border,
    },
    headerTitle: {
        color: GLASS.textPrimary,
        fontSize: 20,
        fontWeight: 'bold',
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    loadingText: { color: GLASS.textSecondary },
    errorText: { color: GLASS.textSecondary, marginTop: 16 },

    completedBanner: {
        alignItems: 'center',
        padding: 32,
        gap: 16,
    },
    completedTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: GLASS.success,
        textAlign: 'center',
    },
    completedSubtitle: {
        fontSize: 16,
        color: GLASS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    goHomeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: GLASS.success,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
        marginTop: 16,
    },
    goHomeButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

    tabContent: { flex: 1 },
    tabContentInner: { padding: 16, paddingBottom: 100 },
    glassCard: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: GLASS.border,
        overflow: 'hidden',
    },
    problemHeader: { marginBottom: 24 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    problemTitle: { flex: 1, fontSize: 24, fontWeight: 'bold', color: GLASS.textPrimary },
    badgesRow: { flexDirection: 'row', gap: 8 },
    badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
    badgeText: { fontSize: 12, fontWeight: 'bold', color: GLASS.textPrimary },
    xpBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, gap: 4 },

    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: GLASS.textPrimary, marginBottom: 8 },
    description: { fontSize: 14, color: GLASS.textSecondary, lineHeight: 22 },

    testCaseCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: GLASS.border,
    },
    testCaseHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    testCaseLabel: { color: GLASS.textPrimary, fontWeight: 'bold', fontSize: 14 },
    testTypeEdge: { backgroundColor: 'rgba(245, 158, 11, 0.2)', paddingHorizontal: 8, borderRadius: 4 },
    testTypeText: { color: GLASS.warning, fontSize: 10, fontWeight: 'bold' },
    testCaseContent: { marginBottom: 8 },
    testCaseKey: { color: GLASS.textSecondary, fontSize: 12, marginBottom: 2 },
    testCaseValue: { color: GLASS.accent, fontSize: 13, fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 8 },
    testCaseExplanation: { color: GLASS.textSecondary, fontStyle: 'italic', fontSize: 13 },

    constraintsRow: { flexDirection: 'row', gap: 12 },
    constraintCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: GLASS.border,
        gap: 4,
    },
    constraintLabel: { color: GLASS.textSecondary, fontSize: 12 },
    constraintValue: { color: GLASS.textPrimary, fontWeight: 'bold', fontSize: 14 },

    editorTab: { flex: 1 },
    editorContainer: { flex: 1, padding: 16 },
    actionBar: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        borderColor: GLASS.border,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        zIndex: 1000,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    reviewButton: { backgroundColor: '#8B5CF6' }, // Violet
    runButton: { backgroundColor: '#3B82F6' }, // Blue
    submitButton: { backgroundColor: '#10B981' }, // Green
    actionButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});
