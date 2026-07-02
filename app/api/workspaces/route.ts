import { NextResponse } from 'next/server';
import { requireUser, handleError, ApiError } from '@/lib/api-auth';
import { createWorkspace, getUserWorkspaces } from '@/lib/workspace/server';

// GET /api/workspaces — list every workspace the caller belongs to, with role.
export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const workspaces = await getUserWorkspaces(user.uid);
    return NextResponse.json({ workspaces });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/workspaces — create a new (non-personal) workspace; caller becomes owner.
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const { name } = await request.json();
    const trimmed = typeof name === 'string' ? name.trim() : '';
    if (!trimmed) throw new ApiError(400, 'Workspace name is required');

    const workspace = await createWorkspace({
      uid: user.uid,
      email: user.email,
      displayName: user.name,
      name: trimmed,
    });
    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
