-- =============================================================================
-- Recommendation Test Cases — Advisor Matching Platform
-- Issue #71: Recommendation Test Dataset Preparation
--
-- Run after:
-- 1. migrations/init.sql
-- 2. migrations/seed.sql
--
-- Purpose:
-- These queries help inspect sample applicant/advisor matching scenarios
-- before the recommendation engine is implemented.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Scenario 1: Technology applicants and available technology advisors
-- ---------------------------------------------------------------------------

SELECT
    ap.first_name || ' ' || ap.last_name AS applicant,
    ap.desired_future_career,
    ap.industry AS applicant_industry,
    st.name AS requested_service,
    ad.first_name || ' ' || ad.last_name AS advisor,
    ad.job_title,
    ad.industry AS advisor_industry,
    ad.reliability_level,
    ad.mentorship_experience,
    ad.max_meetings_per_month,
    ad.availability_status
FROM applicants ap
JOIN service_types st ON st.id = ap.service_id
JOIN advisors ad ON ad.industry = ap.industry
WHERE ap.industry = 'Information Technology'
  AND ad.availability_status = 'Available'
ORDER BY ap.last_name, ad.reliability_level DESC, ad.max_meetings_per_month DESC;

-- ---------------------------------------------------------------------------
-- Scenario 2: Advisors who can support multiple applicants
-- ---------------------------------------------------------------------------

SELECT
    ad.first_name || ' ' || ad.last_name AS advisor,
    ad.industry,
    COUNT(ap.id) AS possible_applicant_matches
FROM advisors ad
JOIN applicants ap ON ap.industry = ad.industry
WHERE ad.availability_status = 'Available'
GROUP BY ad.id, ad.first_name, ad.last_name, ad.industry
ORDER BY possible_applicant_matches DESC;

-- ---------------------------------------------------------------------------
-- Scenario 3: Applicants with no exact industry advisor match or weak matches
-- ---------------------------------------------------------------------------

SELECT
    ap.first_name || ' ' || ap.last_name AS applicant,
    ap.industry,
    ap.desired_future_career,
    st.name AS requested_service
FROM applicants ap
JOIN service_types st ON st.id = ap.service_id
WHERE NOT EXISTS (
    SELECT 1
    FROM advisors ad
    WHERE ad.industry = ap.industry
      AND ad.availability_status = 'Available'
);

-- ---------------------------------------------------------------------------
-- Scenario 4: Advisors who should be deprioritized because unavailable
-- ---------------------------------------------------------------------------

SELECT
    first_name || ' ' || last_name AS advisor,
    industry,
    job_title,
    max_meetings_per_month,
    availability_status
FROM advisors
WHERE availability_status = 'Unavailable'
   OR max_meetings_per_month = 0;

-- ---------------------------------------------------------------------------
-- Scenario 5: Requested service match between applicants and advisors
-- ---------------------------------------------------------------------------

SELECT
    ap.first_name || ' ' || ap.last_name AS applicant,
    ap.desired_future_career,
    st.name AS requested_service,
    ad.first_name || ' ' || ad.last_name AS advisor,
    ad.industry,
    ad.reliability_level,
    ad.availability_status
FROM applicants ap
JOIN service_types st ON st.id = ap.service_id
JOIN advisor_services ads ON ads.service_id = st.id
JOIN advisors ad ON ad.id = ads.advisor_id
WHERE ad.availability_status = 'Available'
ORDER BY ap.last_name, st.name, ad.reliability_level DESC;

-- ---------------------------------------------------------------------------
-- Scenario 6: View advisor expertise coverage
-- ---------------------------------------------------------------------------

SELECT
    ad.first_name || ' ' || ad.last_name AS advisor,
    ad.industry,
    STRING_AGG(e.name, ', ' ORDER BY e.name) AS expertise_areas
FROM advisors ad
LEFT JOIN advisor_expertise ae ON ae.advisor_id = ad.id
LEFT JOIN expertise_areas e ON e.id = ae.expertise_id
GROUP BY ad.id, ad.first_name, ad.last_name, ad.industry
ORDER BY ad.industry, advisor;
