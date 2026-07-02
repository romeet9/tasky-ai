// Backfill script: give every existing user a personal workspace and stamp
// their pre-workspace (legacy) docs with that workspaceId.
//
// SAFE BY DEFAULT: dry-run. It prints what it WOULD change and writes nothing.
// Re-run with `--apply` to actually write:
//
//   npx tsx scripts/backfill-workspaces.ts            # dry run
//   npx tsx scripts/backfill-workspaces.ts --apply    # write changes
//
// It is idempotent — re-running after an --apply is a no-op.

import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import { initializeApp, cert, getApps, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    console.error('Error: .env.local file not found');
    process.exit(1);
  }
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
    if (key && value && !process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const APPLY = process.argv.includes('--apply');

if (getApps().length === 0) {
  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

async function ensurePersonalWorkspaceFor(
  uid: string,
  email: string | null,
  displayName: string | null
): Promise<string> {
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  const existing = userSnap.data()?.personalWorkspaceId as string | undefined;
  if (existing && (await db.collection('workspaces').doc(existing).get()).exists) {
    return existing;
  }

  const wsRef = db.collection('workspaces').doc();
  console.log(`  ${APPLY ? 'CREATE' : 'would create'} personal workspace ${wsRef.id} for ${email || uid}`);
  if (APPLY) {
    const batch = db.batch();
    batch.set(wsRef, {
      name: 'Personal',
      ownerId: uid,
      createdBy: uid,
      personal: true,
      createdAt: FieldValue.serverTimestamp(),
    });
    batch.set(wsRef.collection('members').doc(uid), {
      uid,
      workspaceId: wsRef.id,
      role: 'owner',
      email,
      displayName,
      invitedBy: null,
      joinedAt: FieldValue.serverTimestamp(),
    });
    batch.set(userRef, { personalWorkspaceId: wsRef.id }, { merge: true });
    await batch.commit();
  }
  return wsRef.id;
}

async function backfillCollection(name: string, personalByUid: Map<string, string>) {
  const snap = await db.collection(name).get();
  let stamped = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.workspaceId) continue; // already scoped
    const uid = data.userId as string | undefined;
    if (!uid) {
      console.log(`  SKIP ${name}/${doc.id} (no userId to attribute)`);
      continue;
    }
    const wid = personalByUid.get(uid);
    if (!wid) {
      console.log(`  SKIP ${name}/${doc.id} (no personal workspace for ${uid})`);
      continue;
    }
    stamped++;
    if (APPLY) {
      await doc.ref.set({ workspaceId: wid, createdBy: data.createdBy || uid }, { merge: true });
    }
  }
  console.log(`  ${APPLY ? 'stamped' : 'would stamp'} ${stamped}/${snap.size} ${name}`);
}

async function main() {
  console.log(`\n=== Workspace backfill (${APPLY ? 'APPLY' : 'DRY RUN'}) ===\n`);

  console.log('Step 1: personal workspaces per user');
  const users = await db.collection('users').get();
  const personalByUid = new Map<string, string>();
  for (const u of users.docs) {
    const data = u.data();
    const wid = await ensurePersonalWorkspaceFor(u.id, data.email ?? null, data.displayName ?? null);
    personalByUid.set(u.id, wid);
  }
  console.log(`  ${users.size} users processed\n`);

  console.log('Step 2: stamp legacy docs with workspaceId');
  await backfillCollection('tasks', personalByUid);
  await backfillCollection('meetings', personalByUid);
  await backfillCollection('chat_sessions', personalByUid);

  console.log(`\nDone.${APPLY ? '' : ' (dry run — re-run with --apply to write)'}\n`);
  process.exit(0);
}

main().catch((e) => {
  console.error('Backfill failed:', e);
  process.exit(1);
});
