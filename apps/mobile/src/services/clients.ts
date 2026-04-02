import { getSupabase } from "@shared/api/supabase";
import type {
  CoachClient,
  CoachClientStatus,
  User,
} from "@shared/types/database";

export interface ClientWithUser extends CoachClient {
  user: Pick<User, "id" | "name" | "email" | "avatar_url">;
}

export async function fetchClients(
  coachId: string,
  status?: CoachClientStatus
): Promise<ClientWithUser[]> {
  let query = getSupabase()
    .from("coach_clients")
    .select("*, user:users!client_id(id, name, email, avatar_url)")
    .eq("coach_id", coachId)
    .order("invited_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function inviteClient(email: string): Promise<CoachClient> {
  const supabase = getSupabase();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) throw new Error("Not authenticated");

  // Look up the user by email
  const { data: targetUser, error: lookupError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (lookupError || !targetUser) {
    throw new Error("No account found with this email. The client needs to sign up first, then you can invite them.");
  }

  const { data, error } = await supabase
    .from("coach_clients")
    .insert({
      coach_id: authUser.id,
      client_id: targetUser.id,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateClientStatus(
  relationshipId: string,
  status: CoachClientStatus
): Promise<CoachClient> {
  const updates: Partial<CoachClient> = { status };
  if (status === "active") {
    updates.accepted_at = new Date().toISOString();
  }

  const { data, error } = await getSupabase()
    .from("coach_clients")
    .update(updates)
    .eq("id", relationshipId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export interface ClientDetail {
  user: User;
  programs: { id: string; name: string; type: string; status: string }[];
  injuryCount: number;
  prCount: number;
}

export async function fetchClientDetail(
  clientId: string
): Promise<ClientDetail> {
  const supabase = getSupabase();

  const [userRes, programsRes, injuriesRes, prsRes] = await Promise.all([
    supabase.from("users").select("*").eq("id", clientId).single(),
    supabase
      .from("program_assignments")
      .select("id, status, program:programs!program_id(id, name, type)")
      .eq("client_id", clientId),
    supabase
      .from("injuries")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId),
    supabase
      .from("personal_records")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId),
  ]);

  if (userRes.error) throw userRes.error;

  const programs = (programsRes.data ?? []).map((pa: any) => ({
    id: pa.program?.id ?? pa.id,
    name: pa.program?.name ?? "Unknown",
    type: pa.program?.type ?? "standard",
    status: pa.status,
  }));

  return {
    user: userRes.data,
    programs,
    injuryCount: injuriesRes.count ?? 0,
    prCount: prsRes.count ?? 0,
  };
}
