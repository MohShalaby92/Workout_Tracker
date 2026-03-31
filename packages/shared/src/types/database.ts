// ─── Enums (match SQL enum types exactly) ────────────────────────────────────

export type UserRole = "coach" | "client";
export type UnitPreference = "kg" | "lb";
export type CoachClientStatus = "pending" | "active" | "archived";
export type ProgramType = "template" | "ongoing" | "standard";
export type AssignmentStatus = "active" | "completed" | "paused";
export type SectionFormat = "sets" | "amrap" | "emom" | "fortime" | "tabata" | "superset";
export type ExerciseCategory = "olympic" | "gymnastics" | "conditioning" | "strength" | "accessory";
export type WorkoutLogStatus = "complete" | "partial" | "missed";
export type InjuryStatus = "active" | "recovering" | "resolved";
export type SkillStatus = "locked" | "in_progress" | "unlocked" | "blocked";

// ─── Section settings_json shape ─────────────────────────────────────────────

export interface SectionSettings {
  time_cap_sec?: number;   // AMRAP, For Time
  interval_sec?: number;   // EMOM interval
  rounds?: number;         // Tabata, Superset
  work_sec?: number;       // Tabata work
  rest_sec?: number;       // Tabata rest, Superset rest between rounds
}

// ─── 1. users ────────────────────────────────────────────────────────────────

export interface User {
  id: string;              // = auth.users.id
  email: string;
  role: UserRole;
  name: string;
  avatar_url: string | null;
  unit_pref: UnitPreference;
  phone: string | null;
  gym: string | null;
  speciality: string | null;
  certificates: string | null;
  created_at: string;
  updated_at: string;
}

// ─── 2. coach_clients ────────────────────────────────────────────────────────

export interface CoachClient {
  id: string;
  coach_id: string;
  client_id: string;
  status: CoachClientStatus;
  invited_at: string;
  accepted_at: string | null;
}

// ─── 3. programs ─────────────────────────────────────────────────────────────

export interface Program {
  id: string;
  coach_id: string;
  name: string;
  description: string | null;
  type: ProgramType;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── 4. program_assignments ──────────────────────────────────────────────────

export interface ProgramAssignment {
  id: string;
  program_id: string;
  client_id: string;
  start_date: string | null;
  status: AssignmentStatus;
  assigned_at: string;
}

// ─── 5. workout_templates ────────────────────────────────────────────────────

export interface WorkoutTemplate {
  id: string;
  program_id: string;
  day_number: number;
  title: string;
  notes: string | null;
  created_at: string;
}

// ─── 6. template_sections ────────────────────────────────────────────────────

export interface TemplateSection {
  id: string;
  workout_template_id: string;
  letter: string;           // 'A', 'B', 'C', etc.
  title: string;
  format: SectionFormat;
  settings_json: SectionSettings;
  order_index: number;
}

// ─── 7. exercises ────────────────────────────────────────────────────────────

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  category: ExerciseCategory;
  video_url: string | null;
  created_by: string | null; // user.id for coach-created, null for global
  is_global: boolean;
  created_at: string;
}

// ─── 8. template_exercises ───────────────────────────────────────────────────

export interface TemplateExercise {
  id: string;
  section_id: string;
  exercise_id: string;
  order_index: number;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  percentage_1rm: number | null;
  rpe: number | null;
  rest_sec: number | null;
  notes: string | null;
}

// ─── 9. workout_logs ─────────────────────────────────────────────────────────

export interface WorkoutLog {
  id: string;
  client_id: string;
  workout_template_id: string | null;
  date: string;
  status: WorkoutLogStatus;
  comment: string | null;
  duration_sec: number | null;
  created_at: string;
}

// ─── 10. logged_sets ─────────────────────────────────────────────────────────

export interface LoggedSet {
  id: string;
  workout_log_id: string;
  template_exercise_id: string | null;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  rpe: number | null;
  notes: string | null;
  timestamp: string;
}

// ─── 11. personal_records ────────────────────────────────────────────────────

export interface PersonalRecord {
  id: string;
  client_id: string;
  exercise_id: string;
  weight_kg: number | null;
  reps: number | null;
  estimated_1rm: number | null;
  achieved_at: string;
  auto_detected: boolean;
  created_at: string;
}

// ─── 12. injuries ────────────────────────────────────────────────────────────

export interface Injury {
  id: string;
  client_id: string;
  name: string;
  area: string;
  date: string;
  status: InjuryStatus;
  avoid: string | null;
  notes: string | null;
  doctor_notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── 13. skills ──────────────────────────────────────────────────────────────

export interface Skill {
  id: string;
  client_id: string;
  name: string;
  status: SkillStatus;
  current_level: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── 14. messages ────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  workout_log_id: string | null;
  content: string;
  read_at: string | null;
  created_at: string;
}

// ─── 15. videos ──────────────────────────────────────────────────────────────

export interface Video {
  id: string;
  coach_id: string;
  title: string;
  url: string;
  category: string | null;
  exercise_id: string | null;
  created_at: string;
}

// ─── Database aggregate type ─────────────────────────────────────────────────

export interface Database {
  users: User;
  coach_clients: CoachClient;
  programs: Program;
  program_assignments: ProgramAssignment;
  workout_templates: WorkoutTemplate;
  template_sections: TemplateSection;
  exercises: Exercise;
  template_exercises: TemplateExercise;
  workout_logs: WorkoutLog;
  logged_sets: LoggedSet;
  personal_records: PersonalRecord;
  injuries: Injury;
  skills: Skill;
  messages: Message;
  videos: Video;
}
