"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronsUpDown, Plus, Settings, Loader2 } from "lucide-react";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { createWorkspace } from "@/lib/workspace/client";
import { ROLE_LABELS } from "@/lib/rbac/permissions";

export default function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, activeWorkspaceId, setActiveWorkspaceId, refresh, isLoading } =
    useWorkspace();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    setError(null);
    try {
      const ws = await createWorkspace(name);
      await refresh();
      setActiveWorkspaceId(ws.id);
      setNewName("");
      setCreating(false);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create workspace");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading && !activeWorkspace) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white transition hover:bg-white/10"
      >
        <span className="min-w-0">
          <span className="block truncate font-medium">
            {activeWorkspace?.name ?? "Select workspace"}
          </span>
          {activeWorkspace && (
            <span className="block truncate text-xs text-neutral-400">
              {ROLE_LABELS[activeWorkspace.role]}
            </span>
          )}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-neutral-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full min-w-[16rem] overflow-hidden rounded-lg border border-white/10 bg-[#0e0f12] shadow-xl">
            <div className="max-h-64 overflow-y-auto py-1">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => {
                    setActiveWorkspaceId(ws.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-white transition hover:bg-white/5"
                >
                  <span className="min-w-0">
                    <span className="block truncate">{ws.name}</span>
                    <span className="block truncate text-xs text-neutral-500">
                      {ROLE_LABELS[ws.role]}
                    </span>
                  </span>
                  {ws.id === activeWorkspaceId && <Check className="h-4 w-4 text-emerald-400" />}
                </button>
              ))}
            </div>

            <div className="border-t border-white/10 p-1">
              {creating ? (
                <div className="space-y-2 p-2">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    placeholder="Workspace name"
                    className="w-full rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-white/30"
                  />
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreate}
                      disabled={busy || !newName.trim()}
                      className="flex-1 rounded-md bg-white px-2 py-1.5 text-xs font-medium text-black disabled:opacity-50"
                    >
                      {busy ? "Creating…" : "Create"}
                    </button>
                    <button
                      onClick={() => {
                        setCreating(false);
                        setError(null);
                      }}
                      className="rounded-md px-2 py-1.5 text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-white transition hover:bg-white/5"
                >
                  <Plus className="h-4 w-4" /> New workspace
                </button>
              )}
              <Link
                href="/workspaces"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-neutral-300 transition hover:bg-white/5"
              >
                <Settings className="h-4 w-4" /> Manage workspaces
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
