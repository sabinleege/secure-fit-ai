
-- Profiles expansion
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS goal_weight numeric,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS goals text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS goals_notes text DEFAULT '',
  ADD COLUMN IF NOT EXISTS training_days_per_week int DEFAULT 3,
  ADD COLUMN IF NOT EXISTS session_duration_min int DEFAULT 45,
  ADD COLUMN IF NOT EXISTS preferred_times text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS injuries_detailed jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS other_limitations text DEFAULT '',
  ADD COLUMN IF NOT EXISTS medical_disclaimer_accepted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS medical_disclaimer_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS dietary_style text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS allergies text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS meals_per_day int DEFAULT 3,
  ADD COLUMN IF NOT EXISTS cultural_restrictions text DEFAULT '',
  ADD COLUMN IF NOT EXISTS equipment text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS training_location text DEFAULT 'gym',
  ADD COLUMN IF NOT EXISTS environment_notes text DEFAULT '',
  ADD COLUMN IF NOT EXISTS tos_accepted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS tos_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS data_consent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS data_consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS profile_hash text;

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON public.profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_hash ON public.profiles(profile_hash);

-- Workout plans caching
ALTER TABLE public.workout_plans
  ADD COLUMN IF NOT EXISTS profile_hash text,
  ADD COLUMN IF NOT EXISTS generated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS version int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS regen_reason text;

CREATE INDEX IF NOT EXISTS idx_workout_plans_user_active ON public.workout_plans(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_workout_plans_profile_hash ON public.workout_plans(profile_hash);

-- AI usage tracking
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  function_name text NOT NULL,
  tokens_in int DEFAULT 0,
  tokens_out int DEFAULT 0,
  status text NOT NULL DEFAULT 'success',
  error_message text,
  duration_ms int,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own ai_usage select" ON public.ai_usage
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own ai_usage insert" ON public.ai_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_created ON public.ai_usage(user_id, created_at DESC);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('meals', 'meals', false)
  ON CONFLICT (id) DO NOTHING;

-- Avatars: public read, owner write
CREATE POLICY "avatars public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars owner insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars owner update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars owner delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Meals: owner-only read/write
CREATE POLICY "meals owner select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'meals'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "meals owner insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'meals'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "meals owner update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'meals'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "meals owner delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'meals'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
