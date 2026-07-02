"use client";

// TEMPORARY preview (public via middleware) to review the Raycast manager view
// — who's assigned what — without signing in. Remove before shipping.

import TaskList from "@/components/TaskList";
import type { Task } from "@/types/task";
import type { WorkspaceMember } from "@/types/workspace";

const members: WorkspaceMember[] = [
  { uid: "u1", workspaceId: "w", role: "member", email: "alice@acme.com", displayName: "Alice Chen", joinedAt: "", invitedBy: null },
  { uid: "u2", workspaceId: "w", role: "member", email: "bob@acme.com", displayName: "Bob Rivera", joinedAt: "", invitedBy: null },
];

const now = new Date().toISOString();
const tasks: Task[] = [
  { id: "1", title: "Landing page redesign", description: "Develop and finalize the marketing landing page.", category: "Work", status: "in-progress", priority: "high", createdAt: now, assigneeId: "u1", createdBy: "mgr", subtasks: [{ id: "a", label: "Design the layout and user interface", completed: true }, { id: "b", label: "Write and optimize the page content", completed: false }, { id: "c", label: "Implement responsive design", completed: false }] },
  { id: "2", title: "Design static Instagram post", description: "Create a high-quality static graphic based on the brief.", category: "Work", status: "completed", priority: "medium", createdAt: now, assigneeId: "u1", createdBy: "mgr", subtasks: [{ id: "d", label: "Draft concept", completed: true }] },
  { id: "3", title: "API integration", description: "Wire the backend endpoints for tasks and auth.", category: "Work", status: "pending", priority: "high", createdAt: now, assigneeId: "u2", createdBy: "mgr", subtasks: [{ id: "e", label: "Define the schema", completed: false }, { id: "f", label: "Build the endpoints", completed: false }] },
  { id: "4", title: "Research competitor pricing", description: "Background task, not yet assigned to anyone.", category: "Learning", status: "pending", priority: "low", createdAt: now, assigneeId: null, createdBy: "mgr", subtasks: [] },
];

export default function PreviewPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--raycast-bg)" }}>
      <div className="mx-auto flex h-screen max-w-3xl flex-col">
        <TaskList demo={{ tasks, members, isManager: true }} />
      </div>
    </div>
  );
}
