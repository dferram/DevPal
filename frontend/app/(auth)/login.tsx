import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '@/services/authService';
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
  error: '#EF4444',
  errorBg: 'rgba(239, 68, 68, 0.15)',
};

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo y contrasena');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo valido');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await AuthService.login(email.trim(), password, rememberMe);

      if (response.user_id) {
        await signIn({ ...response, email: email.trim() }, rememberMe);
      } else {
        setError('Error al iniciar sesion. Intenta de nuevo.');
      }
    } catch (err: any) {
      console.error('Login error:', err);

      if (err.response?.status === 401) {
        setError('Correo o contrasena incorrectos');
      } else if (err.response?.status === 500) {
        setError('Error del servidor. Intenta mas tarde.');
      } else if (err.message?.includes('Network Error')) {
        setError('No se pudo conectar al servidor. Verifica tu conexion.');
      } else {
        setError('Error al iniciar sesion. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.logoSection}>
            <Image
              source={require('@/assets/images/devpal-mascot.png')}
              style={styles.mascot}
              resizeMode="contain"
            />
            <Text style={styles.brandText}>DevPal</Text>
          </View>

          <View style={styles.glassCard}>
            <Text style={styles.title}>Bienvenido de regreso!</Text>
            <Text style={styles.subtitle}>Inicia sesion para continuar</Text>

            <View style={styles.inputsContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={GLASS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Correo electronico"
                  placeholderTextColor={GLASS.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                  }}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={GLASS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Contrasena"
                  placeholderTextColor={GLASS.textSecondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                  }}
                  style={styles.input}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={GLASS.textSecondary} 
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.optionsRow}>
              <Pressable
                onPress={() => setRememberMe(!rememberMe)}
                style={styles.rememberContainer}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Ionicons name="checkmark" size={12} color={GLASS.bgDark} />}
                </View>
                <Text style={styles.rememberText}>Recuerdame</Text>
              </Pressable>

              <Pressable>
                <Text style={styles.forgotText}>Olvidaste tu contrasena?</Text>
              </Pressable>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color={GLASS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleLogin}
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={GLASS.bgDark} />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Iniciar sesion</Text>
                  <Ionicons name="arrow-forward" size={20} color={GLASS.bgDark} />
                </>
              )}
            </Pressable>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o continua con</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialContainer}>
              <Pressable style={styles.socialButton}>
                <Text style={styles.googleIcon}>G</Text>
              </Pressable>
              <Pressable style={styles.socialButton}>
                <Ionicons name="logo-apple" size={24} color={GLASS.textPrimary} />
              </Pressable>
              <Pressable style={styles.socialButton}>
                <Ionicons name="logo-github" size={24} color={GLASS.textPrimary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.registerLinkContainer}>
            <Text style={styles.registerLinkText}>No tienes cuenta? </Text>
            <Pressable onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLinkBold}>Registrate</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

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
    top: 200,
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
  keyboardView: {
    flex: 1,
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
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mascot: {
    width: 120,
    height: 120,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '800',
    color: GLASS.textPrimary,
    marginTop: 8,
  },
  glassCard: {
    backgroundColor: GLASS.bg,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: GLASS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: GLASS.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
  },
  inputsContainer: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: GLASS.border,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: GLASS.textPrimary,
  },
  eyeIcon: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: GLASS.border,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: GLASS.accent,
    borderColor: GLASS.accent,
  },
  rememberText: {
    color: GLASS.textSecondary,
    fontSize: 14,
  },
  forgotText: {
    color: GLASS.accent,
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: GLASS.errorBg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    flex: 1,
    color: GLASS.error,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: GLASS.accent,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: GLASS.bgDark,
    fontSize: 17,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: GLASS.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: GLASS.textSecondary,
    fontSize: 13,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: GLASS.inputBg,
    borderWidth: 1,
    borderColor: GLASS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: GLASS.textPrimary,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  registerLinkText: {
    color: GLASS.textSecondary,
    fontSize: 15,
  },
  registerLinkBold: {
    color: GLASS.accent,
    fontWeight: '700',
    fontSize: 15,
  },
});
