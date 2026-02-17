import Colors from "@/constants/Colors";
import React, { useState } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ChubbyButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export default function ChubbyButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  fullWidth = false,
  icon,
}: ChubbyButtonProps) {
  const [pressed, setPressed] = useState(false);

  const getColors = () => {
    switch (variant) {
      case "primary":
        return {
          bg: Colors.blue.primary,
          shadow: Colors.blue.dark,
          text: Colors.white,
        };
      case "secondary":
        return {
          bg: Colors.purple.vibrant,
          shadow: Colors.purple.dark,
          text: Colors.white,
        };
      case "danger":
        return {
          bg: Colors.error,
          shadow: "#B71C1C",
          text: Colors.white,
        };
    }
  };

  const colors = getColors();

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
    >
      <Animated.View
        style={[
          styles.shadow,
          { backgroundColor: colors.shadow },
          pressed && styles.shadowPressed,
        ]}
      />

      <Animated.View
        style={[
          styles.button,
          { backgroundColor: colors.bg },
          pressed && styles.buttonPressed,
        ]}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={[styles.text, { color: colors.text }]}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    height: 60,
    marginVertical: 8,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  shadow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    borderRadius: 30,
  },
  shadowPressed: {
    height: 56,
  },
  button: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    borderWidth: 0,
  },
  buttonPressed: {
    top: 4,
  },
  text: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
});
