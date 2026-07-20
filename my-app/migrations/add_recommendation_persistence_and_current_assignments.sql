-- Persist recommendation cards and track advisor assignment counts.

ALTER TABLE public.advisors
ADD COLUMN IF NOT EXISTS "currentAssignments" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.recommendations
ADD COLUMN IF NOT EXISTS total_score NUMERIC,
ADD COLUMN IF NOT EXISTS career_score NUMERIC,
ADD COLUMN IF NOT EXISTS industry_score NUMERIC,
ADD COLUMN IF NOT EXISTS experience_score NUMERIC,
ADD COLUMN IF NOT EXISTS gender_bonus NUMERIC,
ADD COLUMN IF NOT EXISTS capacity_adjustment NUMERIC,
ADD COLUMN IF NOT EXISTS career_similarity TEXT;

UPDATE public.advisors AS a
SET "currentAssignments" = COALESCE((
    SELECT COUNT(*)::INTEGER
    FROM public.matches AS m
    WHERE m.advisor_id = a.id
      AND m.match_status = 'Active'
), 0);
