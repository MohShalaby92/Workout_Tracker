// ─── App ──────────────────────────────────────────────────────────────────────

export const APP_NAME = "Train Track";
export const APP_VERSION = "1.0.0";

// ─── Workout ──────────────────────────────────────────────────────────────────

export const MAX_SETS_PER_EXERCISE = 20;
export const MAX_EXERCISES_PER_WORKOUT = 30;
export const MAX_WORKOUT_DURATION_HOURS = 6;

export const DEFAULT_REST_SECONDS = 90;
export const REST_PRESETS_SECONDS = [30, 45, 60, 90, 120, 180, 240, 300] as const;

// ─── Program ──────────────────────────────────────────────────────────────────

export const MAX_PROGRAM_WEEKS = 52;
export const MAX_DAYS_PER_WEEK = 7;

// ─── Body Parts for Injuries ──────────────────────────────────────────────────

export const BODY_PARTS = [
  "Neck",
  "Upper Back",
  "Lower Back",
  "Left Shoulder",
  "Right Shoulder",
  "Left Elbow",
  "Right Elbow",
  "Left Wrist",
  "Right Wrist",
  "Left Hip",
  "Right Hip",
  "Left Knee",
  "Right Knee",
  "Left Ankle",
  "Right Ankle",
  "Chest",
  "Core / Abs",
  "Left Hamstring",
  "Right Hamstring",
  "Left Quad",
  "Right Quad",
  "Left Calf",
  "Right Calf",
  "Other",
] as const;

export type BodyPart = (typeof BODY_PARTS)[number];

// ─── RPE Scale ────────────────────────────────────────────────────────────────

export const RPE_DESCRIPTIONS: Record<number, string> = {
  6: "Could do 4+ more reps",
  7: "Could do 3 more reps",
  8: "Could do 2 more reps",
  9: "Could do 1 more rep",
  10: "Maximum effort",
};

// ─── 1RM Formula (Epley) ─────────────────────────────────────────────────────

export function calculate1RM(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30));
}

// ─── Muscle Group Labels ──────────────────────────────────────────────────────

export const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  core: "Core",
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
  full_body: "Full Body",
};

export const EXERCISE_CATEGORY_LABELS: Record<string, string> = {
  olympic: "Olympic Lifting",
  gymnastics: "Gymnastics",
  conditioning: "Conditioning",
  strength: "Strength",
  accessory: "Accessory",
};

// ─── Skill Status Labels ──────────────────────────────────────────────────────

export const SKILL_STATUS_LABELS: Record<string, string> = {
  locked: "Locked",
  in_progress: "In Progress",
  unlocked: "Unlocked",
  blocked: "Blocked",
};

// ─── Section Format Labels ───────────────────────────────────────────────────

export const SECTION_FORMAT_LABELS: Record<string, string> = {
  sets: "Straight Sets",
  amrap: "AMRAP",
  emom: "EMOM",
  fortime: "For Time",
  tabata: "Tabata",
  superset: "Superset / Circuit",
};

// ─── PR Type Labels ───────────────────────────────────────────────────────────

export const PR_TYPE_LABELS: Record<string, string> = {
  weight: "Weight",
  time: "Time",
  distance: "Distance",
  reps: "Max Reps",
};

// ─── Brand Colors (from product spec) ────────────────────────────────────────

export const BRAND_COLORS = {
  navyPrimary: "#1A2332",  // Primary dark surface — trust, professionalism
  navyDeep: "#0D1117",     // Near-black — dark mode base
  teal: "#00E5CC",         // Electric teal — primary accent, energy + wellness
  orange: "#FF6B35",       // Vibrant orange — CTAs, energy states
  gold: "#FFD700",         // PR / Achievement celebrations
  success: "#4CAF50",      // Completed, on track
  error: "#EF5350",        // Alerts, missed workouts
} as const;

// ─── Time Formatting Helpers ──────────────────────────────────────────────────

export function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function parseTimeString(timeStr: string): number {
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 2) return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  if (parts.length === 3) return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
  return 0;
}
