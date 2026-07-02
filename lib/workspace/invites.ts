// Email-based workspace invites. Invites live at top-level `invites/{id}` (not
// under the workspace) so an invited user can look theirs up by token before
// they are a member. Acceptance is server-verified: the logged-in user's email
// must match the invite.

import { randomUUID } from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/server';
import { ApiError } from '@/lib/api-auth';
import { upsertMember } from '@/lib/workspace/server';
import type { Invite, WorkspaceRole } from '@/types/workspace';

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function tsToIso(value: unknown): string {
  const v = value as { toDate?: () => Date } | Date | undefined;
  if (v && typeof (v as { toDate?: () => Date }).toDate === 'function') {
    return (v as { toDate: () => Date }).toDate().toISOString();
  }
  if (v instanceof Date) return v.toISOString();
  return new Date().toISOString();
}

function inviteFromDoc(id: string, data: FirebaseFirestore.DocumentData): Invite {
  return {
    id,
    workspaceId: data.workspaceId,
    workspaceName: data.workspaceName || '',
    email: data.email,
    role: data.role,
    token: data.token,
    status: data.status,
    invitedBy: data.invitedBy,
    createdAt: tsToIso(data.createdAt),
    expiresAt: tsToIso(data.expiresAt),
  };
}

export async function createInvite(params: {
  workspaceId: string;
  workspaceName: string;
  email: string;
  role: Exclude<WorkspaceRole, 'owner'>;
  invitedBy: string;
}): Promise<Invite> {
  const { workspaceId, workspaceName, email, role, invitedBy } = params;
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    throw new ApiError(400, 'A valid email is required');
  }

  const token = randomUUID();
  const now = Date.now();
  const ref = adminDb.collection('invites').doc();
  await ref.set({
    workspaceId,
    workspaceName,
    email: normalizedEmail,
    role,
    token,
    status: 'pending',
    invitedBy,
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: new Date(now + INVITE_TTL_MS),
  });

  return {
    id: ref.id,
    workspaceId,
    workspaceName,
    email: normalizedEmail,
    role,
    token,
    status: 'pending',
    invitedBy,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + INVITE_TTL_MS).toISOString(),
  };
}

export async function listInvites(workspaceId: string): Promise<Invite[]> {
  const snap = await adminDb
    .collection('invites')
    .where('workspaceId', '==', workspaceId)
    .where('status', '==', 'pending')
    .get();
  return snap.docs.map((d) => inviteFromDoc(d.id, d.data()));
}

export async function revokeInvite(workspaceId: string, inviteId: string): Promise<void> {
  const ref = adminDb.collection('invites').doc(inviteId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.workspaceId !== workspaceId) {
    throw new ApiError(404, 'Invite not found');
  }
  await ref.update({ status: 'revoked' });
}

// Accepts an invite by token for the given user. Server-verifies the email
// match so a leaked token can't be redeemed by the wrong account.
export async function acceptInvite(params: {
  token: string;
  uid: string;
  email: string | null;
  displayName: string | null;
}): Promise<{ workspaceId: string; role: WorkspaceRole }> {
  const { token, uid, email, displayName } = params;

  const snap = await adminDb
    .collection('invites')
    .where('token', '==', token)
    .limit(1)
    .get();
  if (snap.empty) throw new ApiError(404, 'Invite not found');

  const doc = snap.docs[0];
  const invite = inviteFromDoc(doc.id, doc.data());

  if (invite.status !== 'pending') {
    throw new ApiError(410, 'This invite is no longer valid');
  }
  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    throw new ApiError(410, 'This invite has expired');
  }
  if (!email || email.trim().toLowerCase() !== invite.email) {
    throw new ApiError(403, 'This invite was sent to a different email address');
  }

  await upsertMember({
    workspaceId: invite.workspaceId,
    uid,
    role: invite.role,
    email,
    displayName,
    invitedBy: invite.invitedBy,
  });
  await doc.ref.update({ status: 'accepted', acceptedBy: uid, acceptedAt: FieldValue.serverTimestamp() });

  return { workspaceId: invite.workspaceId, role: invite.role };
}
