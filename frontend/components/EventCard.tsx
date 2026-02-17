import Colors from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: "workshop" | "meetup" | "conference";
  image?: string;
  popular?: boolean;
  spotsLeft?: number;
}

interface EventCardProps {
  event: Event;
  onPress?: () => void;
}

export default function EventCard({ event, onPress }: EventCardProps) {
  const getCategoryColor = () => {
    switch (event.category) {
      case "workshop":
        return Colors.cyan.bright;
      case "meetup":
        return Colors.purple.vibrant;
      case "conference":
        return Colors.blue.primary;
      default:
        return Colors.gray[400];
    }
  };

  const getCategoryIcon = () => {
    switch (event.category) {
      case "workshop":
        return "W";
      case "meetup":
        return "M";
      case "conference":
        return "C";
      default:
        return "E";
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View
        style={[styles.iconContainer, { backgroundColor: getCategoryColor() }]}
      >
        <Text style={styles.categoryIcon}>{getCategoryIcon()}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={styles.datetime}>
          {event.date} • {event.time}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {event.location}
        </Text>
      </View>

      {event.popular && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Popular</Text>
        </View>
      )}
      {event.spotsLeft && event.spotsLeft <= 5 && (
        <View style={[styles.badge, styles.badgeWarning]}>
          <Text style={styles.badgeText}>{event.spotsLeft} cupos</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  categoryIcon: {
    fontSize: 28,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  datetime: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 4,
    fontWeight: "500",
  },
  location: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.purple.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeWarning: {
    backgroundColor: Colors.warning,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.white,
  },
});
