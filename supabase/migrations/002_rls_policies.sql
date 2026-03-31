-- ============================================================
-- Train Track: Granular RLS Policies
-- Replaces the broad FOR ALL policies from 001_initial_schema
-- ============================================================

-- ─── Drop all existing policies from 001 ─────────────────────

DROP POLICY IF EXISTS "users_read_own"            ON users;
DROP POLICY IF EXISTS "users_update_own"           ON users;
DROP POLICY IF EXISTS "users_coach_reads_clients"  ON users;

DROP POLICY IF EXISTS "cc_coach_all"    ON coach_clients;
DROP POLICY IF EXISTS "cc_client_read"  ON coach_clients;

DROP POLICY IF EXISTS "programs_coach_all"    ON programs;
DROP POLICY IF EXISTS "programs_client_read"  ON programs;

DROP POLICY IF EXISTS "pa_coach_all"    ON program_assignments;
DROP POLICY IF EXISTS "pa_client_read"  ON program_assignments;

DROP POLICY IF EXISTS "wt_coach_all"    ON workout_templates;
DROP POLICY IF EXISTS "wt_client_read"  ON workout_templates;

DROP POLICY IF EXISTS "ts_coach_all"    ON template_sections;
DROP POLICY IF EXISTS "ts_client_read"  ON template_sections;

DROP POLICY IF EXISTS "exercises_read_global"       ON exercises;
DROP POLICY IF EXISTS "exercises_coach_own"          ON exercises;
DROP POLICY IF EXISTS "exercises_client_read_coach"  ON exercises;

DROP POLICY IF EXISTS "te_coach_all"    ON template_exercises;
DROP POLICY IF EXISTS "te_client_read"  ON template_exercises;

DROP POLICY IF EXISTS "wl_client_all"   ON workout_logs;
DROP POLICY IF EXISTS "wl_coach_read"   ON workout_logs;

DROP POLICY IF EXISTS "ls_client_all"   ON logged_sets;
DROP POLICY IF EXISTS "ls_coach_read"   ON logged_sets;

DROP POLICY IF EXISTS "pr_client_all"   ON personal_records;
DROP POLICY IF EXISTS "pr_coach_read"   ON personal_records;

DROP POLICY IF EXISTS "injuries_client_all"  ON injuries;
DROP POLICY IF EXISTS "injuries_coach_all"   ON injuries;

DROP POLICY IF EXISTS "skills_client_all"  ON skills;
DROP POLICY IF EXISTS "skills_coach_all"   ON skills;

DROP POLICY IF EXISTS "messages_participant"  ON messages;

DROP POLICY IF EXISTS "videos_coach_all"     ON videos;
DROP POLICY IF EXISTS "videos_client_read"   ON videos;


-- ═══════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS (already exist from 001, recreate safely)
-- ═══════════════════════════════════════════════════════════════

-- is_my_client: does the current auth user coach this client?
CREATE OR REPLACE FUNCTION is_my_client(p_client_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM coach_clients
    WHERE coach_id = auth.uid()
      AND client_id = p_client_id
      AND status = 'active'
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- my_program_ids: all program IDs owned by the current coach
CREATE OR REPLACE FUNCTION my_program_ids()
RETURNS SETOF UUID AS $$
  SELECT id FROM programs WHERE coach_id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- my_assigned_program_ids: all program IDs assigned to the current client
CREATE OR REPLACE FUNCTION my_assigned_program_ids()
RETURNS SETOF UUID AS $$
  SELECT program_id FROM program_assignments
  WHERE client_id = auth.uid() AND status = 'active'
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- is_my_coach: does the current auth user have this coach?
CREATE OR REPLACE FUNCTION is_my_coach(p_coach_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM coach_clients
    WHERE coach_id = p_coach_id
      AND client_id = auth.uid()
      AND status = 'active'
  )
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ═══════════════════════════════════════════════════════════════
-- 1. users
-- ═══════════════════════════════════════════════════════════════
-- SELECT: own row + coach reads their active clients
-- UPDATE: own row only
-- INSERT: handled by handle_new_user() trigger (SECURITY DEFINER)
-- DELETE: not allowed via app (cascade from auth.users)

CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "users_select_coach_reads_clients"
  ON users FOR SELECT
  USING (is_my_client(id));

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());


-- ═══════════════════════════════════════════════════════════════
-- 2. coach_clients
-- ═══════════════════════════════════════════════════════════════
-- SELECT: coach sees own relationships, client sees own relationships
-- INSERT: only coaches can create invitations
-- UPDATE: coach can update their own, client can update (accept) theirs
-- DELETE: only coach can remove relationship

CREATE POLICY "cc_select_coach"
  ON coach_clients FOR SELECT
  USING (coach_id = auth.uid());

CREATE POLICY "cc_select_client"
  ON coach_clients FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "cc_insert_coach"
  ON coach_clients FOR INSERT
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "cc_update_coach"
  ON coach_clients FOR UPDATE
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "cc_update_client"
  ON coach_clients FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "cc_delete_coach"
  ON coach_clients FOR DELETE
  USING (coach_id = auth.uid());


-- ═══════════════════════════════════════════════════════════════
-- 3. programs
-- ═══════════════════════════════════════════════════════════════
-- SELECT: coach sees own, client sees assigned
-- INSERT/UPDATE/DELETE: coach only

CREATE POLICY "programs_select_coach"
  ON programs FOR SELECT
  USING (coach_id = auth.uid());

CREATE POLICY "programs_select_client"
  ON programs FOR SELECT
  USING (id IN (SELECT my_assigned_program_ids()));

CREATE POLICY "programs_insert_coach"
  ON programs FOR INSERT
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "programs_update_coach"
  ON programs FOR UPDATE
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "programs_delete_coach"
  ON programs FOR DELETE
  USING (coach_id = auth.uid());


-- ═══════════════════════════════════════════════════════════════
-- 4. program_assignments
-- ═══════════════════════════════════════════════════════════════
-- SELECT: coach sees assignments for their programs, client sees own
-- INSERT/UPDATE/DELETE: coach only (for their programs)

CREATE POLICY "pa_select_coach"
  ON program_assignments FOR SELECT
  USING (program_id IN (SELECT my_program_ids()));

CREATE POLICY "pa_select_client"
  ON program_assignments FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "pa_insert_coach"
  ON program_assignments FOR INSERT
  WITH CHECK (program_id IN (SELECT my_program_ids()));

CREATE POLICY "pa_update_coach"
  ON program_assignments FOR UPDATE
  USING (program_id IN (SELECT my_program_ids()))
  WITH CHECK (program_id IN (SELECT my_program_ids()));

CREATE POLICY "pa_delete_coach"
  ON program_assignments FOR DELETE
  USING (program_id IN (SELECT my_program_ids()));


-- ═══════════════════════════════════════════════════════════════
-- 5. workout_templates
-- ═══════════════════════════════════════════════════════════════
-- SELECT: coach sees own programs' templates, client sees assigned
-- INSERT/UPDATE/DELETE: coach only

CREATE POLICY "wt_select_coach"
  ON workout_templates FOR SELECT
  USING (program_id IN (SELECT my_program_ids()));

CREATE POLICY "wt_select_client"
  ON workout_templates FOR SELECT
  USING (program_id IN (SELECT my_assigned_program_ids()));

CREATE POLICY "wt_insert_coach"
  ON workout_templates FOR INSERT
  WITH CHECK (program_id IN (SELECT my_program_ids()));

CREATE POLICY "wt_update_coach"
  ON workout_templates FOR UPDATE
  USING (program_id IN (SELECT my_program_ids()))
  WITH CHECK (program_id IN (SELECT my_program_ids()));

CREATE POLICY "wt_delete_coach"
  ON workout_templates FOR DELETE
  USING (program_id IN (SELECT my_program_ids()));


-- ═══════════════════════════════════════════════════════════════
-- 6. template_sections
-- ═══════════════════════════════════════════════════════════════
-- Visibility follows parent workout_template

CREATE POLICY "ts_select_coach"
  ON template_sections FOR SELECT
  USING (workout_template_id IN (
    SELECT id FROM workout_templates WHERE program_id IN (SELECT my_program_ids())
  ));

CREATE POLICY "ts_select_client"
  ON template_sections FOR SELECT
  USING (workout_template_id IN (
    SELECT id FROM workout_templates WHERE program_id IN (SELECT my_assigned_program_ids())
  ));

CREATE POLICY "ts_insert_coach"
  ON template_sections FOR INSERT
  WITH CHECK (workout_template_id IN (
    SELECT id FROM workout_templates WHERE program_id IN (SELECT my_program_ids())
  ));

CREATE POLICY "ts_update_coach"
  ON template_sections FOR UPDATE
  USING (workout_template_id IN (
    SELECT id FROM workout_templates WHERE program_id IN (SELECT my_program_ids())
  ))
  WITH CHECK (workout_template_id IN (
    SELECT id FROM workout_templates WHERE program_id IN (SELECT my_program_ids())
  ));

CREATE POLICY "ts_delete_coach"
  ON template_sections FOR DELETE
  USING (workout_template_id IN (
    SELECT id FROM workout_templates WHERE program_id IN (SELECT my_program_ids())
  ));


-- ═══════════════════════════════════════════════════════════════
-- 7. exercises
-- ═══════════════════════════════════════════════════════════════
-- SELECT: global exercises visible to all, coach-created visible
--         to that coach and their active clients
-- INSERT/UPDATE/DELETE: coach for their own exercises only

CREATE POLICY "exercises_select_global"
  ON exercises FOR SELECT
  USING (is_global = true);

CREATE POLICY "exercises_select_coach_own"
  ON exercises FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "exercises_select_client_coach"
  ON exercises FOR SELECT
  USING (is_my_coach(created_by));

CREATE POLICY "exercises_insert_coach"
  ON exercises FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "exercises_update_coach"
  ON exercises FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "exercises_delete_coach"
  ON exercises FOR DELETE
  USING (created_by = auth.uid());


-- ═══════════════════════════════════════════════════════════════
-- 8. template_exercises
-- ═══════════════════════════════════════════════════════════════
-- Visibility follows parent template_section → workout_template

CREATE POLICY "te_select_coach"
  ON template_exercises FOR SELECT
  USING (section_id IN (
    SELECT ts.id FROM template_sections ts
    JOIN workout_templates wt ON wt.id = ts.workout_template_id
    WHERE wt.program_id IN (SELECT my_program_ids())
  ));

CREATE POLICY "te_select_client"
  ON template_exercises FOR SELECT
  USING (section_id IN (
    SELECT ts.id FROM template_sections ts
    JOIN workout_templates wt ON wt.id = ts.workout_template_id
    WHERE wt.program_id IN (SELECT my_assigned_program_ids())
  ));

CREATE POLICY "te_insert_coach"
  ON template_exercises FOR INSERT
  WITH CHECK (section_id IN (
    SELECT ts.id FROM template_sections ts
    JOIN workout_templates wt ON wt.id = ts.workout_template_id
    WHERE wt.program_id IN (SELECT my_program_ids())
  ));

CREATE POLICY "te_update_coach"
  ON template_exercises FOR UPDATE
  USING (section_id IN (
    SELECT ts.id FROM template_sections ts
    JOIN workout_templates wt ON wt.id = ts.workout_template_id
    WHERE wt.program_id IN (SELECT my_program_ids())
  ))
  WITH CHECK (section_id IN (
    SELECT ts.id FROM template_sections ts
    JOIN workout_templates wt ON wt.id = ts.workout_template_id
    WHERE wt.program_id IN (SELECT my_program_ids())
  ));

CREATE POLICY "te_delete_coach"
  ON template_exercises FOR DELETE
  USING (section_id IN (
    SELECT ts.id FROM template_sections ts
    JOIN workout_templates wt ON wt.id = ts.workout_template_id
    WHERE wt.program_id IN (SELECT my_program_ids())
  ));


-- ═══════════════════════════════════════════════════════════════
-- 9. workout_logs
-- ═══════════════════════════════════════════════════════════════
-- SELECT: client sees own, coach sees active clients'
-- INSERT/UPDATE: client only (their own)
-- DELETE: client only (their own)

CREATE POLICY "wl_select_client"
  ON workout_logs FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "wl_select_coach"
  ON workout_logs FOR SELECT
  USING (is_my_client(client_id));

CREATE POLICY "wl_insert_client"
  ON workout_logs FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "wl_update_client"
  ON workout_logs FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "wl_delete_client"
  ON workout_logs FOR DELETE
  USING (client_id = auth.uid());


-- ═══════════════════════════════════════════════════════════════
-- 10. logged_sets
-- ═══════════════════════════════════════════════════════════════
-- Visibility follows parent workout_log
-- INSERT/UPDATE/DELETE: client only (via own workout_logs)

CREATE POLICY "ls_select_client"
  ON logged_sets FOR SELECT
  USING (workout_log_id IN (
    SELECT id FROM workout_logs WHERE client_id = auth.uid()
  ));

CREATE POLICY "ls_select_coach"
  ON logged_sets FOR SELECT
  USING (workout_log_id IN (
    SELECT id FROM workout_logs WHERE is_my_client(client_id)
  ));

CREATE POLICY "ls_insert_client"
  ON logged_sets FOR INSERT
  WITH CHECK (workout_log_id IN (
    SELECT id FROM workout_logs WHERE client_id = auth.uid()
  ));

CREATE POLICY "ls_update_client"
  ON logged_sets FOR UPDATE
  USING (workout_log_id IN (
    SELECT id FROM workout_logs WHERE client_id = auth.uid()
  ))
  WITH CHECK (workout_log_id IN (
    SELECT id FROM workout_logs WHERE client_id = auth.uid()
  ));

CREATE POLICY "ls_delete_client"
  ON logged_sets FOR DELETE
  USING (workout_log_id IN (
    SELECT id FROM workout_logs WHERE client_id = auth.uid()
  ));


-- ═══════════════════════════════════════════════════════════════
-- 11. personal_records
-- ═══════════════════════════════════════════════════════════════
-- SELECT: client sees own, coach sees active clients'
-- INSERT: client can add manual PRs, auto_detect_pr() trigger
--         inserts via SECURITY DEFINER so bypasses RLS
-- UPDATE/DELETE: client only (their own)

CREATE POLICY "pr_select_client"
  ON personal_records FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "pr_select_coach"
  ON personal_records FOR SELECT
  USING (is_my_client(client_id));

CREATE POLICY "pr_insert_client"
  ON personal_records FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "pr_update_client"
  ON personal_records FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "pr_delete_client"
  ON personal_records FOR DELETE
  USING (client_id = auth.uid());


-- ═══════════════════════════════════════════════════════════════
-- 12. injuries
-- ═══════════════════════════════════════════════════════════════
-- SELECT: client sees own, coach sees active clients'
-- INSERT/UPDATE: coach can manage for their clients
-- INSERT/UPDATE: client can manage their own
-- DELETE: coach only (for their clients)

CREATE POLICY "injuries_select_client"
  ON injuries FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "injuries_select_coach"
  ON injuries FOR SELECT
  USING (is_my_client(client_id));

CREATE POLICY "injuries_insert_coach"
  ON injuries FOR INSERT
  WITH CHECK (is_my_client(client_id));

CREATE POLICY "injuries_insert_client"
  ON injuries FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "injuries_update_coach"
  ON injuries FOR UPDATE
  USING (is_my_client(client_id))
  WITH CHECK (is_my_client(client_id));

CREATE POLICY "injuries_update_client"
  ON injuries FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "injuries_delete_coach"
  ON injuries FOR DELETE
  USING (is_my_client(client_id));


-- ═══════════════════════════════════════════════════════════════
-- 13. skills
-- ═══════════════════════════════════════════════════════════════
-- SELECT: client sees own, coach sees active clients'
-- INSERT/UPDATE: coach can manage for their clients
-- UPDATE: client can update their own (e.g. mark progress)
-- DELETE: coach only

CREATE POLICY "skills_select_client"
  ON skills FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "skills_select_coach"
  ON skills FOR SELECT
  USING (is_my_client(client_id));

CREATE POLICY "skills_insert_coach"
  ON skills FOR INSERT
  WITH CHECK (is_my_client(client_id));

CREATE POLICY "skills_update_coach"
  ON skills FOR UPDATE
  USING (is_my_client(client_id))
  WITH CHECK (is_my_client(client_id));

CREATE POLICY "skills_update_client"
  ON skills FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "skills_delete_coach"
  ON skills FOR DELETE
  USING (is_my_client(client_id));


-- ═══════════════════════════════════════════════════════════════
-- 14. messages
-- ═══════════════════════════════════════════════════════════════
-- SELECT: only sender or recipient
-- INSERT: anyone can send (must be the sender)
-- UPDATE: only recipient (to set read_at)
-- DELETE: only sender

CREATE POLICY "messages_select_participant"
  ON messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "messages_insert_sender"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_update_recipient"
  ON messages FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "messages_delete_sender"
  ON messages FOR DELETE
  USING (sender_id = auth.uid());


-- ═══════════════════════════════════════════════════════════════
-- 15. videos
-- ═══════════════════════════════════════════════════════════════
-- SELECT: coach sees own, client sees their coach's videos
-- INSERT/UPDATE/DELETE: coach only

CREATE POLICY "videos_select_coach"
  ON videos FOR SELECT
  USING (coach_id = auth.uid());

CREATE POLICY "videos_select_client"
  ON videos FOR SELECT
  USING (is_my_coach(coach_id));

CREATE POLICY "videos_insert_coach"
  ON videos FOR INSERT
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "videos_update_coach"
  ON videos FOR UPDATE
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "videos_delete_coach"
  ON videos FOR DELETE
  USING (coach_id = auth.uid());
