export interface SubTask {
  id: string;
  label: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  subtasks: SubTask[];
  createdAt: string;
  scheduledDate?: string;
  status: "pending" | "in-progress" | "completed";
  priority: "high" | "medium" | "low";
  // Workspace this task belongs to. Optional for backward compatibility with
  // legacy user-scoped tasks created before workspaces existed.
  workspaceId?: string;
  // Who created/assigned the task ("assigned by").
  createdBy?: string;
  // Team member the task is assigned to ("assigned to"). null = unassigned.
  assigneeId?: string | null;
}
