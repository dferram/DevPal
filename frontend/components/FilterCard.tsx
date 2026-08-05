import React from 'react';
import { View, Text, Pressable, ImageBackground, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterCardProps {
  title: string;
  image?: ImageSourcePropType;
  icon?: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
}

export default function FilterCard({ 
  title, 
  image, 
  icon,
  selected, 
  onPress,
  size = 'large'
}: FilterCardProps) {
  const sizeClasses = {
    small: 'h-24',
    medium: 'h-32',
    large: 'h-40',
  };

  return (
    <Pressable 
      onPress={onPress}
      className={`flex-1 ${sizeClasses[size]} rounded-2xl overflow-hidden relative ${selected ? 'border-4 border-primary-blue' : 'border border-gray-200'}`}
    >
      {image ? (
        <ImageBackground
          source={image}
          className="flex-1 justify-end"
          imageStyle={{ borderRadius: 12 }}
        >
          <View className="bg-black/40 p-3">
            <Text className="text-white font-bold text-center text-base">
              {title}
            </Text>
          </View>
        </ImageBackground>
      ) : (
        <View className="flex-1 bg-input-gray items-center justify-center">
          {icon && (
            <Ionicons name={icon} size={40} color={selected ? '#2563EB' : '#64748B'} />
          )}
          <Text className={`font-bold text-center text-base mt-2 ${selected ? 'text-primary-blue' : 'text-dark-bg'}`}>
            {title}
          </Text>
        </View>
      )}
      
      {selected && (
        <View className="absolute top-2 right-2 bg-primary-blue rounded-full p-1">
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
      )}
    </Pressable>
  );
}
