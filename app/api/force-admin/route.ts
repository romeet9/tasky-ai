import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/server';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const userRef = adminDb.collection('users').doc(uid);
    await userRef.set({
      role: 'admin',
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'User has been set as admin.',
      user: {
        uid,
        email: decodedToken.email,
        role: 'admin',
      },
    });
  } catch (error) {
    console.error('Error setting admin role:', error);
    return NextResponse.json(
      { error: 'Failed to set admin role: ' + (error as Error).message },
      { status: 500 }
    );
  }
}