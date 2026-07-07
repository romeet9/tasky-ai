// Self-contained demo data for the /demo dashboard. Lets you see the full
// manager experience — a team, members, and tasks assigned across people —
// without signing in or touching Firestore. Not used by the real app.

import type { Task } from "@/types/task";
import type { WorkspaceMember, WorkspaceWithRole } from "@/types/workspace";

const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function dayOffset(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return fmt(d);
}
// Stable-ish createdAt so ordering is deterministic within a group.
function createdAt(minsAgo: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minsAgo);
  return d.toISOString();
}

const WS_ID = "ws-acme";

// The manager (you) + four employees.
export const DEMO_YOU_UID = "u-you";

export const DEMO_MEMBERS: WorkspaceMember[] = [
  { uid: DEMO_YOU_UID, workspaceId: WS_ID, role: "owner", email: "you@acme.com", displayName: "You (Manager)", joinedAt: createdAt(9000), invitedBy: null },
  { uid: "u-alice", workspaceId: WS_ID, role: "member", email: "alice@acme.com", displayName: "Alice Chen", joinedAt: createdAt(8000), invitedBy: DEMO_YOU_UID },
  { uid: "u-bob", workspaceId: WS_ID, role: "member", email: "bob@acme.com", displayName: "Bob Rivera", joinedAt: createdAt(7000), invitedBy: DEMO_YOU_UID },
  { uid: "u-priya", workspaceId: WS_ID, role: "member", email: "priya@acme.com", displayName: "Priya Nair", joinedAt: createdAt(6000), invitedBy: DEMO_YOU_UID },
  { uid: "u-diego", workspaceId: WS_ID, role: "member", email: "diego@acme.com", displayName: "Diego Santos", joinedAt: createdAt(5000), invitedBy: DEMO_YOU_UID },
];

export const DEMO_WORKSPACES: WorkspaceWithRole[] = [
  { id: WS_ID, name: "Acme Product Team", ownerId: DEMO_YOU_UID, personal: false, createdAt: createdAt(9000), createdBy: DEMO_YOU_UID, role: "owner" },
  { id: "ws-personal", name: "My Tasks", ownerId: DEMO_YOU_UID, personal: true, createdAt: createdAt(9000), createdBy: DEMO_YOU_UID, role: "owner" },
];

// ~13 tasks assigned across the team, with a mix of status, priority, category,
// subtasks, and due dates — plus a couple unassigned in the backlog. The first
// group (assigned to "You") is a guided walkthrough that teaches a first-time
// visitor how to operate the product; the rest show a realistic, lived-in board.
export const DEMO_TASKS: Task[] = [
  // Getting Started — a guided checklist in the "You (Manager)" column (the
  // first column, otherwise empty). Each subtask is a step the visitor can
  // actually check off in the live demo.
  {
    id: "g-1", title: "👋 Start here — welcome to the live demo", description: "A 60-second tour. This whole demo is interactive — check items off as you go.",
    category: "Work", status: "in-progress", priority: "high", createdAt: createdAt(2), scheduledDate: dayOffset(0),
    workspaceId: WS_ID, createdBy: DEMO_YOU_UID, assigneeId: DEMO_YOU_UID,
    subtasks: [
      { id: "g1s1", label: "Read this checklist top to bottom", completed: true },
      { id: "g1s2", label: "Everything is live — click around freely", completed: false },
    ],
  },
  {
    id: "g-2", title: "✍️ See how AI turns a brief into tasks", description: "The chat panel on the left is where planning happens.",
    category: "Work", status: "pending", priority: "high", createdAt: createdAt(4), scheduledDate: dayOffset(0),
    workspaceId: WS_ID, createdBy: DEMO_YOU_UID, assigneeId: DEMO_YOU_UID,
    subtasks: [
      { id: "g2s1", label: "Read the sample brief in the chat on the left", completed: false },
      { id: "g2s2", label: "Notice AI split it into tasks with subtasks", completed: false },
      { id: "g2s3", label: "Each task gets a category, priority & owner", completed: false },
    ],
  },
  {
    id: "g-3", title: "✅ Track progress on any task", description: "Open a task card to manage its subtasks.",
    category: "Work", status: "pending", priority: "medium", createdAt: createdAt(6), scheduledDate: dayOffset(0),
    workspaceId: WS_ID, createdBy: DEMO_YOU_UID, assigneeId: DEMO_YOU_UID,
    subtasks: [
      { id: "g3s1", label: "Click a task card to expand it", completed: false },
      { id: "g3s2", label: "Check off a subtask to mark it done", completed: false },
      { id: "g3s3", label: "Watch the done counter update on the column", completed: false },
    ],
  },
  {
    id: "g-4", title: "🗂️ Explore the team board", description: "See who's working on what, across the team.",
    category: "Work", status: "pending", priority: "medium", createdAt: createdAt(8), scheduledDate: dayOffset(0),
    workspaceId: WS_ID, createdBy: DEMO_YOU_UID, assigneeId: DEMO_YOU_UID,
    subtasks: [
      { id: "g4s1", label: "Scroll across the columns — one per teammate", completed: false },
      { id: "g4s2", label: "Use 'All members' up top to focus one person", completed: false },
      { id: "g4s3", label: "Pick a day on the calendar to filter by date", completed: false },
    ],
  },
  {
    id: "g-5", title: "🚀 Ready to try it for real?", description: "Spin up your own workspace in seconds — no credit card.",
    category: "Work", status: "pending", priority: "low", createdAt: createdAt(10), scheduledDate: dayOffset(0),
    workspaceId: WS_ID, createdBy: DEMO_YOU_UID, assigneeId: DEMO_YOU_UID,
    subtasks: [
      { id: "g5s1", label: "Open the workspace dropdown, top-left of the board", completed: false },
      { id: "g5s2", label: "Hit 'Create free account' in the banner above", completed: false },
    ],
  },

  // Alice — 3
  {
    id: "t-1", title: "Landing page redesign", description: "Ship the new marketing homepage with the updated hero and pricing.",
    category: "Work", status: "in-progress", priority: "high", createdAt: createdAt(120), scheduledDate: dayOffset(0),
    workspaceId: WS_ID, createdBy: DEMO_YOU_UID, assigneeId: "u-alice",
    subtasks: [
      { id: "t1s1", label: "Design the hero + nav layout", completed: true },
      { id: "t1s2", label: "Rebuild the pricing section", completed: false },
      { id: "t1s3", label: "Wire responsive breakpoints", completed: false },
    ],
  },
  {
    id: "t-2", title: "Instagram launch carousel", description: "5-slide static carousel for the feature launch.",
    category: "Work", status: "completed", priority: "medium", createdAt: createdAt(240),
    workspaceId: WS_ID, createdBy: DEMO_YOU_UID, assigneeId: "u-alice",
    subtasks: [
      { id: "t2s1", label: "Draft copy for each slide", completed: true },
      { id: "t2s2", label: "Export final assets", completed: true },
    ],
  },
  {
    id: "t-3", title: "Onboarding email sequence", description: "Write the 4-email welcome drip for new signups.",
    category: "Work", status: "pending", priority: "low", createdAt: createdAt(60), scheduledDate: dayOffset(3),
    workspaceId: WS_ID, createdBy: DEMO_YOU_UID, assigneeId: "u-alice",
    subtasks: [
      { id: "t3s1", label: "Outline the 4 emails", completed: false },
      { id: "t3s2", label: "Draft subject lines", completed: false },
    ],
  },

  // Bob — 3
  {
    id: "t-4", title: "Tasks API integration", description: "Wire the backend endpoints for tasks + assignment.",
    category: "Work", status: "in-progress", priority: "high", createdAt: createdAt(110), scheduledDate: dayOffset(1),
    workspaceId: WS_ID, createdBy: DEMO_YOU_UID, assigneeId: "u-bob",
    subtasks: [
      { id: "t4s1", label: "Define the Firestore schema", completed: true },
      { id: "t4s2", label: "Build the CRUD endpoints", completed: false },
      { id: "t4s3", label: "Add assignee validation", completed: false },
    ],
  },
  {
    id: "t-5", title: "Fix auth token refresh bug", description: "Sessions expire early on Safari — refresh isn't firing.",
    category: "Work", status: "pending", priority: "high", createdAt: createdAt(45), scheduledDate: dayOffset(0),
    workspaceId: WS_ID, createdBy: DEMO_YOU_UID, assigneeId: "u-bob",
    subtasks: [
      { id: "t5s1", label: "Reproduce on Safari", completed: false },
      { id: "t5s2", label: "Patch the refresh interval", completed: false },
    ],
  },
  {
    id: "t-6", title: "Write API documentation", description: "Document the public task + workspace endpoints.",
    category: "Learning", status: "completed", priority: "low", createdAt: createdAt(300),
    workspaceId: WS_ID, createdBy: DEMO_YOU_UID, assigneeId: "u-bob",
    subtasks: [{ id: "t6s1", label: "Draft endpoint reference", completed: true }],
  },

  // Priya — 3
  {
    id: "t-7", title: "Competitor pricing research", description: "Benchmark the top 5 competitors' pricing tiers.",
    category: "Learning", status: "pending", priority: "medium", createdAt: createdAt(80), scheduledDate: dayOffset(2),
    workspaceId: WS_ID, createdBy: DEMO_YOU_UID, assigneeId: "u-priya",
    subtasks: [
      { id: "t7s1", label: "List the 5 competitors", completed: false },
      { id: "t7s2", label: "Capture their tier + price", completed: false },
    ],
  },
  {
    id: "t-8", title: "Q3 marketing plan draft", description: "Channel mix, budget split, and campaign calendar.",
    category: "Work", status: "in-progress", priority: "medium", createdAt: createdAt(150), scheduledDate: dayOffset(5),
    workspaceId: WS_ID, createdBy: DEMO_YOU_UID, assigneeId: "u-priya",
    subtasks: [
      { id: "t8s1", label: "Set channel budget split", completed: true },
      { id: "t8s2", label: "Draft the campaign calendar", completed: true },
      { id: "t8s3", label: "Define success metrics", completed: false },
    ],
  },
  {
    id: "t-9", title: "User interview synthesis", description: "Cluster the 12 interviews into themes.",
    category: "Work", status: "completed", priority: "medium", createdAt: createdAt(280),
    workspaceId: WS_ID, createdBy: DEMO_YOU_UID, assigneeId: "u-priya",
    subtasks: [
      { id: "t9s1", label: "Tag transcripts", completed: true },
      { id: "t9s2", label: "Write the top 3 insights", completed: true },
    ],
  },

  // Diego — 2
  {
    id: "t-10", title: "Set up analytics dashboard", description: "Wire product events into the new dashboard.",
    category: "Work", status: "pending", priority: "high", createdAt: createdAt(70), scheduledDate: dayOffset(1),
    workspaceId: WS_ID, createdBy: DEMO_YOU_UID, assigneeId: "u-diego",
    subtasks: [
      { id: "t10s1", label: "Define the core events", completed: false },
      { id: "t10s2", label: "Add tracking hooks", completed: false },
      { id: "t10s3", label: "Build the overview panel", completed: false },
    ],
  },
  {
    id: "t-11", title: "Migrate CI pipeline", description: "Move CI from Jenkins to GitHub Actions.",
    category: "Work", status: "in-progress", priority: "medium", createdAt: createdAt(200),
    workspaceId: WS_ID, createdBy: DEMO_YOU_UID, assigneeId: "u-diego",
    subtasks: [
      { id: "t11s1", label: "Port the build workflow", completed: true },
      { id: "t11s2", label: "Wire deploy secrets", completed: false },
    ],
  },

  // Unassigned backlog — 2
  {
    id: "t-12", title: "Security audit checklist", description: "Pre-launch security review — not yet assigned.",
    category: "Work", status: "pending", priority: "high", createdAt: createdAt(30),
    workspaceId: WS_ID, createdBy: DEMO_YOU_UID, assigneeId: null,
    subtasks: [
      { id: "t12s1", label: "Review auth + session handling", completed: false },
      { id: "t12s2", label: "Check Firestore rules coverage", completed: false },
    ],
  },
  {
    id: "t-13", title: "Draft team offsite agenda", description: "Half-day planning offsite — owner TBD.",
    category: "Personal", status: "pending", priority: "low", createdAt: createdAt(20), scheduledDate: dayOffset(7),
    workspaceId: WS_ID, createdBy: DEMO_YOU_UID, assigneeId: null,
    subtasks: [{ id: "t13s1", label: "Block the calendar", completed: false }],
  },
];
