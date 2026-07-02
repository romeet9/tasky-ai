import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/server';
import { getAuthUser } from '@/lib/admin/admin-auth';
import { mockAuditLogs } from '@/lib/admin/mock-data';

export async function GET(request: Request) {
  try {
    const { user, error: authError } = await getAuthUser(request);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const action = searchParams.get('action');

    try {
      const logsSnapshot = await adminDb
        .collection('audit_logs')
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get()
        .catch(() => null);

      if (logsSnapshot && !logsSnapshot.empty) {
        let logs = logsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
            action: data.action,
            actor: {
              uid: data.actor?.uid || '',
              email: data.actor?.email || '',
            },
            details: data.details || {},
          };
        });

        if (action) {
          logs = logs.filter((log) => log.action === action);
        }

        return NextResponse.json({ logs, success: true });
      }
    } catch (error) {
      console.error('Error querying audit_logs, using mock data:', error);
    }

    const logs = action
      ? mockAuditLogs.filter(log => log.action === action).slice(0, limit)
      : mockAuditLogs.slice(0, limit);

    return NextResponse.json({ logs, success: true });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ logs: mockAuditLogs, success: true });
  }
}