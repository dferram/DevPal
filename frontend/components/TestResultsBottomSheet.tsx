import React from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '@/constants/designTokens';

interface TestCase {
    numero: number;
    input: string;
    output_esperado: string;
    output_obtenido: string | null;
    pasado: boolean;
    error: string | null;
}

interface ExecutionResults {
    exito: boolean;
    casos_pasados: number;
    casos_totales: number;
    error_compilacion: string | null;
    casos_detalle: TestCase[];
}

interface TestResultsBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    results: ExecutionResults | null;
}

export function TestResultsBottomSheet({ visible, onClose, results }: TestResultsBottomSheetProps) {
    if (!results) return null;

    const passRate = results.casos_totales > 0 
        ? (results.casos_pasados / results.casos_totales) * 100 
        : 0;
    
    const statusColor = results.exito 
        ? COLORS.success 
        : results.error_compilacion 
            ? COLORS.error 
            : COLORS.warning;

    const statusIcon = results.exito 
        ? 'checkmark-circle' 
        : results.error_compilacion 
            ? 'close-circle' 
            : 'alert-circle';

    const statusText = results.exito 
        ? '¡Todos los tests pasaron!' 
        : results.error_compilacion 
            ? 'Error de compilación' 
            : 'Algunos tests fallaron';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.backdrop}>
                <Pressable style={styles.backdropTouchable} onPress={onClose} />
                <View style={styles.sheet}>
                    <Pressable onPress={onClose} style={styles.dragHandleArea}>
                        <View style={styles.dragHandle} />
                    </Pressable>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={true}
                        bounces={true}
                    >
                        <View style={styles.header}>
                            <Text style={styles.title}>Resultados de Ejecución</Text>
                            <Pressable onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                            </Pressable>
                        </View>

                        <View style={[styles.summaryCard, { borderLeftColor: statusColor }]}>
                            <Ionicons name={statusIcon} size={32} color={statusColor} />
                            <View style={styles.summaryInfo}>
                                <Text style={[styles.summaryStatus, { color: statusColor }]}>
                                    {statusText}
                                </Text>
                                <Text style={styles.summaryCount}>
                                    {results.casos_pasados}/{results.casos_totales} casos de prueba
                                </Text>
                            </View>
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBg}>
                                    <View 
                                        style={[
                                            styles.progressFill, 
                                            { 
                                                width: `${passRate}%`,
                                                backgroundColor: statusColor 
                                            }
                                        ]} 
                                    />
                                </View>
                            </View>
                        </View>

                        {results.error_compilacion && (
                            <View style={styles.errorSection}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="bug" size={20} color={COLORS.error} />
                                    <Text style={styles.sectionTitle}>Error de Compilación</Text>
                                </View>
                                <View style={styles.errorBlock}>
                                    <Text style={styles.errorText}>
                                        {results.error_compilacion}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {results.casos_detalle && results.casos_detalle.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="list" size={20} color={COLORS.primary} />
                                    <Text style={styles.sectionTitle}>Casos de Prueba</Text>
                                </View>

                                {results.casos_detalle.map((caso) => (
                                    <TestCaseCard key={caso.numero} testCase={caso} />
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

function TestCaseCard({ testCase }: { testCase: TestCase }) {
    const passed = testCase.pasado;
    const borderColor = passed ? COLORS.success : COLORS.error;
    const iconName = passed ? 'checkmark-circle' : 'close-circle';

    return (
        <View style={[styles.testCaseCard, { borderLeftColor: borderColor }]}>
            <View style={styles.testCaseHeader}>
                <View style={styles.testCaseTitle}>
                    <Ionicons 
                        name={iconName} 
                        size={20} 
                        color={borderColor} 
                    />
                    <Text style={styles.testCaseNumber}>Test #{testCase.numero}</Text>
                </View>
                <Text style={[styles.testCaseStatus, { color: borderColor }]}>
                    {passed ? 'Pasó' : 'Falló'}
                </Text>
            </View>

            <View style={styles.testCaseRow}>
                <Text style={styles.testCaseLabel}>Entrada:</Text>
                <View style={styles.codeBlock}>
                    <Text style={styles.codeText}>{testCase.input}</Text>
                </View>
            </View>

            <View style={styles.testCaseRow}>
                <Text style={styles.testCaseLabel}>Salida esperada:</Text>
                <View style={styles.codeBlock}>
                    <Text style={styles.codeText}>{testCase.output_esperado}</Text>
                </View>
            </View>

            <View style={styles.testCaseRow}>
                <Text style={styles.testCaseLabel}>Salida obtenida:</Text>
                <View style={[
                    styles.codeBlock, 
                    !passed && styles.codeBlockError
                ]}>
                    <Text style={[
                        styles.codeText,
                        !passed && styles.codeTextError
                    ]}>
                        {testCase.output_obtenido || 'Sin salida'}
                    </Text>
                </View>
            </View>

            {testCase.error && (
                <View style={styles.testCaseRow}>
                    <Text style={styles.testCaseLabel}>Error:</Text>
                    <View style={styles.errorBlock}>
                        <Text style={styles.errorText}>{testCase.error}</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: COLORS.overlay,
        justifyContent: 'flex-end',
    },
    backdropTouchable: {
        flex: 1,
    },
    sheet: {
        backgroundColor: COLORS.backgroundLight,
        borderTopLeftRadius: RADIUS['2xl'],
        borderTopRightRadius: RADIUS['2xl'],
        minHeight: '50%',
        maxHeight: '85%',
        ...SHADOWS.xl,
    },
    dragHandleArea: {
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.gray300,
        borderRadius: RADIUS.sm,
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
    
    summaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray100,
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.xl,
        gap: SPACING.md,
        borderLeftWidth: 4,
    },
    summaryInfo: {
        flex: 1,
    },
    summaryStatus: {
        fontSize: TYPOGRAPHY.sizes.lg,
        fontWeight: TYPOGRAPHY.weights.bold,
        marginBottom: SPACING.xs,
    },
    summaryCount: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.textSecondary,
    },
    progressContainer: {
        width: 60,
    },
    progressBg: {
        height: 6,
        backgroundColor: COLORS.gray300,
        borderRadius: RADIUS.sm,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: RADIUS.sm,
    },

    section: {
        marginBottom: SPACING.lg,
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

    errorSection: {
        marginBottom: SPACING.xl,
    },
    errorBlock: {
        backgroundColor: COLORS.error + '15',
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.error + '30',
    },
    errorText: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.error,
        lineHeight: 20,
    },

    testCaseCard: {
        backgroundColor: COLORS.gray50,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderLeftWidth: 4,
    },
    testCaseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    testCaseTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    testCaseNumber: {
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.textPrimary,
    },
    testCaseStatus: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },
    testCaseRow: {
        marginBottom: SPACING.sm,
    },
    testCaseLabel: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
        fontWeight: TYPOGRAPHY.weights.semibold,
    },

    codeBlock: {
        backgroundColor: COLORS.gray900,
        borderRadius: RADIUS.sm,
        padding: SPACING.sm,
    },
    codeBlockError: {
        backgroundColor: COLORS.error + '20',
        borderWidth: 1,
        borderColor: COLORS.error + '40',
    },
    codeText: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.backgroundLight,
        lineHeight: 18,
    },
    codeTextError: {
        color: COLORS.error,
    },
});
