import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const COLORS = {
  darkBg: '#0F172A',
  primaryBlue: '#2563EB',
  accentCyan: '#22D3EE',
  white: '#FFFFFF',
  bubble1: 'rgba(37, 99, 235, 0.2)',
  bubble2: 'rgba(34, 211, 238, 0.15)',
  bubble3: 'rgba(96, 165, 250, 0.25)',
};

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.bubblesContainer}>
        <View style={[styles.bubble, styles.bubble1]} />
        <View style={[styles.bubble, styles.bubble2]} />
        <View style={[styles.bubble, styles.bubble3]} />
        <View style={[styles.bubble, styles.bubble4]} />
        <View style={[styles.bubble, styles.bubble5]} />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.mascotContainer}>
          <Image
            source={require('@/assets/images/devpal-mascot.png')}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.welcomeText}>
          Bienvenido de regreso
        </Text>
        <Text style={styles.helloText}>
          ¡Hola Developer!
        </Text>
      </View>
      
      <View style={styles.buttonsContainer}>
        <Pressable 
          onPress={() => router.push('/(auth)/login')}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed
          ]}
        >
          <Text style={styles.primaryButtonText}>
            Iniciar sesión
          </Text>
        </Pressable>
        
        <Pressable 
          onPress={() => router.push('/(auth)/register')}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed
          ]}
        >
          <Text style={styles.secondaryButtonText}>
            Registrarse
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBg,
  },
  bubblesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 9999,
  },
  bubble1: {
    top: -80,
    left: -80,
    width: 256,
    height: 256,
    backgroundColor: COLORS.bubble1,
  },
  bubble2: {
    top: -40,
    right: -64,
    width: 192,
    height: 192,
    backgroundColor: COLORS.bubble2,
  },
  bubble3: {
    top: '33%',
    left: -40,
    width: 128,
    height: 128,
    backgroundColor: COLORS.bubble3,
  },
  bubble4: {
    bottom: 80,
    right: -80,
    width: 224,
    height: 224,
    backgroundColor: COLORS.bubble2,
  },
  bubble5: {
    bottom: -64,
    left: 40,
    width: 160,
    height: 160,
    backgroundColor: COLORS.bubble1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  mascotContainer: {
    marginBottom: 32,
  },
  mascotImage: {
    width: 256,
    height: 256,
  },
  welcomeText: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  helloText: {
    color: COLORS.accentCyan,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 48,
  },
  buttonsContainer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  primaryButton: {
    backgroundColor: COLORS.primaryBlue,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.white,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
