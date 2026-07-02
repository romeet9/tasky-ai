import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/server';
import { getAuthUser } from '@/lib/admin/admin-auth';
import { mockSystemConfig } from '@/lib/admin/mock-data';

export async function GET(request: Request) {
  try {
    const { user, error: authError } = await getAuthUser(request);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const configDoc = await adminDb
        .collection('system_config')
        .doc('global')
        .get();

      if (configDoc.exists) {
        const config = configDoc.data();
        return NextResponse.json({
          config: {
            googleMeetEnabled: config?.googleMeetEnabled ?? true,
            lastUpdated: config?.lastUpdated?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedBy: config?.updatedBy || user.email,
          },
          success: true,
        });
      }
    } catch (error) {
      console.error('Error querying system_config, using mock data:', error);
    }

    return NextResponse.json({
      config: mockSystemConfig,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching system config:', error);
    return NextResponse.json({ config: mockSystemConfig, success: true });
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, error: authError } = await getAuthUser(request);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { googleMeetEnabled } = body;

    if (typeof googleMeetEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'googleMeetEnabled must be a boolean' },
        { status: 400 }
      );
    }

    try {
      const configRef = adminDb.collection('system_config').doc('global');
      await configRef.set({
        googleMeetEnabled,
        lastUpdated: new Date(),
        updatedBy: user.email,
      }, { merge: true });

      try {
        await adminDb.collection('audit_logs').add({
          timestamp: new Date(),
          action: 'google_meet_toggled',
          actor: {
            uid: user.uid,
            email: user.email,
          },
          details: {
            enabled: googleMeetEnabled,
          },
        });
      } catch {
        console.log('Could not write audit log');
      }
    } catch (error) {
      console.error('Error updating config in Firestore:', error);
    }

    return NextResponse.json({
      config: {
        googleMeetEnabled,
        lastUpdated: new Date().toISOString(),
        updatedBy: user.email,
      },
      success: true,
    });
  } catch (error) {
    console.error('Error updating system config:', error);
    return NextResponse.json(
      { error: 'Failed to update system config' },
      { status: 500 }
    );
  }
}