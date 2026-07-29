-- =============================================================================
-- Monthly Advisor Capacity Reset — Scheduled Automation
-- Issue #151: Implement Monthly Advisor Capacity Management
--
-- HOW TO RUN THIS IN SUPABASE:
--   1. Go to Supabase Dashboard → Database → Extensions
--   2. Enable the "pg_cron" extension (search for it, toggle on)
--   3. Open SQL Editor → New Query
--   4. Paste and run this file
--
-- WHAT IT DOES:
--   Schedules a cron job that runs at 12:00 AM UTC on the first day of
--   every calendar month. The job sets currentAssignments = 0 for every
--   advisor, starting a fresh mentoring cycle without touching historical
--   match records.
--
-- TO VERIFY THE JOB WAS CREATED:
--   SELECT * FROM cron.job;
--
-- TO REMOVE THE JOB (if needed):
--   SELECT cron.unschedule('reset-monthly-advisor-capacity');
-- =============================================================================

-- Enable pg_cron (safe to run even if already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove any existing version of this job before (re)creating it
-- so this file is safe to run more than once without creating duplicates.
SELECT cron.unschedule('reset-monthly-advisor-capacity')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'reset-monthly-advisor-capacity'
);

-- Schedule the monthly reset:
--   Cron expression: 0 0 1 * *
--   Meaning: minute 0, hour 0, day-of-month 1, every month, any day-of-week
--   = 12:00 AM UTC on the 1st of every month
SELECT cron.schedule(
  'reset-monthly-advisor-capacity',
  '0 0 1 * *',
  $$
    UPDATE public.advisors
    SET    "currentAssignments" = 0;
  $$
);
