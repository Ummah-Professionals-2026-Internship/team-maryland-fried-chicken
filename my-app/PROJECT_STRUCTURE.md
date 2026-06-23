# Project Structure Standards

This project uses Next.js App Router, TypeScript, and Tailwind CSS.

## Folder Structure

* `app/` - Route definitions and page files
* `components/` - Reusable UI components
* `layouts/` - Shared layout wrappers
* `data/` - Constants and static data
* `types/` - Shared TypeScript types
* `utils/` - Helper functions
* `assets/` - Images, icons, and styling assets
* `public/` - Static files served by Next.js

## Naming Conventions

### Components

Use PascalCase.

Examples:

* Button.tsx
* UserCard.tsx
* Navbar.tsx

### Layouts

Use PascalCase and end with Layout.

Examples:

* MainLayout.tsx
* AuthLayout.tsx

### Routes

Use lowercase route folders.

Examples:

* app/dashboard/page.tsx
* app/profile/page.tsx

### Utilities

Use camelCase.

Examples:

* formatDate.ts
* validateEmail.ts

### Types

Use descriptive names.

Examples:

* user.ts
* auth.ts
* index.ts

### Assets

Use kebab-case.

Examples:

* hero-image.png
* app-logo.svg

## Organization Rules

* Keep reusable UI inside components.
* Keep route-level code inside app.
* Keep helper functions inside utils.
* Keep shared types inside types.
* Keep constants and mock data inside data.
* Avoid unnecessary deep nesting.

## Team Agreement

The team should follow this structure to maintain consistency and scalability as the project grows.