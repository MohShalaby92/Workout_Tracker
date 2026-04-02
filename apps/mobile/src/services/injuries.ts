import { getSupabase } from "@shared/api/supabase";
import type { Injury, InjuryStatus } from "@shared/types/database";

export async function fetchInjuries(clientId: string): Promise<Injury[]> {
  const { data, error } = await getSupabase()
    .from("injuries")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export interface InjuryWithClient extends Injury {
  client: { id: string; name: string; email: string };
}

export async function fetchAllCoachInjuries(
  coachId: string
): Promise<InjuryWithClient[]> {
  const supabase = getSupabase();

  // Get all client IDs for this coach
  const { data: relationships, error: relError } = await supabase
    .from("coach_clients")
    .select("client_id")
    .eq("coach_id", coachId)
    .in("status", ["active", "pending"]);

  if (relError) throw relError;
  if (!relationships?.length) return [];

  const clientIds = relationships.map((r) => r.client_id);

  const { data, error } = await supabase
    .from("injuries")
    .select("*, client:users!client_id(id, name, email)")
    .in("client_id", clientIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchInjuriesForClients(
  clientIds: string[]
): Promise<InjuryWithClient[]> {
  if (!clientIds.length) return [];
  const { data, error } = await getSupabase()
    .from("injuries")
    .select("*, client:users!client_id(id, name, email)")
    .in("client_id", clientIds)
    .in("status", ["active", "recovering"])
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createInjury(
  clientId: string,
  input: {
    name: string;
    area: string;
    date: string;
    status: InjuryStatus;
    avoid: string | null;
    notes: string | null;
    doctor_notes: string | null;
  }
): Promise<Injury> {
  const { data, error } = await getSupabase()
    .from("injuries")
    .insert({ ...input, client_id: clientId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateInjury(
  id: string,
  updates: Partial<
    Pick<Injury, "name" | "area" | "date" | "status" | "avoid" | "notes" | "doctor_notes">
  >
): Promise<Injury> {
  const { data, error } = await getSupabase()
    .from("injuries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteInjury(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("injuries")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
