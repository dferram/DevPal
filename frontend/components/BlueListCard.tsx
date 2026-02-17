import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface BlueListCardProps {
  title: string;
  percentage?: string | number;
  subtitle?: string;
  onPress?: () => void;
  className?: string;
}

export default function BlueListCard({ 
  title, 
  percentage, 
  subtitle, 
  onPress,
  className 
}: BlueListCardProps) {
  return (
    <Pressable 
      onPress={onPress}
      className={`bg-blue-600 rounded-xl p-4 mb-3 flex-row items-center justify-between active:opacity-80 ${className || ''}`}
    >
      <View className="flex-1">
        <Text className="text-white text-base font-medium">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-blue-100 text-sm mt-1">
            {subtitle}
          </Text>
        )}
      </View>
      
      {percentage !== undefined && (
        <Text className="text-white text-sm font-semibold pl-4">
          {percentage}{typeof percentage === 'number' ? '%' : ''}
        </Text>
      )}
    </Pressable>
  );
}
