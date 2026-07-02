import { NextResponse } from 'next/server';
import { requireUser, handleError, ApiError } from '@/lib/api-auth';
import {
  getMembership,
  listMembers,
  requirePermission,
  setMemberRole,
  removeMember,
} from '@/lib/workspace/server';
import { canActOnMember, ROLE_RANK } from '@/lib/rbac/permissions';
import type { WorkspaceRole } from '@/types/workspace';

type Ctx = { params: Promise<{ id: string }> };

const ASSIGNABLE: WorkspaceRole[] = ['admin', 'member', 'viewer'];

// GET /api/workspaces/:id/members — list members (members:view).
export async function GET(request: Request, { params }: Ctx) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    await requirePermission(id, user.uid, 'members:view');
    const members = await listMembers(id);
    return NextResponse.json({ members });
  } catch (error) {
    return handleError(error);
  }
}

// PATCH /api/workspaces/:id/members — change a member's role (members:update_role).
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const actor = await requireUser(request);
    const { id } = await params;
    const actorMembership = await requirePermission(id, actor.uid, 'members:update_role');

    const { uid, role } = await request.json();
    if (!uid || !role) throw new ApiError(400, "Missing 'uid' or 'role'");
    if (!ASSIGNABLE.includes(role)) throw new ApiError(400, 'Invalid or non-assignable role');
    if (uid === actor.uid) throw new ApiError(400, 'You cannot change your own role');

    const target = await getMembership(id, uid);
    if (!target) throw new ApiError(404, 'Member not found');

    // Can the actor act on this target, and grant the requested role?
    if (!canActOnMember(actorMembership.role, target.role)) {
      throw new ApiError(403, 'You cannot modify this member');
    }
    if (ROLE_RANK[role as WorkspaceRole] > ROLE_RANK[actorMembership.role]) {
      throw new ApiError(403, 'You cannot grant a role higher than your own');
    }

    await setMemberRole(id, uid, role);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/workspaces/:id/members?uid=... — remove a member (members:remove).
export async function DELETE(request: Request, { params }: Ctx) {
  try {
    const actor = await requireUser(request);
    const { id } = await params;
    const actorMembership = await requirePermission(id, actor.uid, 'members:remove');

    const uid = new URL(request.url).searchParams.get('uid');
    if (!uid) throw new ApiError(400, "Missing 'uid'");
    if (uid === actor.uid) throw new ApiError(400, 'Use "leave workspace" to remove yourself');

    const target = await getMembership(id, uid);
    if (!target) throw new ApiError(404, 'Member not found');
    if (!canActOnMember(actorMembership.role, target.role)) {
      throw new ApiError(403, 'You cannot remove this member');
    }

    await removeMember(id, uid);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
