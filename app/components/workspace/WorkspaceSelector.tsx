"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  isSupabaseConfigured,
  supabaseWorkspaceClient,
  type SupabaseAuthSession,
  type SupabaseWorkspace,
} from "@/app/lib/supabaseClient";

type WorkspaceMode = "local" | "cloud";

type WorkspaceSelectorProps = {
  session: SupabaseAuthSession | null;
};

type WorkspaceMessage = {
  type: "success" | "error";
  text: string;
};

const selectedCloudWorkspaceStorageKeyPrefix =
  "meeting-tool-selected-cloud-workspace-id";

const getSelectedCloudWorkspaceStorageKey = (userId: string) =>
  `${selectedCloudWorkspaceStorageKeyPrefix}:${userId}`;

const readStoredCloudWorkspaceId = (userId: string) => {
  if (typeof window === "undefined") return "";

  return (
    window.localStorage.getItem(getSelectedCloudWorkspaceStorageKey(userId)) ??
    ""
  );
};

const writeStoredCloudWorkspaceId = (userId: string, workspaceId: string) => {
  if (typeof window === "undefined") return;

  const storageKey = getSelectedCloudWorkspaceStorageKey(userId);
  if (workspaceId) {
    window.localStorage.setItem(storageKey, workspaceId);
    return;
  }

  window.localStorage.removeItem(storageKey);
};

export function WorkspaceSelector({ session }: WorkspaceSelectorProps) {
  const [selectedCloudWorkspaceId, setSelectedCloudWorkspaceId] = useState("");
  const [hasLoadedWorkspaceSelection, setHasLoadedWorkspaceSelection] =
    useState(false);
  const [workspaces, setWorkspaces] = useState<SupabaseWorkspace[]>([]);
  const [workspaceOwnerId, setWorkspaceOwnerId] = useState<string | null>(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [message, setMessage] = useState<WorkspaceMessage | null>(null);

  const visibleWorkspaces = useMemo(
    () =>
      session && workspaceOwnerId === session.user.id ? workspaces : [],
    [session, workspaceOwnerId, workspaces],
  );
  const selectedWorkspace = useMemo(
    () =>
      visibleWorkspaces.find(
        (workspace) => workspace.id === selectedCloudWorkspaceId,
      ) ?? null,
    [selectedCloudWorkspaceId, visibleWorkspaces],
  );
  const effectiveWorkspaceMode: WorkspaceMode = selectedWorkspace
    ? "cloud"
    : "local";

  useEffect(() => {
    let isMounted = true;

    const loadWorkspaces = async () => {
      await Promise.resolve();
      if (!isMounted) return;

      setHasLoadedWorkspaceSelection(false);
      setSelectedCloudWorkspaceId("");
      setWorkspaces([]);
      setWorkspaceOwnerId(null);
      setMessage(null);

      if (!session || !isSupabaseConfigured) {
        setIsLoadingWorkspaces(false);
        setHasLoadedWorkspaceSelection(true);
        return;
      }

      setIsLoadingWorkspaces(true);

      try {
        const nextWorkspaces = await supabaseWorkspaceClient.listWorkspaces(
          session.accessToken,
        );
        if (!isMounted) return;

        const storedWorkspaceId = readStoredCloudWorkspaceId(session.user.id);
        const storedWorkspaceBelongsToUser = nextWorkspaces.some(
          (workspace) => workspace.id === storedWorkspaceId,
        );

        if (storedWorkspaceId && !storedWorkspaceBelongsToUser) {
          writeStoredCloudWorkspaceId(session.user.id, "");
        }

        setWorkspaces(nextWorkspaces);
        setWorkspaceOwnerId(session.user.id);
        setSelectedCloudWorkspaceId(
          storedWorkspaceBelongsToUser ? storedWorkspaceId : "",
        );
      } catch (error) {
        if (!isMounted) return;

        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Cloud workspaces could not be loaded.",
        });
      } finally {
        if (isMounted) {
          setIsLoadingWorkspaces(false);
          setHasLoadedWorkspaceSelection(true);
        }
      }
    };

    void loadWorkspaces();

    return () => {
      isMounted = false;
    };
  }, [session]);

  useEffect(() => {
    if (!session || !hasLoadedWorkspaceSelection) return;

    writeStoredCloudWorkspaceId(session.user.id, selectedCloudWorkspaceId);
  }, [hasLoadedWorkspaceSelection, selectedCloudWorkspaceId, session]);

  const selectLocalWorkspace = () => {
    setSelectedCloudWorkspaceId("");
    setMessage(null);
  };

  const selectCloudWorkspace = (workspaceId: string) => {
    setSelectedCloudWorkspaceId(workspaceId);
    setMessage(null);
  };

  const handleCreateWorkspace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session || isCreatingWorkspace) return;

    const trimmedName = newWorkspaceName.trim();
    if (!trimmedName) {
      setMessage({ type: "error", text: "Name the cloud workspace first." });
      return;
    }

    setIsCreatingWorkspace(true);
    setMessage(null);

    try {
      const workspace = await supabaseWorkspaceClient.createWorkspace({
        accessToken: session.accessToken,
        ownerId: session.user.id,
        name: trimmedName,
      });

      setWorkspaces((currentWorkspaces) => [workspace, ...currentWorkspaces]);
      setWorkspaceOwnerId(session.user.id);
      setSelectedCloudWorkspaceId(workspace.id);
      setNewWorkspaceName("");
      setMessage({
        type: "success",
        text: "Cloud workspace container created. Local data was not migrated.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Cloud workspace could not be created.",
      });
    } finally {
      setIsCreatingWorkspace(false);
    }
  };

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm sm:w-96">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold uppercase tracking-wide text-blue-600">
            Workspace
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {effectiveWorkspaceMode === "cloud" && selectedWorkspace
              ? selectedWorkspace.name
              : "Local Workspace"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Mode:{" "}
            {effectiveWorkspaceMode === "cloud"
              ? "Cloud Workspace"
              : "Local Workspace"}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            effectiveWorkspaceMode === "cloud"
              ? "bg-blue-100 text-blue-700"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {effectiveWorkspaceMode === "cloud" ? "Cloud" : "Local"}
        </span>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Cloud workspaces only save the selected container for now. Meeting data,
        backup, and restore continue to use this browser&apos;s local workspace.
      </p>

      {!session ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Sign in to create or select cloud workspaces. Signed-out users can keep
          using Local Workspace.
        </p>
      ) : !isSupabaseConfigured ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Supabase is not configured in this environment, so cloud workspaces are
          unavailable.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <select
              value={selectedCloudWorkspaceId}
              onChange={(event) => selectCloudWorkspace(event.target.value)}
              disabled={isLoadingWorkspaces || visibleWorkspaces.length === 0}
              className="min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Select cloud workspace"
            >
              <option value="" disabled>
                {visibleWorkspaces.length === 0
                  ? "No cloud workspaces yet"
                  : "Select Cloud Workspace"}
              </option>
              {visibleWorkspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={selectLocalWorkspace}
              className="rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Use Local
            </button>
          </div>

          <form
            className="grid gap-2 sm:grid-cols-[1fr_auto]"
            onSubmit={handleCreateWorkspace}
          >
            <input
              type="text"
              value={newWorkspaceName}
              onChange={(event) => setNewWorkspaceName(event.target.value)}
              maxLength={80}
              placeholder="New cloud workspace name"
              className="min-w-0 rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="submit"
              disabled={isCreatingWorkspace}
              className="rounded-xl bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingWorkspace ? "Creating…" : "Create"}
            </button>
          </form>

          {isLoadingWorkspaces ? (
            <p className="text-xs text-slate-500">Loading cloud workspaces…</p>
          ) : null}
        </div>
      )}

      {message ? (
        <p
          className={`mt-3 rounded-xl border px-3 py-2 text-xs ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      ) : null}
    </section>
  );
}
