# Database Seeding & Mock Data Migration

Issue: #68 Database Seeding & Mock Data Migration

## Purpose

This seed data prepares the Supabase/PostgreSQL database with realistic applicant and advisor records for frontend development, backend integration, and future recommendation engine testing.

## Files

- `migrations/init.sql`
  - Creates the database schema.
  - Includes tables for users, advisors, applicants, recommendations, matches, service types, expertise areas, advisor services, and advisor expertise.
  - Includes schema updates requested after feedback:
    - `unique_career_experiences` uses a CHECK constraint.
    - `mentorship_experience` uses a CHECK constraint.
    - applicants include `location_city` and `location_state`.

- `migrations/seed.sql`
  - Inserts lookup data.
  - Inserts realistic advisor records.
  - Inserts realistic applicant records.
  - Populates advisor-service and advisor-expertise junction tables.
  - Includes verification queries at the end.

## Dataset Coverage

The seed dataset includes applicants with:

- Different majors
- Different academic standings
- Different industries of interest
- Different desired careers
- Different requested services
- Different locations
- Common and uncommon career interests

The seed dataset includes advisors with:

- Multiple industries
- Various experience levels
- Different expertise areas
- Different reliability levels
- Different mentorship experience levels
- Different meeting capacities
- Available and unavailable advisors

## Edge Cases Included

- Multiple advisors can match one technology applicant.
- One advisor can match several applicants.
- One advisor is unavailable and has zero meeting capacity.
- Some applicants have uncommon interests such as urban planning.
- Applicants request different service types.

## Import Process

Run the files in this order from the Supabase SQL Editor:

1. `migrations/init.sql`
2. `migrations/seed.sql`

After running `seed.sql`, review the verification query results to confirm records were inserted successfully.

## Notes

The seed data intentionally does not copy Monday.com tables directly because the current database schema differs from the older Monday.com structure.
