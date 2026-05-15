# Meeting Tool Operating Instructions

## Product Context
- Product: Meeting Tool by LyArk.
- Repository: Meeting-Tool.
- Purpose: lightweight operational leadership meeting tool for structured weekly leadership meetings.
- Primary use: help leadership teams track the current top priority, defining objectives, tasks, standard operating objectives, strategic topics, meeting items, decisions/actions, and cascading communication.
- Status: live/deployed operational beta on Vercel.
- Current persistence: browser `localStorage` with JSON export/import workspace backup.
- Phase 2 direction: Supabase is the likely cloud/auth/persistence platform, but schema and migration details are unresolved.

## First Files to Read
Before changing implementation, read:
1. `planning/STATE.md` for the current project snapshot.
2. `planning/DECISIONS.md` for durable operating decisions.
3. `planning/DOMAIN.md` for terminology and meeting model.
4. `planning/RISKS.md` and `planning/QUESTIONS.md` for known risks and unresolved items.
5. The active sprint files under `planning/sprints/` when the task is sprint-related.
6. Relevant docs under `docs/` for architecture, data model, validation, and permissions.

## Operating Rules
- Do not overbuild. Keep Phase 1 focused on operational usability, stability, and meeting-friendly UX.
- Avoid turning the product into a heavy project management system.
- Do not make broad product decisions without documenting assumptions and open questions.
- Preserve export/import backup capability even after cloud persistence is introduced.
- Meeting Setup is part of the current `main` baseline after PR #23; when working from other branches, verify branch contents before assuming it is present.
- Update `planning/STATE.md` when work changes current project state, active work, parked work, or next actions.
- Update `planning/DECISIONS.md` only when a durable product, architecture, branch, or operating decision is made.
- Keep planning and documentation concise, specific, and operational; remove generic AI advice.

## Branch Strategy
- `main` is production/stable and deploys to Vercel.
- `main` is the base for production UX stabilization and operational fixes.
- `phase-2-cloud` is the long-running branch for future cloud/auth/storage work.
- UX fixes should branch from `main`.
- Cloud/auth/storage work should branch from `phase-2-cloud`.
- Periodically merge `main` into `phase-2-cloud` to reduce drift.
- Confirm branch context before implementing; multiple Codex PRs can drift if branch purpose is unclear.

## Current Architecture
- Next.js app using TypeScript and Tailwind CSS.
- Vercel deployment.
- Browser `localStorage` persistence through app hooks and workspace backup utilities.
- JSON export/import backs up workspace data and should remain available.
- Major product areas include Meeting Setup, Playbook Definitions, Top Priority, Defining Objectives, Tasks, task details, comments, activity history, subtasks, Standard Operating Objectives, Strategic Topics, meeting sections, agenda items, decisions/actions, cascading communication, Backup/Restore, and lightweight RichTextEditor formatting.
- Supabase cloud/auth/persistence is planned for Phase 2; do not implement it unless the task explicitly targets Phase 2 cloud work on the correct branch.

## Testing Expectations
- For documentation-only changes, confirm the diff is docs/planning only; lint, typecheck, and build are not required unless implementation files changed.
- For app-code changes, run the relevant checks when practical:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm run build`
- Manually test meeting-critical flows after UI/data changes, including task workflow, task details, rich text editing, drag/drop interactions, meeting sections, and Backup/Restore.
- Use Vercel preview testing before merging user-facing changes.

## Do Not Overbuild
- Prefer small, reversible changes.
- Keep UI lightweight and usable during live meetings.
- Protect existing local workspace data.
- Flag assumptions rather than encoding uncertain Phase 2 behavior.
- Do not add production code, new frameworks, database schema, auth, or migrations as part of planning-only work.
