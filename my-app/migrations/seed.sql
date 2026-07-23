-- =============================================================================
-- Seed Data ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Advisor Matching Platform
-- Complete, idempotent mock data for advisors, applicants, services, and expertise.
-- Run after migrations/init.sql in Supabase SQL Editor.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Lookup Data
-- ---------------------------------------------------------------------------

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
    ('Remote Work Strategy'),
    ('Operations Management'),
    ('Law School Preparation'),
    ('Public Policy')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Remove old mock records before reseeding
-- Keeps seed.sql safe to rerun without creating duplicate names/records.
-- ---------------------------------------------------------------------------

DELETE FROM applicants
WHERE email IN (
    'zara.mahmood@example.com',
    'hamza.qureshi@example.com',
    'lina.osman@example.com',
    'faris.patel@example.com',
    'amina.caldwell@example.com',
    'bilal.nguyen@example.com',
    'sara.ahmed@example.com',
    'taha.williams@example.com',
    'mariam.castillo@example.com',
    'noor.ramirez@example.com',
    'kareem.saleh@example.com',
    'layla.bennett@example.com',
    -- Previous mock emails from earlier seed versions
    'yusuf.ibrahim@example.com',
    'amira.osman@example.com',
    'bilal.chaudhry@example.com',
    'hana.malik@example.com',
    'tariq.mahmood@example.com',
    'salma.diallo@example.com',
    'zain.patel@example.com',
    'maryam.farah@example.com',
    'ilyas.rahman@example.com',
    'amina.qureshi@example.com',
    'noor.haddad@example.com'
);

DELETE FROM advisors
WHERE advisor_code IN (
    'ADV-101-0001',
    'ADV-101-0002',
    'ADV-101-0003',
    'ADV-101-0004',
    'ADV-101-0005',
    'ADV-101-0006',
    'ADV-101-0007',
    'ADV-101-0008',
    'ADV-101-0009',
    'ADV-101-0010',
    'ADV-101-0011',
    'ADV-101-0012'
)
OR email IN (
    'david.johnson@example.com',
    'omar.siddiqui@example.com',
    'fatima.ali@example.com',
    'ahmed.khan@example.com',
    'nadia.rahman@example.com',
    'layla.hassan@example.com',
    'hassan.farooq@example.com',
    'maryam.yusuf@example.com',
    'bilal.chaudhry@example.com',
    'aisha.diallo@example.com',
    'ayaan.siddiq@example.com',
    'hafsa.rahman@example.com',
    'karim.abdullah@example.com',
    'noura.elamin@example.com',
    'zayd.malik@example.com',
    'samira.khan@example.com',
    'idris.thompson@example.com',
    'leena.haddad@example.com',
    'musa.bennett@example.com',
    'yasmin.farooq@example.com',
    'omar.navarro@example.com',
    'fatima.brooks@example.com'
);

-- ---------------------------------------------------------------------------
-- Advisors
-- Every advisor includes identity, contact, LinkedIn, career, availability, and service mapping data.
-- ---------------------------------------------------------------------------

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
) VALUES
    (
        'ADV-101-0001',
        'Ayaan',
        'Siddiq',
        'ayaan.siddiq@example.com',
        '+1 (206) 555-0101',
        'https://www.linkedin.com/in/ayaan-siddiq-mock',
        'Brother',
        'University of Washington',
        'Computer Science',
        'Microsoft',
        'Senior Software Engineer',
        'Information Technology',
        'Senior Professional (10+ Years)',
        'High',
        'Built production web platforms and mentored junior engineers across cloud and full-stack teams.',
        'Leadership Experience',
        '5+ years',
        4,
        'Strong fit for software engineering, backend systems, and technical interview preparation.',
        'Seattle',
        'WA',
        'Available'
    ),
    (
        'ADV-101-0002',
        'Hafsa',
        'Rahman',
        'hafsa.rahman@example.com',
        '+1 (212) 555-0102',
        'https://www.linkedin.com/in/hafsa-rahman-mock',
        'Sister',
        'Rutgers University',
        'Information Technology',
        'Figma',
        'Product Manager',
        'Information Technology',
        'Mid-Career Professional (3-10 Years)',
        'High',
        'Moved from implementation work into product management with a focus on user research and roadmap planning.',
        'Career Change',
        '3-5 years',
        3,
        'Helpful for product management, UX collaboration, and early-career tech planning.',
        'New York',
        'NY',
        'Available'
    ),
    (
        'ADV-101-0003',
        'Karim',
        'Abdullah',
        'karim.abdullah@example.com',
        '+1 (609) 555-0103',
        'https://www.linkedin.com/in/karim-abdullah-mock',
        'Brother',
        'Princeton University',
        'Economics',
        'JPMorgan Chase',
        'Financial Analyst',
        'Finance',
        'Mid-Career Professional (3-10 Years)',
        'Medium',
        'Works in financial analysis, reporting, and internship recruiting preparation for analyst-track candidates.',
        'First-Generation College Student',
        '1-3 years',
        3,
        'Good fit for finance resumes, networking strategy, and behavioral interviews.',
        'Jersey City',
        'NJ',
        'Available'
    ),
    (
        'ADV-101-0004',
        'Noura',
        'Elamin',
        'noura.elamin@example.com',
        '+1 (646) 555-0104',
        'https://www.linkedin.com/in/noura-elamin-mock',
        'Sister',
        'Columbia University',
        'Health Administration',
        'Mount Sinai Health System',
        'Healthcare Operations Manager',
        'Healthcare',
        'Senior Professional (10+ Years)',
        'High',
        'Led healthcare operations teams and supported students entering administration, operations, and patient services.',
        'Leadership Experience',
        '5+ years',
        5,
        'High-capacity healthcare mentor for operations and administration pathways.',
        'New York',
        'NY',
        'Available'
    ),
    (
        'ADV-101-0005',
        'Zayd',
        'Malik',
        'zayd.malik@example.com',
        '+1 (312) 555-0105',
        'https://www.linkedin.com/in/zayd-malik-mock',
        'Brother',
        'Northwestern University',
        'Law',
        'Baker McKenzie',
        'Corporate Lawyer',
        'Law',
        'Senior Professional (10+ Years)',
        'High',
        'Built a corporate law career across internships, client advisory, and legal writing for business matters.',
        'International Career',
        '3-5 years',
        3,
        'Good fit for law school planning, legal internship resumes, and professional communication.',
        'Chicago',
        'IL',
        'Available'
    ),
    (
        'ADV-101-0006',
        'Samira',
        'Khan',
        'samira.khan@example.com',
        '+1 (513) 555-0106',
        'https://www.linkedin.com/in/samira-khan-mock',
        'Sister',
        'University of Michigan',
        'Marketing',
        'Procter & Gamble',
        'Brand Marketing Manager',
        'Business',
        'Mid-Career Professional (3-10 Years)',
        'Medium',
        'Experienced in brand strategy, marketing analytics, and cross-functional campaign execution.',
        'Startup Experience',
        '1-3 years',
        3,
        'Strong for marketing resumes, portfolio storytelling, and brand strategy career paths.',
        'Cincinnati',
        'OH',
        'Available'
    ),
    (
        'ADV-101-0007',
        'Idris',
        'Thompson',
        'idris.thompson@example.com',
        '+1 (512) 555-0107',
        'https://www.linkedin.com/in/idris-thompson-mock',
        'Brother',
        'Georgia Tech',
        'Mechanical Engineering',
        'Tesla',
        'Manufacturing Engineer',
        'Engineering',
        'Mid-Career Professional (3-10 Years)',
        'Medium',
        'Works in manufacturing engineering, operations improvement, and hardware production systems.',
        'Remote Work',
        'Less than 1 year',
        2,
        'Helpful for students interested in hardware, manufacturing, and operations roles.',
        'Austin',
        'TX',
        'Available'
    ),
    (
        'ADV-101-0008',
        'Leena',
        'Haddad',
        'leena.haddad@example.com',
        '+1 (617) 555-0108',
        'https://www.linkedin.com/in/leena-haddad-mock',
        'Sister',
        'Harvard Graduate School of Education',
        'Education',
        'KIPP Foundation',
        'Education Program Manager',
        'Education',
        'Mid-Career Professional (3-10 Years)',
        'High',
        'Supports students interested in teaching, education nonprofits, curriculum programs, and graduate school.',
        'Graduate School',
        '3-5 years',
        4,
        'Strong mentor for education careers and graduate school planning.',
        'Boston',
        'MA',
        'Available'
    ),
    (
        'ADV-101-0009',
        'Musa',
        'Bennett',
        'musa.bennett@example.com',
        '+1 (415) 555-0109',
        'https://www.linkedin.com/in/musa-bennett-mock',
        'Brother',
        'Carnegie Mellon University',
        'Information Systems',
        'Cloudflare',
        'Cybersecurity Analyst',
        'Information Technology',
        'Young Professional (0-3 Years)',
        'Medium',
        'Works in cybersecurity operations and helps applicants prepare for technical and behavioral interviews.',
        'Remote Work',
        'Less than 1 year',
        2,
        'Good for cybersecurity, IT, and technical interview preparation.',
        'Remote',
        'Remote',
        'Available'
    ),
    (
        'ADV-101-0010',
        'Yasmin',
        'Farooq',
        'yasmin.farooq@example.com',
        '+1 (703) 555-0110',
        'https://www.linkedin.com/in/yasmin-farooq-mock',
        'Sister',
        'Howard University',
        'Social Work',
        'Islamic Relief USA',
        'Program Coordinator',
        'Social Services',
        'Mid-Career Professional (3-10 Years)',
        'Medium',
        'Experienced in nonprofit programming, community work, volunteer coordination, and social services careers.',
        'Immigration Journey',
        '1-3 years',
        3,
        'Useful for applicants interested in nonprofit and social impact roles.',
        'Alexandria',
        'VA',
        'Available'
    ),
    (
        'ADV-101-0011',
        'Omar',
        'Navarro',
        'omar.navarro@example.com',
        '+1 (305) 555-0111',
        'https://www.linkedin.com/in/omar-navarro-mock',
        'Brother',
        'University of Miami',
        'Data Science',
        'Spotify',
        'Data Analyst',
        'Information Technology',
        'Young Professional (0-3 Years)',
        'High',
        'Works with dashboards, experimentation, SQL, and analytics storytelling for product teams.',
        'Entrepreneurship',
        'Less than 1 year',
        3,
        'Good match for analytics, SQL projects, and early data career planning.',
        'Miami',
        'FL',
        'Available'
    ),
    (
        'ADV-101-0012',
        'Fatima',
        'Brooks',
        'fatima.brooks@example.com',
        '+1 (404) 555-0112',
        'https://www.linkedin.com/in/fatima-brooks-mock',
        'Sister',
        'Emory University',
        'Public Policy',
        'Civic Bridge',
        'Policy Associate',
        'Other',
        'Mid-Career Professional (3-10 Years)',
        'Medium',
        'Works across public policy research, community programs, stakeholder writing, and civic partnerships.',
        'Career Break',
        '1-3 years',
        2,
        'Helpful for policy, public service, and writing-heavy career paths.',
        'Atlanta',
        'GA',
        'Available'
    );

-- ---------------------------------------------------------------------------
-- Advisor Services
-- Advisors do not have a service_id column; services are connected through advisor_services.
-- ---------------------------------------------------------------------------

INSERT INTO advisor_services (advisor_id, service_id)
SELECT a.id, s.id
FROM (
    VALUES
        ('ADV-101-0001', 'Resume Review'),
        ('ADV-101-0001', 'Mock Interview'),
        ('ADV-101-0001', 'Mentorship Program'),
        ('ADV-101-0002', 'Mentorship Program'),
        ('ADV-101-0002', 'Career Guidance'),
        ('ADV-101-0002', 'Mock Interview'),
        ('ADV-101-0003', 'Resume Review'),
        ('ADV-101-0003', 'Mock Interview'),
        ('ADV-101-0003', 'Career Guidance'),
        ('ADV-101-0004', 'Mentorship Program'),
        ('ADV-101-0004', 'Career Guidance'),
        ('ADV-101-0004', 'Resume Review'),
        ('ADV-101-0005', 'Resume Review'),
        ('ADV-101-0005', 'Career Guidance'),
        ('ADV-101-0005', 'Mentorship Program'),
        ('ADV-101-0006', 'Resume Review'),
        ('ADV-101-0006', 'General Career Advice'),
        ('ADV-101-0006', 'Career Guidance'),
        ('ADV-101-0007', 'General Career Advice'),
        ('ADV-101-0007', 'Mentorship Program'),
        ('ADV-101-0007', 'Mock Interview'),
        ('ADV-101-0008', 'Mentorship Program'),
        ('ADV-101-0008', 'Graduate School Planning'),
        ('ADV-101-0008', 'General Career Advice'),
        ('ADV-101-0009', 'Mock Interview'),
        ('ADV-101-0009', 'Career Guidance'),
        ('ADV-101-0009', 'Resume Review'),
        ('ADV-101-0010', 'Mentorship Program'),
        ('ADV-101-0010', 'General Career Advice'),
        ('ADV-101-0010', 'Career Guidance'),
        ('ADV-101-0011', 'Career Guidance'),
        ('ADV-101-0011', 'Mock Interview'),
        ('ADV-101-0011', 'Resume Review'),
        ('ADV-101-0012', 'General Career Advice'),
        ('ADV-101-0012', 'Resume Review'),
        ('ADV-101-0012', 'Mentorship Program')
) AS mapping(advisor_code, service_name)
JOIN advisors a ON a.advisor_code = mapping.advisor_code
JOIN service_types s ON s.name = mapping.service_name
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Advisor Expertise
-- ---------------------------------------------------------------------------

INSERT INTO advisor_expertise (advisor_id, expertise_id)
SELECT a.id, e.id
FROM (
    VALUES
        ('ADV-101-0001', 'Software Engineering'),
        ('ADV-101-0001', 'Full-Stack Development'),
        ('ADV-101-0001', 'Interview Coaching'),
        ('ADV-101-0002', 'Product Management'),
        ('ADV-101-0002', 'UX Design'),
        ('ADV-101-0002', 'Startup Operations'),
        ('ADV-101-0003', 'Financial Analysis'),
        ('ADV-101-0003', 'Resume Strategy'),
        ('ADV-101-0003', 'Interview Coaching'),
        ('ADV-101-0004', 'Healthcare Administration'),
        ('ADV-101-0004', 'Operations Management'),
        ('ADV-101-0004', 'Resume Strategy'),
        ('ADV-101-0005', 'Corporate Law'),
        ('ADV-101-0005', 'Law School Preparation'),
        ('ADV-101-0005', 'Resume Strategy'),
        ('ADV-101-0006', 'Marketing Strategy'),
        ('ADV-101-0006', 'Resume Strategy'),
        ('ADV-101-0006', 'Career Transition'),
        ('ADV-101-0007', 'Engineering Leadership'),
        ('ADV-101-0007', 'Operations Management'),
        ('ADV-101-0007', 'Interview Coaching'),
        ('ADV-101-0008', 'Education Counseling'),
        ('ADV-101-0008', 'Graduate School Planning'),
        ('ADV-101-0008', 'Nonprofit Management'),
        ('ADV-101-0009', 'Cybersecurity'),
        ('ADV-101-0009', 'Remote Work Strategy'),
        ('ADV-101-0009', 'Interview Coaching'),
        ('ADV-101-0010', 'Nonprofit Management'),
        ('ADV-101-0010', 'Career Transition'),
        ('ADV-101-0010', 'Resume Strategy'),
        ('ADV-101-0011', 'Data Analytics'),
        ('ADV-101-0011', 'Interview Coaching'),
        ('ADV-101-0011', 'Remote Work Strategy'),
        ('ADV-101-0012', 'Public Policy'),
        ('ADV-101-0012', 'Nonprofit Management'),
        ('ADV-101-0012', 'Resume Strategy')
) AS mapping(advisor_code, expertise_name)
JOIN advisors a ON a.advisor_code = mapping.advisor_code
JOIN expertise_areas e ON e.name = mapping.expertise_name
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Applicants
-- Every applicant includes identity, contact, school, service, resume, source, location, and status.
-- ---------------------------------------------------------------------------

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
) VALUES
    (
        NULL,
        'Zara',
        'Mahmood',
        'zara.mahmood@example.com',
        '+1 (732) 555-0201',
        'Sister',
        'Rutgers University',
        'Computer Science',
        'Junior',
        'Information Technology',
        'Software Engineer',
        (SELECT id FROM service_types WHERE name = 'Mock Interview'),
        'Looking for technical interview preparation and backend engineering guidance.',
        'https://example.com/mock-resumes/zara-mahmood.pdf',
        'University MSA',
        'Piscataway',
        'NJ',
        'Pending Review'
    ),
    (
        NULL,
        'Hamza',
        'Qureshi',
        'hamza.qureshi@example.com',
        '+1 (201) 555-0202',
        'Brother',
        'New Jersey Institute of Technology',
        'Information Systems',
        'Sophomore',
        'Information Technology',
        'Cybersecurity Analyst',
        (SELECT id FROM service_types WHERE name = 'Career Guidance'),
        'Needs help choosing cybersecurity projects and finding early internship opportunities.',
        'https://example.com/mock-resumes/hamza-qureshi.pdf',
        'Discord',
        'Newark',
        'NJ',
        'Pending Review'
    ),
    (
        NULL,
        'Lina',
        'Osman',
        'lina.osman@example.com',
        '+1 (212) 555-0203',
        'Sister',
        'New York University',
        'Marketing',
        'Masters',
        'Business',
        'Brand Manager',
        (SELECT id FROM service_types WHERE name = 'Resume Review'),
        'Needs help strengthening marketing resume bullets and campaign impact statements.',
        'https://example.com/mock-resumes/lina-osman.pdf',
        'LinkedIn',
        'New York',
        'NY',
        'Pending Review'
    ),
    (
        NULL,
        'Faris',
        'Patel',
        'faris.patel@example.com',
        '+1 (609) 555-0204',
        'Brother',
        'Princeton University',
        'Economics',
        'Senior',
        'Finance',
        'Financial Analyst',
        (SELECT id FROM service_types WHERE name = 'Mentorship Program'),
        'Interested in analyst recruiting, networking, and finance interview preparation.',
        'https://example.com/mock-resumes/faris-patel.pdf',
        'Friend Referral',
        'Princeton',
        'NJ',
        'Pending Review'
    ),
    (
        NULL,
        'Amina',
        'Caldwell',
        'amina.caldwell@example.com',
        '+1 (646) 555-0205',
        'Sister',
        'Columbia University',
        'Health Administration',
        'Masters',
        'Healthcare',
        'Healthcare Operations Manager',
        (SELECT id FROM service_types WHERE name = 'Career Guidance'),
        'Wants advice on healthcare administration, hospital operations, and leadership pathways.',
        'https://example.com/mock-resumes/amina-caldwell.pdf',
        'Career Fair',
        'New York',
        'NY',
        'Pending Review'
    ),
    (
        NULL,
        'Bilal',
        'Nguyen',
        'bilal.nguyen@example.com',
        '+1 (512) 555-0206',
        'Brother',
        'University of Texas at Austin',
        'Mechanical Engineering',
        'Senior',
        'Engineering',
        'Manufacturing Engineer',
        (SELECT id FROM service_types WHERE name = 'General Career Advice'),
        'Interested in hardware, manufacturing systems, and operations engineering roles.',
        'https://example.com/mock-resumes/bilal-nguyen.pdf',
        'Discord',
        'Austin',
        'TX',
        'Pending Review'
    ),
    (
        NULL,
        'Sara',
        'Ahmed',
        'sara.ahmed@example.com',
        '+1 (312) 555-0207',
        'Sister',
        'University of Illinois Chicago',
        'Political Science',
        'Junior',
        'Law',
        'Corporate Lawyer',
        (SELECT id FROM service_types WHERE name = 'Resume Review'),
        'Preparing for legal internships and law school applications.',
        'https://example.com/mock-resumes/sara-ahmed.pdf',
        'Instagram',
        'Chicago',
        'IL',
        'Pending Review'
    ),
    (
        NULL,
        'Taha',
        'Williams',
        'taha.williams@example.com',
        '+1 (617) 555-0208',
        'Brother',
        'Boston University',
        'Education',
        'Senior',
        'Education',
        'Education Program Manager',
        (SELECT id FROM service_types WHERE name = 'Mentorship Program'),
        'Interested in education nonprofits, teaching pathways, and graduate school planning.',
        'https://example.com/mock-resumes/taha-williams.pdf',
        'Newsletter',
        'Boston',
        'MA',
        'Pending Review'
    ),
    (
        NULL,
        'Mariam',
        'Castillo',
        'mariam.castillo@example.com',
        '+1 (929) 555-0209',
        'Sister',
        'CUNY City College',
        'Data Science',
        'Masters',
        'Information Technology',
        'Data Analyst',
        (SELECT id FROM service_types WHERE name = 'Mock Interview'),
        'Wants help with analytics interviews, SQL projects, and portfolio presentation.',
        'https://example.com/mock-resumes/mariam-castillo.pdf',
        'LinkedIn',
        'New York',
        'NY',
        'Pending Review'
    ),
    (
        NULL,
        'Noor',
        'Ramirez',
        'noor.ramirez@example.com',
        '+1 (703) 555-0210',
        'Sister',
        'George Mason University',
        'Social Work',
        'Junior',
        'Social Services',
        'Nonprofit Program Coordinator',
        (SELECT id FROM service_types WHERE name = 'General Career Advice'),
        'Interested in nonprofit work, community service careers, and program coordination.',
        'https://example.com/mock-resumes/noor-ramirez.pdf',
        'Community Event',
        'Alexandria',
        'VA',
        'Pending Review'
    ),
    (
        NULL,
        'Kareem',
        'Saleh',
        'kareem.saleh@example.com',
        '+1 (305) 555-0211',
        'Brother',
        'Florida International University',
        'Business Administration',
        'Freshman',
        'Business',
        'Startup Founder',
        (SELECT id FROM service_types WHERE name = 'Career Guidance'),
        'Early-stage student interested in entrepreneurship and startup operations.',
        'https://example.com/mock-resumes/kareem-saleh.pdf',
        'Instagram',
        'Miami',
        'FL',
        'Pending Review'
    ),
    (
        NULL,
        'Layla',
        'Bennett',
        'layla.bennett@example.com',
        '+1 (404) 555-0212',
        'Sister',
        'Emory University',
        'Public Policy',
        'Senior',
        'Other',
        'Policy Analyst',
        (SELECT id FROM service_types WHERE name = 'Resume Review'),
        'Needs help framing policy research, writing samples, and public service experience.',
        'https://example.com/mock-resumes/layla-bennett.pdf',
        'Career Fair',
        'Atlanta',
        'GA',
        'Pending Review'
    );

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

SELECT 'duplicate_applicant_names' AS check_name, first_name, last_name, COUNT(*) AS duplicate_count
FROM applicants
WHERE email IN (
    'zara.mahmood@example.com',
    'hamza.qureshi@example.com',
    'lina.osman@example.com',
    'faris.patel@example.com',
    'amina.caldwell@example.com',
    'bilal.nguyen@example.com',
    'sara.ahmed@example.com',
    'taha.williams@example.com',
    'mariam.castillo@example.com',
    'noor.ramirez@example.com',
    'kareem.saleh@example.com',
    'layla.bennett@example.com'
)
GROUP BY first_name, last_name
HAVING COUNT(*) > 1;

SELECT 'duplicate_advisor_names' AS check_name, first_name, last_name, COUNT(*) AS duplicate_count
FROM advisors
WHERE advisor_code BETWEEN 'ADV-101-0001' AND 'ADV-101-0012'
GROUP BY first_name, last_name
HAVING COUNT(*) > 1;

-- =============================================================================
-- Issue #141 - Expand mock dataset to at least 50 advisors and 50 applicants
-- Idempotent: safe to run more than once.
-- =============================================================================

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
