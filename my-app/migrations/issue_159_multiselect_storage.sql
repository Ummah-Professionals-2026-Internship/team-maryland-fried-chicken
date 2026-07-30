BEGIN;

-- Store every service selected by an applicant.
CREATE TABLE IF NOT EXISTS public.applicant_services (
    applicant_id UUID NOT NULL
        REFERENCES public.applicants(id) ON DELETE CASCADE,
    service_id UUID NOT NULL
        REFERENCES public.service_types(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (applicant_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_applicant_services_service
    ON public.applicant_services(service_id);

DROP TRIGGER IF EXISTS trg_set_updated_at_applicant_services
    ON public.applicant_services;

CREATE TRIGGER trg_set_updated_at_applicant_services
BEFORE UPDATE ON public.applicant_services
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Preserve existing applicant service selections.
INSERT INTO public.applicant_services (
    applicant_id,
    service_id
)
SELECT
    id,
    service_id
FROM public.applicants
WHERE service_id IS NOT NULL
ON CONFLICT (applicant_id, service_id) DO NOTHING;

-- Convert the advisor experience field from one text value to an array.
DO $$
DECLARE
    current_data_type TEXT;
BEGIN
    SELECT data_type
    INTO current_data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'advisors'
      AND column_name = 'unique_career_experiences';

    IF current_data_type = 'text' THEN
        ALTER TABLE public.advisors
            DROP CONSTRAINT IF EXISTS advisors_unique_career_experiences_check;

        ALTER TABLE public.advisors
            ALTER COLUMN unique_career_experiences TYPE TEXT[]
            USING CASE
                WHEN unique_career_experiences IS NULL THEN NULL
                ELSE ARRAY[unique_career_experiences]
            END;
    END IF;
END
$$;

ALTER TABLE public.advisors
    DROP CONSTRAINT IF EXISTS advisors_unique_career_experiences_check;

ALTER TABLE public.advisors
    ADD CONSTRAINT advisors_unique_career_experiences_check
    CHECK (
        unique_career_experiences IS NULL
        OR unique_career_experiences <@ ARRAY[
            'Career Change',
            'Graduate School',
            'Entrepreneurship',
            'International Career',
            'Startup Experience',
            'Leadership Experience',
            'Career Break',
            'First-Generation College Student',
            'Military Experience',
            'Remote Work',
            'Immigration Journey'
        ]::TEXT[]
    );

-- Remove legacy columns after confirming there are no active application dependencies.
ALTER TABLE public.applicants
    DROP COLUMN IF EXISTS user_id;

ALTER TABLE public.advisors
    DROP COLUMN IF EXISTS advisor_code;
COMMIT;