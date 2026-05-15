# Architecture

## Current Architecture
- Application: existing Next.js app.
- Language: TypeScript.
- Styling: Tailwind CSS.
- Deployment: Vercel.
- Persistence: browser `localStorage`.
- Backup/restore: JSON export/import workspace backup.
- Supabase foundation: official JavaScript client dependency, safe environment placeholders, and a small browser-client utility are present for future Phase 2 work.
- Current status: live/deployed operational beta.

## Current App Areas
- Meeting Setup / Playbook Definitions.
- Top Priority / Thematic Goal.
- Defining Objectives.
- Tasks with `Planning → In Progress → Completed` workflow.
- Task details modal with descriptions, comments, activity history, and subtasks.
- Standard Operating Objectives.
- Strategic Topics.
- Meeting sections including Agenda Items, Decisions / Actions, and Cascading Communication.
- Backup / Restore.
- RichTextEditor with lightweight formatting.

## Persistence Boundary
Current workspace data is stored in browser `localStorage`. Backup/export/import is the safety mechanism for moving or restoring workspace data. The Supabase foundation does not change read/write behavior, migrate local data, or replace JSON workspace backup.

## Supabase Foundation
- Dependency: `@supabase/supabase-js` is listed as the official Supabase JavaScript client for future cloud features.
- Client utility: `app/lib/supabase/client.ts` centralizes browser-client configuration behind `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Environment placeholders: `.env.example` provides safe keys with no secrets.
- Vercel setup: required deployment variables are documented in `docs/VERCEL_ENVIRONMENT.md`.
- Behavior boundary: no auth UI, login/logout, cloud persistence, realtime collaboration, schema, permissions, or local-to-cloud migration is implemented by this foundation.

## Phase 2 Boundary
Supabase is the likely platform for future cloud/auth/persistence work. Phase 2 should be planned on a separate branch such as `phase-2-cloud`; this documentation does not define a final schema, migration process, realtime model, or permission enforcement.
