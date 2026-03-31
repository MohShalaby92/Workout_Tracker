-- ============================================================
-- Train Track: Seed Data
-- Matches prototype INITIAL_DATA from TrainTrack.jsx
-- Run: supabase db reset (applies migrations + seed)
-- ============================================================

-- ─── Fixed UUIDs for referential integrity ───────────────────

-- Users
-- Coach:   a1b2c3d4-e5f6-7890-abcd-ef1234567890
-- Mohamed: b2c3d4e5-f6a7-8901-bcde-f12345678901

-- Programs
-- Strength Builder: c3d4e5f6-a7b8-9012-cdef-123456789012
-- Skill Work:       c4d5e6f7-b8c9-0123-def0-234567890123
-- MetCon Prep:      c5d6e7f8-c9d0-1234-ef01-345678901234

-- Workout template (March 28 Strength Builder)
-- Template:         d6e7f8a9-d0e1-2345-f012-456789012345

-- Template sections
-- A (Warm-Up):        e7f8a9b0-e1f2-3456-0123-567890123456
-- B (Olympic Lifting): e8f9a0b1-f2a3-4567-1234-678901234567
-- C (Accessory):      e9a0b1c2-a3b4-5678-2345-789012345678

-- Exercises (global)
-- Clean:          f0a1b2c3-b4c5-6789-3456-890123456789
-- Squat Clean:    f1b2c3d4-c5d6-7890-4567-901234567890
-- Back Squat:     f2c3d4e5-d6e7-8901-5678-012345678901
-- Front Squat:    f3d4e5f6-e7f8-9012-6789-123456789012
-- Clean & Jerk:   f4e5f6a7-f8a9-0123-7890-234567890123
-- Strict Press:   f5f6a7b8-a9b0-1234-8901-345678901234
-- Push Press:     f6a7b8c9-b0c1-2345-9012-456789012345
-- Bench Press:    f7b8c9d0-c1d2-3456-0123-567890123456
-- Power Snatch:   f8c9d0e1-d2e3-4567-1234-678901234567
-- Squat Snatch:   f9d0e1f2-e3f4-5678-2345-789012345678
-- Deadlift:       a0e1f2a3-f4a5-6789-3456-890123456789
-- Row:            a1f2a3b4-a5b6-7890-4567-901234567890
-- PVC Pass-through: a2a3b4c5-b6c7-8901-5678-012345678901
-- Air Squat:      a3b4c5d6-c7d8-9012-6789-123456789012
-- Inch Worm:      a4c5d6e7-d8e9-0123-7890-234567890123
-- DB Romanian DL: a5d6e7f8-e9f0-1234-8901-345678901234
-- Weighted Step-up: a6e7f8a9-f0a1-2345-9012-456789012345
-- GHD Hip Ext:    a7f8a9b0-a1b2-3456-0123-567890123456
-- Plank:          a8a9b0c1-b2c3-4567-1234-678901234567

-- Injuries
-- Finger fracture: b0b1c2d3-c3d4-5678-2345-789012345678
-- Ulna nonunion:   b1c2d3e4-d4e5-6789-3456-890123456789

-- Videos
-- Squat Clean Technique: d0d1e2f3-e5f6-7890-4567-901234567890
-- Double Under Prog:     d1e2f3a4-f6a7-8901-5678-012345678901


-- ═══════════════════════════════════════════════════════════════
-- 1. Auth users (required before public.users due to FK)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role)
VALUES
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '00000000-0000-0000-0000-000000000000',
    'coach@traintrack.app',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"name": "Coach Alex", "role": "coach"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    '00000000-0000-0000-0000-000000000000',
    'mohamed@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"name": "Mohamed", "role": "client"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  );

-- The handle_new_user() trigger auto-creates public.users rows,
-- but we need to update them with full profile data.

UPDATE users SET
  phone        = NULL,
  gym          = 'Train Track Gym',
  speciality   = 'CrossFit Coaching',
  certificates = 'CF-L2, USAW Sports Performance'
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

UPDATE users SET
  phone        = '01009522073',
  gym          = 'Tunnelvision',
  speciality   = 'Crossfit',
  certificates = 'Medical Certificate of Fitness'
WHERE id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';


-- ═══════════════════════════════════════════════════════════════
-- 2. Coach-client relationship
-- ═══════════════════════════════════════════════════════════════

INSERT INTO coach_clients (id, coach_id, client_id, status, invited_at, accepted_at)
VALUES (
  gen_random_uuid(),
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'active',
  '2026-01-15T10:00:00Z',
  '2026-01-15T12:30:00Z'
);


-- ═══════════════════════════════════════════════════════════════
-- 3. Programs
-- ═══════════════════════════════════════════════════════════════

INSERT INTO programs (id, coach_id, name, description, type)
VALUES
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'Strength Builder', 'Focus on Olympic lifts and squat variations', 'ongoing'),
  ('c4d5e6f7-b8c9-0123-def0-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'Skill Work', 'Gymnastics and skill progressions', 'template'),
  ('c5d6e7f8-c9d0-1234-ef01-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'MetCon Prep', 'Conditioning and WOD preparation', 'standard');


-- ═══════════════════════════════════════════════════════════════
-- 4. Program assignments (Mohamed → all 3 programs)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO program_assignments (id, program_id, client_id, start_date, status)
VALUES
  (gen_random_uuid(), 'c3d4e5f6-a7b8-9012-cdef-123456789012',
   'b2c3d4e5-f6a7-8901-bcde-f12345678901', '2026-03-01', 'active'),
  (gen_random_uuid(), 'c4d5e6f7-b8c9-0123-def0-234567890123',
   'b2c3d4e5-f6a7-8901-bcde-f12345678901', '2026-03-01', 'active'),
  (gen_random_uuid(), 'c5d6e7f8-c9d0-1234-ef01-345678901234',
   'b2c3d4e5-f6a7-8901-bcde-f12345678901', '2026-03-01', 'active');


-- ═══════════════════════════════════════════════════════════════
-- 5. Global exercises (the 11 PR movements + workout exercises)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO exercises (id, name, description, category, is_global)
VALUES
  -- PR movements
  ('f0a1b2c3-b4c5-6789-3456-890123456789', 'Clean',         'Full squat or power clean',                  'olympic',    true),
  ('f1b2c3d4-c5d6-7890-4567-901234567890', 'Squat Clean',   'Clean caught in full front squat position',   'olympic',    true),
  ('f2c3d4e5-d6e7-8901-5678-012345678901', 'Back Squat',    'Barbell back squat — high or low bar',       'strength',   true),
  ('f3d4e5f6-e7f8-9012-6789-123456789012', 'Front Squat',   'Barbell front squat — front rack position',  'strength',   true),
  ('f4e5f6a7-f8a9-0123-7890-234567890123', 'Clean & Jerk',  'Full clean followed by split or push jerk',  'olympic',    true),
  ('f5f6a7b8-a9b0-1234-8901-345678901234', 'Strict Press',  'Standing overhead press — no leg drive',     'strength',   true),
  ('f6a7b8c9-b0c1-2345-9012-456789012345', 'Push Press',    'Overhead press with leg drive',              'olympic',    true),
  ('f7b8c9d0-c1d2-3456-0123-567890123456', 'Bench Press',   'Flat barbell bench press',                   'strength',   true),
  ('f8c9d0e1-d2e3-4567-1234-678901234567', 'Power Snatch',  'Snatch caught above parallel',               'olympic',    true),
  ('f9d0e1f2-e3f4-5678-2345-789012345678', 'Squat Snatch',  'Full snatch caught in overhead squat',        'olympic',    true),
  ('a0e1f2a3-f4a5-6789-3456-890123456789', 'Deadlift',      'Conventional barbell deadlift',              'strength',   true),
  -- Warm-up / accessory exercises
  ('a1f2a3b4-a5b6-7890-4567-901234567890', 'Row',           '500m row on Concept2 or similar',            'conditioning', true),
  ('a2a3b4c5-b6c7-8901-5678-012345678901', 'PVC Pass-through', 'Shoulder mobility drill with PVC pipe',   'gymnastics', true),
  ('a3b4c5d6-c7d8-9012-6789-123456789012', 'Air Squat',     'Bodyweight squat',                           'gymnastics', true),
  ('a4c5d6e7-d8e9-0123-7890-234567890123', 'Inch Worm',     'Walk-out to plank and back',                 'gymnastics', true),
  ('a5d6e7f8-e9f0-1234-8901-345678901234', 'DB Romanian Deadlift', 'Dumbbell RDL for hamstrings',         'accessory',  true),
  ('a6e7f8a9-f0a1-2345-9012-456789012345', 'Weighted Step-up', 'Step-up with dumbbells or barbell',       'accessory',  true),
  ('a7f8a9b0-a1b2-3456-0123-567890123456', 'GHD Hip Extension', 'Glute-ham developer hip extension',     'accessory',  true),
  ('a8a9b0c1-b2c3-4567-1234-678901234567', 'Plank',         'Isometric core hold',                        'gymnastics', true);


-- ═══════════════════════════════════════════════════════════════
-- 6. Workout template for March 28, 2026 (Strength Builder)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO workout_templates (id, program_id, day_number, title, notes)
VALUES (
  'd6e7f8a9-d0e1-2345-f012-456789012345',
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  28,
  'March 28 — Squat Clean & Front Squat',
  'Focus on technique under moderate load. Build to heavy clean complex.'
);


-- ═══════════════════════════════════════════════════════════════
-- 7. Template sections (A, B, C)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO template_sections (id, workout_template_id, letter, title, format, settings_json, order_index)
VALUES
  ('e7f8a9b0-e1f2-3456-0123-567890123456', 'd6e7f8a9-d0e1-2345-f012-456789012345',
   'A', 'Warm-Up', 'sets', '{"rounds": 3}'::jsonb, 0),
  ('e8f9a0b1-f2a3-4567-1234-678901234567', 'd6e7f8a9-d0e1-2345-f012-456789012345',
   'B', 'Olympic Lifting', 'sets', '{}'::jsonb, 1),
  ('e9a0b1c2-a3b4-5678-2345-789012345678', 'd6e7f8a9-d0e1-2345-f012-456789012345',
   'C', 'Accessory', 'sets', '{"rounds": 3}'::jsonb, 2);


-- ═══════════════════════════════════════════════════════════════
-- 8. Template exercises within each section
-- ═══════════════════════════════════════════════════════════════

-- Section A: Warm-Up — 3 Rounds: 500m Row, 10 PVC Pass-throughs, 10 Air Squats, 5 Inch Worms
INSERT INTO template_exercises (section_id, exercise_id, order_index, sets, reps, notes)
VALUES
  ('e7f8a9b0-e1f2-3456-0123-567890123456', 'a1f2a3b4-a5b6-7890-4567-901234567890', 0, 3, NULL,  '500m per round'),
  ('e7f8a9b0-e1f2-3456-0123-567890123456', 'a2a3b4c5-b6c7-8901-5678-012345678901', 1, 3, 10,    NULL),
  ('e7f8a9b0-e1f2-3456-0123-567890123456', 'a3b4c5d6-c7d8-9012-6789-123456789012', 2, 3, 10,    NULL),
  ('e7f8a9b0-e1f2-3456-0123-567890123456', 'a4c5d6e7-d8e9-0123-7890-234567890123', 3, 3, 5,     NULL);

-- Section B: Olympic Lifting
-- Tall Clean 3x3, Clean Complex build to heavy in 5 sets, Front Squat 4x5 @70-75%
INSERT INTO template_exercises (section_id, exercise_id, order_index, sets, reps, weight_kg, percentage_1rm, notes)
VALUES
  ('e8f9a0b1-f2a3-4567-1234-678901234567', 'f1b2c3d4-c5d6-7890-4567-901234567890', 0, 3, 3,  NULL,  NULL,  'Tall Clean — focus on speed under the bar'),
  ('e8f9a0b1-f2a3-4567-1234-678901234567', 'f0a1b2c3-b4c5-6789-3456-890123456789', 1, 5, NULL, NULL,  NULL,  'Clean Complex: 2 Clean Grip DL + 2 Hang Clean Below Knee. Build to heavy.'),
  ('e8f9a0b1-f2a3-4567-1234-678901234567', 'f3d4e5f6-e7f8-9012-6789-123456789012', 2, 4, 5,  NULL,  72.5,  '@70-75% 1RM');

-- Section C: Accessory — 3-4 Sets
INSERT INTO template_exercises (section_id, exercise_id, order_index, sets, reps, notes)
VALUES
  ('e9a0b1c2-a3b4-5678-2345-789012345678', 'a5d6e7f8-e9f0-1234-8901-345678901234', 0, 4, 12, 'DB Romanian Deadlifts'),
  ('e9a0b1c2-a3b4-5678-2345-789012345678', 'a6e7f8a9-f0a1-2345-9012-456789012345', 1, 4, 10, 'Each leg'),
  ('e9a0b1c2-a3b4-5678-2345-789012345678', 'a7f8a9b0-a1b2-3456-0123-567890123456', 2, 4, 15, NULL),
  ('e9a0b1c2-a3b4-5678-2345-789012345678', 'a8a9b0c1-b2c3-4567-1234-678901234567', 3, 4, NULL, '1 min hold');


-- ═══════════════════════════════════════════════════════════════
-- 9. Personal records for Mohamed (from spec PR list)
--    estimated_1rm uses Epley: weight * (1 + reps/30)
--    For 1RM PRs, estimated_1rm = weight_kg
-- ═══════════════════════════════════════════════════════════════

INSERT INTO personal_records (client_id, exercise_id, weight_kg, reps, estimated_1rm, achieved_at, auto_detected)
VALUES
  -- Clean: 80 kg (1RM)
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'f0a1b2c3-b4c5-6789-3456-890123456789',
   80, 1, 80.00, '2026-02-10T09:00:00Z', false),
  -- Squat Clean: 79.4 kg (1RM)
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'f1b2c3d4-c5d6-7890-4567-901234567890',
   79.4, 1, 79.40, '2026-02-10T09:15:00Z', false),
  -- Back Squat: 150 kg (1RM)
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'f2c3d4e5-d6e7-8901-5678-012345678901',
   150, 1, 150.00, '2026-01-20T10:00:00Z', false),
  -- Front Squat: 102 kg (1RM)
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'f3d4e5f6-e7f8-9012-6789-123456789012',
   102, 1, 102.00, '2026-02-05T10:30:00Z', false),
  -- Clean & Jerk: 70.3 kg (1RM)
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'f4e5f6a7-f8a9-0123-7890-234567890123',
   70.3, 1, 70.30, '2026-01-25T09:00:00Z', false),
  -- Strict Press: 47.6 kg (1RM)
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'f5f6a7b8-a9b0-1234-8901-345678901234',
   47.6, 1, 47.60, '2026-02-15T11:00:00Z', false),
  -- Push Press: 70 kg (1RM)
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'f6a7b8c9-b0c1-2345-9012-456789012345',
   70, 1, 70.00, '2026-02-15T11:30:00Z', false),
  -- Bench Press: 80 kg (1RM)
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'f7b8c9d0-c1d2-3456-0123-567890123456',
   80, 1, 80.00, '2026-02-20T10:00:00Z', false),
  -- Power Snatch: 56.7 kg (1RM)
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'f8c9d0e1-d2e3-4567-1234-678901234567',
   56.7, 1, 56.70, '2026-01-30T09:00:00Z', false),
  -- Squat Snatch: 47.6 kg (1RM)
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'f9d0e1f2-e3f4-5678-2345-789012345678',
   47.6, 1, 47.60, '2026-01-30T09:30:00Z', false),
  -- Deadlift: 150 kg (1RM)
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'a0e1f2a3-f4a5-6789-3456-890123456789',
   150, 1, 150.00, '2026-01-18T10:00:00Z', false);


-- ═══════════════════════════════════════════════════════════════
-- 10. Injuries for Mohamed (from spec)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO injuries (id, client_id, name, area, date, status, avoid, notes, doctor_notes)
VALUES
  ('b0b1c2d3-c3d4-5678-2345-789012345678',
   'b2c3d4e5-f6a7-8901-bcde-f12345678901',
   'Right ring finger fracture', 'Right Hand', '2025-12-01', 'recovering',
   'Heavy grip without tape',
   'Test gradually with barbell and pull-up bar work.',
   'Dr cleared for normal pressure. May need hand wrap or tape.'),

  ('b1c2d3e4-d4e5-6789-3456-890123456789',
   'b2c3d4e5-f6a7-8901-bcde-f12345678901',
   'Left ulna nonunion', 'Left Forearm', '2024-01-01', 'active',
   'Dips, butterfly swings, kipping',
   'Only hurts on specific movements. Substitute strict pull-ups for kipping.',
   'Well-aligned with metal plate. Chronic condition.');


-- ═══════════════════════════════════════════════════════════════
-- 11. Skills for Mohamed (from spec)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO skills (client_id, name, status, current_level, notes)
VALUES
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901',
   'High Volume Toes to Bar', 'in_progress', '2-3 reps',
   'Focus on kip timing and grip endurance'),

  ('b2c3d4e5-f6a7-8901-bcde-f12345678901',
   'Double Unders', 'locked', 'Not achieved',
   'Practice single-double transitions'),

  ('b2c3d4e5-f6a7-8901-bcde-f12345678901',
   'Butterfly Pull-ups', 'blocked', 'Blocked by injury',
   'Avoid due to ulna nonunion'),

  ('b2c3d4e5-f6a7-8901-bcde-f12345678901',
   'Muscle Ups', 'locked', 'Not achieved',
   'Build strict pull-up and dip strength'),

  ('b2c3d4e5-f6a7-8901-bcde-f12345678901',
   'Kipping HSPU', 'locked', 'Not achieved',
   'Develop strict HSPU first'),

  ('b2c3d4e5-f6a7-8901-bcde-f12345678901',
   'Handstand Walk', 'locked', 'Not achieved',
   'Progress through wall holds');


-- ═══════════════════════════════════════════════════════════════
-- 12. Videos (from prototype)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO videos (id, coach_id, title, url, category, exercise_id)
VALUES
  ('d0d1e2f3-e5f6-7890-4567-901234567890',
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'Squat Clean Technique',
   'https://youtube.com/watch?v=example1',
   'Olympic Lifting',
   'f1b2c3d4-c5d6-7890-4567-901234567890'),

  ('d1e2f3a4-f6a7-8901-5678-012345678901',
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'Double Under Progression',
   'https://youtube.com/watch?v=example2',
   'Skills',
   NULL);
