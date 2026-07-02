// Server-side workspace access layer. All reads/writes here use the Admin SDK
// (bypasses Firestore rules), so THIS is where server enforcement lives — every
// API route must go through requireMembership / requirePermission before
// touching workspace-scoped data. The Firestore rules are the second line of
// defense for any direct client reads.

import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/server';
import { ApiError } from '@/lib/api-auth';
import { can } from '@/lib/rbac/permissions';
import type {
  Permission,
  Workspace,
  WorkspaceMember,
  WorkspaceRole,
  WorkspaceWithRole,
} from '@/types/workspace';

function tsToIso(value: unknown): string {
  const v = value as { toDate?: () => Date } | Date | undefined;
  if (v && typeof (v as { toDate?: () => Date }).toDate === 'function') {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  if (v instanceof Date) return v.toISOString();
  return new Date().toISOString();
}

function workspaceFromDoc(id: string, data: FirebaseFirestore.DocumentData): Workspace {
  return {
    id,
    name: data.name,
    ownerId: data.ownerId,
    personal: !!data.personal,
    createdAt: tsToIso(data.createdAt),
    createdBy: data.createdBy || data.ownerId,
  };
}

function memberFromDoc(data: FirebaseFirestore.DocumentData): WorkspaceMember {
  return {
    uid: data.uid,
    workspaceId: data.workspaceId,
    role: data.role,
    email: data.email ?? null,
    displayName: data.displayName ?? null,
    joinedAt: tsToIso(data.joinedAt),
    invitedBy: data.invitedBy ?? null,
  };
}

export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
  const snap = await adminDb.collection('workspaces').doc(workspaceId).get();
  if (!snap.exists) return null;
  return workspaceFromDoc(snap.id, snap.data()!);
}

export async function getMembership(
  workspaceId: string,
  uid: string
): Promise<WorkspaceMember | null> {
  const snap = await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members')
    .doc(uid)
    .get();
  if (!snap.exists) return null;
  return memberFromDoc(snap.data()!);
}

// Throws 404 if the workspace is missing, 403 if the user isn't a member.
// Returns the caller's membership so handlers can inspect their role.
export async function requireMembership(
  workspaceId: string,
  uid: string
): Promise<WorkspaceMember> {
  const ws = await getWorkspace(workspaceId);
  if (!ws) throw new ApiError(404, 'Workspace not found');
  const membership = await getMembership(workspaceId, uid);
  if (!membership) throw new ApiError(403, 'You are not a member of this workspace');
  return membership;
}

export async function requirePermission(
  workspaceId: string,
  uid: string,
  permission: Permission
): Promise<WorkspaceMember> {
  const membership = await requireMembership(workspaceId, uid);
  if (!can(membership.role, permission)) {
    throw new ApiError(403, `Your role (${membership.role}) cannot perform this action`);
  }
  return membership;
}

export async function listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const snap = await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members')
    .get();
  return snap.docs.map((d) => memberFromDoc(d.data()));
}

// Lists every workspace the user belongs to, with their role. Reads the
// denormalized `workspaceIds` array (+ personalWorkspaceId) off the user doc so
// it needs no collection-group index. Membership is re-verified per workspace.
export async function getUserWorkspaces(uid: string): Promise<WorkspaceWithRole[]> {
  const userSnap = await adminDb.collection('users').doc(uid).get();
  const data = userSnap.data() || {};
  const ids = new Set<string>();
  if (Array.isArray(data.workspaceIds)) for (const id of data.workspaceIds) ids.add(id);
  if (data.personalWorkspaceId) ids.add(data.personalWorkspaceId);

  const results: WorkspaceWithRole[] = [];
  for (const wid of ids) {
    const ws = await getWorkspace(wid);
    if (!ws) continue;
    const membership = await getMembership(wid, uid);
    if (!membership) continue; // stale id: not actually a member
    results.push({ ...ws, role: membership.role });
  }
  // Personal workspace first, then alphabetical.
  results.sort((a, b) => {
    if (a.personal !== b.personal) return a.personal ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return results;
}

interface CreateWorkspaceInput {
  uid: string;
  email: string | null;
  displayName: string | null;
  name: string;
  personal?: boolean;
}

// Creates a workspace and its owner membership atomically.
export async function createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
  const { uid, email, displayName, name, personal = false } = input;
  const wsRef = adminDb.collection('workspaces').doc();
  const memberRef = wsRef.collection('members').doc(uid);

  const batch = adminDb.batch();
  batch.set(wsRef, {
    name,
    ownerId: uid,
    createdBy: uid,
    personal,
    createdAt: FieldValue.serverTimestamp(),
  });
  batch.set(memberRef, {
    uid,
    workspaceId: wsRef.id,
    role: 'owner' as WorkspaceRole,
    email,
    displayName,
    invitedBy: null,
    joinedAt: FieldValue.serverTimestamp(),
  });
  batch.set(
    adminDb.collection('users').doc(uid),
    { workspaceIds: FieldValue.arrayUnion(wsRef.id) },
    { merge: true }
  );
  await batch.commit();

  return {
    id: wsRef.id,
    name,
    ownerId: uid,
    createdBy: uid,
    personal,
    createdAt: new Date().toISOString(),
  };
}

// Idempotently ensures the user has a personal workspace. Called on login.
// Records the id on the user doc (`personalWorkspaceId`) so it runs the
// expensive path only once per user.
export async function ensurePersonalWorkspace(
  uid: string,
  email: string | null,
  displayName: string | null
): Promise<string> {
  const userRef = adminDb.collection('users').doc(uid);
  const userSnap = await userRef.get();
  const existing = userSnap.data()?.personalWorkspaceId as string | undefined;
  if (existing) {
    const stillThere = await adminDb.collection('workspaces').doc(existing).get();
    if (stillThere.exists) return existing;
  }

  const ws = await createWorkspace({
    uid,
    email,
    displayName,
    name: 'Personal',
    personal: true,
  });
  await userRef.set({ personalWorkspaceId: ws.id }, { merge: true });
  return ws.id;
}

// Adds or updates a member (used by invite-accept and role changes). Writes the
// member subdoc under the workspace.
export async function upsertMember(params: {
  workspaceId: string;
  uid: string;
  role: WorkspaceRole;
  email: string | null;
  displayName: string | null;
  invitedBy: string | null;
}): Promise<void> {
  const { workspaceId, uid, role, email, displayName, invitedBy } = params;
  await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members')
    .doc(uid)
    .set(
      {
        uid,
        workspaceId,
        role,
        email,
        displayName,
        invitedBy,
        joinedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  // Denormalize onto the member's user doc so getUserWorkspaces finds it.
  await adminDb
    .collection('users')
    .doc(uid)
    .set({ workspaceIds: FieldValue.arrayUnion(workspaceId) }, { merge: true });
}

export async function setMemberRole(
  workspaceId: string,
  uid: string,
  role: WorkspaceRole
): Promise<void> {
  await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members')
    .doc(uid)
    .update({ role });
}

export async function removeMember(workspaceId: string, uid: string): Promise<void> {
  await adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('members')
    .doc(uid)
    .delete();
  await adminDb
    .collection('users')
    .doc(uid)
    .set({ workspaceIds: FieldValue.arrayRemove(workspaceId) }, { merge: true });
}
