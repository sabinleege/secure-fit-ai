# Plan: Mandatory Onboarding + Robust AI Layer

Two phases. Phase 1 ships a hard-gated 7-step onboarding wizard that fills every field the AI needs. Phase 2 rebuilds the AI generation layer with strong JSON schemas, caching by profile hash, retries, and a great loading/error UX. After both phases I stop and wait for confirmation.

---

## Phase 1 — Mandatory Onboarding Wizard

### 1.1 Database changes (migration)
Expand `profiles` with the fields the wizard collects and the gating flag:

- `onboarding_completed` boolean default false
- `gender` text, `date_of_birth` date, `goal_weight` numeric
- `avatar_url` text
- `goals` text[] (multi-select), `goals_notes` text
- `training_days_per_week` int, `session_duration_min` int, `preferred_times` text[]
- `injuries_detailed` jsonb (array of `{area, severity, duration, doctor_notes}`), `other_limitations` text, `medical_disclaimer_accepted` bool, `medical_disclaimer_accepted_at` timestamptz
- `dietary_style` text[], `allergies` text[], `meals_per_day` int, `cultural_restrictions` text
- `equipment` text[], `training_location` text, `environment_notes` text
- `tos_accepted` bool, `tos_accepted_at` timestamptz, `data_consent` bool, `data_consent_at` timestamptz
- `profile_hash` text (computed client-side from key fields, used by AI caching)

Indexes: `profiles(onboarding_completed)`, `profiles(profile_hash)`. Keep existing RLS (own-row). Update `handle_new_user` only if needed (no — defaults handle it).

Storage: create public `avatars` bucket + RLS so each user can read/write only `avatars/{auth.uid()}/...`.

### 1.2 Routing gate
- Add `/onboarding` route (no sidebar/layout, full-screen wizard).
- Extend `AuthGuard` (or wrap in new `OnboardingGate`): after auth, fetch `profiles.onboarding_completed`. If false → force-redirect to `/onboarding` from any other route. Only `/onboarding` and `/auth` reachable until completed.
- After completion → redirect `/dashboard` (Index).

### 1.3 Wizard component
`src/pages/OnboardingPage.tsx` + `src/components/onboarding/` with one component per step. Shared:
- `react-hook-form` with `zodResolver`, one Zod schema per step + a master schema.
- TanStack Query mutation to upsert `profiles` on finish.
- Framer Motion slide transitions, progress bar (step N/7 + %).
- Mobile-first shadcn cards, large touch targets, sticky footer with Back/Next.
- Persist draft to `localStorage` per step so refresh doesn't lose data.

Steps: Personal → Goals → Activity/Schedule → Injuries/Medical (with required disclaimer) → Nutrition → Equipment/Environment → Review & Consent.

Review step shows summary cards with inline "Edit" buttons (jump to step). Final CTA "Complete Profile & Generate My Personalized Plan" triggers:
1. Compute `profile_hash`.
2. Upsert profile with `onboarding_completed = true`.
3. Invalidate profile query, call Phase-2 `generate-workout-plan` edge function.
4. Show success animation, redirect to dashboard.

---

## Phase 2 — AI Robustness, Caching, Safety

### 2.1 Edge functions
Refactor `ai-analyze` into focused functions:
- `generate-workout-plan` — input: full profile + `profile_hash`. Strong system prompt referencing ACSM/NSCA/ISSN, injury-first rules, warm-up/cool-down, RPE, progression, form cues. Uses Lovable AI (`google/gemini-2.5-flash`) with JSON response mode + tool/schema:
  ```
  { weeks, days: [{ day_name, focus, exercises: [{ name, sets, reps_or_time, rest_seconds, rpe, notes, muscles_targeted, injury_modification }] }] }
  ```
- `analyze-nutrition` — text meal description → `{ estimated_calories, macros{protein_g,carbs_g,fats_g}, confidence_score, food_items[], suggestions[] }`.
- `ai-vision-meal` — image (Storage URL) → same nutrition schema using a vision-capable model (`google/gemini-2.5-pro`).

All functions: CORS, Zod input validation, 429/402 mapped to friendly messages, log tokens/duration to a new `ai_usage` table.

### 2.2 Caching & versioning
- `workout_plans` already exists; add columns: `profile_hash text`, `generated_at timestamptz`, `version int`, `regen_reason text`.
- Before calling AI: select latest active plan for user; if `profile_hash` matches and not manually invalidated, reuse. Otherwise generate, deactivate old, insert new.
- Manual "Regenerate plan" UI with reason dropdown (Injury improved / New goal / Too easy / Too hard / Other).
- New `ai_usage` table: `user_id, function_name, tokens_in, tokens_out, status, created_at` + own-row RLS. Used for monitoring + future credit system (display "X generations this month").

### 2.3 Frontend AI UX
- `src/components/ai/AILoadingScreen.tsx`: rotating motivational messages ("Analyzing your injuries…", "Building safe progressions…", "Personalizing nutrition…") with progress dots, Framer Motion.
- `useGeneratePlan` hook (TanStack mutation): exponential backoff retry up to 3, surfaces typed errors (rate-limit, quota, network, validation).
- Error fallback card: "We had trouble generating a custom plan. Here's a safe starter — regenerate anytime." with a baked-in safe default plan.
- Global `AIErrorBoundary` around AI-driven pages.
- Optimistic updates + `queryClient.invalidateQueries` on plan/meal mutations.
- Improve `NutritionPage` photo flow → upload to Storage `meals/{uid}/...` → invoke `ai-vision-meal` → autofill meal log form.

### 2.4 Safety
- Every AI output includes a disclaimer field rendered as a small footnote card.
- Injuries always passed into prompt; system prompt forbids contraindicated movements and requires `injury_modification` per exercise.

---

## Technical Notes (for engineers)

- Stack stays exactly as listed; no new heavy libs. (Adds: nothing — RHF, Zod, TanStack Query, Framer Motion, Recharts, date-fns, Lucide, Sonner already present.)
- `profile_hash` = stable JSON.stringify of `{goals, injuries_detailed, equipment, training_days_per_week, session_duration_min, activity_level, dietary_style, allergies}` → SHA-256 hex (Web Crypto).
- Edge functions use `npm:@supabase/supabase-js@2/cors` for CORS and read `LOVABLE_API_KEY` (already set).
- All new tables/columns get RLS limited to `auth.uid() = user_id`.
- No backend logic changes outside the AI layer; existing AppDataContext keeps working — extend it to read new profile fields.

---

## Deliverable order
1. Migration (profiles columns + avatars bucket + ai_usage table + workout_plans columns).
2. Onboarding gate + 7-step wizard + avatar upload.
3. Edge functions rewrite (`generate-workout-plan`, `analyze-nutrition`, `ai-vision-meal`).
4. Caching by `profile_hash` + Regenerate UI + AI loading/error components.
5. Wire wizard finish → plan generation; wire NutritionPage to vision function.
6. Stop and await your confirmation before further work.