import { NextResponse } from 'next/server';
import { requireUser, handleError, ApiError } from '@/lib/api-auth';
import { getWorkspace, requirePermission } from '@/lib/workspace/server';
import { createInvite, listInvites, revokeInvite } from '@/lib/workspace/invites';
import { ROLE_RANK } from '@/lib/rbac/permissions';
import type { WorkspaceRole } from '@/types/workspace';

type Ctx = { params: Promise<{ id: string }> };

const INVITABLE: WorkspaceRole[] = ['admin', 'member', 'viewer'];

// GET /api/workspaces/:id/invites — pending invites (members:view).
export async function GET(request: Request, { params }: Ctx) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    await requirePermission(id, user.uid, 'members:view');
    const invites = await listInvites(id);
    return NextResponse.json({ invites });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/workspaces/:id/invites — invite by email (members:invite).
export async function POST(request: Request, { params }: Ctx) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const actor = await requirePermission(id, user.uid, 'members:invite');

    const { email, role } = await request.json();
    if (!email || !role) throw new ApiError(400, "Missing 'email' or 'role'");
    if (!INVITABLE.includes(role)) throw new ApiError(400, 'Invalid or non-assignable role');
    if (ROLE_RANK[role as WorkspaceRole] > ROLE_RANK[actor.role]) {
      throw new ApiError(403, 'You cannot invite at a role higher than your own');
    }

    const workspace = await getWorkspace(id);
    const invite = await createInvite({
      workspaceId: id,
      workspaceName: workspace?.name || 'Workspace',
      email,
      role,
      invitedBy: user.uid,
    });
    return NextResponse.json({ invite }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/workspaces/:id/invites?inviteId=... — revoke a pending invite.
export async function DELETE(request: Request, { params }: Ctx) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    await requirePermission(id, user.uid, 'members:invite');

    const inviteId = new URL(request.url).searchParams.get('inviteId');
    if (!inviteId) throw new ApiError(400, "Missing 'inviteId'");
    await revokeInvite(id, inviteId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
