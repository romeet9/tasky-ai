import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as readline from 'readline';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    console.error('Error: .env.local file not found');
    process.exit(1);
  }
  
  const content = readFileSync(envPath, 'utf-8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
    
    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv();

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKeyRaw) {
  console.error('Error: Missing Firebase environment variables.');
  console.error('Make sure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in .env.local');
  process.exit(1);
}

const serviceAccount: ServiceAccount = {
  projectId,
  clientEmail,
  privateKey: privateKeyRaw.replace(/\\n/g, '\n'),
};

initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function clearAllMeetings(): Promise<number> {
  console.log('\nChecking existing meetings...');
  
  const meetingsSnapshot = await db.collection('meetings').get();
  const count = meetingsSnapshot.size;
  
  if (count === 0) {
    console.log('No existing meetings found.');
    return 0;
  }
  
  console.log(`Found ${count} existing meeting(s).`);
  const confirmed = await askConfirmation('Do you want to delete all existing meetings and insert demo data? (y/n): ');
  
  if (!confirmed) {
    console.log('Operation cancelled.');
    process.exit(0);
  }
  
  console.log('Deleting existing meetings...');
  
  const batch = db.batch();
  
  for (const doc of meetingsSnapshot.docs) {
    const participantsSnapshot = await doc.ref.collection('participants').get();
    participantsSnapshot.docs.forEach((p) => batch.delete(p.ref));
    
    batch.delete(doc.ref);
  }
  
  const momSnapshot = await db.collection('meeting_minutes').get();
  momSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
  
  await batch.commit();
  console.log(`Deleted ${count} meeting(s).`);
  
  return count;
}

async function getOrCreateUser(): Promise<string> {
  const usersSnapshot = await db.collection('users').limit(1).get();
  
  if (usersSnapshot.empty) {
    console.log('No users found. Creating a demo user...');
    const userRef = await db.collection('users').add({
      email: 'demo@tasky.ai',
      displayName: 'Demo User',
      createdAt: new Date(),
    });
    console.log(`Created demo user: ${userRef.id}`);
    return userRef.id;
  }
  
  const userId = usersSnapshot.docs[0].id;
  console.log(`Using existing user: ${userId}`);
  return userId;
}

async function seedMeetings() {
  console.log('========================================');
  console.log('   Tasky AI - Seed Demo Meetings');
  console.log('========================================\n');
  
  await clearAllMeetings();
  
  const userId = await getOrCreateUser();
  
  console.log('\nCreating demo meetings...\n');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(14, 0, 0, 0);
  
  // Meeting 1: Scheduled Meeting
  const scheduledMeetingRef = await db.collection('meetings').add({
    userId,
    title: 'Q4 Sprint Planning',
    description: 'Quarterly sprint planning session to align on priorities and assign tasks for the upcoming sprint.',
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    durationMinutes: 60,
    status: 'scheduled',
    createdAt: tomorrow,
  });
  
  await scheduledMeetingRef.collection('participants').add({
    name: 'Sarah Chen',
    email: 'sarah@company.com',
  });
  
  await scheduledMeetingRef.collection('participants').add({
    name: 'Alex Rivera',
    email: 'alex@company.com',
  });
  
  await scheduledMeetingRef.collection('participants').add({
    name: 'Jordan Kim',
    email: 'jordan@company.com',
  });
  
  // Meeting 2: Completed Meeting with MOM
  const completedMeetingRef = await db.collection('meetings').add({
    userId,
    title: 'Product Roadmap Review',
    description: 'Reviewed Q4 roadmap priorities including mobile app redesign, API integration, and analytics dashboard. Team aligned on key deliverables.',
    meetingUrl: 'https://meet.google.com/xyz-uvwx-yz',
    durationMinutes: 45,
    status: 'completed',
    createdAt: yesterday,
  });
  
  await completedMeetingRef.collection('participants').add({
    name: 'Emma Watson',
    email: 'emma@company.com',
  });
  
  await completedMeetingRef.collection('participants').add({
    name: 'David Park',
    email: 'david@company.com',
  });
  
  await completedMeetingRef.collection('participants').add({
    name: 'Lisa Chen',
    email: 'lisa@company.com',
  });
  
  await completedMeetingRef.collection('participants').add({
    name: 'Mike Johnson',
    email: 'mike@company.com',
  });
  
  await completedMeetingRef.collection('participants').add({
    name: 'Nina Patel',
    email: 'nina@company.com',
  });
  
  // Meeting Minutes for the completed meeting
  await db.collection('meeting_minutes').add({
    meetingId: completedMeetingRef.id,
    userId,
    transcript: `Emma Watson: Welcome everyone to our Q4 roadmap review. We have several key initiatives to discuss today.

David Park: First, I want to highlight the mobile app redesign project. It's been progressing well and we're on track for the beta release next month.

Lisa Chen: We need to prioritize the API integration work before the end of the month. The new endpoints are critical for the client dashboard.

Mike Johnson: I can handle the authentication module by next Friday. That will unblock the rest of the team.

Nina Patel: And I'll take on the dashboard analytics feature. Should have the wireframes ready by Wednesday.

Emma Watson: Great. Let's make sure our weekly syncs are moved to Thursdays at 2 PM to accommodate the offshore team.

David Park: Sounds good. I'll schedule the mobile redesign kickoff for Monday.`.trim(),
    summary: 'Discussed Q4 roadmap priorities including mobile app redesign, API integration, and analytics dashboard. Team aligned on key deliverables and assigned owners for each initiative.',
    actionItems: [
      {
        task: 'Complete authentication module implementation',
        owner: 'Mike Johnson',
        deadline: '2026-04-12',
      },
      {
        task: 'Finalize analytics dashboard wireframes',
        owner: 'Nina Patel',
        deadline: '2026-04-10',
      },
      {
        task: 'Review and approve API integration specs',
        owner: 'Lisa Chen',
        deadline: '2026-04-08',
      },
      {
        task: 'Schedule mobile redesign kickoff meeting',
        owner: 'David Park',
        deadline: '2026-04-09',
      },
    ],
    decisions: [
      'API integration takes priority over mobile redesign tasks',
      'Weekly sync meetings moved to Thursdays at 2 PM',
      'Emma Watson will be the point of contact for stakeholder communications',
    ],
    roadmap: [
      {
        phase: 'Week 1',
        items: [
          'Complete authentication module',
          'Approve API specs',
          'Finalize dashboard wireframes',
        ],
      },
      {
        phase: 'Week 2',
        items: [
          'Begin API integration development',
          'Start dashboard implementation',
          'Mobile redesign kickoff meeting',
        ],
      },
      {
        phase: 'Week 3-4',
        items: [
          'Complete API integration',
          'Dashboard beta release',
          'Mobile app alpha testing',
        ],
      },
    ],
    createdAt: yesterday,
  });
  
  console.log('----------------------------------------');
  console.log('Demo meetings created successfully!\n');
  console.log('Meeting 1 (Scheduled):');
  console.log(`  ID: ${scheduledMeetingRef.id}`);
  console.log(`  Title: Q4 Sprint Planning`);
  console.log(`  Status: scheduled`);
  console.log(`  Participants: 3\n`);
  
  console.log('Meeting 2 (Completed with MOM):');
  console.log(`  ID: ${completedMeetingRef.id}`);
  console.log(`  Title: Product Roadmap Review`);
  console.log(`  Status: completed`);
  console.log(`  Participants: 5`);
  console.log(`  Action Items: 4`);
  console.log(`  Decisions: 3\n`);
  
  console.log('----------------------------------------');
  console.log('You can now view these meetings in your app!');
  console.log('========================================\n');
}

seedMeetings().catch((error) => {
  console.error('Error seeding meetings:', error);
  process.exit(1);
});