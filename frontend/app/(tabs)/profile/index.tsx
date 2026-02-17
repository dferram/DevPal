import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
  Linking,
  TextInput,
  Alert
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from "@/constants/designTokens";
import { AuthService } from "@/services/authService";
import { ProgressCircle } from "@/components/ProgressCircle";
import { useAuth } from "@/contexts/AuthContext";
import { BASE_URL } from "@/constants/Config";

const GLASS = {
  bg: 'rgba(30, 41, 59, 0.7)',
  border: 'rgba(255, 255, 255, 0.1)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  accent: '#22D3EE',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [newProject, setNewProject] = useState({
    titulo: '',
    descripcion: '',
    tecnologias: '',
    url_repositorio: '',
    url_demo: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      const data = await AuthService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async () => {
    if (!newProject.titulo || !newProject.descripcion) {
      Alert.alert("Error", "El título y la descripción son obligatorios.");
      return;
    }

    try {
      setSubmitting(true);
      const techs = newProject.tecnologias.split(',').map(t => t.trim()).filter(Boolean);

      await AuthService.addProject({
        titulo: newProject.titulo,
        descripcion: newProject.descripcion,
        tecnologias: techs,
        url_repositorio: newProject.url_repositorio || undefined,
        url_demo: newProject.url_demo || undefined
      });

      Alert.alert("¡Proyecto Agregado!", "Has ganado XP por compartir tu trabajo.", [
        {
          text: "Genial", onPress: () => {
            setShowProjectModal(false);
            setNewProject({ titulo: '', descripcion: '', tecnologias: '', url_repositorio: '', url_demo: '' });
            loadProfile(); // Recargar para ver nueva XP y proyecto
          }
        }
      ]);
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el proyecto. Intenta nuevamente.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setShowAccountMenu(false);
    await signOut();
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para cambiar la foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    setUploadingAvatar(true);
    try {
      const response = await AuthService.uploadAvatar(uri);

      let fullUrl = response.avatar_url;
      if (fullUrl && fullUrl.startsWith('/')) {
        const { BASE_URL } = require('@/constants/Config');
        fullUrl = `${BASE_URL}${response.avatar_url}`;
      }

      setProfile((prev: any) => ({
        ...prev,
        avatar_url: fullUrl,
      }));

      Alert.alert("Éxito", "Foto de perfil actualizada");
    } catch (error) {
      console.error("Upload failed", error);
      Alert.alert("Error", "No se pudo subir la imagen");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GLASS.accent} />
      </View>
    );
  }

  if (!profile) return null;

  const { perfil, recent_activity } = profile;

  const levelProgress = (perfil.xp_nivel_actual / 1000) * 100;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.bgGradient} />
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BlurView intensity={40} tint="dark" style={styles.glassCard}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Mi Perfil</Text>
            <Pressable onPress={() => setShowAccountMenu(true)} style={styles.settingsBtn}>
              <Ionicons name="settings-outline" size={24} color={GLASS.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarContainer}>
              <Image
                source={profile.avatar_url ? { uri: profile.avatar_url } : { uri: 'https://ui-avatars.com/api/?name=' + profile.nombre + '+' + profile.apellidos }}
                style={styles.avatar}
              />
              <Pressable style={styles.editAvatarBtn} onPress={handlePickAvatar} disabled={uploadingAvatar}>
                {uploadingAvatar ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="pencil" size={14} color="#FFF" />}
              </Pressable>
            </View>
            <View style={styles.profileMainInfo}>
              <Text style={styles.profileName}>{profile.nombre} {profile.apellidos}</Text>
              <View style={styles.levelBadge}>
                <Ionicons name="sparkles" size={14} color={GLASS.accent} />
                <Text style={styles.levelText}>Nivel {perfil.nivel}</Text>
              </View>
            </View>
          </View>

          <View style={styles.xpSection}>
            <View style={styles.xpLabels}>
              <Text style={styles.xpText}>XP {perfil.xp_nivel_actual} / 1000</Text>
              <Text style={styles.xpTotal}>Total: {perfil.xp}</Text>
            </View>
            <View style={styles.xpTrack}>
              <View style={[styles.xpThumb, { width: `${levelProgress}%` }]} />
            </View>
          </View>
        </BlurView>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{perfil.logros}</Text>
            <Text style={styles.statLabel}>Logros</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="ribbon" size={24} color="#10B981" />
            <Text style={styles.statValue}>{perfil.certificados}</Text>
            <Text style={styles.statLabel}>Certificados</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#EF4444" />
            <Text style={styles.statValue}>{perfil.racha_dias}</Text>
            <Text style={styles.statLabel}>Racha Días</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Portafolio & Actividad</Text>
          <Pressable style={styles.addProjectBtn} onPress={() => setShowProjectModal(true)}>
            <Ionicons name="add" size={16} color="#FFF" />
            <Text style={styles.addProjectText}>Proyecto</Text>
          </Pressable>
        </View>

        {recent_activity && recent_activity.length > 0 ? (
          recent_activity.map((item: any, index: number) => (
            <BlurView key={item.id || index} intensity={20} tint="dark" style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon || 'ellipse'} size={20} color={item.color} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityDate}>{item.date} • {item.status}</Text>

                {item.type === 'project' && (
                  <View style={styles.projectTags}>
                    {item.tecnologias && item.tecnologias.map((tech: string, i: number) => (
                      <View key={i} style={styles.techTag}>
                        <Text style={styles.techText}>{tech}</Text>
                      </View>
                    ))}
                    {item.url_demo && (
                      <Pressable onPress={() => Linking.openURL(item.url_demo)}>
                        <Ionicons name="open-outline" size={16} color={GLASS.accent} />
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            </BlurView>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color={GLASS.textSecondary} />
            <Text style={styles.emptyText}>No hay actividad reciente.</Text>
            <Text style={styles.emptySub}>¡Completa retos o sube un proyecto!</Text>
          </View>
        )}

      </ScrollView>

      <Modal visible={showProjectModal} animationType="slide" transparent>
        <BlurView intensity={95} tint="dark" style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Proyecto</Text>
              <Pressable onPress={() => setShowProjectModal(false)}>
                <Ionicons name="close-circle" size={30} color={GLASS.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Título del Proyecto *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: E-commerce React Native"
                placeholderTextColor="#64748B"
                value={newProject.titulo}
                onChangeText={(t) => setNewProject({ ...newProject, titulo: t })}
              />

              <Text style={styles.inputLabel}>Descripción *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe brevemente tu proyecto..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={3}
                value={newProject.descripcion}
                onChangeText={(t) => setNewProject({ ...newProject, descripcion: t })}
              />

              <Text style={styles.inputLabel}>Tecnologías (separadas por coma)</Text>
              <TextInput
                style={styles.input}
                placeholder="React, Node.js, Python..."
                placeholderTextColor="#64748B"
                value={newProject.tecnologias}
                onChangeText={(t) => setNewProject({ ...newProject, tecnologias: t })}
              />

              <Text style={styles.inputLabel}>URL Repositorio (Opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://github.com/..."
                placeholderTextColor="#64748B"
                value={newProject.url_repositorio}
                onChangeText={(t) => setNewProject({ ...newProject, url_repositorio: t })}
              />

              <Text style={styles.inputLabel}>URL Demo (Opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://mi-proyecto.com"
                placeholderTextColor="#64748B"
                value={newProject.url_demo}
                onChangeText={(t) => setNewProject({ ...newProject, url_demo: t })}
              />

              <Pressable
                style={[styles.submitBtn, submitting && styles.btnDisabled]}
                onPress={handleAddProject}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Publicar Proyecto (+XP)</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </BlurView>
      </Modal>

      <Modal
        visible={showAccountMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAccountMenu(false)}
      >
        <Pressable
          style={styles.dropdownOverlay}
          onPress={() => setShowAccountMenu(false)}
        >
          <View style={styles.accountDropdown}>
            <Pressable style={styles.dropdownItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={{ color: '#EF4444' }}>Cerrar sesión</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A'
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
  },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#2563EB',
    opacity: 0.15,
    top: -50,
    left: -50,
    transform: [{ scale: 1.2 }],
  },
  bgCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#22D3EE',
    opacity: 0.1,
    top: 100,
    right: -80,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 130,
  },
  glassCard: {
    padding: 24,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS.border,
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: GLASS.textPrimary,
  },
  settingsBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: GLASS.accent,
  },
  avatarContainer: {
    position: 'relative',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: GLASS.accent,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1E293B',
  },
  profileMainInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: GLASS.textPrimary,
    marginBottom: 6,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  levelText: {
    color: GLASS.accent,
    fontWeight: 'bold',
    fontSize: 14,
  },
  xpSection: {
    marginTop: 8,
  },
  xpLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpText: {
    color: GLASS.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  xpTotal: {
    color: GLASS.textSecondary,
    fontSize: 12,
  },
  xpTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpThumb: {
    height: '100%',
    backgroundColor: GLASS.accent,
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GLASS.border,
    aspectRatio: 1,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: GLASS.textPrimary,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: GLASS.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: GLASS.textPrimary,
  },
  addProjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GLASS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    shadowColor: GLASS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addProjectText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 12,
  },
  activityItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: GLASS.textPrimary,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: GLASS.textSecondary,
  },
  projectTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  techTag: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  techText: {
    color: GLASS.textSecondary,
    fontSize: 10,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  emptyText: {
    color: GLASS.textPrimary,
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySub: {
    color: GLASS.textSecondary,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    height: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    color: '#F8FAFC',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: GLASS.accent,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 48,
    shadowColor: GLASS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dropdownOverlay: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 20
  },
  accountDropdown: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    minWidth: 150,
    elevation: 10
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  }
});
