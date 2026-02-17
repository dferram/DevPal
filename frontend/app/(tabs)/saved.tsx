import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Image, Modal, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { EventsService } from '@/services/eventsService';
import { BlurView } from "expo-blur";
import { ActiveHeader } from "@/app/components/ActiveHeader";

const GLASS = {
  bg: 'rgba(30, 41, 59, 0.7)',
  border: 'rgba(255, 255, 255, 0.1)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  accent: '#22D3EE',
  inputBg: 'rgba(15, 23, 42, 0.6)',
};

export default function SavedScreen() {
  const router = useRouter();
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadSavedEvents();
      loadUserProfile();
    }, [])
  );

  const loadUserProfile = async () => {
    try {
      const { AuthService } = require('@/services/authService');
      const profile = await AuthService.getProfile();
      if (profile && profile.avatar_url) {
        setUserAvatarUrl(profile.avatar_url);
      }
    } catch (error) {
      console.log("Error fetching profile:", error);
    }
  };

  const loadSavedEvents = async () => {
    try {
      setLoading(true);
      const data = await EventsService.getSaved();
      setEvents(data);
    } catch (error) {
      console.error('Error loading saved events:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToSearch = () => router.push('/search');
  const navigateToNotifications = () => router.push('/notifications');
  const navigateToSettings = () => {
    setShowAccountMenu(false);
    router.push('/settings');
  };
  const handleLogout = () => {
    setShowAccountMenu(false);
    router.replace('/(auth)/welcome');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.bgGradient} />
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ActiveHeader
        userAvatarUrl={userAvatarUrl}
        onAccountPress={() => setShowAccountMenu(true)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Eventos Guardados</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={GLASS.accent} />
            <Text style={styles.loadingText}>Cargando favoritos...</Text>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={48} color={GLASS.textSecondary} />
            <Text style={styles.emptyText}>
              No tienes eventos guardados aún.
            </Text>
          </View>
        ) : (
          events.map((event) => {
            const isExpanded = expandedEvent === event.id;
            return (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventCardHeader}>
                  <View style={styles.eventCardLeft}>
                    <View style={styles.eventIconContainer}>
                      <Ionicons name="bookmark" size={20} color={GLASS.accent} />
                    </View>
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {event.titulo}
                    </Text>
                  </View>

                  <Pressable
                    style={styles.moreInfoButton}
                    onPress={() => setExpandedEvent(isExpanded ? null : event.id)}
                  >
                    <Text style={styles.moreInfoText}>Info</Text>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={GLASS.textSecondary}
                    />
                  </Pressable>
                </View>

                {isExpanded && (
                  <View style={styles.eventExpanded}>
                    <View style={styles.eventDetail}>
                      <Ionicons name="calendar-outline" size={16} color={GLASS.accent} />
                      <Text style={styles.eventDetailText}>{event.fecha}</Text>
                    </View>
                    <View style={styles.eventDetail}>
                      <Ionicons name="time-outline" size={16} color={GLASS.accent} />
                      <Text style={styles.eventDetailText}>{event.hora}</Text>
                    </View>
                    <View style={styles.eventDetail}>
                      <Ionicons name="location-outline" size={16} color={GLASS.accent} />
                      <Text style={styles.eventDetailText}>{event.ubicacion}</Text>
                    </View>
                    <Pressable
                      style={styles.viewButton}
                      onPress={() => router.push(`/event/${event.id}`)}
                    >
                      <Text style={styles.viewButtonText}>Ver detalle completo</Text>
                      <Ionicons name="arrow-forward" size={16} color="#0F172A" />
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={showAccountMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAccountMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAccountMenu(false)}
        >
          <BlurView intensity={50} tint="dark" style={styles.accountDropdown}>
            <Pressable style={styles.dropdownItem} onPress={navigateToSettings}>
              <Ionicons name="settings-outline" size={20} color={GLASS.textPrimary} />
              <Text style={styles.dropdownItemText}>Configuración</Text>
            </Pressable>
            <View style={styles.dropdownDivider} />
            <Pressable style={styles.dropdownItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={[styles.dropdownItemText, { color: '#EF4444' }]}>Cerrar sesión</Text>
            </Pressable>
          </BlurView>
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
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
  },
  bgCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#2563EB',
    opacity: 0.1,
    top: -100,
    right: -100,
  },
  bgCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#22D3EE',
    opacity: 0.08,
    bottom: 200,
    left: -100,
  },
  scrollView: {
    flex: 1,
    marginTop: 0,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  sectionTitle: {
    color: GLASS.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  eventCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  eventCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventIconContainer: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
  },
  eventTitle: {
    color: GLASS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  moreInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  moreInfoText: {
    color: GLASS.textSecondary,
    fontSize: 12,
  },
  eventExpanded: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: GLASS.border,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  eventDetailText: {
    color: GLASS.textSecondary,
    fontSize: 14,
  },
  viewButton: {
    backgroundColor: GLASS.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  viewButtonText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    color: GLASS.textSecondary
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  emptyText: {
    textAlign: 'center',
    color: GLASS.textSecondary,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  accountDropdown: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 16,
    padding: 8,
    minWidth: 180,
    borderWidth: 1,
    borderColor: GLASS.border,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    color: GLASS.textPrimary,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: GLASS.border,
    marginVertical: 4,
  },
});
