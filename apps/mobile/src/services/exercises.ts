import { getSupabase } from "@shared/api/supabase";
import type { Exercise, ExerciseCategory } from "@shared/types/database";

export async function fetchExercises(
  coachId: string,
  category?: ExerciseCategory
): Promise<Exercise[]> {
  let query = getSupabase()
    .from("exercises")
    .select("*")
    .or(`is_global.eq.true,created_by.eq.${coachId}`)
    .order("name");

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createExercise(input: {
  name: string;
  description: string | null;
  category: ExerciseCategory;
  video_url: string | null;
}): Promise<Exercise> {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("exercises")
    .insert({
      ...input,
      created_by: user.id,
      is_global: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateExercise(
  id: string,
  updates: Partial<Pick<Exercise, "name" | "description" | "category" | "video_url">>
): Promise<Exercise> {
  const { data, error } = await getSupabase()
    .from("exercises")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteExercise(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("exercises")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
