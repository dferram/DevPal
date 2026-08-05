import { Tabs } from "expo-router";
import React from "react";
import { View, Image, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

const COLORS = {
  activeTint: '#22D3EE',
  inactiveTint: '#94A3B8',
  dotColor: '#22D3EE',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.activeTint,
        tabBarInactiveTintColor: COLORS.inactiveTint,
        tabBarStyle: {
          position: "absolute",
          bottom: 25,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 35,
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: 'transparent',
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
        },
        tabBarItemStyle: {
          height: 70,
          padding: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={{
              ...StyleSheet.absoluteFillObject,
              borderRadius: 35,
              overflow: 'hidden',
              backgroundColor: 'rgba(20, 20, 30, 0.6)',
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <View style={styles.iconWrapper}>
                <Image
                  source={require("@/assets/images/devpal-mascot.png")}
                  style={[
                    styles.mascotIcon,
                    { opacity: focused ? 1 : 0.5 }
                  ]}
                  resizeMode="contain"
                />
              </View>
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: "Favoritos",
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name={focused ? "star" : "star-outline"}
                size={30}
                color={color}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: "Mapa",
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name={focused ? "map" : "map-outline"}
                size={30}
                color={color}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Portafolio",
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={30}
                color={color}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen name="chat" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 70, // Altura completa del tab bar
    width: 60,
    top: 14, // Damos un offset consistente hacia abajo para centrar visualmente
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotIcon: {
    width: 32, // Mascota ligeramente más grande
    height: 32,
  },
  activeDot: {
    position: 'absolute',
    bottom: -6, // Ajuste negativo relativo al container desplazado para mantener proporción
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.dotColor,
    shadowColor: COLORS.dotColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
});
