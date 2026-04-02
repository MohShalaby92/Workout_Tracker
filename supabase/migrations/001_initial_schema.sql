-- ============================================================
-- Train Track: Complete Database Schema
-- 15 tables · RLS · Triggers · Indexes
-- Fully idempotent — safe to re-run
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUM TYPES ──────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('coach', 'client');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE unit_preference AS ENUM ('kg', 'lb');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE coach_client_status AS ENUM ('pending', 'active', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE program_type AS ENUM ('template', 'ongoing', 'standard');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE assignment_status AS ENUM ('active', 'completed', 'paused');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE section_format AS ENUM ('sets', 'amrap', 'emom', 'fortime', 'tabata', 'superset');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE exercise_category AS ENUM ('olympic', 'gymnastics', 'conditioning', 'strength', 'accessory');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE workout_log_status AS ENUM ('complete', 'partial', 'missed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE injury_status AS ENUM ('active', 'recovering', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE skill_status AS ENUM ('locked', 'in_progress', 'unlocked', 'blocked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ═══════════════════════════════════════════════════════════════
-- 1. users
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  role         user_role NOT NULL DEFAULT 'client',
  name         TEXT NOT NULL,
  avatar_url   TEXT,
  unit_pref    unit_preference NOT NULL DEFAULT 'kg',
  phone        TEXT,
  gym          TEXT,
  speciality   TEXT,
  certificates TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);


-- ═══════════════════════════════════════════════════════════════
-- 2. coach_clients
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS coach_clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      coach_client_status NOT NULL DEFAULT 'pending',
  invited_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(coach_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_coach_clients_coach  ON coach_clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_clients_client ON coach_clients(client_id);


-- ═══════════════════════════════════════════════════════════════
-- 3. programs
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS programs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  type        program_type NOT NULL DEFAULT 'template',
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_programs_coach ON programs(coach_id);


-- ═══════════════════════════════════════════════════════════════
-- 4. program_assignments
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS program_assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id  UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  client_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date  DATE,
  status      assignment_status NOT NULL DEFAULT 'active',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_program_assignments_client  ON program_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_program_assignments_program ON program_assignments(program_id);


-- ═══════════════════════════════════════════════════════════════
-- 5. workout_templates
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS workout_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id  UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  day_number  INTEGER NOT NULL,
  title       TEXT NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workout_templates_program ON workout_templates(program_id);


-- ═══════════════════════════════════════════════════════════════
-- 6. template_sections
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS template_sections (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_template_id  UUID NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
  letter               CHAR(1) NOT NULL,
  title                TEXT NOT NULL,
  format               section_format NOT NULL DEFAULT 'sets',
  settings_json        JSONB DEFAULT '{}'::jsonb,
  order_index          INTEGER NOT NULL DEFAULT 0
);

COMMENT ON COLUMN template_sections.settings_json IS
  'Format-specific config: {time_cap_sec, interval_sec, rounds, work_sec, rest_sec}';

CREATE INDEX IF NOT EXISTS idx_template_sections_template ON template_sections(workout_template_id);


-- ═══════════════════════════════════════════════════════════════
-- 7. exercises
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS exercises (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  category    exercise_category NOT NULL DEFAULT 'strength',
  video_url   TEXT,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  is_global   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_created_by ON exercises(created_by) WHERE created_by IS NOT NULL;


-- ═══════════════════════════════════════════════════════════════
-- 8. template_exercises
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS template_exercises (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id      UUID NOT NULL REFERENCES template_sections(id) ON DELETE CASCADE,
  exercise_id     UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  order_index     INTEGER NOT NULL DEFAULT 0,
  sets            INTEGER,
  reps            INTEGER,
  weight_kg       NUMERIC(7,2),
  percentage_1rm  NUMERIC(5,2) CHECK (percentage_1rm BETWEEN 0 AND 150),
  rpe             NUMERIC(3,1) CHECK (rpe BETWEEN 1 AND 10),
  rest_sec        INTEGER CHECK (rest_sec >= 0),
  notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_template_exercises_section ON template_exercises(section_id);


-- ═══════════════════════════════════════════════════════════════
-- 9. workout_logs
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS workout_logs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_template_id  UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
  date                 DATE NOT NULL DEFAULT CURRENT_DATE,
  status               workout_log_status NOT NULL DEFAULT 'complete',
  comment              TEXT,
  duration_sec         INTEGER,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workout_logs_client      ON workout_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_client_date ON workout_logs(client_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_logs_template    ON workout_logs(workout_template_id) WHERE workout_template_id IS NOT NULL;


-- ═══════════════════════════════════════════════════════════════
-- 10. logged_sets
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS logged_sets (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_log_id        UUID NOT NULL REFERENCES workout_logs(id) ON DELETE CASCADE,
  template_exercise_id  UUID REFERENCES template_exercises(id) ON DELETE SET NULL,
  set_number            INTEGER NOT NULL,
  reps                  INTEGER,
  weight_kg             NUMERIC(7,2),
  rpe                   NUMERIC(3,1) CHECK (rpe BETWEEN 1 AND 10),
  notes                 TEXT,
  timestamp             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_logged_sets_log ON logged_sets(workout_log_id);
CREATE INDEX IF NOT EXISTS idx_logged_sets_client_exercise ON logged_sets(workout_log_id, template_exercise_id);


-- ═══════════════════════════════════════════════════════════════
-- 11. personal_records
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS personal_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id   UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  weight_kg     NUMERIC(7,2),
  reps          INTEGER,
  estimated_1rm NUMERIC(7,2),
  achieved_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  auto_detected BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_personal_records_client_exercise ON personal_records(client_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise_1rm    ON personal_records(client_id, exercise_id, estimated_1rm DESC);


-- ═══════════════════════════════════════════════════════════════
-- 12. injuries
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS injuries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  area         TEXT NOT NULL,
  date         DATE NOT NULL DEFAULT CURRENT_DATE,
  status       injury_status NOT NULL DEFAULT 'active',
  avoid        TEXT,
  notes        TEXT,
  doctor_notes TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_injuries_client ON injuries(client_id);
CREATE INDEX IF NOT EXISTS idx_injuries_active ON injuries(client_id) WHERE status = 'active';


-- ═══════════════════════════════════════════════════════════════
-- 13. skills
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS skills (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  status        skill_status NOT NULL DEFAULT 'locked',
  current_level TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skills_client ON skills(client_id);


-- ═══════════════════════════════════════════════════════════════
-- 14. messages
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_log_id  UUID REFERENCES workout_logs(id) ON DELETE SET NULL,
  content         TEXT NOT NULL,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_recipient    ON messages(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread       ON messages(recipient_id) WHERE read_at IS NULL;


-- ═══════════════════════════════════════════════════════════════
-- 15. videos
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS videos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  url         TEXT NOT NULL,
  category    TEXT,
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_videos_coach    ON videos(coach_id);
CREATE INDEX IF NOT EXISTS idx_videos_exercise ON videos(exercise_id) WHERE exercise_id IS NOT NULL;


-- ─── TRIGGER: auto-update updated_at ─────────────────────────

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to every table that has updated_at (drop first to be idempotent)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users', 'programs', 'injuries', 'skills'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', t);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION handle_updated_at()',
      t
    );
  END LOOP;
END $$;


-- ─── TRIGGER: auto-create user row on signup ─────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ─── TRIGGER: PR auto-detection on logged_sets INSERT ────────

CREATE OR REPLACE FUNCTION auto_detect_pr()
RETURNS TRIGGER AS $$
DECLARE
  v_client_id     UUID;
  v_exercise_id   UUID;
  v_new_1rm       NUMERIC;
  v_current_best  NUMERIC;
BEGIN
  IF NEW.weight_kg IS NULL OR NEW.reps IS NULL OR NEW.reps < 1 THEN
    RETURN NEW;
  END IF;

  SELECT wl.client_id INTO v_client_id
  FROM workout_logs wl
  WHERE wl.id = NEW.workout_log_id;

  IF v_client_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.template_exercise_id IS NOT NULL THEN
    SELECT te.exercise_id INTO v_exercise_id
    FROM template_exercises te
    WHERE te.id = NEW.template_exercise_id;
  END IF;

  IF v_exercise_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.reps = 1 THEN
    v_new_1rm := NEW.weight_kg;
  ELSE
    v_new_1rm := NEW.weight_kg * (1.0 + NEW.reps::NUMERIC / 30.0);
  END IF;

  SELECT MAX(estimated_1rm) INTO v_current_best
  FROM personal_records
  WHERE client_id = v_client_id
    AND exercise_id = v_exercise_id;

  IF v_current_best IS NULL OR v_new_1rm > v_current_best THEN
    INSERT INTO personal_records (
      client_id, exercise_id, weight_kg, reps,
      estimated_1rm, achieved_at, auto_detected
    ) VALUES (
      v_client_id, v_exercise_id, NEW.weight_kg, NEW.reps,
      ROUND(v_new_1rm, 2), now(), true
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_set_logged ON logged_sets;
CREATE TRIGGER on_set_logged
  AFTER INSERT ON logged_sets
  FOR EACH ROW EXECUTE FUNCTION auto_detect_pr();


-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_clients       ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_sections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises           ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_exercises  ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE logged_sets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records    ENABLE ROW LEVEL SECURITY;
ALTER TABLE injuries            ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills              ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos              ENABLE ROW LEVEL SECURITY;


-- ─── RLS helper functions ────────────────────────────────────

CREATE OR REPLACE FUNCTION is_my_client(p_client_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM coach_clients
    WHERE coach_id = auth.uid()
      AND client_id = p_client_id
      AND status = 'active'
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION my_program_ids()
RETURNS SETOF UUID AS $$
  SELECT id FROM programs WHERE coach_id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION my_assigned_program_ids()
RETURNS SETOF UUID AS $$
  SELECT program_id FROM program_assignments
  WHERE client_id = auth.uid() AND status = 'active'
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ─── RLS POLICIES (drop-then-create for idempotency) ────────

-- users
DROP POLICY IF EXISTS "users_read_own" ON users;
CREATE POLICY "users_read_own" ON users FOR SELECT USING (id = auth.uid());
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = auth.uid());
DROP POLICY IF EXISTS "users_coach_reads_clients" ON users;
CREATE POLICY "users_coach_reads_clients" ON users FOR SELECT USING (is_my_client(id));

-- coach_clients
DROP POLICY IF EXISTS "cc_coach_all" ON coach_clients;
CREATE POLICY "cc_coach_all" ON coach_clients FOR ALL USING (coach_id = auth.uid());
DROP POLICY IF EXISTS "cc_client_read" ON coach_clients;
CREATE POLICY "cc_client_read" ON coach_clients FOR SELECT USING (client_id = auth.uid());

-- programs
DROP POLICY IF EXISTS "programs_coach_all" ON programs;
CREATE POLICY "programs_coach_all" ON programs FOR ALL USING (coach_id = auth.uid());
DROP POLICY IF EXISTS "programs_client_read" ON programs;
CREATE POLICY "programs_client_read" ON programs FOR SELECT USING (id IN (SELECT my_assigned_program_ids()));

-- program_assignments
DROP POLICY IF EXISTS "pa_coach_all" ON program_assignments;
CREATE POLICY "pa_coach_all" ON program_assignments FOR ALL USING (program_id IN (SELECT my_program_ids()));
DROP POLICY IF EXISTS "pa_client_read" ON program_assignments;
CREATE POLICY "pa_client_read" ON program_assignments FOR SELECT USING (client_id = auth.uid());

-- workout_templates
DROP POLICY IF EXISTS "wt_coach_all" ON workout_templates;
CREATE POLICY "wt_coach_all" ON workout_templates FOR ALL USING (program_id IN (SELECT my_program_ids()));
DROP POLICY IF EXISTS "wt_client_read" ON workout_templates;
CREATE POLICY "wt_client_read" ON workout_templates FOR SELECT USING (program_id IN (SELECT my_assigned_program_ids()));

-- template_sections
DROP POLICY IF EXISTS "ts_coach_all" ON template_sections;
CREATE POLICY "ts_coach_all" ON template_sections FOR ALL USING (workout_template_id IN (
  SELECT id FROM workout_templates WHERE program_id IN (SELECT my_program_ids())
));
DROP POLICY IF EXISTS "ts_client_read" ON template_sections;
CREATE POLICY "ts_client_read" ON template_sections FOR SELECT USING (workout_template_id IN (
  SELECT id FROM workout_templates WHERE program_id IN (SELECT my_assigned_program_ids())
));

-- exercises
DROP POLICY IF EXISTS "exercises_read_global" ON exercises;
CREATE POLICY "exercises_read_global" ON exercises FOR SELECT USING (is_global = true);
DROP POLICY IF EXISTS "exercises_coach_own" ON exercises;
CREATE POLICY "exercises_coach_own" ON exercises FOR ALL USING (created_by = auth.uid());
DROP POLICY IF EXISTS "exercises_client_read_coach" ON exercises;
CREATE POLICY "exercises_client_read_coach" ON exercises FOR SELECT USING (
  created_by IN (
    SELECT coach_id FROM coach_clients
    WHERE client_id = auth.uid() AND status = 'active'
  )
);

-- template_exercises
DROP POLICY IF EXISTS "te_coach_all" ON template_exercises;
CREATE POLICY "te_coach_all" ON template_exercises FOR ALL USING (section_id IN (
  SELECT ts.id FROM template_sections ts
  JOIN workout_templates wt ON wt.id = ts.workout_template_id
  WHERE wt.program_id IN (SELECT my_program_ids())
));
DROP POLICY IF EXISTS "te_client_read" ON template_exercises;
CREATE POLICY "te_client_read" ON template_exercises FOR SELECT USING (section_id IN (
  SELECT ts.id FROM template_sections ts
  JOIN workout_templates wt ON wt.id = ts.workout_template_id
  WHERE wt.program_id IN (SELECT my_assigned_program_ids())
));

-- workout_logs
DROP POLICY IF EXISTS "wl_client_all" ON workout_logs;
CREATE POLICY "wl_client_all" ON workout_logs FOR ALL USING (client_id = auth.uid());
DROP POLICY IF EXISTS "wl_coach_read" ON workout_logs;
CREATE POLICY "wl_coach_read" ON workout_logs FOR SELECT USING (is_my_client(client_id));

-- logged_sets
DROP POLICY IF EXISTS "ls_client_all" ON logged_sets;
CREATE POLICY "ls_client_all" ON logged_sets FOR ALL USING (workout_log_id IN (
  SELECT id FROM workout_logs WHERE client_id = auth.uid()
));
DROP POLICY IF EXISTS "ls_coach_read" ON logged_sets;
CREATE POLICY "ls_coach_read" ON logged_sets FOR SELECT USING (workout_log_id IN (
  SELECT id FROM workout_logs WHERE is_my_client(client_id)
));

-- personal_records
DROP POLICY IF EXISTS "pr_client_all" ON personal_records;
CREATE POLICY "pr_client_all" ON personal_records FOR ALL USING (client_id = auth.uid());
DROP POLICY IF EXISTS "pr_coach_read" ON personal_records;
CREATE POLICY "pr_coach_read" ON personal_records FOR SELECT USING (is_my_client(client_id));

-- injuries
DROP POLICY IF EXISTS "injuries_client_all" ON injuries;
CREATE POLICY "injuries_client_all" ON injuries FOR ALL USING (client_id = auth.uid());
DROP POLICY IF EXISTS "injuries_coach_all" ON injuries;
CREATE POLICY "injuries_coach_all" ON injuries FOR ALL USING (is_my_client(client_id));

-- skills
DROP POLICY IF EXISTS "skills_client_all" ON skills;
CREATE POLICY "skills_client_all" ON skills FOR ALL USING (client_id = auth.uid());
DROP POLICY IF EXISTS "skills_coach_all" ON skills;
CREATE POLICY "skills_coach_all" ON skills FOR ALL USING (is_my_client(client_id));

-- messages
DROP POLICY IF EXISTS "messages_participant" ON messages;
CREATE POLICY "messages_participant" ON messages FOR ALL USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- videos
DROP POLICY IF EXISTS "videos_coach_all" ON videos;
CREATE POLICY "videos_coach_all" ON videos FOR ALL USING (coach_id = auth.uid());
DROP POLICY IF EXISTS "videos_client_read" ON videos;
CREATE POLICY "videos_client_read" ON videos FOR SELECT USING (
  coach_id IN (
    SELECT coach_id FROM coach_clients
    WHERE client_id = auth.uid() AND status = 'active'
  )
);
