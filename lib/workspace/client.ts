// Client-side wrappers around the workspace/RBAC API. Every call attaches the
// Firebase ID token (same scheme as the rest of the app via getAccessToken).

import { getAccessToken } from '@/lib/auth';
import type { Invite, WorkspaceMember, WorkspaceRole, WorkspaceWithRole } from '@/types/workspace';

async function authHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
  }
  return body as T;
}

export async function fetchWorkspaces(): Promise<WorkspaceWithRole[]> {
  const res = await fetch('/api/workspaces', { headers: await authHeaders() });
  return (await parse<{ workspaces: WorkspaceWithRole[] }>(res)).workspaces;
}

export async function createWorkspace(name: string): Promise<WorkspaceWithRole> {
  const res = await fetch('/api/workspaces', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ name }),
  });
  const { workspace } = await parse<{ workspace: WorkspaceWithRole }>(res);
  return { ...workspace, role: 'owner' };
}

export async function renameWorkspace(id: string, name: string): Promise<void> {
  const res = await fetch(`/api/workspaces/${id}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify({ name }),
  });
  await parse(res);
}

export async function deleteWorkspace(id: string): Promise<void> {
  const res = await fetch(`/api/workspaces/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  await parse(res);
}

export async function fetchMembers(id: string): Promise<WorkspaceMember[]> {
  const res = await fetch(`/api/workspaces/${id}/members`, { headers: await authHeaders() });
  return (await parse<{ members: WorkspaceMember[] }>(res)).members;
}

export async function updateMemberRole(
  id: string,
  uid: string,
  role: WorkspaceRole
): Promise<void> {
  const res = await fetch(`/api/workspaces/${id}/members`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify({ uid, role }),
  });
  await parse(res);
}

export async function removeMember(id: string, uid: string): Promise<void> {
  const res = await fetch(`/api/workspaces/${id}/members?uid=${encodeURIComponent(uid)}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  await parse(res);
}

export async function fetchInvites(id: string): Promise<Invite[]> {
  const res = await fetch(`/api/workspaces/${id}/invites`, { headers: await authHeaders() });
  return (await parse<{ invites: Invite[] }>(res)).invites;
}

export async function createInvite(
  id: string,
  email: string,
  role: Exclude<WorkspaceRole, 'owner'>
): Promise<Invite> {
  const res = await fetch(`/api/workspaces/${id}/invites`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ email, role }),
  });
  return (await parse<{ invite: Invite }>(res)).invite;
}

export async function revokeInvite(id: string, inviteId: string): Promise<void> {
  const res = await fetch(`/api/workspaces/${id}/invites?inviteId=${encodeURIComponent(inviteId)}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  await parse(res);
}

export async function acceptInvite(token: string): Promise<{ workspaceId: string; role: WorkspaceRole }> {
  const res = await fetch('/api/invites/accept', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ token }),
  });
  return parse(res);
}
