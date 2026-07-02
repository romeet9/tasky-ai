import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/server';
import { getAuthUser } from '@/lib/admin/admin-auth';
import { mockUsers } from '@/lib/admin/mock-data';

export async function GET(request: Request) {
  try {
    const { user, error: authError } = await getAuthUser(request);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let users: any[] = [];

    try {
      const usersSnapshot = await adminDb.collection('users').get();

      if (usersSnapshot.size > 0) {
        users = usersSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            uid: doc.id,
            email: data.email || '',
            displayName: data.displayName || data.email?.split('@')[0] || 'User',
            role: data.role || 'user',
            status: data.lastLoginAt
              ? (new Date().getTime() - (data.lastLoginAt.toDate ? data.lastLoginAt.toDate().getTime() : new Date(data.lastLoginAt).getTime()) < 30 * 24 * 60 * 60 * 1000 ? 'active' : 'inactive')
              : 'inactive',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            lastLoginAt: data.lastLoginAt?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          };
        });
      }
    } catch (error) {
      console.error('Error querying Firestore, using mock data:', error);
    }

    if (users.length === 0) {
      users = [...mockUsers];
    }

    if (role && (role === 'user' || role === 'admin')) {
      users = users.filter((u) => u.role === role);
    }

    if (status && (status === 'active' || status === 'inactive')) {
      users = users.filter((u) => u.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.email.toLowerCase().includes(searchLower) ||
          u.displayName.toLowerCase().includes(searchLower)
      );
    }

    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ users, success: true });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ users: mockUsers, success: true });
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, error: authError } = await getAuthUser(request);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { uid, role } = body;

    if (!uid || !role || (role !== 'user' && role !== 'admin')) {
      return NextResponse.json(
        { error: 'uid and role (user|admin) are required' },
        { status: 400 }
      );
    }

    if (uid === user.uid && role === 'user') {
      return NextResponse.json(
        { error: 'Cannot remove your own admin role' },
        { status: 400 }
      );
    }

    await adminDb.collection('users').doc(uid).set({ role }, { merge: true });

    try {
      await adminDb.collection('audit_logs').add({
        timestamp: new Date(),
        action: role === 'admin' ? 'admin_added' : 'admin_removed',
        actor: {
          uid: user.uid,
          email: user.email,
        },
        details: {
          targetUid: uid,
          newRole: role,
        },
      });
    } catch {
      console.log('Could not write audit log');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}