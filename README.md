# Meeting Tool

Meeting Tool by LyArk is a lightweight operational leadership meeting tool for structured weekly leadership meetings. The current live beta is a Next.js application deployed on Vercel.

## Current Persistence

The app currently stores workspace data in the browser through `localStorage`. JSON export/import backup remains the supported way to move or restore a workspace, and that backup behavior must be preserved as cloud features are planned.

## Getting Started

Copy the safe placeholder environment file if you are preparing Phase 2 Supabase work:

```bash
cp .env.example .env.local
```

Leave the Supabase values blank unless you are working with a real Supabase project:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Supabase Foundation

The repo includes a small Supabase browser-client utility at `app/lib/supabase/client.ts` and safe placeholders in `.env.example`. This is foundation work only: it does not add auth UI, login/logout, cloud persistence, local-to-cloud migration, or any change to the current localStorage behavior.

Required Vercel variables for future Supabase-backed features are documented in `docs/VERCEL_ENVIRONMENT.md`.

## Validation

For app-code changes, run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Deploy on Vercel

The app deploys through Vercel with the default Next.js settings. Current production behavior remains browser-local; future cloud features should be developed against the `phase-2-cloud` branch and should keep JSON export/import backup available.
