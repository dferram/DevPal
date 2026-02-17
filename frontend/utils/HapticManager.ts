import * as Haptics from 'expo-haptics';

export class HapticManager {
    static light() {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
            console.warn('Haptics not available:', error);
        }
    }

    static medium() {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
            console.warn('Haptics not available:', error);
        }
    }

    static heavy() {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (error) {
            console.warn('Haptics not available:', error);
        }
    }

    static selection() {
        try {
            Haptics.selectionAsync();
        } catch (error) {
            console.warn('Haptics not available:', error);
        }
    }

    static success() {
        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.warn('Haptics not available:', error);
        }
    }

    static warning() {
        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch (error) {
            console.warn('Haptics not available:', error);
        }
    }

    static error() {
        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (error) {
            console.warn('Haptics not available:', error);
        }
    }
}
