import { create } from "zustand";
import type { User } from "@shared/types/database";

interface Session {
  access_token: string;
  user: { id: string; email: string };
}

interface AuthState {
  session: Session | null;
  profile: User | null;
  isLoading: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (
    email: string,
    password: string,
    name: string,
    role: "coach" | "client"
  ) => Promise<string | null>;
  signOut: () => Promise<void>;
  setProfile: (profile: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  isLoading: true,

  initialize: async () => {
    // TODO: Initialize Supabase session from storage
    // const { data } = await supabase.auth.getSession();
    // set({ session: data.session, isLoading: false });
    set({ isLoading: false });
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // TODO: Implement with Supabase
      // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      // if (error) return error.message;
      // set({ session: data.session });
      // Fetch profile...
      return null;
    } catch (err) {
      return "An unexpected error occurred";
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password, name, role) => {
    set({ isLoading: true });
    try {
      // TODO: Implement with Supabase
      // const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name, role } } });
      // if (error) return error.message;
      return null;
    } catch (err) {
      return "An unexpected error occurred";
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    // TODO: await supabase.auth.signOut();
    set({ session: null, profile: null });
  },

  setProfile: (profile) => set({ profile }),
}));
