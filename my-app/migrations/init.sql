-- =============================================================================
-- Database Schema — Advisor Matching Platform
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
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
    name        TEXT UNIQUE NOT NULL  -- 'Resume Review', 'Mentorship Program', 'General Career Advice'
);

CREATE TABLE IF NOT EXISTS industries (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT UNIQUE NOT NULL  -- 'Architecture', 'Tech', 'Finance', etc.
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
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS advisors (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    advisor_code        TEXT UNIQUE,              -- e.g. ADV-101-0001
    name                TEXT NOT NULL,
    phone               TEXT,
    linkedin_url        TEXT,
    company             TEXT,
    job_title           TEXT,
    experience_level    TEXT CHECK (experience_level IN ('Entry', 'Mid', 'Senior')),
    industry_id         UUID REFERENCES industries(id),
    reliability_level   INTEGER CHECK (reliability_level IN (1, 2, 3)),  -- 1 = most reliable
    max_meetings        INTEGER NOT NULL DEFAULT 3,
    current_meetings    INTEGER NOT NULL DEFAULT 0,
    location_city       TEXT,
    location_state      TEXT,
    status              TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Unavailable')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction: advisors ↔ expertise_areas (many-to-many)
CREATE TABLE IF NOT EXISTS advisor_expertise (
    advisor_id      UUID REFERENCES advisors(id) ON DELETE CASCADE,
    expertise_id    UUID REFERENCES expertise_areas(id) ON DELETE CASCADE,
    PRIMARY KEY (advisor_id, expertise_id)
);

-- Junction: advisors ↔ service_types (many-to-many)
CREATE TABLE IF NOT EXISTS advisor_services (
    advisor_id      UUID REFERENCES advisors(id) ON DELETE CASCADE,
    service_id      UUID REFERENCES service_types(id) ON DELETE CASCADE,
    PRIMARY KEY (advisor_id, service_id)
);

-- ---------------------------------------------------------------------------
-- Applicants
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS applicants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    phone           TEXT,
    industry_id     UUID REFERENCES industries(id),   -- what industry they're in
    service_id      UUID REFERENCES service_types(id), -- what they need
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Sessions (needed to track advisor meeting load)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisor_id      UUID REFERENCES advisors(id) ON DELETE SET NULL,
    applicant_id    UUID REFERENCES applicants(id) ON DELETE SET NULL,
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_advisors_industry     ON advisors(industry_id);
CREATE INDEX IF NOT EXISTS idx_advisors_status       ON advisors(status);
CREATE INDEX IF NOT EXISTS idx_advisors_reliability  ON advisors(reliability_level);
CREATE INDEX IF NOT EXISTS idx_sessions_advisor      ON sessions(advisor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_applicant    ON sessions(applicant_id);

-- ---------------------------------------------------------------------------
-- Seed lookup data
-- ---------------------------------------------------------------------------

INSERT INTO service_types (name) VALUES
    ('Resume Review'),
    ('Mentorship Program'),
    ('General Career Advice')
ON CONFLICT (name) DO NOTHING;

INSERT INTO industries (name) VALUES
    ('Architecture'),
    ('Technology'),
    ('Finance'),
    ('Healthcare'),
    ('Engineering')
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
