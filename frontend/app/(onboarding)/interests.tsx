import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

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

const INTERESTS = [
  { 
    id: 'hackathons', 
    title: 'Hackathones',
    description: 'Competencias de desarrollo',
    icon: 'code-slash',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400',
  },
  { 
    id: 'conferencias', 
    title: 'Conferencias',
    description: 'Charlas y presentaciones',
    icon: 'people',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
  },
  { 
    id: 'talleres', 
    title: 'Talleres',
    description: 'Aprende haciendo',
    icon: 'construct',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400',
  },
  { 
    id: 'concursos', 
    title: 'Concursos',
    description: 'Demuestra tus habilidades',
    icon: 'trophy',
    image: 'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=400',
  },
  { 
    id: 'networking', 
    title: 'Networking',
    description: 'Conecta con otros devs',
    icon: 'share-social',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400',
  },
  { 
    id: 'cursos', 
    title: 'Cursos',
    description: 'Formación continua',
    icon: 'school',
    image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400',
  },
];

export default function InterestsScreen() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleNext = () => {
    router.push('/(onboarding)/languages');
  };

  const handleSkip = () => {
    router.push('/(onboarding)/languages');
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
            <View style={styles.progressDot} />
            <View style={[styles.progressDot, styles.progressDotInactive]} />
          </View>
          
          <Text style={styles.stepText}>Paso 1 de 2</Text>
          <Text style={styles.title}>¿Qué tipo de eventos te interesan?</Text>
          <Text style={styles.subtitle}>
            Selecciona tus actividades favoritas para personalizar tu experiencia
          </Text>
        </View>
        
        <View style={styles.glassCard}>
          <View style={styles.grid}>
            {INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              return (
                <Pressable
                  key={interest.id}
                  onPress={() => toggleInterest(interest.id)}
                  style={[
                    styles.interestCard,
                    isSelected && styles.interestCardSelected,
                  ]}
                >
                  <Image 
                    source={{ uri: interest.image }}
                    style={styles.cardImage}
                  />
                  
                  <View style={styles.cardOverlay}>
                    <View style={styles.cardContent}>
                      <View style={[
                        styles.iconContainer,
                        isSelected && styles.iconContainerSelected,
                      ]}>
                        <Ionicons 
                          name={interest.icon as any} 
                          size={22} 
                          color={isSelected ? GLASS.bgDark : GLASS.textPrimary} 
                        />
                      </View>
                      <Text style={styles.cardTitle}>{interest.title}</Text>
                      <Text style={styles.cardDescription}>{interest.description}</Text>
                    </View>
                    
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark" size={14} color={GLASS.bgDark} />
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
          
          <View style={styles.selectionInfo}>
            <Ionicons name="information-circle-outline" size={18} color={GLASS.textSecondary} />
            <Text style={styles.selectionText}>
              {selectedInterests.length === 0 
                ? 'Selecciona al menos una opción'
                : `${selectedInterests.length} ${selectedInterests.length === 1 ? 'seleccionado' : 'seleccionados'}`
              }
            </Text>
          </View>
        </View>
        
        <View style={styles.buttonsContainer}>
          <Pressable 
            onPress={handleNext}
            style={[
              styles.nextButton,
              selectedInterests.length === 0 && styles.buttonDisabled,
            ]}
            disabled={selectedInterests.length === 0}
          >
            <Text style={styles.nextButtonText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={20} color={GLASS.bgDark} />
          </Pressable>
          
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipButtonText}>Omitir por ahora</Text>
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
  interestCard: {
    width: CARD_WIDTH,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  interestCardSelected: {
    borderColor: GLASS.accent,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    padding: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconContainerSelected: {
    backgroundColor: GLASS.accent,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: GLASS.textPrimary,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 11,
    color: GLASS.textSecondary,
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
  },
  skipButtonText: {
    color: GLASS.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
});
