import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AuthStorage } from '@/utils/AuthStorage';
import { useRouter, useSegments } from 'expo-router';
import api from '@/services/api';
import { ENDPOINTS } from '@/constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'onboarding_completed';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    userId: string | null;
    needsOnboarding: boolean;
    signIn: (userData: any, rememberMe?: boolean, isNewUser?: boolean) => Promise<void>;
    signOut: () => Promise<void>;
    checkAuth: () => Promise<void>;
    completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);
    const isLoggingOutRef = useRef(false);
    const router = useRouter();
    const segments = useSegments();

    const checkAuth = useCallback(async () => {
        if (isLoggingOutRef.current) {
            console.log('Skipping auth check - logout in progress');
            return;
        }

        console.log('checkAuth RUNNING...');

        try {
            const hasSession = await AuthStorage.hasActiveSession();
            const storedUserId = await AuthStorage.getUserId();

            console.log('Auth check result:', { hasSession, storedUserId, isLoggingOut: isLoggingOutRef.current });

            if (isLoggingOutRef.current) {
                console.log('Logout started during check, aborting');
                return;
            }

            if (hasSession && storedUserId) {
                try {
                    await api.get(ENDPOINTS.AUTH.ME(storedUserId));
                    console.log('User validated in backend');
                    setIsAuthenticated(true);
                    setUserId(storedUserId);

                    const onboardingCompleted = await AsyncStorage.getItem(`${ONBOARDING_KEY}_${storedUserId}`);
                    setNeedsOnboarding(onboardingCompleted !== 'true');
                    console.log('Onboarding status:', onboardingCompleted !== 'true' ? 'needed' : 'completed');
                } catch (error: any) {
                    if (error.response?.status === 404) {
                        console.log('User not found in backend, clearing session');
                        await AuthStorage.clearSession();
                        setIsAuthenticated(false);
                        setUserId(null);
                    } else {
                        console.log('Could not validate user, keeping local session');
                        setIsAuthenticated(true);
                        setUserId(storedUserId);

                        const onboardingCompleted = await AsyncStorage.getItem(`${ONBOARDING_KEY}_${storedUserId}`);
                        setNeedsOnboarding(onboardingCompleted !== 'true');
                    }
                }
            } else {
                setIsAuthenticated(false);
                setUserId(null);
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            setIsAuthenticated(false);
            setUserId(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        const handleNavigation = async () => {
            console.log('Navigation effect:', {
                isLoading,
                isLoggingOut: isLoggingOutRef.current,
                isAuthenticated,
                needsOnboarding,
                segments: segments.join('/')
            });

            if (isLoading || isLoggingOutRef.current) {
                console.log('Skipping navigation - loading or logging out');
                return;
            }

            const inAuthGroup = segments[0] === '(auth)';
            const inOnboardingGroup = segments[0] === '(onboarding)';

            if (isAuthenticated && needsOnboarding && !inOnboardingGroup) {
                console.log('Needs onboarding, navigating to interests');
                router.replace('/(onboarding)/interests');
            } else if (isAuthenticated && !needsOnboarding && (inAuthGroup || inOnboardingGroup)) {
                const reallyHasSession = await AuthStorage.hasActiveSession();
                if (!reallyHasSession) {
                    console.log('State says authenticated but no session in storage! Correcting...');
                    setIsAuthenticated(false);
                    setUserId(null);
                    return;
                }
                console.log('NAVIGATING TO TABS - isAuthenticated:', isAuthenticated);
                router.replace('/(tabs)');
            } else if (!isAuthenticated && !inAuthGroup && !inOnboardingGroup) {
                console.log('Not authenticated, navigating to auth');
                router.replace('/(auth)/welcome');
            } else {
                console.log('No navigation needed');
            }
        };

        handleNavigation();
    }, [isAuthenticated, isLoading, needsOnboarding, segments]);

    const signIn = async (userData: any, rememberMe: boolean = true, isNewUser: boolean = false) => {
        await AuthStorage.saveSession(userData, rememberMe);
        setIsAuthenticated(true);
        setUserId(userData.user_id);

        // Only require onboarding for new users or if explicitly requested
        if (isNewUser) {
            setNeedsOnboarding(true);
        } else {
            // Existing users are assumed to have completed onboarding (or it's optional)
            // This prevents the preferences screen from showing on every login/reinstall
            setNeedsOnboarding(false);

            // Mark as completed in local storage to be consistent
            if (userData.user_id) {
                await AsyncStorage.setItem(`${ONBOARDING_KEY}_${userData.user_id}`, 'true');
            }
        }
    };

    const completeOnboarding = async () => {
        if (userId) {
            await AsyncStorage.setItem(`${ONBOARDING_KEY}_${userId}`, 'true');
            setNeedsOnboarding(false);
            console.log('Onboarding completed');
        }
    };

    const signOut = async () => {
        console.log('Signing out...');

        isLoggingOutRef.current = true;

        try {
            await AuthStorage.clearSession();
            console.log('Session cleared from storage');

            const stillHasSession = await AuthStorage.hasActiveSession();
            console.log('Session after clear:', stillHasSession ? 'STILL EXISTS!' : 'cleared');
        } catch (error) {
            console.error('Error clearing session:', error);
        }

        setIsAuthenticated(false);
        setUserId(null);
        setNeedsOnboarding(false);

        console.log('State updated, navigating to welcome...');

        router.replace('/(auth)/welcome');

        setTimeout(() => {
            isLoggingOutRef.current = false;
            console.log('Logout lock released');
        }, 2000);
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isLoading,
            userId,
            needsOnboarding,
            signIn,
            signOut,
            checkAuth,
            completeOnboarding,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
