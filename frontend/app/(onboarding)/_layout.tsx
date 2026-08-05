import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="interests" />
      <Stack.Screen name="languages" />
    </Stack>
  );
}
