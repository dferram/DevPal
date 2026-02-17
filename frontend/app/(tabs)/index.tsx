import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Modal,
  ActivityIndicator
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { EventsService } from "@/services/eventsService";
import { BentoCard } from "@/components/BentoCard";
import { ExpandableEventCard } from "@/components/ExpandableEventCard"; // Needs update? We'll see.
import { ActiveHeader } from "@/app/components/ActiveHeader";
import { COLORS as OLD_COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from "@/constants/designTokens";

const GLASS = {
  bg: 'rgba(30, 41, 59, 0.7)',
  border: 'rgba(255, 255, 255, 0.1)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  accent: '#22D3EE', // Cian
  inputBg: 'rgba(15, 23, 42, 0.6)',
};

const FILTERS = ["Hackathons", "Conferencias", "Talleres", "Todos"];

const FALLBACK_IMAGES: Record<string, string[]> = {
  "Hackathon": [
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    "https://images.unsplash.com/photo-1517245386647-45ac0c1e8f32?w=800&q=80",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
  ],
  "Conferencia": [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    "https://images.unsplash.com/photo-1559223606-3158cf9890ca?w=800&q=80",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
    "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80",
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80",
    "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80",
    "https://images.unsplash.com/photo-1560439514-4e9645039924?w=800&q=80",
  ],
  "Taller": [
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
    "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&q=80",
    "https://images.unsplash.com/photo-1558008258-3256797b1e1e?w=800&q=80",
    "https://images.unsplash.com/photo-1552581234-26160f608093?w=800&q=80",
    "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=800&q=80",
  ],
  "Default": [
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80",
  ],
};

const getRandomFallback = (category?: string): string => {
  const images = FALLBACK_IMAGES[category || ""] || FALLBACK_IMAGES["Default"];
  return images[Math.floor(Math.random() * images.length)];
};

const EventImage = ({ uri, style, category }: { uri: string | undefined; style: any; category?: string }) => {
  const [hasError, setHasError] = useState(false);
  const [fallbackUri] = useState(() => getRandomFallback(category));
  
  return (
    <Image
      source={{ uri: hasError ? fallbackUri : (uri || fallbackUri) }}
      style={style}
      onError={() => setHasError(true)}
    />
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("Hackathons");
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      setLoading(true);

      const categoryMap: Record<string, string | undefined> = {
        "Hackathons": "Hackathon",
        "Conferencias": "Conferencia",
        "Talleres": "Taller",
        "Todos": undefined
      };

      const category = categoryMap[activeFilter];
      const data = await EventsService.getAll(category, 50);
      setEvents(data);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const { AuthService } = require('@/services/authService');
      const profile = await AuthService.getProfile();
      if (profile && profile.unread_notifications_count !== undefined) {
        setUnreadNotifications(profile.unread_notifications_count);
      }
      if (profile && profile.avatar_url) {
        setUserAvatarUrl(profile.avatar_url);
      }
    } catch (error) {
      console.log("Error fetching profile for notifications:", error);
    }
  };

  const checkDailyChallengeStatus = async () => {
    try {
      const { ChallengesService } = require('@/services/challengesService');
      const challenge = await ChallengesService.getToday();
      if (challenge && challenge.estado === 'completado') {
        setDailyChallengeCompleted(true);
      } else {
        setDailyChallengeCompleted(false);
      }
    } catch (error) {
      console.log("Error checking daily challenge status:", error);
    }
  };

  useEffect(() => {
    loadEvents();
    loadUserProfile();
    checkDailyChallengeStatus();
  }, [activeFilter]);

  const navigateToSearch = () => router.push('/search');
  const navigateToNotifications = () => router.push('/notifications');
  const navigateToSettings = () => {
    setShowAccountMenu(false);
    router.push('/settings' as any);
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
        unreadNotifications={unreadNotifications}
        userAvatarUrl={userAvatarUrl}
        onAccountPress={() => setShowAccountMenu(true)}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSection}>
          <Text style={styles.greetingText}>¡Hola, Dev!</Text>
          <Text style={styles.subGreeting}>¿Qué vas a construir hoy?</Text>
        </View>

        <View style={styles.bentoGrid}>
          <Pressable
            style={[styles.dailyChallengeCard, dailyChallengeCompleted && styles.dailyChallengeCardCompleted]}
            onPress={() => router.push('/challenges')}
          >
            <View style={styles.challengeInfo}>
              <View style={[styles.challengeIconBg, dailyChallengeCompleted && styles.challengeIconBgCompleted]}>
                <Ionicons name={dailyChallengeCompleted ? "checkmark-circle" : "trophy"} size={24} color={dailyChallengeCompleted ? "#10B981" : "#F59E0B"} />
              </View>
              <View>
                <Text style={styles.cardTitle}>{dailyChallengeCompleted ? "Desafío Completado" : "Desafío Diario"}</Text>
                <Text style={[styles.cardSubtitle, dailyChallengeCompleted && styles.cardSubtitleCompleted]}>
                  {dailyChallengeCompleted ? "¡Bien hecho! Vuelve mañana" : "Gana +50 XP hoy"}
                </Text>
              </View>
            </View>
            <View style={[styles.arrowBg, dailyChallengeCompleted && styles.arrowBgCompleted]}>
              <Ionicons name={dailyChallengeCompleted ? "checkmark" : "arrow-forward"} size={20} color={GLASS.textPrimary} />
            </View>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {FILTERS.map((filter) => (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterPill,
                activeFilter === filter && styles.filterPillActive
              ]}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive
              ]}>
                {filter}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos eventos</Text>
          <Pressable onPress={() => router.push('/search')}>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={GLASS.accent} />
            <Text style={styles.loadingText}>Cargando eventos...</Text>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-clear-outline" size={48} color={GLASS.textSecondary} />
            <Text style={styles.emptyText}>
              No hay eventos disponibles en esta categoría.
            </Text>
          </View>
        ) : (
          events.map((event) => (
            <View key={event.id} style={{ marginBottom: 16 }}>
              <Pressable
                style={styles.eventCard}
                onPress={() => router.push(`/event/${event.id}`)}
              >
                <EventImage
                  uri={event.imagen_url}
                  style={styles.eventImage}
                  category={event.categoria}
                />
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventCategory}>{event.categoria}</Text>
                    <Text style={styles.eventDate}>{new Date(event.fecha).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.eventTitle}>{event.titulo}</Text>
                  <View style={styles.eventFooter}>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color={GLASS.textSecondary} />
                      <Text style={styles.locationText} numberOfLines={1}>{event.ubicacion}</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            </View>
          ))
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
              <Text style={[styles.dropdownItemText, { color: '#EF4444' }]}>
                Cerrar sesión
              </Text>
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
  headerGlass: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: GLASS.border,
  },
  headerContent: {},
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mascotIcon: {
    width: 40,
    height: 40,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: GLASS.border,
    gap: 10,
  },
  searchText: {
    color: GLASS.textSecondary,
    fontSize: 14,
  },
  iconButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // Tab bar space
  },
  heroSection: {
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: GLASS.textPrimary,
  },
  subGreeting: {
    fontSize: 16,
    color: GLASS.textSecondary,
    marginTop: 4,
  },
  bentoGrid: {
    marginBottom: 24,
  },
  dailyChallengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  dailyChallengeCardCompleted: {
    borderColor: 'rgba(16, 185, 129, 0.5)', // Green hint
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  challengeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  challengeIconBg: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeIconBgCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  cardTitle: {
    color: GLASS.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardSubtitle: {
    color: '#F59E0B', // Amber
    fontSize: 14,
    fontWeight: '600',
  },
  cardSubtitleCompleted: {
    color: '#10B981', // Green
  },
  arrowBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowBgCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  filtersContainer: {
    gap: 12,
    marginBottom: 24,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  filterPillActive: {
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    borderColor: GLASS.accent,
  },
  filterText: {
    color: GLASS.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: GLASS.accent,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: GLASS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: GLASS.accent,
    fontSize: 14,
  },
  eventCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventCategory: {
    color: GLASS.accent,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  eventDate: {
    color: GLASS.textSecondary,
    fontSize: 12,
  },
  eventTitle: {
    color: GLASS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    color: GLASS.textSecondary,
    fontSize: 13,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  loadingText: {
    color: GLASS.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  emptyText: {
    color: GLASS.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
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
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#0F172A',
  },
});
