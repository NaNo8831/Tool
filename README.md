# Meeting Tool

Meeting Tool by LyArk is a lightweight operational leadership meeting tool for structured weekly leadership meetings. It supports Meeting Setup, Playbook Definitions, Top Priority / Thematic Goal, Defining Objectives, tasks, Standard Operating Objectives, Strategic Topics, meeting notes, decisions/actions, cascading communication, and JSON workspace backup/restore.

## Current Architecture

- Next.js app using TypeScript and Tailwind CSS.
- Deployed on Vercel from the production/stable `main` branch.
- Phase 1 persistence is browser `localStorage` with JSON export/import backup.
- No production database, authentication, or cloud storage is required for Phase 1.
- Supabase cloud/auth/persistence is planned for Phase 2 on the long-running `phase-2-cloud` branch; schema, permissions, migration, and realtime details are still unresolved.

## Environment Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the local development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in a browser.

No `.env` file or external service credentials are required for the current localStorage-first app. If Phase 2 Supabase work begins later, document any required environment variables on the `phase-2-cloud` branch before relying on them.

## Validation Commands

Run these checks for app-code changes and when doing a full maintenance verification:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

For documentation-only changes, confirm the diff is limited to docs/planning/instruction files unless a full validation run is explicitly requested.

## Deployment

Vercel uses the default Next.js install, build, and output settings. Keep JSON export/import available even after future cloud persistence is introduced so users retain a backup and recovery path.

## Contributor Context

Read `AGENTS.md` first for canonical operating instructions, then review the planning source of truth under `planning/` and the architecture notes under `docs/` before changing implementation.
