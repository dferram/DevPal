import React from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '@/constants/designTokens';

interface AIReviewBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    review: {
        resumen_ejecutivo?: string;
        puntos_fuertes_json?: string[];
        oportunidades_mejora_json?: string[];
        optimizacion_json?: {
            codigo_sugerido?: string;
            explicacion?: string;
        };
        pista_conceptual?: string;
        calidad_codigo?: number;
        comentarios?: string;
        sugerencias_optimizacion?: string;
        codigo_corregido?: string;
    } | null;
}

export function AIReviewBottomSheet({ visible, onClose, review }: AIReviewBottomSheetProps) {
    if (!review) return null;

    const resumen = review.resumen_ejecutivo || review.comentarios || 'Sin análisis disponible';
    const puntosFuertes = review.puntos_fuertes_json || [];
    const oportunidades = review.oportunidades_mejora_json || [];
    const optimizacion = review.optimizacion_json;
    const pista = review.pista_conceptual;
    const codigoCorregido = optimizacion?.codigo_sugerido || review.codigo_corregido;
    
    const score = review.calidad_codigo || 
        Math.min(10, Math.max(1, 5 + puntosFuertes.length - oportunidades.length));

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.dragHandle} />

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.header}>
                            <Text style={styles.title}>Revisión de IA</Text>
                            <Pressable onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                            </Pressable>
                        </View>

                        <View style={styles.scoreCard}>
                            <Ionicons name="star" size={32} color={COLORS.warning} />
                            <View style={styles.scoreInfo}>
                                <Text style={styles.scoreLabel}>Calidad del Código</Text>
                                <Text style={styles.scoreValue}>{score}/10</Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.primary} />
                                <Text style={styles.sectionTitle}>Análisis</Text>
                            </View>
                            <Text style={styles.sectionText}>{resumen}</Text>
                        </View>

                        {puntosFuertes.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                                    <Text style={styles.sectionTitle}>Puntos Fuertes</Text>
                                </View>
                                {puntosFuertes.map((punto, index) => (
                                    <View key={index} style={styles.bulletItem}>
                                        <Text style={styles.bulletIcon}>✓</Text>
                                        <Text style={styles.bulletText}>{punto}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {oportunidades.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="rocket" size={20} color={COLORS.warning} />
                                    <Text style={styles.sectionTitle}>Oportunidades de Mejora</Text>
                                </View>
                                {oportunidades.map((oportunidad, index) => (
                                    <View key={index} style={styles.bulletItem}>
                                        <Text style={[styles.bulletIcon, { color: COLORS.warning }]}>→</Text>
                                        <Text style={styles.bulletText}>{oportunidad}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {pista && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="bulb" size={20} color={COLORS.primary} />
                                    <Text style={styles.sectionTitle}>Pista</Text>
                                </View>
                                <View style={styles.hintCard}>
                                    <Text style={styles.hintText}>{pista}</Text>
                                </View>
                            </View>
                        )}

                        {codigoCorregido && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="code-slash" size={20} color={COLORS.success} />
                                    <Text style={styles.sectionTitle}>Código Sugerido</Text>
                                </View>
                                {optimizacion?.explicacion && (
                                    <Text style={styles.sectionText}>{optimizacion.explicacion}</Text>
                                )}
                                <View style={styles.codeBlock}>
                                    <Text style={styles.codeText}>{codigoCorregido}</Text>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: COLORS.overlay,
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: COLORS.backgroundLight,
        borderTopLeftRadius: RADIUS['2xl'],
        borderTopRightRadius: RADIUS['2xl'],
        minHeight: '50%',
        maxHeight: '85%',
        ...SHADOWS.xl,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.gray300,
        borderRadius: RADIUS.sm,
        alignSelf: 'center',
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: SPACING.xl,
        paddingBottom: SPACING['2xl'] + 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: TYPOGRAPHY.sizes['2xl'],
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.textPrimary,
    },
    closeButton: {
        padding: SPACING.sm,
    },
    scoreCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.warning + '10',
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.xl,
        gap: SPACING.lg,
    },
    scoreInfo: {
        flex: 1,
    },
    scoreLabel: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    scoreValue: {
        fontSize: TYPOGRAPHY.sizes['3xl'],
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.warning,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.textPrimary,
    },
    sectionText: {
        fontSize: TYPOGRAPHY.sizes.base,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    bulletItem: {
        flexDirection: 'row',
        marginBottom: SPACING.sm,
        paddingLeft: SPACING.sm,
    },
    bulletIcon: {
        color: COLORS.success,
        marginRight: SPACING.sm,
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
    bulletText: {
        flex: 1,
        fontSize: TYPOGRAPHY.sizes.base,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    hintCard: {
        backgroundColor: COLORS.primary + '15',
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },
    hintText: {
        fontSize: TYPOGRAPHY.sizes.base,
        color: COLORS.textPrimary,
        fontStyle: 'italic',
        lineHeight: 22,
    },
    codeBlock: {
        backgroundColor: COLORS.gray900,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginTop: SPACING.sm,
    },
    codeText: {
        color: COLORS.backgroundLight,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: TYPOGRAPHY.sizes.sm,
        lineHeight: 20,
    },
});
