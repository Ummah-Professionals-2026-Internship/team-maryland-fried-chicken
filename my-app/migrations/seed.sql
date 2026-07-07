-- =============================================================================
-- Seed Data — Advisor Matching Platform
-- Issue #68: Database Seeding & Mock Data Migration
-- Run after migrations/init.sql in Supabase SQL Editor.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Lookup Data
-- ---------------------------------------------------------------------------

INSERT INTO service_types (name) VALUES
    ('Resume Review'),
    ('Mentorship Program'),
    ('General Career Advice'),
    ('Mock Interview'),
    ('Career Guidance')
ON CONFLICT (name) DO NOTHING;

INSERT INTO expertise_areas (name) VALUES
    ('Full-Stack Development'),
    ('Product Management'),
    ('Financial Analysis'),
    ('Healthcare Administration'),
    ('Corporate Law'),
    ('Marketing Strategy'),
    ('Engineering Leadership'),
    ('Education Counseling'),
    ('Nonprofit Management'),
    ('UX Design'),
    ('Data Analytics'),
    ('Cybersecurity'),
    ('Resume Strategy'),
    ('Interview Coaching'),
    ('Career Transition'),
    ('Startup Operations'),
    ('Graduate School Planning'),
    ('Remote Work Strategy')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Advisors
-- ---------------------------------------------------------------------------

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
) VALUES
    (
        'ADV-101-0001',
        'David',
        'Johnson',
        'david.johnson@example.com',
        'Male',
        'University of Washington',
        'Computer Science',
        'Microsoft',
        'Senior Software Engineer',
        'Information Technology',
        'Senior Professional (10+ Years)',
        'High',
        'Built a career across full-stack engineering, cloud platforms, and engineering mentorship.',
        'International Career',
        '5+ years',
        4,
        'Strong fit for software engineering, system design, and technical interview preparation.',
        'Seattle',
        'WA',
        'Available'
    ),
    (
        'ADV-101-0002',
        'Omar',
        'Siddiqui',
        'omar.siddiqui@example.com',
        'Male',
        'Rutgers University',
        'Computer Science',
        'Stripe',
        'Product Manager',
        'Information Technology',
        'Mid-Career Professional (3-10 Years)',
        'Medium',
        'Moved from software engineering into product management with a focus on fintech products.',
        'Career Change',
        '1–3 years',
        3,
        'Helpful for applicants interested in product management and fintech.',
        'New York',
        'NY',
        'Available'
    ),
    (
        'ADV-101-0003',
        'Fatima',
        'Ali',
        'fatima.ali@example.com',
        'Female',
        'University of Michigan',
        'Marketing',
        'Procter & Gamble',
        'Marketing Manager',
        'Business',
        'Mid-Career Professional (3-10 Years)',
        'Medium',
        'Experienced in brand strategy, campaign execution, and cross-functional product launches.',
        'Leadership Experience',
        '3–5 years',
        3,
        'Good fit for marketing, business, and resume storytelling.',
        'Cincinnati',
        'OH',
        'Available'
    ),
    (
        'ADV-101-0004',
        'Ahmed',
        'Khan',
        'ahmed.khan@example.com',
        'Male',
        'New York University',
        'Economics',
        'Goldman Sachs',
        'Financial Analyst',
        'Finance',
        'Young Professional (0-3 Years)',
        'Medium',
        'Works in finance with experience in analyst recruiting, networking, and interview preparation.',
        'First-Generation College Student',
        'Less than 1 year',
        2,
        'Useful for finance applicants seeking analyst-track roles.',
        'Jersey City',
        'NJ',
        'Available'
    ),
    (
        'ADV-101-0005',
        'Nadia',
        'Rahman',
        'nadia.rahman@example.com',
        'Female',
        'Columbia University',
        'Health Administration',
        'Mount Sinai Health System',
        'Healthcare Administrator',
        'Healthcare',
        'Senior Professional (10+ Years)',
        'High',
        'Led healthcare operations teams and supported students entering healthcare administration.',
        'Leadership Experience',
        '5+ years',
        5,
        'High-capacity healthcare mentor.',
        'New York',
        'NY',
        'Available'
    ),
    (
        'ADV-101-0006',
        'Layla',
        'Hassan',
        'layla.hassan@example.com',
        'Female',
        'Northwestern University',
        'Law',
        'Baker McKenzie',
        'Corporate Lawyer',
        'Law',
        'Senior Professional (10+ Years)',
        'High',
        'Built a legal career in corporate law, client advisory, and international business matters.',
        'International Career',
        '3–5 years',
        3,
        'Good fit for law school, legal internships, and professional communication.',
        'Chicago',
        'IL',
        'Available'
    ),
    (
        'ADV-101-0007',
        'Hassan',
        'Farooq',
        'hassan.farooq@example.com',
        'Male',
        'Georgia Tech',
        'Mechanical Engineering',
        'Tesla',
        'Manufacturing Engineer',
        'Engineering',
        'Mid-Career Professional (3-10 Years)',
        'Low',
        'Works in manufacturing engineering and supports students interested in hardware and operations.',
        'Startup Experience',
        'None',
        0,
        'At maximum meeting capacity for this month.',
        'Austin',
        'TX',
        'Unavailable'
    ),
    (
        'ADV-101-0008',
        'Maryam',
        'Yusuf',
        'maryam.yusuf@example.com',
        'Female',
        'Harvard Graduate School of Education',
        'Education',
        'KIPP Foundation',
        'Education Program Manager',
        'Education',
        'Mid-Career Professional (3-10 Years)',
        'High',
        'Supports students interested in teaching, education nonprofits, and graduate school.',
        'Graduate School',
        '3–5 years',
        4,
        'Strong for education and nonprofit applicants.',
        'Boston',
        'MA',
        'Available'
    ),
    (
        'ADV-101-0009',
        'Bilal',
        'Chaudhry',
        'bilal.chaudhry@example.com',
        'Male',
        'Carnegie Mellon University',
        'Information Systems',
        'Cloudflare',
        'Cybersecurity Analyst',
        'Information Technology',
        'Young Professional (0-3 Years)',
        'Medium',
        'Works in cybersecurity and helps applicants prepare for technical and behavioral interviews.',
        'Remote Work',
        'Less than 1 year',
        2,
        'Good for cybersecurity and IT applicants.',
        'Remote',
        'Remote',
        'Available'
    ),
    (
        'ADV-101-0010',
        'Aisha',
        'Diallo',
        'aisha.diallo@example.com',
        'Female',
        'Howard University',
        'Social Work',
        'Islamic Relief USA',
        'Program Coordinator',
        'Social Services',
        'Mid-Career Professional (3-10 Years)',
        'Medium',
        'Experienced in nonprofit programming, community work, and social services careers.',
        'Immigration Journey',
        '1–3 years',
        3,
        'Useful for applicants interested in nonprofit and social impact roles.',
        'Alexandria',
        'VA',
        'Available'
    )
ON CONFLICT (advisor_code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Advisor Services
-- ---------------------------------------------------------------------------

INSERT INTO advisor_services (advisor_id, service_id)
SELECT a.id, s.id
FROM advisors a
JOIN service_types s ON s.name IN ('Resume Review', 'Mock Interview', 'Mentorship Program')
WHERE a.advisor_code = 'ADV-101-0001'
ON CONFLICT DO NOTHING;

INSERT INTO advisor_services (advisor_id, service_id)
SELECT a.id, s.id
FROM advisors a
JOIN service_types s ON s.name IN ('Mock Interview', 'Mentorship Program', 'Career Guidance')
WHERE a.advisor_code = 'ADV-101-0002'
ON CONFLICT DO NOTHING;

INSERT INTO advisor_services (advisor_id, service_id)
SELECT a.id, s.id
FROM advisors a
JOIN service_types s ON s.name IN ('Resume Review', 'Mentorship Program', 'General Career Advice')
WHERE a.advisor_code = 'ADV-101-0003'
ON CONFLICT DO NOTHING;

INSERT INTO advisor_services (advisor_id, service_id)
SELECT a.id, s.id
FROM advisors a
JOIN service_types s ON s.name IN ('Resume Review', 'Mock Interview', 'Mentorship Program')
WHERE a.advisor_code = 'ADV-101-0004'
ON CONFLICT DO NOTHING;

INSERT INTO advisor_services (advisor_id, service_id)
SELECT a.id, s.id
FROM advisors a
JOIN service_types s ON s.name IN ('Mentorship Program', 'Resume Review', 'Career Guidance')
WHERE a.advisor_code = 'ADV-101-0005'
ON CONFLICT DO NOTHING;

INSERT INTO advisor_services (advisor_id, service_id)
SELECT a.id, s.id
FROM advisors a
JOIN service_types s ON s.name IN ('Resume Review', 'Mock Interview', 'Career Guidance')
WHERE a.advisor_code = 'ADV-101-0006'
ON CONFLICT DO NOTHING;

INSERT INTO advisor_services (advisor_id, service_id)
SELECT a.id, s.id
FROM advisors a
JOIN service_types s ON s.name IN ('General Career Advice', 'Mentorship Program')
WHERE a.advisor_code = 'ADV-101-0007'
ON CONFLICT DO NOTHING;

INSERT INTO advisor_services (advisor_id, service_id)
SELECT a.id, s.id
FROM advisors a
JOIN service_types s ON s.name IN ('Mentorship Program', 'General Career Advice', 'Career Guidance')
WHERE a.advisor_code = 'ADV-101-0008'
ON CONFLICT DO NOTHING;

INSERT INTO advisor_services (advisor_id, service_id)
SELECT a.id, s.id
FROM advisors a
JOIN service_types s ON s.name IN ('Mock Interview', 'Career Guidance')
WHERE a.advisor_code = 'ADV-101-0009'
ON CONFLICT DO NOTHING;

INSERT INTO advisor_services (advisor_id, service_id)
SELECT a.id, s.id
FROM advisors a
JOIN service_types s ON s.name IN ('Mentorship Program', 'General Career Advice')
WHERE a.advisor_code = 'ADV-101-0010'
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Advisor Expertise
-- ---------------------------------------------------------------------------

INSERT INTO advisor_expertise (advisor_id, expertise_id)
SELECT a.id, e.id
FROM advisors a
JOIN expertise_areas e ON e.name IN ('Full-Stack Development', 'Interview Coaching', 'Career Transition')
WHERE a.advisor_code = 'ADV-101-0001'
ON CONFLICT DO NOTHING;

INSERT INTO advisor_expertise (advisor_id, expertise_id)
SELECT a.id, e.id
FROM advisors a
JOIN expertise_areas e ON e.name IN ('Product Management', 'UX Design', 'Startup Operations')
WHERE a.advisor_code = 'ADV-101-0002'
ON CONFLICT DO NOTHING;

INSERT INTO advisor_expertise (advisor_id, expertise_id)
SELECT a.id, e.id
FROM advisors a
JOIN expertise_areas e ON e.name IN ('Marketing Strategy', 'Resume Strategy', 'Project Management')
WHERE a.advisor_code = 'ADV-101-0003'
ON CONFLICT DO NOTHING;

INSERT INTO advisor_expertise (advisor_id, expertise_id)
SELECT a.id, e.id
FROM advisors a
JOIN expertise_areas e ON e.name IN ('Financial Analysis', 'Interview Coaching', 'Data Analytics')
WHERE a.advisor_code = 'ADV-101-0004'
ON CONFLICT DO NOTHING;

INSERT INTO advisor_expertise (advisor_id, expertise_id)
SELECT a.id, e.id
FROM advisors a
JOIN expertise_areas e ON e.name IN ('Healthcare Administration', 'Engineering Leadership', 'Project Management')
WHERE a.advisor_code = 'ADV-101-0005'
ON CONFLICT DO NOTHING;

INSERT INTO advisor_expertise (advisor_id, expertise_id)
SELECT a.id, e.id
FROM advisors a
JOIN expertise_areas e ON e.name IN ('Corporate Law', 'Resume Strategy', 'Interview Coaching')
WHERE a.advisor_code = 'ADV-101-0006'
ON CONFLICT DO NOTHING;

INSERT INTO advisor_expertise (advisor_id, expertise_id)
SELECT a.id, e.id
FROM advisors a
JOIN expertise_areas e ON e.name IN ('Engineering Leadership', 'Startup Operations', 'Project Management')
WHERE a.advisor_code = 'ADV-101-0007'
ON CONFLICT DO NOTHING;

INSERT INTO advisor_expertise (advisor_id, expertise_id)
SELECT a.id, e.id
FROM advisors a
JOIN expertise_areas e ON e.name IN ('Education Counseling', 'Graduate School Planning', 'Nonprofit Management')
WHERE a.advisor_code = 'ADV-101-0008'
ON CONFLICT DO NOTHING;

INSERT INTO advisor_expertise (advisor_id, expertise_id)
SELECT a.id, e.id
FROM advisors a
JOIN expertise_areas e ON e.name IN ('Cybersecurity', 'Interview Coaching', 'Remote Work Strategy')
WHERE a.advisor_code = 'ADV-101-0009'
ON CONFLICT DO NOTHING;

INSERT INTO advisor_expertise (advisor_id, expertise_id)
SELECT a.id, e.id
FROM advisors a
JOIN expertise_areas e ON e.name IN ('Nonprofit Management', 'Career Transition', 'Resume Strategy')
WHERE a.advisor_code = 'ADV-101-0010'
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Applicants
-- ---------------------------------------------------------------------------

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
) VALUES
    (
        'Yusuf',
        'Ibrahim',
        'yusuf.ibrahim@example.com',
        'Male',
        'Computer Science',
        'Junior',
        'Information Technology',
        'Software Engineer',
        (SELECT id FROM service_types WHERE name = 'Mock Interview'),
        'Looking for technical interview preparation and guidance on backend engineering roles.',
        'Piscataway',
        'NJ',
        NULL,
        'University MSA',
        'Pending Review'
    ),
    (
        'Amira',
        'Osman',
        'amira.osman@example.com',
        'Female',
        'Marketing',
        'Masters',
        'Business',
        'Brand Manager',
        (SELECT id FROM service_types WHERE name = 'Resume Review'),
        'Needs help strengthening resume bullets for marketing roles.',
        'New Brunswick',
        'NJ',
        NULL,
        'LinkedIn',
        'Pending Review'
    ),
    (
        'Bilal',
        'Chaudhry',
        'bilal.chaudhry@example.com',
        'Male',
        'Economics',
        'Senior',
        'Finance',
        'Financial Analyst',
        (SELECT id FROM service_types WHERE name = 'Mentorship Program'),
        'Interested in investment banking and finance networking.',
        'Jersey City',
        'NJ',
        NULL,
        'Friend Referral',
        'Pending Review'
    ),
    (
        'Hana',
        'Malik',
        'hana.malik@example.com',
        'Female',
        'Health Administration',
        'Masters',
        'Healthcare',
        'Healthcare Operations Manager',
        (SELECT id FROM service_types WHERE name = 'Career Guidance'),
        'Wants advice on healthcare operations career paths.',
        'New York',
        'NY',
        NULL,
        'Career Fair',
        'Pending Review'
    ),
    (
        'Tariq',
        'Mahmood',
        'tariq.mahmood@example.com',
        'Male',
        'Electrical Engineering',
        'Senior',
        'Engineering',
        'Manufacturing Engineer',
        (SELECT id FROM service_types WHERE name = 'General Career Advice'),
        'Interested in hardware, manufacturing, and operations roles.',
        'Austin',
        'TX',
        NULL,
        'Discord',
        'Pending Review'
    ),
    (
        'Salma',
        'Diallo',
        'salma.diallo@example.com',
        'Female',
        'Political Science',
        'Junior',
        'Law',
        'Corporate Lawyer',
        (SELECT id FROM service_types WHERE name = 'Resume Review'),
        'Preparing for legal internships and law school applications.',
        'Chicago',
        'IL',
        NULL,
        'Instagram',
        'Pending Review'
    ),
    (
        'Zain',
        'Patel',
        'zain.patel@example.com',
        'Male',
        'Information Systems',
        'Sophomore',
        'Information Technology',
        'Cybersecurity Analyst',
        (SELECT id FROM service_types WHERE name = 'Mock Interview'),
        'Needs a cybersecurity-focused advisor for early career planning.',
        'Edison',
        'NJ',
        NULL,
        'University MSA',
        'Pending Review'
    ),
    (
        'Maryam',
        'Farah',
        'maryam.farah@example.com',
        'Female',
        'Education',
        'Senior',
        'Education',
        'Education Program Manager',
        (SELECT id FROM service_types WHERE name = 'Mentorship Program'),
        'Interested in education nonprofits and graduate school planning.',
        'Boston',
        'MA',
        NULL,
        'Newsletter',
        'Pending Review'
    ),
    (
        'Ilyas',
        'Rahman',
        'ilyas.rahman@example.com',
        'Male',
        'Data Science',
        'Masters',
        'Information Technology',
        'Data Analyst',
        (SELECT id FROM service_types WHERE name = 'Career Guidance'),
        'Multiple technology advisors may be suitable; wants help choosing between analytics and software.',
        'Remote',
        'Remote',
        NULL,
        'LinkedIn',
        'Pending Review'
    ),
    (
        'Amina',
        'Qureshi',
        'amina.qureshi@example.com',
        'Female',
        'Social Work',
        'Junior',
        'Social Services',
        'Nonprofit Program Coordinator',
        (SELECT id FROM service_types WHERE name = 'General Career Advice'),
        'Interested in nonprofit and community service career options.',
        'Alexandria',
        'VA',
        NULL,
        'Community Event',
        'Pending Review'
    ),
    (
        'Noor',
        'Haddad',
        'noor.haddad@example.com',
        'Female',
        'Architecture',
        'Senior',
        'Other',
        'Urban Planner',
        (SELECT id FROM service_types WHERE name = 'Mentorship Program'),
        'Uncommon career interest that may only partially match current advisor expertise.',
        'Philadelphia',
        'PA',
        NULL,
        'Friend Referral',
        'Pending Review'
    ),
    (
        'Kareem',
        'Saleh',
        'kareem.saleh@example.com',
        'Male',
        'Business Administration',
        'Freshman',
        'Business',
        'Startup Founder',
        (SELECT id FROM service_types WHERE name = 'Career Guidance'),
        'Early-stage student interested in entrepreneurship and startup operations.',
        'Princeton',
        'NJ',
        NULL,
        'Instagram',
        'Pending Review'
    )
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Verification Queries
-- ---------------------------------------------------------------------------

SELECT 'service_types' AS table_name, COUNT(*) AS total_records FROM service_types
UNION ALL
SELECT 'expertise_areas', COUNT(*) FROM expertise_areas
UNION ALL
SELECT 'advisors', COUNT(*) FROM advisors
UNION ALL
SELECT 'advisor_services', COUNT(*) FROM advisor_services
UNION ALL
SELECT 'advisor_expertise', COUNT(*) FROM advisor_expertise
UNION ALL
SELECT 'applicants', COUNT(*) FROM applicants;
