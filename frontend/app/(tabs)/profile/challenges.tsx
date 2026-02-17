import React from 'react';
import { View, Text, FlatList, ScrollView, Pressable, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import BlueListCard from '@/components/BlueListCard';

// Mock data for languages
const LANGUAGES = [
  { id: '1', name: 'JavaScript', percentage: 0 },
  { id: '2', name: 'Python', percentage: 20 },
  { id: '3', name: 'Java', percentage: 80 },
  { id: '4', name: 'C / C++', percentage: 0 },
  { id: '5', name: 'C#', percentage: 0 },
  { id: '6', name: 'HTML', percentage: 60 },
  { id: '7', name: 'CSS', percentage: 50 },
  { id: '8', name: 'TypeScript', percentage: 0 },
];

export default function ChallengesScreen() {
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
        <Text style={styles.title}>Lenguajes</Text>

        <FlatList
          data={LANGUAGES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <BlueListCard
              title={item.name}
              percentage={item.percentage}
              onPress={() => router.push(`/profile/details/${item.name}`)}
            />
          )}
        />
        
        {/* Floating Action Button (Location) */}
        <View style={styles.fabContainer}>
           <Pressable style={styles.fabButton} onPress={() => router.push('/profile/projects')}>
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
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 100, // Space for FAB and TabBar
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
