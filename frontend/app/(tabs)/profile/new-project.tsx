import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import OutlinedInput from '@/components/OutlinedInput';

export default function NewProjectScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header - Consistent with others */}
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
        <Text style={styles.title}>Empecemos!</Text>

        <View style={styles.form}>
            <OutlinedInput placeholder="Nombre del proyecto..." />
            <OutlinedInput placeholder="Nombre de los participantes..." />
            <OutlinedInput placeholder="Herramientas de desarrollo..." />
            <OutlinedInput placeholder="Objetivo del proyecto..." />
            <OutlinedInput placeholder="Objetivos específicos..." />
            <OutlinedInput placeholder="Categoría del proyecto..." />
            <OutlinedInput placeholder="Imágenes de evidencias..." />
        </View>

        <Pressable style={styles.submitButton} onPress={() => router.back()}>
            <Text style={styles.submitButtonText}>Registrarlo</Text>
        </Pressable>
        
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
    paddingHorizontal: 30, // Extra padding for form look
    paddingTop: 30,
    paddingBottom: 100,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
      gap: 12,
      marginBottom: 30,
  },
  submitButton: {
      backgroundColor: '#1E40AF', // bg-blue-800
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 20,
      width: '60%',
      alignSelf: 'center',
  },
  submitButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 16,
  },
  fabContainer: {
    alignItems: 'center',
    marginTop: 10,
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
