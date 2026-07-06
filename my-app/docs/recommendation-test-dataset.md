# Recommendation Test Dataset Preparation

Issue: #71 Recommendation Test Dataset Preparation

## Purpose

This document prepares representative applicant/advisor matching scenarios for Sprint 5 recommendation engine development and testing.

The goal is to validate that the future recommendation engine can handle realistic matching cases, edge cases, partial matches, and capacity/availability constraints.

## Dataset Source

This recommendation test dataset builds on the seed data from:

- `my-app/migrations/init.sql`
- `my-app/migrations/seed.sql`

The dataset follows the current PostgreSQL/Supabase schema, not the older Monday.com table structure.

## Matching Criteria Covered

The dataset covers:

- Applicant major
- Applicant industry
- Applicant academic standing
- Applicant desired future career
- Applicant requested service type
- Applicant location
- Advisor industry
- Advisor experience level
- Advisor expertise areas
- Advisor reliability level
- Advisor mentorship experience
- Advisor meeting capacity
- Advisor availability status

## Applicant Coverage

The applicant records cover:

- Information Technology
- Business
- Finance
- Healthcare
- Engineering
- Law
- Education
- Social Services
- Other

The academic standings include:

- Freshman
- Sophomore
- Junior
- Senior
- Graduate

The requested service types include:

- Resume Review
- Mentorship Program
- General Career Advice
- Mock Interview
- Career Guidance

## Advisor Coverage

The advisor records cover:

- Information Technology
- Business
- Finance
- Healthcare
- Engineering
- Law
- Education
- Social Services

The advisor records include:

- High, Medium, and Low reliability levels
- Different mentorship experience levels
- Different meeting capacities
- Available and unavailable advisors
- Advisors with direct and partial expertise matches

## Test Scenarios

### Scenario 1: Strong direct technology match

Applicant: Yusuf Ibrahim  
Desired career: Software Engineer  
Industry: Information Technology  
Requested service: Mock Interview  

Expected strong matches:

- David Johnson
- Bilal Chaudhry
- Omar Siddiqui

Reason:

The applicant wants a technology career and mock interview support. Technology advisors with interview coaching or technical expertise should rank highly.

### Scenario 2: Multiple advisors suitable for one applicant

Applicant: Ilyas Rahman  
Desired career: Data Analyst  
Industry: Information Technology  
Requested service: Career Guidance  

Expected possible matches:

- David Johnson
- Omar Siddiqui
- Bilal Chaudhry

Reason:

The applicant could match with software, product, or cybersecurity/data-oriented advisors depending on the scoring weights.

### Scenario 3: One advisor matches several applicants

Advisor: David Johnson  
Industry: Information Technology  
Expertise: Full-Stack Development, Interview Coaching, Career Transition  

Expected matching applicants:

- Yusuf Ibrahim
- Zain Patel
- Ilyas Rahman

Reason:

David has broad technical experience and can support several technology applicants.

### Scenario 4: Advisor at maximum or unavailable capacity

Advisor: Hassan Farooq  
Availability: Unavailable  
Max meetings per month: 0  

Expected behavior:

The recommendation engine should exclude this advisor or rank him lower, even if his expertise partially matches an applicant.

### Scenario 5: Uncommon career interest with weak match

Applicant: Noor Haddad  
Desired career: Urban Planner  
Industry: Other  
Requested service: Mentorship Program  

Expected behavior:

The recommendation engine may not find a perfect advisor. It should return the closest partial match based on related expertise, service type, or general career support.

### Scenario 6: Finance applicant

Applicant: Bilal Chaudhry  
Desired career: Financial Analyst  
Industry: Finance  
Requested service: Mentorship Program  

Expected strong match:

- Ahmed Khan

Reason:

Ahmed is the strongest finance-related advisor and should rank above general business advisors.

### Scenario 7: Healthcare applicant

Applicant: Hana Malik  
Desired career: Healthcare Operations Manager  
Industry: Healthcare  
Requested service: Career Guidance  

Expected strong match:

- Nadia Rahman

Reason:

Nadia has senior healthcare administration experience and strong mentorship background.

### Scenario 8: Law applicant

Applicant: Salma Diallo  
Desired career: Corporate Lawyer  
Industry: Law  
Requested service: Resume Review  

Expected strong match:

- Layla Hassan

Reason:

Layla works in corporate law and offers resume/interview/career guidance support.

### Scenario 9: Education applicant

Applicant: Maryam Farah  
Desired career: Education Program Manager  
Industry: Education  
Requested service: Mentorship Program  

Expected strong match:

- Maryam Yusuf

Reason:

Maryam Yusuf works in education program management and supports education/nonprofit career paths.

### Scenario 10: Social services applicant

Applicant: Amina Qureshi  
Desired career: Nonprofit Program Coordinator  
Industry: Social Services  
Requested service: General Career Advice  

Expected strong match:

- Aisha Diallo

Reason:

Aisha has nonprofit and social services experience.

## Sample Recommendation Cases

| Applicant | Strong Match | Backup Match | Edge Case |
|---|---|---|---|
| Yusuf Ibrahim | David Johnson | Bilal Chaudhry | Multiple technology advisors available |
| Ilyas Rahman | Omar Siddiqui | David Johnson | Applicant could match analytics, software, or product |
| Bilal Chaudhry | Ahmed Khan | Fatima Ali | Finance-specific match should rank highest |
| Hana Malik | Nadia Rahman | Aisha Diallo | Healthcare match should beat general nonprofit match |
| Noor Haddad | Hassan Farooq | Maryam Yusuf | Uncommon career interest only partially matches |
| Zain Patel | Bilal Chaudhry | David Johnson | Cybersecurity applicant should favor cybersecurity expertise |
| Salma Diallo | Layla Hassan | Fatima Ali | Law match should rank above general business |
| Amina Qureshi | Aisha Diallo | Maryam Yusuf | Social services/nonprofit overlap |

## Expected Recommendation Engine Priority

The recommendation engine should prioritize:

1. Exact industry match
2. Requested service match
3. Advisor expertise overlap
4. Advisor availability
5. Advisor meeting capacity
6. Advisor reliability level
7. Advisor mentorship experience
8. Partial career similarity when no exact match exists

## Hafeth Matching Set Note

The real-life applicant/advisor entries from Hafeth should be added once the matching set is available.

The already-matched advisor reference should not be included in production seed data. It should only be kept separately as an evaluation reference to compare the algorithm's output against known human matches.
