# LeadCop AI Agent Directives

**Purpose:** This document strictly controls all future AI-generated code quality for the LeadCop repository. Any agent modifying this codebase MUST strictly adhere to these rules. Failure to do so is considered a critical error.

## 1. Coding Standards
*   **TypeScript Strict Mode:** All code must be strictly typed.
*   **No `any` Types:** The use of `any` is strictly forbidden. Use `unknown` if the shape is truly dynamic, and validate it before use.
*   **SOLID Principles:** All generated code must adhere to Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles.
*   **Production-Grade Only:** Do not write MVP hacks or "TODO" shortcuts for core business logic. Code must be robust and handle edge cases gracefully.

## 2. Naming Conventions
*   **Variables, Functions, and Hooks:** Use `camelCase` (e.g., `validateDomain`, `useUserPlan`).
*   **Constants:** Use `UPPER_SNAKE_CASE` (e.g., `MAX_QUOTA_LIMIT`).
*   **Types, Interfaces, and Classes:** Use `PascalCase` (e.g., `ValidationResult`, `UserRepository`).
*   **React Components:** Use `PascalCase` (e.g., `DomainList`, `BillingSettingsForm`).
*   **Booleans:** Prefix with `is`, `has`, or `should` (e.g., `isActive`, `hasExtraCredits`).

## 3. Folder Rules (Feature-Based Architecture)
*   **Strict Isolation:** Code is organized by feature inside `/src/features/`. Each feature must have its own `components/`, `schemas.ts`, `service.ts`, `repository.ts`, and `actions.ts`.
*   **No Business Logic in UI:** The `/app` and `/components` directories must contain absolutely zero business logic. They are strictly for routing, data-fetching boundaries, and presentation.
*   **Service Layer:** All business logic lives in `service.ts` files within a feature module.
*   **Repository Layer:** All database interactions live in `repository.ts` files. Services call Repositories; they never use the Prisma client directly.

## 4. Import Rules
*   **Absolute Imports:** Always use the configured `@/` alias (e.g., `@/features/users/service`). Never use relative paths like `../../`.
*   **Cross-Feature Boundaries:** A feature (e.g., `/features/billing`) cannot import from the `/app` folder. Features can import Services or Schemas from other features, but should never import UI Components from other features (use `@/components/shared` instead).

## 5. Security Rules
*   **Server Actions for Mutations:** All data mutations must occur via Next.js Server Actions.
*   **Zod Validation:** Every Server Action must validate its input payload using a Zod schema before processing.
*   **Session Verification:** Every Server Action and API Route must independently verify the user's session and authorize the request via Auth.js. Never trust client-provided IDs.
*   **No Plaintext Secrets:** API keys and passwords must always be hashed (e.g., SHA-256) before storage.

## 6. Database Rules
*   **Prisma ORM:** All database access is mediated through Prisma.
*   **Transactions:** Use Prisma Transactions (`prisma.$transaction`) whenever updating multiple related records to ensure atomicity (e.g., decrementing quota and logging a validation simultaneously).
*   **Read-Only Analytics:** Complex dashboard analytics should rely on the `UsageCounter` table, not `COUNT(*)` aggregations over the `ValidationLog` table.

## 7. API Rules
*   **Axios:** Use Axios only for external client-side requests (e.g., fetching data in a React component context). For Server Components or Server Actions, use the native `fetch` API.
*   **Rate Limiting:** Public endpoints (`/api/v1/validate`) must implement strict IP and API-Key based rate limiting.
*   **Origin Checks:** Public endpoints must strictly validate `Origin` and `Referer` headers against the allowed `Domain` records.

## 8. UI Rules
*   **shadcn/ui First:** Always use or extend existing `shadcn/ui` and Tailwind CSS components. Do not invent custom CSS classes unless absolutely necessary.
*   **Mobile-First:** All UI components must be responsive, starting with mobile layouts and scaling up using Tailwind breakpoints (`md:`, `lg:`).
*   **Accessibility (a11y):** All components must use proper ARIA labels, semantic HTML (e.g., `<nav>`, `<main>`, `<article>`), and support keyboard navigation.

## 9. Performance Rules
*   **SEO Best Practices:** Public pages (`/(marketing)`, blog, CMS) must use Next.js `generateMetadata`, proper canonical URLs, semantic tags, and optimized `<Image />` components.
*   **Edge Functions:** Latency-critical endpoints (like the validation engine) should be optimized for Edge execution where possible, minimizing cold starts.
*   **React Server Components (RSC):** Default to Server Components. Only use `"use client"` when interactivity (hooks, state, event listeners) is strictly required.
