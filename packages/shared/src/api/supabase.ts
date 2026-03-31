import { createClient, SupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

let _supabase: SupabaseClient | null = null;

/**
 * Initialize the Supabase client. Call once at app startup
 * before any queries. Env vars come from the host app.
 */
export function initSupabase(url: string, anonKey: string): SupabaseClient {
  _supabase = createClient(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return _supabase;
}

/**
 * Get the initialized Supabase client.
 * Throws if initSupabase() hasn't been called yet.
 */
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    throw new Error("Supabase not initialized. Call initSupabase() first.");
  }
  return _supabase;
}
