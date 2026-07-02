import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/server';
import { requireUser, handleError, ApiError } from '@/lib/api-auth';
import {
  getWorkspace,
  requireMembership,
  requirePermission,
} from '@/lib/workspace/server';

type Ctx = { params: Promise<{ id: string }> };

// GET /api/workspaces/:id — workspace details + caller's role.
export async function GET(request: Request, { params }: Ctx) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const membership = await requireMembership(id, user.uid);
    const workspace = await getWorkspace(id);
    return NextResponse.json({ workspace, role: membership.role });
  } catch (error) {
    return handleError(error);
  }
}

// PATCH /api/workspaces/:id — rename (admin+).
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    await requirePermission(id, user.uid, 'workspace:update');

    const { name } = await request.json();
    const trimmed = typeof name === 'string' ? name.trim() : '';
    if (!trimmed) throw new ApiError(400, 'Workspace name is required');

    await adminDb.collection('workspaces').doc(id).update({ name: trimmed });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/workspaces/:id — owner only; personal workspaces cannot be deleted.
export async function DELETE(request: Request, { params }: Ctx) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    await requirePermission(id, user.uid, 'workspace:delete');

    const workspace = await getWorkspace(id);
    if (workspace?.personal) {
      throw new ApiError(400, 'The personal workspace cannot be deleted');
    }

    // Remove member subdocs then the workspace doc. Task cleanup is left to a
    // separate maintenance step so we never bulk-delete user content here.
    const wsRef = adminDb.collection('workspaces').doc(id);
    const members = await wsRef.collection('members').get();
    const batch = adminDb.batch();
    members.forEach((m) => batch.delete(m.ref));
    batch.delete(wsRef);
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
