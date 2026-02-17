import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

const GLASS = {
  bg: 'rgba(30, 41, 59, 0.7)',
  bgDark: '#0F172A',
  border: 'rgba(255, 255, 255, 0.1)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  accent: '#22D3EE',
  accentGradient: '#3B82F6',
  inputBg: 'rgba(15, 23, 42, 0.6)',
  cardBg: 'rgba(30, 41, 59, 0.6)',
};

const LANGUAGES = [
  { id: 'javascript', title: 'JavaScript', bgColor: '#F7DF1E', textColor: '#000' },
  { id: 'python', title: 'Python', bgColor: '#3776AB', textColor: '#FFF' },
  { id: 'java', title: 'Java', bgColor: '#ED8B00', textColor: '#FFF' },
  { id: 'cpp', title: 'C / C++', bgColor: '#00599C', textColor: '#FFF' },
  { id: 'typescript', title: 'TypeScript', bgColor: '#3178C6', textColor: '#FFF' },
  { id: 'csharp', title: 'C#', bgColor: '#512BD4', textColor: '#FFF' },
];

export default function LanguagesScreen() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [customLanguage, setCustomLanguage] = useState('');

  const toggleLanguage = (id: string) => {
    setSelectedLanguages(prev => 
      prev.includes(id) 
        ? prev.filter(l => l !== id)
        : [...prev, id]
    );
  };

  const handleComplete = async () => {
    await completeOnboarding();
  };

  const handleBack = () => {
    router.back();
  };

  const getLangSymbol = (id: string) => {
    switch (id) {
      case 'javascript': return 'JS';
      case 'python': return 'Py';
      case 'java': return 'Jv';
      case 'cpp': return 'C++';
      case 'typescript': return 'TS';
      case 'csharp': return 'C#';
      default: return '?';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerSection}>
          <Image
            source={require('@/assets/images/devpal-mascot.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
          
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.progressDotInactive]} />
            <View style={styles.progressDot} />
          </View>
          
          <Text style={styles.stepText}>Paso 2 de 2</Text>
          <Text style={styles.title}>¿Cuáles son tus lenguajes de interés?</Text>
          <Text style={styles.subtitle}>
            Selecciona los lenguajes de programación que te interesan
          </Text>
        </View>
        
        <View style={styles.glassCard}>
          <View style={styles.grid}>
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLanguages.includes(lang.id);
              return (
                <Pressable
                  key={lang.id}
                  onPress={() => toggleLanguage(lang.id)}
                  style={[
                    styles.langCard,
                    isSelected && styles.langCardSelected,
                  ]}
                >
                  <View style={[styles.langIcon, { backgroundColor: lang.bgColor }]}>
                    <Text style={[styles.langSymbol, { color: lang.textColor }]}>
                      {getLangSymbol(lang.id)}
                    </Text>
                  </View>
                  
                  <Text style={styles.cardTitle}>{lang.title}</Text>
                  
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark" size={14} color={GLASS.bgDark} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
          
          <View style={styles.customInputContainer}>
            <TextInput
              placeholder="Otro lenguaje (escribe aquí)"
              placeholderTextColor={GLASS.textSecondary}
              value={customLanguage}
              onChangeText={setCustomLanguage}
              style={styles.customInput}
            />
          </View>
          
          <View style={styles.selectionInfo}>
            <Ionicons name="information-circle-outline" size={18} color={GLASS.textSecondary} />
            <Text style={styles.selectionText}>
              {selectedLanguages.length === 0 && !customLanguage
                ? 'Selecciona al menos una opción'
                : `${selectedLanguages.length + (customLanguage ? 1 : 0)} ${(selectedLanguages.length + (customLanguage ? 1 : 0)) === 1 ? 'seleccionado' : 'seleccionados'}`
              }
            </Text>
          </View>
        </View>
        
        <View style={styles.buttonsContainer}>
          <Pressable 
            onPress={handleComplete}
            style={[
              styles.nextButton,
              selectedLanguages.length === 0 && !customLanguage && styles.buttonDisabled,
            ]}
            disabled={selectedLanguages.length === 0 && !customLanguage}
          >
            <Text style={styles.nextButtonText}>Completar</Text>
            <Ionicons name="checkmark-circle" size={20} color={GLASS.bgDark} />
          </Pressable>
          
          <Pressable onPress={handleBack} style={styles.skipButton}>
            <Ionicons name="arrow-back" size={18} color={GLASS.textSecondary} />
            <Text style={styles.skipButtonText}>Volver atrás</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const CARD_WIDTH = (width - 72) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLASS.bgDark,
  },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
    top: -100,
    right: -100,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    top: 400,
    left: -80,
  },
  bgCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
    bottom: 100,
    right: -50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mascot: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  progressDot: {
    width: 32,
    height: 6,
    borderRadius: 3,
    backgroundColor: GLASS.accent,
  },
  progressDotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepText: {
    fontSize: 13,
    color: GLASS.textSecondary,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: GLASS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: GLASS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  glassCard: {
    backgroundColor: GLASS.bg,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  langCard: {
    width: CARD_WIDTH,
    height: 120,
    borderRadius: 16,
    backgroundColor: GLASS.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  langCardSelected: {
    borderColor: GLASS.accent,
  },
  langIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  langSymbol: {
    fontSize: 20,
    fontWeight: '800',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: GLASS.textPrimary,
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: GLASS.accent,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customInputContainer: {
    marginTop: 16,
  },
  customInput: {
    backgroundColor: GLASS.inputBg,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 14,
    color: GLASS.textPrimary,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: GLASS.border,
  },
  selectionText: {
    fontSize: 14,
    color: GLASS.textSecondary,
  },
  buttonsContainer: {
    marginTop: 24,
    gap: 12,
  },
  nextButton: {
    backgroundColor: GLASS.accent,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: GLASS.bgDark,
    fontSize: 17,
    fontWeight: '700',
  },
  skipButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  skipButtonText: {
    color: GLASS.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
});
