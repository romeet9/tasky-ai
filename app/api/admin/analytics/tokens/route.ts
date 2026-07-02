import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/server';
import { getAuthUser } from '@/lib/admin/admin-auth';
import { mockTokenMetrics } from '@/lib/admin/mock-data';

export async function GET(request: Request) {
  try {
    const { user, error: authError } = await getAuthUser(request);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    const daysBack = range === '30d' ? 30 : 7;

    try {
      const analyticsSnapshot = await adminDb
        .collection('analytics_tokens')
        .orderBy('date', 'desc')
        .limit(daysBack)
        .get()
        .catch(() => null);

      if (analyticsSnapshot && !analyticsSnapshot.empty) {
        const metrics = analyticsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            date: data.date,
            byProvider: data.byProvider,
          };
        });

        return NextResponse.json({ metrics, success: true });
      }
    } catch (error) {
      console.error('Error querying analytics_tokens, using mock data:', error);
    }

    const metrics = mockTokenMetrics.slice(0, daysBack);
    return NextResponse.json({ metrics, success: true });
  } catch (error) {
    console.error('Error fetching token metrics:', error);
    return NextResponse.json({ metrics: mockTokenMetrics, success: true });
  }
}