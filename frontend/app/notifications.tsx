import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { AuthService } from '@/services/authService';

const GLASS = {
  bg: 'rgba(30, 41, 59, 0.7)',
  border: 'rgba(255, 255, 255, 0.1)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  accent: '#22D3EE',
  inputBg: 'rgba(15, 23, 42, 0.6)',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await AuthService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error loading notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'evento': return 'calendar';
      case 'recordatorio': return 'alarm';
      case 'sistema': return 'information-circle';
      case 'logro': return 'trophy';
      default: return 'notifications';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'evento': return GLASS.accent;
      case 'recordatorio': return GLASS.warning;
      case 'sistema': return GLASS.textSecondary;
      case 'logro': return GLASS.success;
      default: return GLASS.textPrimary;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.bgGradient} />
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <BlurView intensity={30} tint="dark" style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={GLASS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={styles.placeholder} />
      </BlurView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color={GLASS.accent} style={{ marginTop: 50 }} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color={GLASS.textSecondary} />
            <Text style={styles.emptyText}>No tienes notificaciones</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <BlurView
              intensity={20}
              tint="dark"
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.leido && styles.notificationUnread
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <Ionicons name={getIcon(notification.tipo)} size={20} color={getColor(notification.tipo)} />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.titulo}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationTime}>
                  {new Date(notification.created_at).toLocaleDateString()}
                </Text>
              </View>
              {!notification.leido && <View style={styles.unreadDot} />}
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
  bgGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0F172A' },
  bgCircle1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#2563EB', opacity: 0.15, top: -50, right: -50 },
  bgCircle2: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#22D3EE', opacity: 0.1, bottom: 100, left: -80 },

  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: GLASS.border,
    overflow: 'hidden',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  headerTitle: {
    color: GLASS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  notificationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: GLASS.border,
    overflow: 'hidden',
  },
  notificationUnread: {
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: GLASS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    color: GLASS.textSecondary,
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  notificationTime: {
    color: 'rgba(148, 163, 184, 0.7)',
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GLASS.accent,
    marginLeft: 8,
    marginTop: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    opacity: 0.7,
  },
  emptyText: {
    color: GLASS.textSecondary,
    marginTop: 16,
    fontSize: 16,
  }
});
