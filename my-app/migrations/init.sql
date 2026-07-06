-- =============================================================================
-- Database Schema â€” Advisor Matching Platform
-- Run in: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Lookup Tables
-- industry is NOT a table here â€” it's a fixed small set, enforced with a
-- CHECK constraint directly on advisors/applicants instead of a join.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS service_types (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT UNIQUE NOT NULL  -- 'Resume Review', 'Mentorship Program', 'General Career Advice'
);

CREATE TABLE IF NOT EXISTS expertise_areas (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT UNIQUE NOT NULL  -- 'CAD Design', 'Sustainability', 'Urban Planning', etc.
);

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    role        TEXT NOT NULL CHECK (role IN ('advisor', 'applicant')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Advisors
-- industry is a plain TEXT column with a CHECK constraint (constants),
-- not a foreign key to a lookup table.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS advisors (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                     UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    advisor_code                TEXT UNIQUE,                 -- e.g. ADV-101-0001
    first_name                  TEXT NOT NULL,
    last_name                   TEXT NOT NULL,
    email                       TEXT,
    gender                      TEXT,
    alma_mater                  TEXT,
    major                       TEXT,
    company                     TEXT,
    job_title                   TEXT,
    industry                    TEXT CHECK (industry IN ('Business', 'Education', 'Engineering', 'Finance', 'Healthcare', 'Information Technology', 'Law', 'Social Services', 'Other')),
    experience_level            TEXT CHECK (experience_level IN ('Graduate/Working Student', 'Young Professional (0-3 Years)', 'Mid-Career Professional (3-10 Years)', 'Senior Professional (10+ Years)')),
    reliability_level           TEXT CHECK (reliability_level IN ('High', 'Medium', 'Low')),
    career_history_summary      TEXT,
    unique_career_experiences   TEXT CHECK (unique_career_experiences IN (
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
    )),
    mentorship_experience       TEXT CHECK (mentorship_experience IN (
        'None',
        'Less than 1 year',
        '1–3 years',
        '3–5 years',
        '5+ years'
    )),
    max_meetings_per_month      INTEGER NOT NULL DEFAULT 3,
    additional_notes            TEXT,
    location_city               TEXT,
    location_state              TEXT,
    availability_status         TEXT NOT NULL DEFAULT 'Available' CHECK (availability_status IN ('Available', 'Unavailable')),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction: advisors <-> expertise_areas (many-to-many, advisor can have several skills)
CREATE TABLE IF NOT EXISTS advisor_expertise (
    advisor_id      UUID REFERENCES advisors(id) ON DELETE CASCADE,
    expertise_id    UUID REFERENCES expertise_areas(id) ON DELETE CASCADE,
    PRIMARY KEY (advisor_id, expertise_id)
);

-- Junction: advisors <-> service_types (many-to-many â€” advisor CAN offer several services)
CREATE TABLE IF NOT EXISTS advisor_services (
    advisor_id      UUID REFERENCES advisors(id) ON DELETE CASCADE,
    service_id      UUID REFERENCES service_types(id) ON DELETE CASCADE,
    PRIMARY KEY (advisor_id, service_id)
);

-- ---------------------------------------------------------------------------
-- Applicants
-- industry is a plain TEXT column with a CHECK constraint (constants).
-- service is a direct foreign key â€” applicant only requests ONE service,
-- so no junction table needed here.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS applicants (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name              TEXT NOT NULL,
    last_name               TEXT NOT NULL,
    email                   TEXT,
    gender                  TEXT,
    major                   TEXT,
    academic_standing       TEXT CHECK (academic_standing IN ('Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate')),
    industry                TEXT CHECK (industry IN ('Business', 'Education', 'Engineering', 'Finance', 'Healthcare', 'Information Technology', 'Law', 'Social Services', 'Other')),
    desired_future_career   TEXT,
    service_id              UUID REFERENCES service_types(id),  -- one service per applicant, direct FK
    additional_notes        TEXT,
    resume_url              TEXT,
    source                  TEXT,  -- how they heard about the program
    submission_date         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status                  TEXT NOT NULL DEFAULT 'Pending Review'
                                 CHECK (status IN ('Pending Review', 'Recommendations Generated', 'Matched', 'Closed')),
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Recommendations
-- All generated recommendations are preserved, even if rejected.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS recommendations (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    applicant_id            UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    advisor_id              UUID NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
    match_score             NUMERIC,                -- calculated recommendation score
    rank_position           INTEGER,                -- 1 through 5, ranking among an applicant's recommendations
    recommendation_status   TEXT NOT NULL DEFAULT 'Pending'
                                 CHECK (recommendation_status IN ('Pending', 'Accepted', 'Rejected')),
    matching_explanation    TEXT,                   -- why this recommendation was generated
    generated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Matches
-- Only accepted recommendations become matches.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS matches (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    applicant_id        UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    advisor_id          UUID NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
    recommendation_id   UUID REFERENCES recommendations(id) ON DELETE SET NULL,  -- recommendation that produced this match
    match_status         TEXT NOT NULL DEFAULT 'Active'
                              CHECK (match_status IN ('Active', 'Completed', 'Cancelled')),
    matched_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes                TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_advisors_industry           ON advisors(industry);
CREATE INDEX IF NOT EXISTS idx_advisors_availability        ON advisors(availability_status);
CREATE INDEX IF NOT EXISTS idx_advisors_reliability         ON advisors(reliability_level);

CREATE INDEX IF NOT EXISTS idx_applicants_industry          ON applicants(industry);
CREATE INDEX IF NOT EXISTS idx_applicants_service           ON applicants(service_id);
CREATE INDEX IF NOT EXISTS idx_applicants_status            ON applicants(status);

CREATE INDEX IF NOT EXISTS idx_recommendations_applicant    ON recommendations(applicant_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_advisor      ON recommendations(advisor_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status       ON recommendations(recommendation_status);

CREATE INDEX IF NOT EXISTS idx_matches_applicant            ON matches(applicant_id);
CREATE INDEX IF NOT EXISTS idx_matches_advisor              ON matches(advisor_id);
CREATE INDEX IF NOT EXISTS idx_matches_status                ON matches(match_status);

-- ---------------------------------------------------------------------------
-- Auto-update updated_at via trigger
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY['advisors', 'applicants']) LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_updated_at_' || t
        ) THEN
            EXECUTE format(
                'CREATE TRIGGER trg_set_updated_at_%I
                 BEFORE UPDATE ON %I
                 FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
                t, t
            );
        END IF;
    END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- Seed lookup data
-- ---------------------------------------------------------------------------

INSERT INTO service_types (name) VALUES
    ('Resume Review'),
    ('Mentorship Program'),
    ('General Career Advice')
ON CONFLICT (name) DO NOTHING;

INSERT INTO expertise_areas (name) VALUES
    ('CAD Design'),
    ('Sustainability'),
    ('Urban Planning'),
    ('Structural Engineering'),
    ('Historic Preservation'),
    ('Landscape Architecture'),
    ('Project Management'),
    ('Interior Architecture')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
