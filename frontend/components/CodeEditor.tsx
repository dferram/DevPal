import React, { useRef, useCallback, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, ScrollView, Pressable, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/designTokens';

interface CodeEditorProps {
    code: string;
    onCodeChange: (code: string) => void;
    language?: string;
    placeholder?: string;
    onLanguageChange?: (lang: string) => void;
    availableLanguages?: string[];
}

const SYNTAX_COLORS = {
    keyword: '#C678DD',
    string: '#98C379',
    number: '#D19A66',
    comment: '#5C6370',
    function: '#61AFEF',
    operator: '#56B6C2',
    bracket: '#E5C07B',
    default: '#ABB2BF',
};

const pythonKeywords = ['def', 'return', 'if', 'else', 'elif', 'for', 'while', 'in', 'not', 'and', 'or', 'True', 'False', 'None', 'import', 'from', 'class', 'try', 'except', 'finally', 'with', 'as', 'lambda', 'pass', 'break', 'continue', 'global', 'yield', 'raise', 'assert'];
const jsKeywords = ['function', 'return', 'if', 'else', 'for', 'while', 'const', 'let', 'var', 'true', 'false', 'null', 'undefined', 'new', 'this', 'class', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'import', 'export', 'from', 'default', 'switch', 'case', 'break', 'continue', 'typeof', 'instanceof'];

interface Token {
    text: string;
    color: string;
}

function tokenizeLine(line: string, language: string): Token[] {
    const keywords = language === 'python' ? pythonKeywords : jsKeywords;
    const tokens: Token[] = [];
    let remaining = line;

    const commentChar = language === 'python' ? '#' : '//';
    const commentIndex = remaining.indexOf(commentChar);

    if (commentIndex !== -1 && !remaining.substring(0, commentIndex).includes('"') && !remaining.substring(0, commentIndex).includes("'")) {
        if (commentIndex > 0) {
            tokens.push(...tokenizeSegment(remaining.substring(0, commentIndex), keywords));
        }
        tokens.push({ text: remaining.substring(commentIndex), color: SYNTAX_COLORS.comment });
        return tokens;
    }

    return tokenizeSegment(line, keywords);
}

function tokenizeSegment(segment: string, keywords: string[]): Token[] {
    const tokens: Token[] = [];

    const regex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\d+\.?\d*|\w+|[+\-*/%=<>!&|^~]+|[()[\]{}.,;:]|\s+)/g;
    let match;

    while ((match = regex.exec(segment)) !== null) {
        const text = match[0];
        let color = SYNTAX_COLORS.default;

        if (text.startsWith('"') || text.startsWith("'")) {
            color = SYNTAX_COLORS.string;
        } else if (/^\d/.test(text)) {
            color = SYNTAX_COLORS.number;
        } else if (keywords.includes(text)) {
            color = SYNTAX_COLORS.keyword;
        } else if (/^[()[\]{}]$/.test(text)) {
            color = SYNTAX_COLORS.bracket;
        } else if (/^[+\-*/%=<>!&|^~]+$/.test(text)) {
            color = SYNTAX_COLORS.operator;
        } else if (/^\w+$/.test(text) && !keywords.includes(text)) {
            const nextChar = segment[regex.lastIndex];
            if (nextChar === '(') {
                color = SYNTAX_COLORS.function;
            }
        }

        tokens.push({ text, color });
    }

    return tokens;
}

export function CodeEditor({
    code,
    onCodeChange,
    language = 'python',
    placeholder = '// Tu código aquí...',
    onLanguageChange,
    availableLanguages = ['python', 'javascript'],
}: CodeEditorProps) {
    const lines = code.split('\n');
    const lineNumbersRef = useRef<ScrollView>(null);
    const highlightRef = useRef<ScrollView>(null);

    const highlightedLines = useMemo(() => {
        return lines.map(line => tokenizeLine(line, language));
    }, [code, language]);

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = event.nativeEvent.contentOffset.y;
        lineNumbersRef.current?.scrollTo({ y, animated: false });
        highlightRef.current?.scrollTo({ y, animated: false });
    }, []);

    return (
        <View style={styles.container}>
            <Pressable
                style={({ pressed }) => [
                    styles.languageBadge,
                    pressed && { opacity: 0.8 }
                ]}
                onPress={() => {
                    if (onLanguageChange && availableLanguages && availableLanguages.length > 1) {
                        const currentIndex = availableLanguages.indexOf(language);
                        const safeIndex = currentIndex === -1 ? 0 : currentIndex;
                        const nextIndex = (safeIndex + 1) % availableLanguages.length;
                        onLanguageChange(availableLanguages[nextIndex]);
                    }
                }}
            >
                <Text style={styles.languageText}>{language}</Text>
            </Pressable>

            <View style={styles.editorContainer}>
                <ScrollView
                    ref={lineNumbersRef}
                    style={styles.lineNumbers}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    contentContainerStyle={styles.lineNumbersContent}
                >
                    {lines.map((_, index) => (
                        <Text key={index} style={styles.lineNumber}>
                            {index + 1}
                        </Text>
                    ))}
                </ScrollView>

                <View style={styles.codeArea}>
                    <ScrollView
                        ref={highlightRef}
                        style={styles.highlightLayer}
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.codeContent}
                        pointerEvents="none"
                    >
                        {highlightedLines.map((tokens, lineIndex) => (
                            <View key={lineIndex} style={styles.codeLine}>
                                {tokens.length > 0 ? tokens.map((token, tokenIndex) => (
                                    <Text key={tokenIndex} style={[styles.codeText, { color: token.color }]}>
                                        {token.text}
                                    </Text>
                                )) : <Text style={styles.codeText}>{' '}</Text>}
                            </View>
                        ))}
                    </ScrollView>

                    <ScrollView
                        style={styles.inputLayer}
                        contentContainerStyle={styles.codeContent}
                        showsVerticalScrollIndicator={true}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="none"
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    >
                        <TextInput
                            style={[styles.codeInput, { minHeight: Math.max(300, lines.length * 24 + 100) }]}
                            multiline
                            value={code}
                            onChangeText={onCodeChange}
                            placeholder={placeholder}
                            placeholderTextColor={COLORS.textTertiary}
                            autoCapitalize="none"
                            autoCorrect={false}
                            textAlignVertical="top"
                            scrollEnabled={false}
                            spellCheck={false}
                            selectionColor="#22D3EE"
                            keyboardType="default"
                        />
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray900,
        borderRadius: RADIUS.md,
        overflow: 'hidden',
    },
    editorContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    lineNumbers: {
        backgroundColor: COLORS.gray800,
        width: 18,
        minWidth: 18,
        maxWidth: 18,
    },
    lineNumbersContent: {
        paddingVertical: SPACING.md,
    },
    lineNumber: {
        color: COLORS.textTertiary,
        fontSize: 9,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        lineHeight: 24,
        textAlign: 'center',
    },
    codeArea: {
        flex: 1,
        position: 'relative',
    },
    highlightLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    inputLayer: {
        flex: 1,
    },
    codeContent: {
        flexGrow: 1,
        padding: SPACING.md,
    },
    codeLine: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        minHeight: 24,
        lineHeight: 24,
    },
    codeText: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: TYPOGRAPHY.sizes.base,
        lineHeight: 24,
    },
    codeInput: {
        flex: 1,
        color: 'rgba(0,0,0,0)', // Fix for Android transparency
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: TYPOGRAPHY.sizes.base,
        lineHeight: 24,
        textAlignVertical: 'top',
        padding: 0,
        paddingTop: 0, // Explicitly remove Android top padding
        paddingBottom: 0, // Explicitly remove Android bottom padding
        margin: 0,
    },
    languageBadge: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.sm,
        zIndex: 10,
    },
    languageText: {
        color: COLORS.textInverse,
        fontSize: TYPOGRAPHY.sizes.xs,
        fontWeight: TYPOGRAPHY.weights.semibold,
        textTransform: 'uppercase',
    },
});
