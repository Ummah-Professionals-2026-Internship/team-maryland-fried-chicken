-- =============================================================================
-- CRUD Validation Script — Advisor Matching Platform
-- Issue #70: Database Validation & CRUD Testing
--
-- Run after:
-- 1. migrations/init.sql
-- 2. migrations/seed.sql
--
-- Purpose:
-- Validate Create, Read, Update, and Delete operations for advisors and applicants.
-- Also validates required fields, CHECK constraints, foreign keys, and cleanup.
-- =============================================================================

DO $$
DECLARE
    v_service_id UUID;
    v_advisor_id UUID;
    v_applicant_id UUID;
    v_count INTEGER;
BEGIN
    RAISE NOTICE 'Starting CRUD validation tests...';

    -- -------------------------------------------------------------------------
    -- Setup: get required service type
    -- -------------------------------------------------------------------------
    SELECT id INTO v_service_id
    FROM service_types
    WHERE name = 'Resume Review'
    LIMIT 1;

    IF v_service_id IS NULL THEN
        RAISE EXCEPTION 'Missing required service type: Resume Review';
    END IF;

    -- -------------------------------------------------------------------------
    -- Advisor CREATE
    -- -------------------------------------------------------------------------
    INSERT INTO advisors (
        advisor_code,
        first_name,
        last_name,
        email,
        gender,
        alma_mater,
        major,
        company,
        job_title,
        industry,
        experience_level,
        reliability_level,
        career_history_summary,
        unique_career_experiences,
        mentorship_experience,
        max_meetings_per_month,
        additional_notes,
        location_city,
        location_state,
        availability_status
    ) VALUES (
        'TEST-ADV-CRUD',
        'Test',
        'Advisor',
        'test.advisor.crud@example.com',
        'Other',
        'Test University',
        'Computer Science',
        'Test Company',
        'Test Engineer',
        'Information Technology',
        'Young Professional (0-3 Years)',
        'Medium',
        'Temporary advisor record for CRUD validation.',
        'Remote Work',
        '1–3 years',
        2,
        'Created by CRUD validation script.',
        'Test City',
        'TS',
        'Available'
    )
    RETURNING id INTO v_advisor_id;

    IF v_advisor_id IS NULL THEN
        RAISE EXCEPTION 'Advisor CREATE failed';
    END IF;

    RAISE NOTICE 'Advisor CREATE passed';

    -- -------------------------------------------------------------------------
    -- Advisor READ all and READ by ID
    -- -------------------------------------------------------------------------
    SELECT COUNT(*) INTO v_count FROM advisors;

    IF v_count < 1 THEN
        RAISE EXCEPTION 'Advisor READ all failed';
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM advisors
    WHERE id = v_advisor_id
      AND advisor_code = 'TEST-ADV-CRUD';

    IF v_count <> 1 THEN
        RAISE EXCEPTION 'Advisor READ by ID failed';
    END IF;

    RAISE NOTICE 'Advisor READ passed';

    -- -------------------------------------------------------------------------
    -- Advisor UPDATE
    -- -------------------------------------------------------------------------
    UPDATE advisors
    SET
        job_title = 'Updated Test Engineer',
        reliability_level = 'High',
        additional_notes = 'Updated by CRUD validation script.'
    WHERE id = v_advisor_id;

    SELECT COUNT(*) INTO v_count
    FROM advisors
    WHERE id = v_advisor_id
      AND job_title = 'Updated Test Engineer'
      AND reliability_level = 'High'
      AND additional_notes = 'Updated by CRUD validation script.';

    IF v_count <> 1 THEN
        RAISE EXCEPTION 'Advisor UPDATE failed';
    END IF;

    RAISE NOTICE 'Advisor UPDATE passed';

    -- -------------------------------------------------------------------------
    -- Applicant CREATE
    -- -------------------------------------------------------------------------
    INSERT INTO applicants (
        first_name,
        last_name,
        email,
        gender,
        major,
        academic_standing,
        industry,
        desired_future_career,
        service_id,
        additional_notes,
        location_city,
        location_state,
        resume_url,
        source,
        status
    ) VALUES (
        'Test',
        'Applicant',
        'test.applicant.crud@example.com',
        'Other',
        'Information Systems',
        'Junior',
        'Information Technology',
        'Software Engineer',
        v_service_id,
        'Temporary applicant record for CRUD validation.',
        'Applicant City',
        'AC',
        NULL,
        'CRUD Test',
        'Pending Review'
    )
    RETURNING id INTO v_applicant_id;

    IF v_applicant_id IS NULL THEN
        RAISE EXCEPTION 'Applicant CREATE failed';
    END IF;

    RAISE NOTICE 'Applicant CREATE passed';

    -- -------------------------------------------------------------------------
    -- Applicant READ all and READ by ID
    -- -------------------------------------------------------------------------
    SELECT COUNT(*) INTO v_count FROM applicants;

    IF v_count < 1 THEN
        RAISE EXCEPTION 'Applicant READ all failed';
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM applicants
    WHERE id = v_applicant_id
      AND email = 'test.applicant.crud@example.com';

    IF v_count <> 1 THEN
        RAISE EXCEPTION 'Applicant READ by ID failed';
    END IF;

    RAISE NOTICE 'Applicant READ passed';

    -- -------------------------------------------------------------------------
    -- Applicant UPDATE
    -- -------------------------------------------------------------------------
    UPDATE applicants
    SET
        status = 'Recommendations Generated',
        desired_future_career = 'Backend Software Engineer',
        location_city = 'Updated City',
        location_state = 'UC'
    WHERE id = v_applicant_id;

    SELECT COUNT(*) INTO v_count
    FROM applicants
    WHERE id = v_applicant_id
      AND status = 'Recommendations Generated'
      AND desired_future_career = 'Backend Software Engineer'
      AND location_city = 'Updated City'
      AND location_state = 'UC';

    IF v_count <> 1 THEN
        RAISE EXCEPTION 'Applicant UPDATE failed';
    END IF;

    RAISE NOTICE 'Applicant UPDATE passed';

    -- -------------------------------------------------------------------------
    -- Foreign key relationship validation
    -- -------------------------------------------------------------------------
    BEGIN
        INSERT INTO applicants (
            first_name,
            last_name,
            academic_standing,
            industry,
            desired_future_career,
            service_id
        ) VALUES (
            'Bad',
            'ForeignKey',
            'Junior',
            'Information Technology',
            'Software Engineer',
            uuid_generate_v4()
        );

        RAISE EXCEPTION 'Foreign key validation failed: invalid service_id was accepted';
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE NOTICE 'Foreign key validation passed';
    END;

    -- -------------------------------------------------------------------------
    -- Required field validation
    -- -------------------------------------------------------------------------
    BEGIN
        INSERT INTO advisors (
            last_name,
            industry,
            experience_level,
            reliability_level
        ) VALUES (
            'MissingFirstName',
            'Finance',
            'Young Professional (0-3 Years)',
            'Medium'
        );

        RAISE EXCEPTION 'Required field validation failed: missing first_name was accepted';
    EXCEPTION
        WHEN not_null_violation THEN
            RAISE NOTICE 'Required field validation passed';
    END;

    -- -------------------------------------------------------------------------
    -- CHECK constraint validation: advisor industry
    -- -------------------------------------------------------------------------
    BEGIN
        INSERT INTO advisors (
            first_name,
            last_name,
            industry,
            experience_level,
            reliability_level
        ) VALUES (
            'Bad',
            'Industry',
            'Invalid Industry',
            'Young Professional (0-3 Years)',
            'Medium'
        );

        RAISE EXCEPTION 'CHECK validation failed: invalid industry was accepted';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'Advisor industry CHECK validation passed';
    END;

    -- -------------------------------------------------------------------------
    -- CHECK constraint validation: unique career experiences
    -- -------------------------------------------------------------------------
    BEGIN
        INSERT INTO advisors (
            first_name,
            last_name,
            industry,
            experience_level,
            reliability_level,
            unique_career_experiences,
            mentorship_experience
        ) VALUES (
            'Bad',
            'CareerExperience',
            'Finance',
            'Young Professional (0-3 Years)',
            'Medium',
            'Invalid Option',
            '1–3 years'
        );

        RAISE EXCEPTION 'CHECK validation failed: invalid unique_career_experiences was accepted';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'Unique career experiences CHECK validation passed';
    END;

    -- -------------------------------------------------------------------------
    -- CHECK constraint validation: mentorship experience
    -- -------------------------------------------------------------------------
    BEGIN
        INSERT INTO advisors (
            first_name,
            last_name,
            industry,
            experience_level,
            reliability_level,
            unique_career_experiences,
            mentorship_experience
        ) VALUES (
            'Bad',
            'MentorshipExperience',
            'Finance',
            'Young Professional (0-3 Years)',
            'Medium',
            'Career Change',
            'Invalid Mentorship'
        );

        RAISE EXCEPTION 'CHECK validation failed: invalid mentorship_experience was accepted';
    EXCEPTION
        WHEN check_violation THEN
            RAISE NOTICE 'Mentorship experience CHECK validation passed';
    END;

    -- -------------------------------------------------------------------------
    -- DELETE applicant and advisor test records
    -- -------------------------------------------------------------------------
    DELETE FROM applicants WHERE id = v_applicant_id;

    SELECT COUNT(*) INTO v_count
    FROM applicants
    WHERE id = v_applicant_id;

    IF v_count <> 0 THEN
        RAISE EXCEPTION 'Applicant DELETE failed';
    END IF;

    RAISE NOTICE 'Applicant DELETE passed';

    DELETE FROM advisors WHERE id = v_advisor_id;

    SELECT COUNT(*) INTO v_count
    FROM advisors
    WHERE id = v_advisor_id;

    IF v_count <> 0 THEN
        RAISE EXCEPTION 'Advisor DELETE failed';
    END IF;

    RAISE NOTICE 'Advisor DELETE passed';

    -- -------------------------------------------------------------------------
    -- Final cleanup verification
    -- -------------------------------------------------------------------------
    SELECT COUNT(*) INTO v_count
    FROM advisors
    WHERE advisor_code = 'TEST-ADV-CRUD'
       OR email = 'test.advisor.crud@example.com';

    IF v_count <> 0 THEN
        RAISE EXCEPTION 'Advisor cleanup validation failed';
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM applicants
    WHERE email = 'test.applicant.crud@example.com';

    IF v_count <> 0 THEN
        RAISE EXCEPTION 'Applicant cleanup validation failed';
    END IF;

    RAISE NOTICE 'Cleanup validation passed';
    RAISE NOTICE 'All CRUD validation tests passed successfully.';
END $$;
