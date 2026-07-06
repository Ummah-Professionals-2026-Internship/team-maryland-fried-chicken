# Database Validation & CRUD Testing Report

Issue: #70 Database Validation & CRUD Testing

## Purpose

This report documents the database validation and CRUD testing plan for the Advisor Matching Platform database.

The validation script checks that the database supports the required Create, Read, Update, and Delete operations for both applicants and advisors. It also checks required fields, foreign key relationships, CHECK constraints, and cleanup after deletion.

## Files Added

- `migrations/crud-validation.sql`
  - Runs CRUD validation for advisors.
  - Runs CRUD validation for applicants.
  - Tests required field enforcement.
  - Tests foreign key enforcement.
  - Tests CHECK constraint enforcement.
  - Deletes temporary test records.
  - Verifies test records are removed after deletion.

## Required Setup

Run these files first:

1. `migrations/init.sql`
2. `migrations/seed.sql`
3. `migrations/crud-validation.sql`

## Advisor CRUD Tests

### Create

Creates a temporary advisor record with advisor code, name, email, industry, experience level, reliability level, career experience, mentorship experience, meeting capacity, location, and availability status.

### Read

Validates that all advisors can be retrieved and that the temporary advisor can be retrieved by ID.

### Update

Updates the temporary advisor's job title, reliability level, and notes. Then it verifies the updated values were saved.

### Delete

Deletes the temporary advisor and verifies the record no longer exists.

## Applicant CRUD Tests

### Create

Creates a temporary applicant record with name, email, major, academic standing, industry, desired career, service type, location, source, and status.

### Read

Validates that all applicants can be retrieved and that the temporary applicant can be retrieved by ID.

### Update

Updates the temporary applicant's status, desired future career, location city, and location state. Then it verifies the updated values were saved.

### Delete

Deletes the temporary applicant and verifies the record no longer exists.

## Constraint Validation

The script validates:

- Required fields reject missing required data.
- Invalid service_id values are rejected by foreign key constraints.
- Invalid advisor industries are rejected by CHECK constraints.
- Invalid unique career experience values are rejected by CHECK constraints.
- Invalid mentorship experience values are rejected by CHECK constraints.

## Data Integrity Validation

The script validates that temporary advisor and applicant records are removed after deletion and that test data does not remain in the database after the script finishes.

## Expected Result

A successful run ends with:

`NOTICE: All CRUD validation tests passed successfully.`

## Local Testing Notes

Frontend checks passed locally:

- `npm run lint`
- `npm run build`

Actual SQL execution requires access to the Supabase/PostgreSQL database or a local PostgreSQL/Docker environment.
