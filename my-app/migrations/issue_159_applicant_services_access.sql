BEGIN;

-- Keep applicant service access consistent with the existing applicants table.
-- Server routes may run under the anonymous role when no authenticated session exists.
ALTER TABLE public.applicant_services DISABLE ROW LEVEL SECURITY;

COMMIT;