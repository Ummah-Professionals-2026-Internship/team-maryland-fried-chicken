-- =============================================================================
-- Issue #141 - Expand mock dataset to at least 50 advisors and 50 applicants
-- Idempotent: safe to run more than once.
-- =============================================================================

ALTER TABLE public.advisors
ADD COLUMN IF NOT EXISTS location_city TEXT;

ALTER TABLE public.applicants
ADD COLUMN IF NOT EXISTS location_city TEXT;

INSERT INTO service_types (name) VALUES
    ('Resume Review'),
    ('Mentorship Program'),
    ('General Career Advice'),
    ('Mock Interview'),
    ('Career Guidance')
ON CONFLICT (name) DO NOTHING;

INSERT INTO expertise_areas (name) VALUES
    ('Software Engineering'),
    ('Product Management'),
    ('Financial Analysis'),
    ('Healthcare Administration'),
    ('Corporate Law'),
    ('Marketing Strategy'),
    ('Engineering Leadership'),
    ('Education Counseling'),
    ('Nonprofit Management'),
    ('Data Analytics'),
    ('Cybersecurity'),
    ('Operations Management'),
    ('Public Policy')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Add 38 advisors.
-- The base seed contains 12, giving a clean seed exactly 50 advisors.
-- ---------------------------------------------------------------------------

WITH advisor_source AS (
    SELECT
        gs,
        (ARRAY[
            'Omar','Maryam','Yusuf','Layla','Ibrahim',
            'Huda','Kareem','Nadia','Tariq','Salma',
            'Adam','Rania','Zain','Mariam','Idris',
            'Noor','Sami','Yasmin','Rayyan','Amira'
        ])[((gs - 13) % 20) + 1] AS first_name,

        (ARRAY[
            'Haddad','Ali','Rahman','Khan','Noor',
            'Saleh','Aziz','Malik','Hussein','Farooq',
            'Mansour','Iqbal','Abdullah','Saeed','Bashir',
            'Hamdan','Khalil','Chowdhury','Mahmoud'
        ])[((gs - 13) % 19) + 1] AS last_name,

        (ARRAY[
            'Brother','Sister'
        ])[((gs - 13) % 2) + 1] AS gender,

        (ARRAY[
            'Rutgers University',
            'New York University',
            'University of Michigan',
            'Georgia Institute of Technology',
            'University of Maryland',
            'Columbia University',
            'University of Pennsylvania',
            'Howard University',
            'University of Washington',
            'Boston University'
        ])[((gs - 13) % 10) + 1] AS alma_mater,

        (ARRAY[
            'Computer Science',
            'Business Administration',
            'Finance',
            'Public Health',
            'Law',
            'Marketing',
            'Mechanical Engineering',
            'Education',
            'Data Science',
            'Public Policy'
        ])[((gs - 13) % 10) + 1] AS major,

        (ARRAY[
            'Microsoft',
            'Google',
            'JPMorgan Chase',
            'Mount Sinai Health System',
            'Deloitte',
            'Amazon',
            'IBM',
            'Accenture',
            'Civic Bridge',
            'Islamic Relief USA'
        ])[((gs - 13) % 10) + 1] AS company,

        (ARRAY[
            'Software Engineer',
            'Product Manager',
            'Financial Analyst',
            'Healthcare Program Manager',
            'Corporate Attorney',
            'Marketing Manager',
            'Engineering Manager',
            'Education Program Manager',
            'Data Analyst',
            'Policy Advisor'
        ])[((gs - 13) % 10) + 1] AS job_title,

        (ARRAY[
            'Information Technology',
            'Business',
            'Finance',
            'Healthcare',
            'Law',
            'Engineering',
            'Education',
            'Social Services',
            'Other'
        ])[((gs - 13) % 9) + 1] AS industry,

        (ARRAY[
            'Young Professional (0-3 Years)',
            'Mid-Career Professional (3-10 Years)',
            'Senior Professional (10+ Years)'
        ])[((gs - 13) % 3) + 1] AS experience_level,

        (ARRAY[
            'High','Medium'
        ])[((gs - 13) % 2) + 1] AS reliability_level,

        (ARRAY[
            'Leadership Experience',
            'Career Change',
            'First-Generation College Student',
            'International Career',
            'Startup Experience',
            'Remote Work',
            'Graduate School',
            'Immigration Journey'
        ])[((gs - 13) % 8) + 1] AS unique_experience,

        (ARRAY[
            'Less than 1 year',
            '1-3 years',
            '3-5 years',
            '5+ years'
        ])[((gs - 13) % 4) + 1] AS mentorship_experience,

        (ARRAY[
            'New York','Jersey City','Boston','Chicago','Seattle',
            'Austin','Atlanta','Philadelphia','Baltimore','Washington'
        ])[((gs - 13) % 10) + 1] AS city,

        (ARRAY[
            'NY','NJ','MA','IL','WA',
            'TX','GA','PA','MD','DC'
        ])[((gs - 13) % 10) + 1] AS state,

        (ARRAY[
            '201','212','617','312','206',
            '512','404','215','410','202'
        ])[((gs - 13) % 10) + 1] AS area_code

    FROM generate_series(13, 50) AS gs
)

INSERT INTO advisors (
    advisor_code,
    first_name,
    last_name,
    email,
    phone_number,
    linkedin_url,
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
)
SELECT
    'ADV-EXP-' || LPAD(gs::text, 4, '0'),
    first_name,
    last_name,
    LOWER(first_name || '.' || last_name || '.' || gs || '@example.com'),
    '+1 (' || area_code || ') ' ||
        LPAD((200 + gs)::text, 3, '0') || '-' ||
        LPAD((1000 + gs)::text, 4, '0'),
    LOWER(
        'https://www.linkedin.com/in/' ||
        first_name || '-' || last_name || '-' || gs || '-mock'
    ),
    gender,
    alma_mater,
    major,
    company,
    job_title,
    industry,
    experience_level,
    reliability_level,
    'Experienced professional in ' || industry ||
        ' with experience mentoring students and early-career professionals.',
    unique_experience,
    mentorship_experience,
    ((gs - 13) % 4) + 2,
    'Mock advisor created for recommendation engine testing and dataset coverage.',
    city,
    state,
    'Available'
FROM advisor_source
ON CONFLICT DO NOTHING;


-- Give each expanded advisor a service.
INSERT INTO advisor_services (advisor_id, service_id)
SELECT
    a.id,
    s.id
FROM advisors a
JOIN service_types s
    ON s.name = (
        ARRAY[
            'Resume Review',
            'Mentorship Program',
            'General Career Advice',
            'Mock Interview',
            'Career Guidance'
        ]
    )[
        ((SUBSTRING(a.advisor_code FROM '([0-9]+)$')::integer - 13) % 5) + 1
    ]
WHERE a.advisor_code LIKE 'ADV-EXP-%'
ON CONFLICT DO NOTHING;


-- Give each expanded advisor an expertise area.
INSERT INTO advisor_expertise (advisor_id, expertise_id)
SELECT
    a.id,
    e.id
FROM advisors a
JOIN expertise_areas e
    ON e.name = (
        ARRAY[
            'Software Engineering',
            'Product Management',
            'Financial Analysis',
            'Healthcare Administration',
            'Corporate Law',
            'Marketing Strategy',
            'Engineering Leadership',
            'Education Counseling',
            'Nonprofit Management',
            'Data Analytics',
            'Cybersecurity',
            'Operations Management',
            'Public Policy'
        ]
    )[
        ((SUBSTRING(a.advisor_code FROM '([0-9]+)$')::integer - 13) % 13) + 1
    ]
WHERE a.advisor_code LIKE 'ADV-EXP-%'
ON CONFLICT DO NOTHING;


-- ---------------------------------------------------------------------------
-- Add 38 applicants.
-- The base seed contains 12, giving a clean seed exactly 50 applicants.
-- ---------------------------------------------------------------------------

WITH applicant_source AS (
    SELECT
        gs,

        (ARRAY[
            'Hamza','Amina','Bilal','Sara','Taha',
            'Mariam','Kareem','Layla','Yusuf','Hana',
            'Zain','Maryam','Ilyas','Noor','Ahmed',
            'Fatima','Omar','Samira','Ayaan','Hafsa'
        ])[((gs - 13) % 20) + 1] AS first_name,

        (ARRAY[
            'Ahmed','Patel','Rahman','Williams','Osman',
            'Castillo','Ramirez','Saleh','Ibrahim','Malik',
            'Diallo','Farah','Qureshi','Haddad','Siddiqui',
            'Ali','Khan','Farooq','Bennett'
        ])[((gs - 13) % 19) + 1] AS last_name,

        (ARRAY[
            'Brother','Sister'
        ])[((gs - 13) % 2) + 1] AS gender,

        (ARRAY[
            'Rutgers University',
            'New Jersey Institute of Technology',
            'New York University',
            'University of Maryland',
            'Penn State University',
            'Temple University',
            'Howard University',
            'University of Michigan',
            'Georgia State University',
            'Boston University'
        ])[((gs - 13) % 10) + 1] AS university,

        (ARRAY[
            'Computer Science',
            'Information Technology',
            'Finance',
            'Public Health',
            'Political Science',
            'Marketing',
            'Mechanical Engineering',
            'Education',
            'Data Science',
            'Business Administration'
        ])[((gs - 13) % 10) + 1] AS major,

        (ARRAY[
            'Freshman',
            'Sophomore',
            'Junior',
            'Senior',
            'Masters'
        ])[((gs - 13) % 5) + 1] AS academic_standing,

        (ARRAY[
            'Information Technology',
            'Business',
            'Finance',
            'Healthcare',
            'Law',
            'Engineering',
            'Education',
            'Social Services',
            'Other'
        ])[((gs - 13) % 9) + 1] AS industry,

        (ARRAY[
            'Software Engineer',
            'Product Manager',
            'Financial Analyst',
            'Healthcare Administrator',
            'Attorney',
            'Marketing Manager',
            'Mechanical Engineer',
            'Education Program Manager',
            'Data Analyst',
            'Policy Analyst'
        ])[((gs - 13) % 10) + 1] AS desired_career,

        (ARRAY[
            'New Brunswick','Newark','New York','Baltimore','Philadelphia',
            'Washington','Detroit','Atlanta','Boston','Jersey City'
        ])[((gs - 13) % 10) + 1] AS city,

        (ARRAY[
            'NJ','NJ','NY','MD','PA',
            'DC','MI','GA','MA','NJ'
        ])[((gs - 13) % 10) + 1] AS state,

        (ARRAY[
            '732','973','212','410','215',
            '202','313','404','617','201'
        ])[((gs - 13) % 10) + 1] AS area_code,

        (ARRAY[
            'Resume Review',
            'Mentorship Program',
            'General Career Advice',
            'Mock Interview',
            'Career Guidance'
        ])[((gs - 13) % 5) + 1] AS service_name

    FROM generate_series(13, 50) AS gs
)

INSERT INTO applicants (
    user_id,
    first_name,
    last_name,
    email,
    phone_number,
    gender,
    university,
    major,
    academic_standing,
    industry,
    desired_future_career,
    service_id,
    additional_notes,
    resume_url,
    source,
    location_city,
    location_state,
    status
)
SELECT
    NULL,
    first_name,
    last_name,
    LOWER('mock.applicant.' || LPAD(gs::text, 4, '0') || '@example.com'),
    '+1 (' || area_code || ') ' ||
        LPAD((300 + gs)::text, 3, '0') || '-' ||
        LPAD((2000 + gs)::text, 4, '0'),
    gender,
    university,
    major,
    academic_standing,
    industry,
    desired_career,
    (
        SELECT id
        FROM service_types
        WHERE name = service_name
        LIMIT 1
    ),
    'Mock applicant created for recommendation engine testing and dataset coverage.',
    'https://example.com/resumes/mock-applicant-' || LPAD(gs::text, 4, '0') || '.pdf',
    'Mock Dataset Expansion',
    city,
    state,
    'Pending Review'
FROM applicant_source src
WHERE NOT EXISTS (
    SELECT 1
    FROM public.applicants existing
    WHERE LOWER(existing.email) =
          LOWER('mock.applicant.' || LPAD(src.gs::text, 4, '0') || '@example.com')
);


-- Verification
SELECT
    (SELECT COUNT(*) FROM advisors) AS advisor_count,
    (SELECT COUNT(*) FROM applicants) AS applicant_count;

