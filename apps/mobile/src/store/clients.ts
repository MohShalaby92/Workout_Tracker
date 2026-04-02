import { create } from "zustand";
import type { CoachClientStatus } from "@shared/types/database";
import * as clientsService from "@/services/clients";
import type { ClientWithUser } from "@/services/clients";

interface ClientsState {
  clients: ClientWithUser[];
  filter: CoachClientStatus | "all";
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  fetch: (coachId: string) => Promise<void>;
  invite: (email: string) => Promise<void>;
  updateStatus: (
    relationshipId: string,
    status: CoachClientStatus
  ) => Promise<void>;
  setFilter: (filter: CoachClientStatus | "all") => void;
  setSearchQuery: (query: string) => void;
  filteredClients: () => ClientWithUser[];
}

export const useClientsStore = create<ClientsState>((set, get) => ({
  clients: [],
  filter: "all",
  searchQuery: "",
  isLoading: false,
  error: null,

  fetch: async (coachId) => {
    set({ isLoading: true, error: null });
    try {
      const clients = await clientsService.fetchClients(coachId);
      set({ clients });
    } catch (err: any) {
      set({ error: err.message ?? "Failed to load clients" });
    } finally {
      set({ isLoading: false });
    }
  },

  invite: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await clientsService.inviteClient(email);
      // Re-fetch to get the joined user data
      const { clients } = get();
      // The new client will appear after re-fetch by the screen
    } catch (err: any) {
      set({ error: err.message ?? "Failed to invite client" });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateStatus: async (relationshipId, status) => {
    set({ error: null });
    try {
      const updated = await clientsService.updateClientStatus(
        relationshipId,
        status
      );
      set((state) => ({
        clients: state.clients.map((c) =>
          c.id === relationshipId ? { ...c, ...updated } : c
        ),
      }));
    } catch (err: any) {
      set({ error: err.message ?? "Failed to update client status" });
      throw err;
    }
  },

  setFilter: (filter) => set({ filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  filteredClients: () => {
    const { clients, filter, searchQuery } = get();
    let result = clients;

    if (filter !== "all") {
      result = result.filter((c) => c.status === filter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.user.name.toLowerCase().includes(q) ||
          c.user.email.toLowerCase().includes(q)
      );
    }

    return result;
  },
}));
