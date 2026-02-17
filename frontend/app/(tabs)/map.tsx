import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Image, Modal, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MapView from "@/components/MapView";
import { EventsService } from "@/services/eventsService";
import { BlurView } from "expo-blur";

const GLASS = {
  bg: 'rgba(30, 41, 59, 0.7)',
  border: 'rgba(255, 255, 255, 0.1)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  accent: '#22D3EE',
  inputBg: 'rgba(15, 23, 42, 0.6)',
};

const DEFAULT_REGION = {
  latitude: 20.5888,
  longitude: -100.3899,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mapRef = useRef<any>(null);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
    loadUserProfile();
  }, []);

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

  useEffect(() => {
    if (id && events.length > 0) {
      const targetEvent = events.find(e => e.id === id);
      if (targetEvent) {
        setSelectedPin(id);
        const newRegion = {
          latitude: parseFloat(targetEvent.latitud),
          longitude: parseFloat(targetEvent.longitud),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        mapRef.current?.animateToRegion(newRegion, 1000);
      }
    }
  }, [id, events]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await EventsService.getAll(undefined, 100);
      const mapEvents = data.filter((e: any) =>
        e.latitud && e.longitud &&
        !isNaN(parseFloat(e.latitud)) && !isNaN(parseFloat(e.longitud)) &&
        parseFloat(e.latitud) !== 0 && parseFloat(e.longitud) !== 0
      );
      setEvents(mapEvents);
    } catch (error) {
      console.error("Error loading map events:", error);
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

  const selectedEvent = events.find(e => e.id === selectedPin);

  const mapMarkers = events.map(event => ({
    id: event.id,
    coordinate: {
      latitude: parseFloat(event.latitud),
      longitude: parseFloat(event.longitud),
    },
    title: event.titulo,
    category: event.categoria,
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <BlurView intensity={30} tint="dark" style={styles.headerGlass}>
        <View style={styles.searchRow}>
          <Image
            source={require('@/assets/images/devpal-mascot.png')}
            style={styles.mascotIcon}
            resizeMode="contain"
          />

          <Pressable style={styles.searchContainer} onPress={navigateToSearch}>
            <Text style={styles.searchText}>Buscar e.g. "React"</Text>
            <Ionicons name="search" size={18} color={GLASS.textSecondary} />
          </Pressable>

          <Pressable style={[styles.iconButton, userAvatarUrl && styles.avatarButton]} onPress={() => setShowAccountMenu(true)}>
            {userAvatarUrl ? (
              <Image source={{ uri: userAvatarUrl }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person-circle-outline" size={28} color={GLASS.textPrimary} />
            )}
          </Pressable>

          <Pressable style={styles.iconButton} onPress={navigateToNotifications}>
            <Ionicons name="notifications-outline" size={24} color={GLASS.textPrimary} />
          </Pressable>
        </View>
      </BlurView>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={DEFAULT_REGION}
          markers={mapMarkers}
          onMarkerPress={setSelectedPin}
        />
      </View>

      {selectedEvent && (
        <BlurView intensity={80} tint="dark" style={styles.eventModal}>
          <View style={styles.eventModalContent}>
            <Image
              source={selectedEvent.imagen_url ? { uri: selectedEvent.imagen_url } : { uri: `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100` }}
              style={styles.eventImage}
            />
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle} numberOfLines={1}>{selectedEvent.titulo}</Text>
              <View style={styles.eventMeta}>
                <Ionicons name="calendar-outline" size={14} color={GLASS.accent} />
                <Text style={styles.eventMetaText}>{new Date(selectedEvent.fecha).toLocaleDateString()}</Text>
              </View>
              <View style={styles.eventMeta}>
                <Ionicons name="location-outline" size={14} color={GLASS.textSecondary} />
                <Text style={styles.eventMetaText} numberOfLines={1}>{selectedEvent.ubicacion}</Text>
              </View>
            </View>
            <Pressable style={styles.closeButton} onPress={() => setSelectedPin(null)}>
              <Ionicons name="close-circle" size={24} color={GLASS.textSecondary} />
            </Pressable>
          </View>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push(`/event/${selectedEvent.id}`)}
          >
            <Text style={styles.actionButtonText}>Ver Detalles</Text>
            <Ionicons name="arrow-forward" size={16} color="#0F172A" />
          </Pressable>
        </BlurView>
      )}

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

function getCategoryIcon(category: string) {
  let iconName: any = "location";

  switch (category?.toLowerCase()) {
    case 'hackathon': iconName = "code-slash"; break;
    case 'conferencia': iconName = "mic"; break;
    case 'taller': iconName = "hammer"; break;
    case 'meetup': iconName = "people"; break;
    case 'concurso': iconName = "trophy"; break;
  }

  return <Ionicons name={iconName} size={16} color="#FFF" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  headerGlass: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    borderRadius: 25,
    overflow: 'hidden',
    padding: 10,
    zIndex: 100,
    borderWidth: 1,
    borderColor: GLASS.border,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mascotIcon: {
    width: 32,
    height: 32,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchText: {
    color: GLASS.textSecondary,
    fontSize: 14,
  },
  iconButton: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
  },
  avatarButton: {
    padding: 4,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: GLASS.textSecondary,
  },
  pin: {
    backgroundColor: GLASS.accent,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: GLASS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  pinSelected: {
    backgroundColor: '#F59E0B',
    transform: [{ scale: 1.25 }],
    zIndex: 10,
    borderColor: '#FFF',
  },
  eventModal: {
    position: 'absolute',
    bottom: 110,
    left: 20,
    right: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS.border,
    padding: 4,
  },
  eventModalContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  eventImage: {
    width: 70,
    height: 70,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GLASS.border,
    backgroundColor: '#1E293B',
  },
  eventInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  eventTitle: {
    color: GLASS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  eventMetaText: {
    color: GLASS.textSecondary,
    fontSize: 12,
  },
  closeButton: {
    padding: 4,
    alignSelf: 'flex-start',
  },
  actionButton: {
    backgroundColor: GLASS.accent,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: 'bold',
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
