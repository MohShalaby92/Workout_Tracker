import { create } from "zustand";
import { getSupabase } from "@shared/api/supabase";
import type { User, UserRole } from "@shared/types/database";

interface Session {
  access_token: string;
  user: { id: string; email: string };
}

interface AuthState {
  session: Session | null;
  profile: User | null;
  isLoading: boolean; // only true during initial session check
  isSubmitting: boolean; // true during signIn/signUp

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => Promise<string | null>;
  signOut: () => Promise<void>;
  setProfile: (profile: User) => void;
}

async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await getSupabase()
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  isLoading: true,
  isSubmitting: false,

  initialize: async () => {
    try {
      const supabase = getSupabase();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const profile = await fetchProfile(session.user.id);
        set({
          session: {
            access_token: session.access_token,
            user: { id: session.user.id, email: session.user.email ?? "" },
          },
          profile,
        });
      } else {
        set({ session: null, profile: null });
      }

      // Listen for auth state changes (token refresh, sign out, etc.)
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (event === "SIGNED_OUT") {
          set({ session: null, profile: null });
          return;
        }

        if (newSession) {
          set({
            session: {
              access_token: newSession.access_token,
              user: {
                id: newSession.user.id,
                email: newSession.user.email ?? "",
              },
            },
          });

          // Fetch profile if we don't have one yet
          if (!get().profile) {
            const profile = await fetchProfile(newSession.user.id);
            set({ profile });
          }
        }
      });
    } catch {
      set({ session: null, profile: null });
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    set({ isSubmitting: true });
    try {
      const { data, error } = await getSupabase().auth.signInWithPassword({
        email,
        password,
      });

      if (error) return error.message;

      const profile = await fetchProfile(data.user.id);
      set({
        session: {
          access_token: data.session.access_token,
          user: { id: data.user.id, email: data.user.email ?? "" },
        },
        profile,
      });
      return null;
    } catch (err: any) {
      return err.message ?? "An unexpected error occurred";
    } finally {
      set({ isSubmitting: false });
    }
  },

  signUp: async (email, password, name, role) => {
    set({ isSubmitting: true });
    try {
      const { data, error } = await getSupabase().auth.signUp({
        email,
        password,
        options: { data: { name, role } },
      });

      if (error) return error.message;
      if (!data.user) return "Signup failed — no user returned";

      // If Supabase has email confirmation disabled, we get a session immediately.
      // If email confirmation is ON, data.session is null.
      if (!data.session) {
        // No session = email confirmation is required.
        // Auto-sign-in so the user doesn't have to go check email during dev.
        const { data: signInData, error: signInError } =
          await getSupabase().auth.signInWithPassword({ email, password });

        if (signInError) {
          // Email confirmation IS enforced and we can't bypass it
          return "Account created! Please check your email to confirm, then sign in.";
        }

        // Wait for the DB trigger to create the users row
        await new Promise((r) => setTimeout(r, 500));

        const profile = await fetchProfile(signInData.user.id);
        set({
          session: {
            access_token: signInData.session.access_token,
            user: {
              id: signInData.user.id,
              email: signInData.user.email ?? "",
            },
          },
          profile,
        });
        return null;
      }

      // Session exists — email confirmation is off
      await new Promise((r) => setTimeout(r, 500));
      const profile = await fetchProfile(data.user.id);
      set({
        session: {
          access_token: data.session.access_token,
          user: { id: data.user.id, email: data.user.email ?? "" },
        },
        profile,
      });
      return null;
    } catch (err: any) {
      return err.message ?? "An unexpected error occurred";
    } finally {
      set({ isSubmitting: false });
    }
  },

  signOut: async () => {
    await getSupabase().auth.signOut();
    set({ session: null, profile: null });
  },

  setProfile: (profile) => set({ profile }),
}));
