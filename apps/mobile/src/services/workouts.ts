import { getSupabase } from "@shared/api/supabase";
import type {
  WorkoutTemplate,
  TemplateSection,
  TemplateExercise,
  SectionFormat,
  SectionSettings,
} from "@shared/types/database";

// ─── Workout Templates ──────────────────────────────────────────

export async function fetchWorkoutTemplates(
  programId: string
): Promise<WorkoutTemplate[]> {
  const { data, error } = await getSupabase()
    .from("workout_templates")
    .select("*")
    .eq("program_id", programId)
    .order("day_number");

  if (error) throw error;
  return data ?? [];
}

export async function createWorkoutTemplate(
  programId: string,
  input: { day_number: number; title: string; notes?: string | null }
): Promise<WorkoutTemplate> {
  const { data, error } = await getSupabase()
    .from("workout_templates")
    .insert({
      program_id: programId,
      day_number: input.day_number,
      title: input.title,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWorkoutTemplate(
  id: string,
  updates: Partial<Pick<WorkoutTemplate, "title" | "notes">>
): Promise<WorkoutTemplate> {
  const { data, error } = await getSupabase()
    .from("workout_templates")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWorkoutTemplate(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("workout_templates")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function copyWorkoutTemplate(
  templateId: string,
  targetProgramId: string,
  targetDayNumber: number
): Promise<WorkoutTemplate> {
  const supabase = getSupabase();

  // 1. Fetch source template
  const { data: source, error: sourceErr } = await supabase
    .from("workout_templates")
    .select("*")
    .eq("id", templateId)
    .single();
  if (sourceErr) throw sourceErr;

  // 2. Create new template
  const { data: newTemplate, error: tmplErr } = await supabase
    .from("workout_templates")
    .insert({
      program_id: targetProgramId,
      day_number: targetDayNumber,
      title: source.title,
      notes: source.notes,
    })
    .select()
    .single();
  if (tmplErr) throw tmplErr;

  // 3. Fetch source sections
  const { data: sections, error: secErr } = await supabase
    .from("template_sections")
    .select("*")
    .eq("workout_template_id", templateId)
    .order("order_index");
  if (secErr) throw secErr;

  for (const section of sections ?? []) {
    // 4. Create new section
    const { data: newSection, error: newSecErr } = await supabase
      .from("template_sections")
      .insert({
        workout_template_id: newTemplate.id,
        letter: section.letter,
        title: section.title,
        format: section.format,
        settings_json: section.settings_json,
        order_index: section.order_index,
      })
      .select()
      .single();
    if (newSecErr) throw newSecErr;

    // 5. Fetch and copy exercises
    const { data: exercises, error: exErr } = await supabase
      .from("template_exercises")
      .select("*")
      .eq("section_id", section.id)
      .order("order_index");
    if (exErr) throw exErr;

    if (exercises?.length) {
      const { error: insertErr } = await supabase
        .from("template_exercises")
        .insert(
          exercises.map((ex) => ({
            section_id: newSection.id,
            exercise_id: ex.exercise_id,
            order_index: ex.order_index,
            sets: ex.sets,
            reps: ex.reps,
            weight_kg: ex.weight_kg,
            percentage_1rm: ex.percentage_1rm,
            rpe: ex.rpe,
            rest_sec: ex.rest_sec,
            notes: ex.notes,
          }))
        );
      if (insertErr) throw insertErr;
    }
  }

  return newTemplate;
}

// ─── Program Assignments ────────────────────────────────────────

export async function fetchProgramAssignments(
  programId: string
): Promise<{ client_id: string }[]> {
  const { data, error } = await getSupabase()
    .from("program_assignments")
    .select("client_id")
    .eq("program_id", programId)
    .in("status", ["active", "pending"]);

  if (error) throw error;
  return data ?? [];
}

// ─── Template Sections ──────────────────────────────────────────

export interface SectionWithExercises extends TemplateSection {
  template_exercises: (TemplateExercise & {
    exercise: { id: string; name: string; category: string } | null;
  })[];
}

export async function fetchTemplateSections(
  workoutTemplateId: string
): Promise<SectionWithExercises[]> {
  const { data, error } = await getSupabase()
    .from("template_sections")
    .select(
      "*, template_exercises(*, exercise:exercises(id, name, category))"
    )
    .eq("workout_template_id", workoutTemplateId)
    .order("order_index");

  if (error) throw error;

  // Sort exercises within each section by order_index
  return (data ?? []).map((section) => ({
    ...section,
    template_exercises: (section.template_exercises ?? []).sort(
      (a: any, b: any) => a.order_index - b.order_index
    ),
  })) as SectionWithExercises[];
}

export async function createTemplateSection(
  workoutTemplateId: string,
  input: {
    letter: string;
    title: string;
    format: SectionFormat;
    settings_json?: SectionSettings;
    order_index: number;
  }
): Promise<TemplateSection> {
  const { data, error } = await getSupabase()
    .from("template_sections")
    .insert({
      workout_template_id: workoutTemplateId,
      letter: input.letter,
      title: input.title,
      format: input.format,
      settings_json: input.settings_json ?? {},
      order_index: input.order_index,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTemplateSection(
  id: string,
  updates: Partial<Pick<TemplateSection, "title" | "format" | "settings_json">>
): Promise<TemplateSection> {
  const { data, error } = await getSupabase()
    .from("template_sections")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTemplateSection(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("template_sections")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function reorderSections(
  sections: { id: string; order_index: number }[]
): Promise<void> {
  const supabase = getSupabase();
  for (const s of sections) {
    const { error } = await supabase
      .from("template_sections")
      .update({ order_index: s.order_index })
      .eq("id", s.id);
    if (error) throw error;
  }
}

// ─── Template Exercises ─────────────────────────────────────────

export async function addExerciseToSection(
  sectionId: string,
  input: {
    exercise_id: string;
    order_index: number;
    sets?: number | null;
    reps?: number | null;
    weight_kg?: number | null;
    percentage_1rm?: number | null;
    rpe?: number | null;
    rest_sec?: number | null;
    notes?: string | null;
  }
): Promise<TemplateExercise> {
  const { data, error } = await getSupabase()
    .from("template_exercises")
    .insert({
      section_id: sectionId,
      exercise_id: input.exercise_id,
      order_index: input.order_index,
      sets: input.sets ?? null,
      reps: input.reps ?? null,
      weight_kg: input.weight_kg ?? null,
      percentage_1rm: input.percentage_1rm ?? null,
      rpe: input.rpe ?? null,
      rest_sec: input.rest_sec ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTemplateExercise(
  id: string,
  updates: Partial<
    Pick<
      TemplateExercise,
      "sets" | "reps" | "weight_kg" | "percentage_1rm" | "rpe" | "rest_sec" | "notes" | "order_index"
    >
  >
): Promise<TemplateExercise> {
  const { data, error } = await getSupabase()
    .from("template_exercises")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeExerciseFromSection(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("template_exercises")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function reorderExercises(
  exercises: { id: string; order_index: number }[]
): Promise<void> {
  const supabase = getSupabase();
  for (const e of exercises) {
    const { error } = await supabase
      .from("template_exercises")
      .update({ order_index: e.order_index })
      .eq("id", e.id);
    if (error) throw error;
  }
}
