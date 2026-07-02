import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminAuth: Auth;
let adminDb: Firestore;

function initApp() {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Firebase Admin: Missing environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). Admin features will not work.');
    return null;
  }

  const serviceAccount: ServiceAccount = {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  };

  return initializeApp({ credential: cert(serviceAccount) });
}

const app = initApp();

if (app) {
  adminAuth = getAuth(app);
  adminDb = getFirestore(app);
} else {
  throw new Error(
    'Firebase Admin SDK failed to initialize. Check your environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.'
  );
}

export { adminAuth, adminDb };