ALTER TABLE public.advisors
DROP CONSTRAINT IF EXISTS advisors_gender_check;

ALTER TABLE public.advisors
ADD CONSTRAINT advisors_gender_check
CHECK (gender IN ('Brother', 'Sister'));

ALTER TABLE public.applicants
DROP CONSTRAINT IF EXISTS applicants_gender_check;

ALTER TABLE public.applicants
ADD CONSTRAINT applicants_gender_check
CHECK (gender IN ('Brother', 'Sister'));
