# Project State

## Current Snapshot

- Product: Meeting Tool by LyArk in the `Meeting-Tool` repo.
- Status: live/deployed operational beta.
- Deployment: Vercel.
- Persistence: browser `localStorage`.
- Backup: JSON export/import workspace backup.
- Current focus: production UX stabilization, Meeting Setup follow-through, and Phase 2 cloud-support foundations.
- Current branch note: Cloud Workspace Foundation is based from the updated `phase-2-cloud` branch context.

## Production State

- The app supports lightweight leadership meeting operations around Meeting Setup, Playbook Definitions, Top Priority, Defining Objectives, tasks, Standard Operating Objectives, Strategic Topics, meeting sections, and Cascading Communication.
- Tasks follow the workflow `Planning → In Progress → Completed` and include details, descriptions, comments, activity history, and subtasks.
- RichTextEditor provides lightweight formatting for applicable descriptions/content.

## Active Work

- Cloud Workspace Foundation adds a lightweight Local Workspace / Cloud Workspace mode and owner-only Supabase workspace containers with per-user selection state, without moving full workspace data out of `localStorage`.
- Keep the 120x operating structure accurate through lightweight planning and documentation maintenance.
- Keep `main` stable for production and UX stabilization.
- Treat the Meeting Setup flow as part of the current production baseline on `main` after PR #23.

## Parked / Deferred Work
- Full Phase 2 cloud persistence remains deferred. Cloud workspace containers are available on `phase-2-cloud`, but objectives, tasks, meetings, setup fields, SOOs, and Strategic Topics remain localStorage-backed.

## Next Actions

- Use the planning files as the source of truth before future changes.
- Continue Phase 1 operational usability and stability improvements.
- Validate Cloud Workspace Foundation on a Supabase-configured preview, including signed-out local mode, signed-in create/select/switch behavior, user-scoped workspace selection, owner-only RLS, existing localStorage data, export/import, and Feedback Widget behavior.
- Plan full cloud persistence schema and local-to-cloud migration before saving Meeting Tool workspace data to Supabase.
