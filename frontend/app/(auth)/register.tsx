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

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!formData.nombre.trim() || !formData.apellidos.trim() ||
      !formData.email.trim() || !formData.password.trim() ||
      !formData.confirmPassword.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un correo valido');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres');
      return;
    }

    if (!acceptedTerms) {
      setError('Debes aceptar los terminos y condiciones');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await AuthService.register(
        formData.nombre.trim(),
        formData.apellidos.trim(),
        formData.email.trim(),
        formData.password
      );

      if (response.user_id) {
        await signIn({ ...response, email: formData.email.trim() }, true, true);
      } else {
        setError('Error al registrar usuario. Intenta de nuevo.');
      }
    } catch (err: any) {
      console.error('Register error:', err);

      if (err.response?.status === 400) {
        setError('El email ya esta registrado');
      } else if (err.response?.status === 500) {
        setError('Error del servidor. Intenta mas tarde.');
      } else if (err.message?.includes('Network Error')) {
        setError('No se pudo conectar al servidor. Verifica tu conexion.');
      } else {
        setError('Error al registrarse. Intenta de nuevo.');
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
            <Text style={styles.title}>Crea tu cuenta</Text>
            <Text style={styles.subtitle}>Unete a la comunidad de desarrolladores</Text>

            <View style={styles.inputsContainer}>
              <View style={styles.rowInputs}>
                <View style={[styles.inputWrapper, styles.halfInput]}>
                  <Ionicons name="person-outline" size={20} color={GLASS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Nombre"
                    placeholderTextColor={GLASS.textSecondary}
                    value={formData.nombre}
                    onChangeText={(text) => {
                      setFormData({ ...formData, nombre: text });
                      setError('');
                    }}
                    style={styles.input}
                  />
                </View>
                <View style={[styles.inputWrapper, styles.halfInput]}>
                  <TextInput
                    placeholder="Apellidos"
                    placeholderTextColor={GLASS.textSecondary}
                    value={formData.apellidos}
                    onChangeText={(text) => {
                      setFormData({ ...formData, apellidos: text });
                      setError('');
                    }}
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={GLASS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Correo electronico"
                  placeholderTextColor={GLASS.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({ ...formData, email: text });
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
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData({ ...formData, password: text });
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

              <View style={styles.inputWrapper}>
                <Ionicons name="shield-checkmark-outline" size={20} color={GLASS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Confirmar contrasena"
                  placeholderTextColor={GLASS.textSecondary}
                  secureTextEntry={!showConfirmPassword}
                  value={formData.confirmPassword}
                  onChangeText={(text) => {
                    setFormData({ ...formData, confirmPassword: text });
                    setError('');
                  }}
                  style={styles.input}
                />
                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={GLASS.textSecondary} 
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              style={styles.termsContainer}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms && <Ionicons name="checkmark" size={12} color={GLASS.bgDark} />}
              </View>
              <Text style={styles.termsText}>
                Acepto los <Text style={styles.termsLink}>terminos y condiciones</Text> de DevPal
              </Text>
            </Pressable>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color={GLASS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleRegister}
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={GLASS.bgDark} />
              ) : (
                <>
                  <Text style={styles.registerButtonText}>Crear cuenta</Text>
                  <Ionicons name="arrow-forward" size={20} color={GLASS.bgDark} />
                </>
              )}
            </Pressable>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o registrate con</Text>
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

          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>Ya tienes cuenta? </Text>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLinkBold}>Inicia sesion</Text>
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
    top: 300,
    left: -80,
  },
  bgCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
    bottom: 50,
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
    paddingTop: 50,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mascot: {
    width: 100,
    height: 100,
  },
  brandText: {
    fontSize: 24,
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
    fontSize: 14,
    color: GLASS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputsContainer: {
    gap: 14,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
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
    paddingVertical: 14,
    fontSize: 15,
    color: GLASS.textPrimary,
  },
  eyeIcon: {
    padding: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: GLASS.border,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: GLASS.accent,
    borderColor: GLASS.accent,
  },
  termsText: {
    color: GLASS.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  termsLink: {
    color: GLASS.accent,
    fontWeight: '600',
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
  registerButton: {
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
  registerButtonText: {
    color: GLASS.bgDark,
    fontSize: 17,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
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
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginLinkText: {
    color: GLASS.textSecondary,
    fontSize: 15,
  },
  loginLinkBold: {
    color: GLASS.accent,
    fontWeight: '700',
    fontSize: 15,
  },
});
