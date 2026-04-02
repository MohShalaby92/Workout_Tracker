import "../global.css";

import { useEffect } from "react";
import { Platform, View, ActivityIndicator } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { initSupabase } from "@shared/api/supabase";
import { useAuthStore } from "@/store/auth";

// Set dark class on <html> before React renders so NativeWind initializes in dark mode
if (typeof document !== "undefined") {
  document.documentElement.classList.add("dark");
}

if (Platform.OS !== "web" || typeof window !== "undefined") {
  SplashScreen.preventAutoHideAsync();

  initSupabase(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function RootLayout() {
  const { session, profile, isLoading, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Auth-based routing — runs whenever session/profile/segments change
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isAuthenticated = !!session;

    if (!isAuthenticated && !inAuthGroup) {
      // Not logged in and not on auth screen → go to login
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Wait until profile is loaded before routing — avoids race condition
      // where session arrives before profile, defaulting to wrong role
      if (!profile) return;

      if (profile.role === "coach") {
        router.replace("/(coach)/dashboard");
      } else {
        router.replace("/(client)/train");
      }
    }
  }, [isLoading, session, profile, segments]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-navy-deep items-center justify-center">
        <ActivityIndicator size="large" color="#00E5CC" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(coach)" />
        <Stack.Screen name="(client)" />
      </Stack>
    </>
  );
}
