import { NextResponse } from 'next/server';
import { requireUser, handleError, ApiError } from '@/lib/api-auth';
import { acceptInvite } from '@/lib/workspace/invites';

// POST /api/invites/accept — redeem an invite by token for the logged-in user.
// The invite's email must match the caller (verified server-side).
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const { token } = await request.json();
    if (!token) throw new ApiError(400, "Missing 'token'");

    const result = await acceptInvite({
      token,
      uid: user.uid,
      email: user.email,
      displayName: user.name,
    });
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}
