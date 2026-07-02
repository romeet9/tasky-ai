import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/server";
import { requireUser, handleError, ApiError, type AuthedUser } from "@/lib/api-auth";
import {
  ensurePersonalWorkspace,
  getWorkspace,
  getMembership,
  requireMembership,
  requirePermission,
} from "@/lib/workspace/server";
import { can } from "@/lib/rbac/permissions";
import type { Task } from "@/types/task";
import type { Permission } from "@/types/workspace";

// Authorizes a write against a specific task. Workspace-scoped tasks go through
// RBAC; legacy tasks (no workspaceId) fall back to the original owner check.
// This also closes the prior hole where PATCH/DELETE did no ownership check.
async function authorizeTaskWrite(
  taskId: string,
  user: AuthedUser,
  permission: Permission
): Promise<{ ref: FirebaseFirestore.DocumentReference; data: FirebaseFirestore.DocumentData }> {
  const ref = adminDb.collection("tasks").doc(taskId);
  const snap = await ref.get();
  if (!snap.exists) throw new ApiError(404, "Task not found");
  const data = snap.data()!;
  if (data.workspaceId) {
    const membership = await requireMembership(data.workspaceId, user.uid);
    // Managers can act on any task; employees only on tasks they were assigned
    // or created. Then the role must still hold the requested permission.
    const isManager = can(membership.role, "tasks:assign");
    const isOwnTask = data.assigneeId === user.uid || data.createdBy === user.uid;
    if (!isManager && !isOwnTask) {
      throw new ApiError(403, "You do not have access to this task");
    }
    if (!can(membership.role, permission)) {
      throw new ApiError(403, `Your role (${membership.role}) cannot perform this action`);
    }
  } else if (data.userId !== user.uid) {
    throw new ApiError(403, "You do not have access to this task");
  }
  return { ref, data };
}

function serializeTask(id: string, data: FirebaseFirestore.DocumentData): Task {
  return {
    id,
    title: data.title,
    description: data.description || "",
    category: data.category || "Personal",
    subtasks: data.subtasks || [],
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    scheduledDate: data.scheduledDate?.toDate?.()?.toISOString() || data.scheduledDate || undefined,
    status: data.status || "pending",
    priority: data.priority || "medium",
    workspaceId: data.workspaceId || undefined,
    createdBy: data.createdBy || data.userId || undefined,
    assigneeId: data.assigneeId ?? null,
  };
}

// GET /api/tasks[?workspaceId=...]
// With workspaceId: returns that workspace's tasks (requires tasks:view).
// Without: legacy behavior — the caller's own user-scoped tasks.
export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const workspaceId = new URL(request.url).searchParams.get("workspaceId");

    let query: FirebaseFirestore.Query = adminDb.collection("tasks");
    // Personal/legacy path uses the deployed userId+createdAt index (dbSort).
    // Team paths sort in memory to avoid composite indexes that aren't deployed.
    let dbSort = true;
    if (workspaceId) {
      const membership = await requirePermission(workspaceId, user.uid, "tasks:view");
      const ws = await getWorkspace(workspaceId);
      if (ws?.personal && ws.ownerId === user.uid) {
        // Personal workspace: query by userId so pre-workspace (legacy) tasks
        // stay visible without a migration.
        query = query.where("userId", "==", user.uid);
      } else {
        // Team workspace: managers see everything (optionally filtered to one
        // member); employees see only tasks assigned to them.
        query = query.where("workspaceId", "==", workspaceId);
        const isManager = can(membership.role, "tasks:assign");
        const assigneeFilter = new URL(request.url).searchParams.get("assigneeId");
        if (!isManager) {
          query = query.where("assigneeId", "==", user.uid);
        } else if (assigneeFilter) {
          query = query.where("assigneeId", "==", assigneeFilter);
        }
        dbSort = false;
      }
    } else {
      query = query.where("userId", "==", user.uid);
    }

    const snapshot = dbSort
      ? await query.orderBy("createdAt", "desc").get()
      : await query.get();
    const tasks = snapshot.docs.map((doc) => serializeTask(doc.id, doc.data()));
    if (!dbSort) tasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ tasks, success: true });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/tasks  { tasks: [...], workspaceId? }
// Tasks always get a workspaceId: the given one (requires tasks:create) or the
// caller's personal workspace when omitted.
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const { tasks, workspaceId } = await request.json();

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json({ error: "Missing 'tasks' array" }, { status: 400 });
    }

    let targetWorkspaceId: string;
    let isPersonal: boolean;
    let isManager = false;
    if (workspaceId) {
      const membership = await requirePermission(workspaceId, user.uid, "tasks:create");
      const ws = await getWorkspace(workspaceId);
      targetWorkspaceId = workspaceId;
      isPersonal = !!(ws?.personal && ws.ownerId === user.uid);
      isManager = can(membership.role, "tasks:assign");
    } else {
      targetWorkspaceId = await ensurePersonalWorkspace(user.uid, user.email, user.name);
      isPersonal = true;
    }

    // Resolve who a task is assigned to. Personal tasks are always self.
    // In a team workspace, only managers may assign to someone else; employees
    // are forced to self-assign. The assignee must be a workspace member.
    const resolveAssignee = async (desired: unknown): Promise<string | null> => {
      if (isPersonal) return user.uid;
      const target = typeof desired === "string" && desired ? desired : null;
      if (!target || target === user.uid) {
        return isManager ? target : user.uid;
      }
      if (!isManager) {
        throw new ApiError(403, "Only managers can assign tasks to other members");
      }
      const member = await getMembership(targetWorkspaceId, target);
      if (!member) throw new ApiError(400, "Assignee is not a member of this workspace");
      return target;
    };

    const insertedTasks: Task[] = [];
    for (const task of tasks) {
      const scheduledDateValue =
        task.scheduledDate && task.scheduledDate !== "null" && task.scheduledDate !== null
          ? new Date(task.scheduledDate)
          : null;
      const assigneeId = await resolveAssignee(task.assigneeId);

      const docRef = await adminDb.collection("tasks").add({
        // userId is set only for personal-workspace tasks, so a personal
        // "where userId ==" query never picks up team tasks the user created.
        ...(isPersonal ? { userId: user.uid } : {}),
        workspaceId: targetWorkspaceId,
        createdBy: user.uid,
        assigneeId: assigneeId ?? null,
        title: task.title,
        description: task.description || "",
        category: task.category || "Personal",
        subtasks: task.subtasks || [],
        status: task.status || "pending",
        priority: task.priority || "medium",
        ...(scheduledDateValue ? { scheduledDate: scheduledDateValue } : {}),
        createdAt: new Date(task.createdAt || Date.now()),
      });

      insertedTasks.push({
        id: docRef.id,
        title: task.title,
        description: task.description || "",
        category: task.category || "Personal",
        subtasks: task.subtasks || [],
        createdAt: task.createdAt || new Date().toISOString(),
        scheduledDate: task.scheduledDate || undefined,
        status: task.status || "pending",
        priority: task.priority || "medium",
        workspaceId: targetWorkspaceId,
        createdBy: user.uid,
        assigneeId: assigneeId ?? null,
      });
    }

    return NextResponse.json({ tasks: insertedTasks, success: true });
  } catch (error) {
    return handleError(error);
  }
}

// PATCH /api/tasks  { id, updates }
export async function PATCH(request: Request) {
  try {
    const user = await requireUser(request);
    const { id, updates } = await request.json();
    if (!id || !updates) {
      return NextResponse.json({ error: "Missing 'id' or 'updates'" }, { status: 400 });
    }

    const { ref, data } = await authorizeTaskWrite(id, user, "tasks:update");

    // Ownership/scoping fields can't be reassigned via a normal update.
    const safeUpdates = { ...updates };
    delete safeUpdates.workspaceId;
    delete safeUpdates.userId;
    delete safeUpdates.createdBy;

    // Reassignment is a manager-only action and the new assignee must be a
    // member. Ignore it silently on personal/legacy tasks.
    if ("assigneeId" in safeUpdates) {
      if (!data.workspaceId) {
        delete safeUpdates.assigneeId;
      } else {
        await requirePermission(data.workspaceId, user.uid, "tasks:assign");
        const next = safeUpdates.assigneeId;
        if (next) {
          const member = await getMembership(data.workspaceId, next);
          if (!member) throw new ApiError(400, "Assignee is not a member of this workspace");
        } else {
          safeUpdates.assigneeId = null;
        }
      }
    }

    await ref.update(safeUpdates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/tasks?id=...
export async function DELETE(request: Request) {
  try {
    const user = await requireUser(request);
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing 'id' query parameter" }, { status: 400 });
    }

    const { ref } = await authorizeTaskWrite(id, user, "tasks:delete");
    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
