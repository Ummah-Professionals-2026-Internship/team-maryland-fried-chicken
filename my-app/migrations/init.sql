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
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS service_types (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT UNIQUE NOT NULL,  -- 'Resume Review', 'Mentorship Program', 'General Career Advice'
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expertise_areas (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT UNIQUE NOT NULL,  -- 'CAD Design', 'Sustainability', 'Urban Planning', etc.
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    role        TEXT NOT NULL CHECK (role IN ('advisor', 'applicant')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Advisors
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS advisors (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                     UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    advisor_code                TEXT UNIQUE,                  -- e.g. ADV-101-0001
    first_name                  TEXT NOT NULL,
    last_name                   TEXT NOT NULL,
    email                       TEXT,
    phone_number                TEXT,                         -- Added phone number field
    linkedin_url                TEXT,
    gender                      TEXT,
    alma_mater                  TEXT,
    major                       TEXT,
    company                     TEXT,
    job_title                   TEXT,
    industry                    TEXT CHECK (industry IN ('Business', 'Education', 'Engineering', 'Finance', 'Healthcare', 'Information Technology', 'Law', 'Social Services', 'Other')),
    experience_level            TEXT CHECK (experience_level IN ('Graduate/Working Student', 'Young Professional (0-3 Years)', 'Mid-Career Professional (3-10 Years)', 'Senior Professional (10+ Years)')),
    reliability_level           TEXT CHECK (reliability_level IN ('High', 'Medium', 'Low')),
    career_history_summary      TEXT,
    unique_career_experiences   TEXT CHECK (unique_career_experiences IN ('Career Change', 'Graduate School', 'Entrepreneurship', 'International Career', 'Startup Experience', 'Leadership Experience', 'Career Break', 'First-Generation College Student', 'Military Experience', 'Remote Work', 'Immigration Journey')),
    mentorship_experience       TEXT CHECK (mentorship_experience IN ('None', 'Less than 1 year', '1â€“3 years', '3â€“5 years', '5+ years')),
    max_meetings_per_month      INTEGER NOT NULL DEFAULT 3,
    currentAssignments        INTEGER NOT NULL DEFAULT 0,
    additional_notes            TEXT,
    location_county               TEXT,
    location_state               TEXT,
    availability_status         TEXT NOT NULL DEFAULT 'Available' CHECK (availability_status IN ('Available', 'Unavailable')),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction: advisors <-> expertise_areas
CREATE TABLE IF NOT EXISTS advisor_expertise (
    advisor_id   UUID REFERENCES advisors(id) ON DELETE CASCADE,
    expertise_id UUID REFERENCES expertise_areas(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (advisor_id, expertise_id)
);

-- Junction: advisors <-> service_types
CREATE TABLE IF NOT EXISTS advisor_services (
    advisor_id   UUID REFERENCES advisors(id) ON DELETE CASCADE,
    service_id   UUID REFERENCES service_types(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (advisor_id, service_id)
);

-- ---------------------------------------------------------------------------
-- Applicants
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS applicants (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name              TEXT NOT NULL,
    last_name               TEXT NOT NULL,
    email                   TEXT,
    phone_number            TEXT,                         -- Added phone number field
    university              TEXT,                         -- Added university field
    major                   TEXT,
    academic_standing       TEXT CHECK (academic_standing IN ('Freshman', 'Sophomore', 'Junior', 'Senior', 'Masters', 'Graduated')), -- Updated enum options
    industry                TEXT CHECK (industry IN ('Business', 'Education', 'Engineering', 'Finance', 'Healthcare', 'Information Technology', 'Law', 'Social Services', 'Other')),
    desired_future_career   TEXT,
    service_id              UUID REFERENCES service_types(id),
    additional_notes        TEXT,
    resume_url              TEXT,
    source                  TEXT,
    location_county           TEXT,                         -- Added location fields
    location_state          TEXT,                         -- Added location fields
    submission_date         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status                  TEXT NOT NULL DEFAULT 'Pending Review'
                                 CHECK (status IN ('Pending Review', 'Recommendations Generated', 'Matched', 'Closed')),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Recommendations
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS recommendations (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    applicant_id            UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    advisor_id              UUID NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
    match_score             NUMERIC,
    rank_position           INTEGER,
    recommendation_status   TEXT NOT NULL DEFAULT 'Pending'
                                 CHECK (recommendation_status IN ('Pending', 'Accepted', 'Rejected')),
    matching_explanation    TEXT,
    total_score             NUMERIC,
    career_score            NUMERIC,
    industry_score          NUMERIC,
    experience_score        NUMERIC,
    gender_bonus            NUMERIC,
    capacity_adjustment     NUMERIC,
    career_similarity       TEXT,
    generated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- acts as created_at
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Matches
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS matches (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    applicant_id        UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    advisor_id          UUID NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
    recommendation_id   UUID REFERENCES recommendations(id) ON DELETE SET NULL,
    match_status        TEXT NOT NULL DEFAULT 'Active'
                             CHECK (match_status IN ('Active', 'Completed', 'Cancelled')),
    matched_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- acts as created_at
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_matches_status               ON matches(match_status);

-- ---------------------------------------------------------------------------
-- Auto-update updated_at via trigger (Applies to all tables)
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
    FOR t IN SELECT unnest(ARRAY[
        'service_types', 
        'expertise_areas', 
        'users', 
        'advisors', 
        'advisor_expertise', 
        'advisor_services', 
        'applicants', 
        'recommendations', 
        'matches'
    ]) LOOP
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
-- Schema patches for existing Supabase databases
-- ---------------------------------------------------------------------------

ALTER TABLE advisors
ADD COLUMN IF NOT EXISTS phone_number TEXT;

ALTER TABLE advisors
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

ALTER TABLE advisors
ADD COLUMN IF NOT EXISTS "currentAssignments" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE recommendations
ADD COLUMN IF NOT EXISTS total_score NUMERIC,
ADD COLUMN IF NOT EXISTS career_score NUMERIC,
ADD COLUMN IF NOT EXISTS industry_score NUMERIC,
ADD COLUMN IF NOT EXISTS experience_score NUMERIC,
ADD COLUMN IF NOT EXISTS gender_bonus NUMERIC,
ADD COLUMN IF NOT EXISTS capacity_adjustment NUMERIC,
ADD COLUMN IF NOT EXISTS career_similarity TEXT;

ALTER TABLE applicants
ADD COLUMN IF NOT EXISTS phone_number TEXT;

ALTER TABLE applicants
ADD COLUMN IF NOT EXISTS university TEXT;

ALTER TABLE applicants
ADD COLUMN IF NOT EXISTS gender TEXT;

ALTER TABLE applicants
ADD COLUMN IF NOT EXISTS resume_url TEXT;

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;