import { getSupabase } from "@shared/api/supabase";
import type {
  Program,
  ProgramAssignment,
  ProgramType,
} from "@shared/types/database";

export async function fetchPrograms(coachId: string): Promise<Program[]> {
  const { data, error } = await getSupabase()
    .from("programs")
    .select("*")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createProgram(input: {
  name: string;
  description: string | null;
  type: ProgramType;
  image_url: string | null;
}): Promise<Program> {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("programs")
    .insert({ ...input, coach_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProgram(
  id: string,
  updates: Partial<Pick<Program, "name" | "description" | "type" | "image_url">>
): Promise<Program> {
  const { data, error } = await getSupabase()
    .from("programs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProgram(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("programs")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function fetchProgramAssignments(
  programId: string
): Promise<(ProgramAssignment & { client: { id: string; name: string; email: string } })[]> {
  const { data, error } = await getSupabase()
    .from("program_assignments")
    .select("*, client:users!client_id(id, name, email)")
    .eq("program_id", programId);

  if (error) throw error;
  return data ?? [];
}

export async function assignProgram(
  programId: string,
  clientId: string,
  startDate: string | null
): Promise<ProgramAssignment> {
  const { data, error } = await getSupabase()
    .from("program_assignments")
    .insert({
      program_id: programId,
      client_id: clientId,
      start_date: startDate,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unassignProgram(assignmentId: string): Promise<void> {
  const { error } = await getSupabase()
    .from("program_assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) throw error;
}
