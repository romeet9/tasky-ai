import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/server';

export async function POST(request: Request) {
  try {
    // Get the authorization token
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify the token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Check how many users exist
    const usersSnapshot = await adminDb.collection('users').get();
    const isFirstUser = usersSnapshot.empty;

    // Set the user's role
    const userRef = adminDb.collection('users').doc(uid);
    await userRef.set({
      role: isFirstUser ? 'admin' : 'user',
    }, { merge: true });

    // Get updated user data
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      message: isFirstUser 
        ? 'First user has been set as admin' 
        : 'User role has been set to user',
      user: {
        uid,
        email: decodedToken.email,
        role: userData?.role || (isFirstUser ? 'admin' : 'user'),
        isFirstUser,
      },
    });
  } catch (error) {
    console.error('Error setting user role:', error);
    return NextResponse.json(
      { error: 'Failed to set user role' },
      { status: 500 }
    );
  }
}