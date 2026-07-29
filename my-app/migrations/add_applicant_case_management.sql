-- Issue #146 - Applicant Case Management

ALTER TABLE public.applicants
ADD COLUMN IF NOT EXISTS follow_up_phase TEXT NOT NULL DEFAULT 'Not Started',
ADD COLUMN IF NOT EXISTS follow_up_outcome TEXT,
ADD COLUMN IF NOT EXISTS last_meeting_date DATE,
ADD COLUMN IF NOT EXISTS next_follow_up_date DATE,
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

ALTER TABLE public.applicants
DROP CONSTRAINT IF EXISTS applicants_follow_up_phase_check;

ALTER TABLE public.applicants
ADD CONSTRAINT applicants_follow_up_phase_check
CHECK (follow_up_phase IN (
    'Not Started',
    '1 Week Follow-up',
    '2 Month Follow-up',
    '4 Month Follow-up',
    'Follow-up Complete'
));

ALTER TABLE public.applicants
DROP CONSTRAINT IF EXISTS applicants_follow_up_outcome_check;

ALTER TABLE public.applicants
ADD CONSTRAINT applicants_follow_up_outcome_check
CHECK (
    follow_up_outcome IS NULL
    OR follow_up_outcome IN (
        'Awaiting Follow-up',
        'No Additional Session Needed',
        'Additional Session Requested'
    )
);

CREATE INDEX IF NOT EXISTS idx_applicants_next_follow_up_date
ON public.applicants(next_follow_up_date);
