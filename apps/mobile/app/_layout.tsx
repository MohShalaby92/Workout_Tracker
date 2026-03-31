import "../global.css";

import { useEffect } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
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
  const { session, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  // TODO: Re-enable auth guards once login flow is wired up
  // For now, always show coach layout for development
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" redirect={true} />
        <Stack.Screen name="(coach)" />
        <Stack.Screen name="(client)" redirect={true} />
      </Stack>
    </>
  );
}
