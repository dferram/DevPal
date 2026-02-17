import Colors from "@/constants/Colors";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface AIChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export default function AIChatBubble({
  message,
  isUser,
  timestamp,
}: AIChatBubbleProps) {
  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.aiContainer,
      ]}
    >
      {!isUser && (
        <View style={styles.avatar}>
          <Image
            source={require("@/assets/images/devpal-mascot.png")}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </View>
      )}

      <View
        style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}
      >
        <Text
          style={[
            styles.message,
            isUser ? styles.userMessage : styles.aiMessage,
          ]}
        >
          {message}
        </Text>
        {timestamp && (
          <Text
            style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.aiTimestamp,
            ]}
          >
            {timestamp}
          </Text>
        )}
      </View>

      {isUser && <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 6,
    paddingHorizontal: 16,
  },
  userContainer: {
    justifyContent: "flex-end",
  },
  aiContainer: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    overflow: "hidden",
  },
  mascotImage: {
    width: 40,
    height: 40,
  },
  avatarText: {
    fontSize: 20,
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: Colors.blue.primary,
    borderTopRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Colors.gray[100],
    borderTopLeftRadius: 4,
  },
  message: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessage: {
    color: Colors.white,
  },
  aiMessage: {
    color: Colors.text.primary,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  userTimestamp: {
    color: "#fff",
    opacity: 0.7,
    textAlign: "right",
  },
  aiTimestamp: {
    color: Colors.text.secondary,
  },
  spacer: {
    width: 36,
  },
});
