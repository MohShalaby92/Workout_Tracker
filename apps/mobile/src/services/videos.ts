import { getSupabase } from "@shared/api/supabase";
import type { Video } from "@shared/types/database";

export async function fetchVideos(coachId: string): Promise<Video[]> {
  const { data, error } = await getSupabase()
    .from("videos")
    .select("*")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createVideo(input: {
  title: string;
  url: string;
  category: string | null;
  exercise_id: string | null;
}): Promise<Video> {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("videos")
    .insert({ ...input, coach_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateVideo(
  id: string,
  updates: Partial<Pick<Video, "title" | "url" | "category" | "exercise_id">>
): Promise<Video> {
  const { data, error } = await getSupabase()
    .from("videos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteVideo(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("videos")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
