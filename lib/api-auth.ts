// Shared server-side request auth. Verifies the Firebase ID token from the
// `Authorization: Bearer <idToken>` header (same scheme the existing routes
// use) and turns thrown ApiErrors into JSON responses.

import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/server';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface AuthedUser {
  uid: string;
  email: string | null;
  name: string | null;
}

export async function requireUser(request: Request): Promise<AuthedUser> {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    throw new ApiError(401, 'Unauthorized');
  }
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: (decoded.name as string | undefined) ?? null,
    };
  } catch {
    throw new ApiError(401, 'Unauthorized');
  }
}

// Wrap a route handler body: rethrows nothing, converts ApiError to its status
// and anything else to a 500.
export function handleError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error('Unhandled API error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
