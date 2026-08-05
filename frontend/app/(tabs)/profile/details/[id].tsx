import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import BlueListCard from '@/components/BlueListCard';

const TOPICS = [
  "Variables y tipos de datos",
  "Operadores",
  "Ciclos",
  "If, elif, else",
  "Listas, tuplas, diccionarios y sets",
  "Funciones",
  "Entradas y salidas de datos",
  "Manejo de errores",
];

export default function ChallengeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header - Custom for this screen */}
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

      <ScrollView contentContainerStyle={styles.content}>
        {/* Back Button */}
        <Pressable 
            style={styles.backButton} 
            onPress={() => router.back()}
        >
            <Ionicons name="chevron-back" size={16} color="white" />
            <Text style={styles.backButtonText}>Lenguajes</Text>
        </Pressable>

        <Text style={styles.title}>{id}</Text>
        <Text style={styles.subtitle}>Nivel 1</Text>

        <View style={styles.listContainer}>
          {TOPICS.map((topic, index) => (
            <BlueListCard
              key={index}
              title={topic}
              className="py-5" // Slightly taller cards
            />
          ))}
        </View>
        
        {/* Floating Action Button (Location) */}
        <View style={styles.fabContainer}>
           <Pressable style={styles.fabButton}>
             <Ionicons name="location-outline" size={24} color="white" />
           </Pressable>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1E3A8A', // Dark blue
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginBottom: 16,
  },
  backButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 12,
      marginLeft: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB', // Blue
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
      fontSize: 20,
      color: '#2563EB',
      textAlign: 'center',
      marginBottom: 24,
      fontWeight: '500',
  },
  listContainer: {
      gap: 12,
  },
  fabContainer: {
    alignItems: 'center',
    marginTop: 20,
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
