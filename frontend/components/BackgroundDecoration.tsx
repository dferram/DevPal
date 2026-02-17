import React from 'react';
import { View } from 'react-native';

interface BackgroundDecorationProps {
  variant?: 'default' | 'auth';
}

export default function BackgroundDecoration({ variant = 'default' }: BackgroundDecorationProps) {
  return (
    <View className="absolute inset-0 overflow-hidden">
      <View 
        className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary-blue/20"
      />
      
      <View 
        className="absolute -top-10 -right-16 w-48 h-48 rounded-full bg-accent-cyan/15"
      />
      
      <View 
        className="absolute top-1/3 -left-10 w-32 h-32 rounded-full bg-primary-blue/25"
      />
      
      <View 
        className="absolute bottom-20 -right-20 w-56 h-56 rounded-full bg-accent-cyan/20"
      />
      
      <View 
        className="absolute -bottom-16 left-10 w-40 h-40 rounded-full bg-primary-blue/15"
      />
      
      <View 
        className="absolute top-1/2 right-10 w-24 h-24 rounded-full bg-accent-cyan/10"
      />
      
      <View 
        className="absolute bottom-1/3 left-1/4 w-20 h-20 rounded-full bg-primary-blue/10"
      />
    </View>
  );
}
