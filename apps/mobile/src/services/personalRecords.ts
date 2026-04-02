import { getSupabase } from "@shared/api/supabase";
import type { PersonalRecord } from "@shared/types/database";

export interface PRWithExercise extends PersonalRecord {
  exercise: { id: string; name: string; category: string };
}

export async function fetchClientPRs(
  clientId: string
): Promise<PRWithExercise[]> {
  const { data, error } = await getSupabase()
    .from("personal_records")
    .select("*, exercise:exercises!exercise_id(id, name, category)")
    .eq("client_id", clientId)
    .order("achieved_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export interface PRWithClientAndExercise extends PersonalRecord {
  exercise: { id: string; name: string; category: string };
  client: { id: string; name: string; email: string };
}

export async function fetchAllCoachPRs(
  coachId: string
): Promise<PRWithClientAndExercise[]> {
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
    .from("personal_records")
    .select(
      "*, exercise:exercises!exercise_id(id, name, category), client:users!client_id(id, name, email)"
    )
    .in("client_id", clientIds)
    .order("achieved_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createPR(
  clientId: string,
  input: {
    exercise_id: string;
    weight_kg: number | null;
    reps: number | null;
    achieved_at: string;
  }
): Promise<PersonalRecord> {
  // Calculate estimated 1RM using Epley formula
  let estimated_1rm: number | null = null;
  if (input.weight_kg != null && input.reps != null && input.reps >= 1) {
    estimated_1rm =
      input.reps === 1
        ? input.weight_kg
        : Math.round(input.weight_kg * (1 + input.reps / 30) * 100) / 100;
  }

  const { data, error } = await getSupabase()
    .from("personal_records")
    .insert({
      client_id: clientId,
      exercise_id: input.exercise_id,
      weight_kg: input.weight_kg,
      reps: input.reps,
      estimated_1rm,
      achieved_at: input.achieved_at,
      auto_detected: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePR(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("personal_records")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
