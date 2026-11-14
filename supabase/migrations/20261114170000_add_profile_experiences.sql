-- Extend profiles and add LinkedIn-style experience entries.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS languages text[];

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'subjects'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'academic_interests'
  ) THEN
    ALTER TABLE public.profiles RENAME COLUMN subjects TO academic_interests;
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_uidx
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'education', 'work', 'volunteering', 'project', 'award', 'extracurricular'
  )),
  title text NOT NULL,
  organization text,
  description text,
  start_date date,
  end_date date,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS experiences_profile_id_idx
  ON public.experiences (profile_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

-- Preserve authenticated profile reading, while ensuring writes stay with the owner.
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS experiences_read_authenticated ON public.experiences;
CREATE POLICY experiences_read_authenticated
  ON public.experiences FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS experiences_insert_own ON public.experiences;
CREATE POLICY experiences_insert_own
  ON public.experiences FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = profile_id);

DROP POLICY IF EXISTS experiences_update_own ON public.experiences;
CREATE POLICY experiences_update_own
  ON public.experiences FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = profile_id)
  WITH CHECK ((SELECT auth.uid()) = profile_id);

DROP POLICY IF EXISTS experiences_delete_own ON public.experiences;
CREATE POLICY experiences_delete_own
  ON public.experiences FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = profile_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiences TO authenticated;
