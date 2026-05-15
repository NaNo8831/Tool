const supabasePackageName = "@supabase/supabase-js";

type SupabaseClientFactory = (
  supabaseUrl: string,
  supabaseAnonKey: string,
) => unknown;

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export const isSupabaseConfigured = Boolean(
  supabaseConfig.url && supabaseConfig.anonKey,
);

export async function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const { createClient } = (await import(supabasePackageName)) as {
    createClient: SupabaseClientFactory;
  };

  return createClient(supabaseConfig.url, supabaseConfig.anonKey);
}
