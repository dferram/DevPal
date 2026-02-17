import { Stack } from 'expo-router';
import React from 'react';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="projects" />
      <Stack.Screen name="details/[id]" />
      <Stack.Screen name="new-project" />
      <Stack.Screen name="challenges" />
    </Stack>
  );
}
