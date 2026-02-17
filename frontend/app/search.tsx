import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { EventsService } from '@/services/eventsService';

const GLASS = {
  bg: 'rgba(30, 41, 59, 0.7)',
  border: 'rgba(255, 255, 255, 0.1)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  accent: '#22D3EE',
  inputBg: 'rgba(15, 23, 42, 0.6)',
};

const RECENT_SEARCHES = [
  { id: '1', title: 'Peña de Bernal', subtitle: '21 de Noviembre - 300 personas' },
];

const SUGGESTIONS = [
  'Por la mera',
  'Descubre que hay a tu alrededor',
  'Santiago de Querétaro',
];

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredEvents = events.filter((event) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const titulo = (event.titulo || '').toLowerCase();
    const descripcion = (event.descripcion || '').toLowerCase();
    const categoria = (event.categoria || '').toLowerCase();
    const ubicacion = (event.ubicacion || '').toLowerCase();
    return titulo.includes(query) || descripcion.includes(query) || categoria.includes(query) || ubicacion.includes(query);
  });

  useEffect(() => {
    loadEvents();
  }, [selectedCategory]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await EventsService.getAll(selectedCategory, 50, 0);
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateToNotifications = () => router.push('/notifications');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.bgGradient} />
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <BlurView intensity={30} tint="dark" style={styles.header}>
        <View style={styles.searchRow}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color={GLASS.textPrimary} />
          </Pressable>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={GLASS.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Buscar..."
              placeholderTextColor={GLASS.textSecondary}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setShowDropdown(text.length === 0);
              }}
              onFocus={() => setShowDropdown(searchQuery.length === 0)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => {
                setSearchQuery('');
                setShowDropdown(true);
              }}>
                <Ionicons name="close-circle" size={18} color={GLASS.textSecondary} />
              </Pressable>
            )}
          </View>

          <Pressable style={styles.iconButton} onPress={navigateToNotifications}>
            <Ionicons name="notifications-outline" size={24} color={GLASS.textPrimary} />
          </Pressable>
        </View>

        {showDropdown && (
          <View style={styles.dropdown}>
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
            <Text style={styles.dropdownHeader}>Búsquedas recientes</Text>

            {RECENT_SEARCHES.map((item) => (
              <Pressable
                key={item.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSearchQuery(item.title);
                  setShowDropdown(false);
                }}
              >
                <View style={styles.dropdownItemIcon}>
                  <Ionicons name="time-outline" size={16} color={GLASS.textSecondary} />
                </View>
                <View>
                  <Text style={styles.dropdownItemTitle}>{item.title}</Text>
                  <Text style={styles.dropdownItemSubtitle}>{item.subtitle}</Text>
                </View>
              </Pressable>
            ))}

            <Text style={styles.dropdownHeader}>Sugerencias de búsqueda</Text>

            {SUGGESTIONS.map((suggestion, index) => (
              <Pressable
                key={index}
                style={styles.dropdownItem}
                onPress={() => {
                  setSearchQuery(suggestion);
                  setShowDropdown(false);
                }}
              >
                <View style={styles.dropdownItemIcon}>
                  <Ionicons name="search" size={16} color={GLASS.textSecondary} />
                </View>
                <Text style={styles.dropdownItemTitle}>{suggestion}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </BlurView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24, marginTop: 10 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
          {['Hackathon', 'Conferencia', 'Taller', 'Meetup'].map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.filterPill,
                selectedCategory === cat && styles.filterPillActive
              ]}
              onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            >
              <Text style={selectedCategory === cat ? styles.filterTextActive : styles.filterText}>
                {cat}s
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>
          Próximos eventos
        </Text>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={GLASS.accent} />
            <Text style={{ marginTop: 12, color: GLASS.textSecondary }}>Cargando eventos...</Text>
          </View>
        ) : filteredEvents.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: GLASS.textSecondary, fontSize: 16 }}>
              {searchQuery.trim() ? 'No se encontraron resultados' : 'No hay eventos disponibles'}
            </Text>
          </View>
        ) : (
          filteredEvents.map((event: any) => (
            <BlurView key={event.id} intensity={20} tint="dark" style={styles.eventCard}>
              <Pressable
                style={styles.eventCardHeader}
                onPress={() => router.push(`/event/${event.id}`)}
              >
                <View style={styles.eventCardLeft}>
                  <View style={styles.eventIconContainer}>
                    <Ionicons name="calendar" size={20} color={GLASS.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {event.titulo}
                    </Text>
                    <Text style={styles.eventDate}>
                      {new Date(event.fecha).toLocaleDateString()} • {event.categoria}
                    </Text>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color={GLASS.textSecondary} />
              </Pressable>
            </BlurView>
          ))
        )}
      </ScrollView>
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
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 10,
    borderBottomWidth: 1,
    borderColor: GLASS.border,
    overflow: 'hidden', // Para que el blur no se salga
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mascotIcon: {
    width: 32,
    height: 32,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: GLASS.inputBg,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: GLASS.textPrimary,
  },
  iconButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  dropdown: {
    borderRadius: 16,
    marginTop: 12,
    padding: 16,
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  dropdownHeader: {
    color: GLASS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  dropdownItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dropdownItemTitle: {
    color: GLASS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownItemSubtitle: {
    color: GLASS.textSecondary,
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingTop: 10,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: GLASS.border,
  },
  filterPillActive: {
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    borderColor: GLASS.accent,
  },
  filterText: {
    fontWeight: '500',
    color: GLASS.textSecondary,
  },
  filterTextActive: {
    fontWeight: '600',
    color: GLASS.accent,
  },
  sectionTitle: {
    color: GLASS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  eventCard: {
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    marginHorizontal: 20,
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
    marginRight: 10,
  },
  eventIconContainer: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderRadius: 14,
    padding: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
  },
  eventTitle: {
    color: GLASS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventDate: {
    color: GLASS.textSecondary,
    fontSize: 12,
  },
});
