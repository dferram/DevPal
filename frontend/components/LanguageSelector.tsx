import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '@/constants/designTokens';

interface LanguageSelectorProps {
    selectedLanguage: string;
    availableLanguages: string[];
    onLanguageChange: (language: string) => void;
}

const LANGUAGE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
    python: { label: 'Python', icon: 'logo-python', color: '#3776AB' },
    javascript: { label: 'JavaScript', icon: 'logo-javascript', color: '#F7DF1E' },
    java: { label: 'Java', icon: 'logo-java', color: '#007396' },
    cpp: { label: 'C++', icon: 'code-slash', color: '#00599C' },
};

export function LanguageSelector({
    selectedLanguage,
    availableLanguages,
    onLanguageChange,
}: LanguageSelectorProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Lenguaje:</Text>
            <View style={styles.languagesRow}>
                {availableLanguages.map((lang) => {
                    const config = LANGUAGE_CONFIG[lang] || { label: lang, icon: 'code', color: COLORS.gray500 };
                    const isSelected = selectedLanguage === lang;

                    return (
                        <Pressable
                            key={lang}
                            style={[
                                styles.languageButton,
                                isSelected && styles.languageButtonSelected,
                                isSelected && { borderColor: config.color },
                            ]}
                            onPress={() => onLanguageChange(lang)}
                        >
                            <Ionicons
                                name={config.icon as any}
                                size={18}
                                color={isSelected ? config.color : COLORS.textTertiary}
                            />
                            <Text
                                style={[
                                    styles.languageText,
                                    isSelected && styles.languageTextSelected,
                                    isSelected && { color: config.color },
                                ]}
                            >
                                {config.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        backgroundColor: COLORS.backgroundLight,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray200,
    },
    label: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    languagesRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        flexWrap: 'wrap',
    },
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.md,
        borderWidth: 1.5,
        borderColor: COLORS.gray300,
        backgroundColor: COLORS.background,
    },
    languageButtonSelected: {
        backgroundColor: COLORS.backgroundLight,
        borderWidth: 2,
        ...SHADOWS.soft,
    },
    languageText: {
        fontSize: TYPOGRAPHY.sizes.sm,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.textTertiary,
    },
    languageTextSelected: {
        fontWeight: TYPOGRAPHY.weights.bold,
    },
});
