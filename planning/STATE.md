# Project State

## Current Snapshot

- Product: Meeting Tool by LyArk in the `Meeting-Tool` repo.
- Status: live/deployed operational beta.
- Deployment: Vercel.
- Persistence: browser `localStorage`.
- Backup: JSON export/import workspace backup.
- Current focus: production UX stabilization, Meeting Setup follow-through, and Phase 2 cloud-support foundations.
- Current branch note: Feedback Widget Foundation is based from the updated `phase-2-cloud` branch context.

## Production State

- The app supports lightweight leadership meeting operations around Meeting Setup, Playbook Definitions, Top Priority, Defining Objectives, tasks, Standard Operating Objectives, Strategic Topics, meeting sections, and Cascading Communication.
- Tasks follow the workflow `Planning → In Progress → Completed` and include details, descriptions, comments, activity history, and subtasks.
- RichTextEditor provides lightweight formatting for applicable descriptions/content.

## Active Work

- Feedback Widget Foundation adds lightweight Supabase-backed tester feedback collection for Phase 2 development without creating ticket workflow scope.
- Keep the 120x operating structure accurate through lightweight planning and documentation maintenance.
- Keep `main` stable for production and UX stabilization.
- Treat the Meeting Setup flow as part of the current production baseline on `main` after PR #23.

## Parked / Deferred Work
- Phase 2 cloud/auth/persistence work is deferred to the long-running `phase-2-cloud` branch. Do not begin Phase 2 feature implementation from `main`.

## Next Actions

- Use the planning files as the source of truth before future changes.
- Continue Phase 1 operational usability and stability improvements.
- Validate Feedback Widget Foundation on a Supabase-configured preview, including authenticated and anonymous feedback submissions.
- Plan Supabase schema, permissions, and local-to-cloud migration before implementing cloud persistence.
