import React from 'react';
import { View, Text, FlatList, Pressable, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import BlueListCard from '@/components/BlueListCard';

// Mock projects
const PROJECTS = [
  { id: '1', name: 'DevPal' },
  { id: '2', name: 'InfoTrack' },
  { id: '3', name: 'Frameworks' },
  { id: '4', name: 'SAC 2026' },
];

export default function PortfolioScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header - Consistent with Home */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Image 
            source={require('@/assets/images/devpal-mascot.png')} 
            style={styles.mascotIcon}
            resizeMode="contain"
          />
          <View style={styles.searchBar}>
            <Text style={styles.searchText}>Buscar</Text>
            <Ionicons name="search" size={20} color="#2563EB" />
          </View>
          <View style={styles.iconRow}>
            <Ionicons name="person-circle" size={30} color="white" />
            <Ionicons name="notifications" size={24} color="white" />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Portafolio</Text>

        <View style={styles.listContainer}>
            {PROJECTS.map((item) => (
                <BlueListCard
                    key={item.id}
                    title={item.name}
                    className="justify-center items-center"
                />
            ))}
            
            {/* New Project Button */}
            <View style={styles.newProjectContainer}>
                <Pressable 
                    style={styles.newProjectButton}
                    onPress={() => router.push('/profile/new-project')}
                >
                    <Ionicons name="add" size={32} color="white" />
                </Pressable>
                <Text style={styles.newProjectText}>Nuevo proyecto</Text>
            </View>
        </View>
        
        {/* Floating Action Button (Location) */}
        <View style={styles.fabContainer}>
           <Pressable style={styles.fabButton}>
             <Ionicons name="location-outline" size={24} color="white" />
           </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  mascotIcon: {
    width: 32,
    height: 32,
  },
  searchBar: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 24,
  },
  listContainer: {
      gap: 12
  },
  newProjectContainer: {
      alignItems: 'center',
      marginTop: 20,
      gap: 8,
  },
  newProjectButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#2563EB',
      alignItems: 'center',
      justifyContent: 'center',
  },
  newProjectText: {
      color: '#2563EB',
      fontSize: 14,
      fontWeight: '500',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E40AF', // bg-blue-700
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
