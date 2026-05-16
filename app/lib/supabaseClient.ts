const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export type SupabaseAuthUser = {
  id: string;
  email: string;
};

export type SupabaseAuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: SupabaseAuthUser;
};

type SupabaseAuthUserResponse = {
  id?: string;
  email?: string;
};

type SupabaseAuthResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  user?: SupabaseAuthUserResponse | null;
  error?: string;
  error_description?: string;
  msg?: string;
};

const getRestUrl = (table: string) => {
  if (!supabaseUrl) {
    throw new Error("Supabase URL is not configured.");
  }

  return `${supabaseUrl}/rest/v1/${table}`;
};

const getAuthUrl = (path: string) => {
  if (!supabaseUrl) {
    throw new Error("Supabase URL is not configured.");
  }

  return `${supabaseUrl}/auth/v1${path}`;
};

const getSupabaseHeaders = (accessToken?: string) => {
  if (!supabaseAnonKey) {
    throw new Error("Supabase anon key is not configured.");
  }

  return {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${accessToken ?? supabaseAnonKey}`,
    "Content-Type": "application/json",
  };
};

const getAuthHeaders = (accessToken?: string) => {
  return getSupabaseHeaders(accessToken);
};

const getAuthErrorMessage = async (response: Response) => {
  try {
    const body = (await response.json()) as SupabaseAuthResponse;
    return (
      body.error_description ||
      body.msg ||
      body.error ||
      `Supabase Auth request failed with status ${response.status}.`
    );
  } catch {
    return `Supabase Auth request failed with status ${response.status}.`;
  }
};

const normalizeSession = (
  response: SupabaseAuthResponse,
): SupabaseAuthSession | null => {
  if (!response.access_token || !response.refresh_token || !response.user?.id) {
    return null;
  }

  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresAt:
      response.expires_at ??
      Math.floor(Date.now() / 1000) + (response.expires_in ?? 3600),
    user: {
      id: response.user.id,
      email: response.user.email ?? "Signed in user",
    },
  };
};

export const supabaseAuthClient = {
  async signUp(email: string, password: string) {
    const response = await fetch(getAuthUrl("/signup"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(await getAuthErrorMessage(response));
    }

    return normalizeSession((await response.json()) as SupabaseAuthResponse);
  },

  async signIn(email: string, password: string) {
    const response = await fetch(getAuthUrl("/token?grant_type=password"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(await getAuthErrorMessage(response));
    }

    const session = normalizeSession(
      (await response.json()) as SupabaseAuthResponse,
    );
    if (!session) {
      throw new Error("Supabase did not return a sign-in session.");
    }

    return session;
  },

  async refreshSession(refreshToken: string) {
    const response = await fetch(
      getAuthUrl("/token?grant_type=refresh_token"),
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ refresh_token: refreshToken }),
      },
    );

    if (!response.ok) {
      throw new Error(await getAuthErrorMessage(response));
    }

    const session = normalizeSession(
      (await response.json()) as SupabaseAuthResponse,
    );
    if (!session) {
      throw new Error("Supabase did not return a refreshed session.");
    }

    return session;
  },

  async getUser(accessToken: string) {
    const response = await fetch(getAuthUrl("/user"), {
      method: "GET",
      headers: getAuthHeaders(accessToken),
    });

    if (!response.ok) {
      throw new Error(await getAuthErrorMessage(response));
    }

    const user = (await response.json()) as SupabaseAuthUserResponse;
    if (!user.id) {
      throw new Error("Supabase did not return the current user.");
    }

    return {
      id: user.id,
      email: user.email ?? "Signed in user",
    } satisfies SupabaseAuthUser;
  },

  async signOut(accessToken: string) {
    const response = await fetch(getAuthUrl("/logout"), {
      method: "POST",
      headers: getAuthHeaders(accessToken),
    });

    if (!response.ok) {
      throw new Error(await getAuthErrorMessage(response));
    }
  },
};


export type SupabaseFeedbackType =
  | "Bug"
  | "UX Friction"
  | "Suggestion"
  | "Confusing Workflow";

export type SupabaseFeedbackSeverity = "Minor" | "Blocking";

export type SupabaseFeedbackInsert = {
  user_id: string | null;
  user_email: string | null;
  type: SupabaseFeedbackType;
  severity: SupabaseFeedbackSeverity;
  note: string;
  intent: string | null;
  page: string;
  browser: string;
  app_version: string | null;
  workspace_snapshot: Record<string, unknown> | null;
  metadata_json: Record<string, unknown> | null;
};

const getFeedbackErrorMessage = async (response: Response) => {
  try {
    const body = (await response.json()) as {
      message?: string;
      error?: string;
      details?: string;
    };

    return (
      body.message ||
      body.error ||
      body.details ||
      `Feedback request failed with status ${response.status}.`
    );
  } catch {
    return `Feedback request failed with status ${response.status}.`;
  }
};

export const supabaseFeedbackClient = {
  async submitFeedback({
    accessToken,
    feedback,
  }: {
    accessToken?: string;
    feedback: SupabaseFeedbackInsert;
  }) {
    const response = await fetch(getRestUrl("feedback"), {
      method: "POST",
      headers: {
        ...getSupabaseHeaders(accessToken),
        Prefer: "return=minimal",
      },
      body: JSON.stringify(feedback),
    });

    if (!response.ok) {
      throw new Error(await getFeedbackErrorMessage(response));
    }
  },
};
