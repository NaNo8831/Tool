# Vercel Environment Variables

## Supabase Foundation

Phase 2 cloud work expects the following Vercel environment variables to be configured before any Supabase-backed features are enabled:

| Variable | Required for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase client setup | Use the project URL from the Supabase project settings. This value is public in browser builds. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client setup | Use the Supabase anon/public API key. This value is public in browser builds and must be protected by future Row Level Security policies before cloud persistence is enabled. |

Do not commit `.env.local` or any environment file containing real project values. Use `.env.example` for safe local setup placeholders.

The current app behavior remains localStorage-first. These variables prepare the deployment environment for future cloud/auth/persistence work only; they do not enable auth UI, login/logout, cloud persistence, or local-to-cloud migration by themselves.
