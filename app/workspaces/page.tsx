"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Loader2, Trash2, UserPlus } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
import Select from "@/components/Select";
import { useWorkspace } from "@/components/WorkspaceProvider";
import {
  assignableRoles,
  can,
  canActOnMember,
  ROLE_LABELS,
} from "@/lib/rbac/permissions";
import {
  createInvite,
  fetchInvites,
  fetchMembers,
  removeMember,
  revokeInvite,
  updateMemberRole,
} from "@/lib/workspace/client";
import type { Invite, WorkspaceMember, WorkspaceRole } from "@/types/workspace";

export default function WorkspacesPage() {
  return (
    <AuthGuard>
      <ManageWorkspaces />
    </AuthGuard>
  );
}

function ManageWorkspaces() {
  const { activeWorkspace, activeWorkspaceId, activeRole } = useWorkspace();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("member");
  const [inviting, setInviting] = useState(false);

  const canManageMembers = activeRole ? can(activeRole, "members:invite") : false;
  const canChangeRoles = activeRole ? can(activeRole, "members:update_role") : false;

  const load = useCallback(async () => {
    if (!activeWorkspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const [m, inv] = await Promise.all([
        fetchMembers(activeWorkspaceId),
        can(activeRole ?? "viewer", "members:invite")
          ? fetchInvites(activeWorkspaceId)
          : Promise.resolve([]),
      ]);
      setMembers(m);
      setInvites(inv);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load workspace");
    } finally {
      setLoading(false);
    }
  }, [activeWorkspaceId, activeRole]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleInvite() {
    if (!activeWorkspaceId || !inviteEmail.trim()) return;
    setInviting(true);
    setError(null);
    try {
      await createInvite(activeWorkspaceId, inviteEmail.trim(), inviteRole as Exclude<WorkspaceRole, "owner">);
      setInviteEmail("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send invite");
    } finally {
      setInviting(false);
    }
  }

  async function handleRoleChange(uid: string, role: WorkspaceRole) {
    if (!activeWorkspaceId) return;
    try {
      await updateMemberRole(activeWorkspaceId, uid, role);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update role");
    }
  }

  async function handleRemove(uid: string) {
    if (!activeWorkspaceId) return;
    try {
      await removeMember(activeWorkspaceId, uid);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove member");
    }
  }

  async function handleRevoke(inviteId: string) {
    if (!activeWorkspaceId) return;
    try {
      await revokeInvite(activeWorkspaceId, inviteId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to revoke invite");
    }
  }

  function copyInviteLink(token: string) {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard?.writeText(link);
  }

  const grantable = activeRole ? assignableRoles(activeRole) : [];

  return (
    <div className="min-h-screen bg-[#07080a] text-white">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <Link
          href="/chat"
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to app
        </Link>

        <h1 className="text-2xl font-semibold">Workspaces</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Switch workspace, manage members, and control access by role.
        </p>

        <div className="mt-6 max-w-sm">
          <WorkspaceSwitcher />
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-10 flex items-center gap-2 text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading members…
          </div>
        ) : (
          <>
            {/* Invite */}
            {canManageMembers && (
              <section className="mt-8 rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <h2 className="flex items-center gap-2 text-sm font-medium">
                  <UserPlus className="h-4 w-4" /> Invite a member
                </h2>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@example.com"
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30"
                  />
                  <Select
                    ariaLabel="Invite role"
                    variant="field"
                    size="md"
                    value={inviteRole}
                    onChange={(v) => setInviteRole(v as WorkspaceRole)}
                    options={grantable.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
                  />
                  <button
                    onClick={handleInvite}
                    disabled={inviting || !inviteEmail.trim()}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
                  >
                    {inviting ? "Sending…" : "Invite"}
                  </button>
                </div>
              </section>
            )}

            {/* Members */}
            <section className="mt-6">
              <h2 className="mb-2 text-sm font-medium text-neutral-300">
                Members ({members.length})
              </h2>
              <div className="divide-y divide-white/5 rounded-xl border border-white/10">
                {members.map((m) => {
                  const editable =
                    canChangeRoles && activeRole ? canActOnMember(activeRole, m.role) : false;
                  return (
                    <div key={m.uid} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm">{m.displayName || m.email || m.uid}</p>
                        <p className="truncate text-xs text-neutral-500">{m.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {editable ? (
                          <Select
                            ariaLabel="Member role"
                            variant="field"
                            size="sm"
                            align="right"
                            value={m.role}
                            onChange={(v) => handleRoleChange(m.uid, v as WorkspaceRole)}
                            options={[...grantable, m.role]
                              .filter((v, i, a) => a.indexOf(v) === i)
                              .map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
                          />
                        ) : (
                          <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-neutral-300">
                            {ROLE_LABELS[m.role]}
                          </span>
                        )}
                        {editable && (
                          <button
                            onClick={() => handleRemove(m.uid)}
                            title="Remove member"
                            className="rounded-md p-1.5 text-neutral-500 transition hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Pending invites */}
            {canManageMembers && invites.length > 0 && (
              <section className="mt-6">
                <h2 className="mb-2 text-sm font-medium text-neutral-300">
                  Pending invites ({invites.length})
                </h2>
                <div className="divide-y divide-white/5 rounded-xl border border-white/10">
                  {invites.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm">{inv.email}</p>
                        <p className="text-xs text-neutral-500">{ROLE_LABELS[inv.role]} · pending</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyInviteLink(inv.token)}
                          title="Copy invite link"
                          className="rounded-md p-1.5 text-neutral-400 transition hover:bg-white/5 hover:text-white"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRevoke(inv.id)}
                          title="Revoke invite"
                          className="rounded-md p-1.5 text-neutral-500 transition hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!canManageMembers && (
              <p className="mt-6 text-xs text-neutral-500">
                Your role ({activeRole ? ROLE_LABELS[activeRole] : "—"}) has read-only access to member
                management.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
