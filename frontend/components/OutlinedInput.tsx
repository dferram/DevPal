import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';

interface OutlinedInputProps extends TextInputProps {
  className?: string;
}

export default function OutlinedInput({ className, ...props }: OutlinedInputProps) {
  return (
    <View className={`mb-4 ${className || ''}`}>
      <TextInput
        placeholderTextColor="#94A3B8"
        className="bg-white border border-blue-400 rounded-3xl px-6 py-3 text-center text-slate-700 font-medium"
        {...props}
      />
    </View>
  );
}
