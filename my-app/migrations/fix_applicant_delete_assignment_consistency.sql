-- Keep advisor capacity and applicant matches consistent when applicants
-- are closed or permanently deleted.

-- Repair existing Closed applicants that still have Active matches.
UPDATE public.matches AS match
SET match_status = 'Completed'
FROM public.applicants AS applicant
WHERE applicant.id = match.applicant_id
  AND applicant.status = 'Closed'
  AND match.match_status = 'Active';

-- Reconcile monthly capacity using only active matches created during the
-- current UTC calendar month.
UPDATE public.advisors AS advisor
SET "currentAssignments" = (
  SELECT COUNT(*)::INTEGER
  FROM public.matches AS match
  WHERE match.advisor_id = advisor.id
    AND match.match_status = 'Active'
    AND match.matched_at >= (
      date_trunc('month', now() AT TIME ZONE 'UTC')
      AT TIME ZONE 'UTC'
    )
    AND match.matched_at < (
      date_trunc('month', now() AT TIME ZONE 'UTC')
      AT TIME ZONE 'UTC'
    ) + INTERVAL '1 month'
);

-- Release monthly advisor capacity before applicant deletion cascades
-- remove the applicant's match rows.
CREATE OR REPLACE FUNCTION public.release_assignments_before_applicant_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.advisors AS advisor
  SET "currentAssignments" = GREATEST(
    0,
    COALESCE(advisor."currentAssignments", 0)
      - assignment_counts.release_count
  )
  FROM (
    SELECT
      matches.advisor_id,
      COUNT(*)::INTEGER AS release_count
    FROM public.matches
    WHERE matches.applicant_id = OLD.id
      AND matches.match_status = 'Active'
      AND matches.matched_at >= (
        date_trunc('month', now() AT TIME ZONE 'UTC')
        AT TIME ZONE 'UTC'
      )
      AND matches.matched_at < (
        date_trunc('month', now() AT TIME ZONE 'UTC')
        AT TIME ZONE 'UTC'
      ) + INTERVAL '1 month'
    GROUP BY matches.advisor_id
  ) AS assignment_counts
  WHERE advisor.id = assignment_counts.advisor_id;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS
  trg_release_assignments_before_applicant_delete
  ON public.applicants;

CREATE TRIGGER trg_release_assignments_before_applicant_delete
BEFORE DELETE ON public.applicants
FOR EACH ROW
EXECUTE FUNCTION public.release_assignments_before_applicant_delete();

-- Closing a case completes its active match and releases the advisor slot.
CREATE OR REPLACE FUNCTION public.complete_matches_before_applicant_closed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.advisors AS advisor
  SET "currentAssignments" = GREATEST(
    0,
    COALESCE(advisor."currentAssignments", 0)
      - assignment_counts.release_count
  )
  FROM (
    SELECT
      matches.advisor_id,
      COUNT(*)::INTEGER AS release_count
    FROM public.matches
    WHERE matches.applicant_id = OLD.id
      AND matches.match_status = 'Active'
      AND matches.matched_at >= (
        date_trunc('month', now() AT TIME ZONE 'UTC')
        AT TIME ZONE 'UTC'
      )
      AND matches.matched_at < (
        date_trunc('month', now() AT TIME ZONE 'UTC')
        AT TIME ZONE 'UTC'
      ) + INTERVAL '1 month'
    GROUP BY matches.advisor_id
  ) AS assignment_counts
  WHERE advisor.id = assignment_counts.advisor_id;

  UPDATE public.matches
  SET match_status = 'Completed'
  WHERE applicant_id = OLD.id
    AND match_status = 'Active';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS
  trg_complete_matches_before_applicant_closed
  ON public.applicants;

CREATE TRIGGER trg_complete_matches_before_applicant_closed
BEFORE UPDATE OF status ON public.applicants
FOR EACH ROW
WHEN (
  NEW.status = 'Closed'
  AND OLD.status IS DISTINCT FROM 'Closed'
)
EXECUTE FUNCTION public.complete_matches_before_applicant_closed();

-- Prevent database writes from creating an Active match for a Closed case.
CREATE OR REPLACE FUNCTION public.reject_active_match_for_closed_applicant()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.match_status = 'Active'
    AND EXISTS (
      SELECT 1
      FROM public.applicants
      WHERE applicants.id = NEW.applicant_id
        AND applicants.status = 'Closed'
    )
  THEN
    RAISE EXCEPTION
      'A closed applicant cannot have an active match.'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS
  trg_reject_active_match_for_closed_applicant
  ON public.matches;

CREATE TRIGGER trg_reject_active_match_for_closed_applicant
BEFORE INSERT OR UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.reject_active_match_for_closed_applicant();

-- One applicant may have only one active advisor match.
CREATE UNIQUE INDEX IF NOT EXISTS
  idx_matches_one_active_per_applicant
ON public.matches (applicant_id)
WHERE match_status = 'Active';
