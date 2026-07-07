"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task } from "@/types/task";
import type { WorkspaceMember } from "@/types/workspace";
import TaskCard from "@/components/TaskCard";
import TaskSkeleton from "@/components/TaskSkeleton";
import EmptyState from "@/components/EmptyState";
import ActivityLog from "@/components/ActivityLog";
import HorizontalCalendar from "@/components/HorizontalCalendar";
import { getAccessToken } from "@/lib/auth";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { can } from "@/lib/rbac/permissions";
import UserChip from "@/components/UserChip";
import Select from "@/components/Select";

const CATEGORIES = ["All", "Work", "Personal", "Learning", "Health", "Meetings"];

export default function TaskList({
  fetchKey,
  demo,
}: {
  fetchKey?: number;
  demo?: { tasks: Task[]; members: WorkspaceMember[]; isManager: boolean };
}) {
  const ws = useWorkspace();
  const isDemo = !!demo;
  const activeWorkspaceId = ws.activeWorkspaceId;
  const members = demo ? demo.members : ws.members;
  // Team context: managers see all tasks (grouped by assignee, reassignable);
  // employees see only their own with an "assigned by" chip.
  const isTeam = demo ? true : !!ws.activeWorkspace && !ws.activeWorkspace.personal;
  const isManager = demo ? demo.isManager : !!ws.activeRole && can(ws.activeRole, "tasks:assign");
  // Managers see a Kanban board: one column per employee (+ Unassigned).
  const isManagerBoard = isTeam && isManager;
  const [memberFilter, setMemberFilter] = useState<string>("all");
  const memberName = useCallback(
    (uid?: string | null): string | null => {
      if (!uid) return null;
      const m = members.find((mem) => mem.uid === uid);
      return m ? m.displayName || m.email || "Member" : null;
    },
    [members]
  );
  const [tasks, setTasks] = useState<Task[]>(demo?.tasks ?? []);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!demo);
  const [activities, setActivities] = useState<Array<{ id: string; message: string; status: "pending" | "success" | "error"; timestamp: number }>>([]);
  const [newTaskIds, setNewTaskIds] = useState<Set<string>>(new Set());
  const prevTaskCountRef = useRef(0);

  const addActivity = useCallback((message: string, status: "pending" | "success" | "error") => {
    setActivities((prev) => [
      ...prev,
      { id: crypto.randomUUID(), message, status, timestamp: Date.now() },
    ]);
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const url = activeWorkspaceId
        ? `/api/tasks?workspaceId=${encodeURIComponent(activeWorkspaceId)}`
        : "/api/tasks";
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const newTasks = data.tasks || [];
      
      // Track which tasks are new
      const existingIds = new Set(tasks.map((t) => t.id));
      const newIds = new Set<string>();
      newTasks.forEach((t: Task) => {
        if (!existingIds.has(t.id)) {
          newIds.add(t.id);
        }
      });
      
      setTasks(newTasks);
      if (newIds.size > 0) {
        setNewTaskIds(newIds);
        setTimeout(() => setNewTaskIds(new Set()), 1000);
      }
      
      addActivity(`Loaded ${newTasks.length} tasks`, "success");
    } catch (error) {
      console.error("Error fetching tasks:", error);
      addActivity("Failed to fetch tasks", "error");
    } finally {
      setIsLoading(false);
    }
  }, [tasks, addActivity, activeWorkspaceId]);

  // Refetch on mount and whenever the active workspace changes.
  useEffect(() => {
    if (demo) return;
    setIsLoading(true);
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspaceId]);

  // Refetch when fetchKey changes (triggered from chat)
  useEffect(() => {
    if (fetchKey && fetchKey > 0) {
      fetchTasks();
    }
  }, [fetchKey, fetchTasks]);

  const filteredTasks = (() => {
    let filtered = activeCategory === "All" ? tasks : tasks.filter((t) => t.category === activeCategory);
    
    if (selectedDate) {
      filtered = filtered.filter((t) => {
        const taskDate = t.scheduledDate || t.createdAt.split("T")[0];
        return taskDate === selectedDate;
      });
    }

    if (isManager && memberFilter !== "all") {
      filtered = filtered.filter((t) =>
        memberFilter === "unassigned" ? !t.assigneeId : t.assigneeId === memberFilter
      );
    }

    return filtered;
  })();

  const handleExpand = (id: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    const allCompleted = updatedSubtasks.every((st) => st.completed);
    const anyCompleted = updatedSubtasks.some((st) => st.completed);
    let newStatus: Task["status"] = task.status;

    if (allCompleted) {
      newStatus = "completed";
    } else if (anyCompleted) {
      newStatus = "in-progress";
    } else {
      newStatus = "pending";
    }

    const optimisticTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, subtasks: updatedSubtasks, status: newStatus } : t
    );
    setTasks(optimisticTasks);
    if (isDemo) return;

    try {
      addActivity("Syncing subtask...", "pending");
      const token = await getAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      await fetch(`/api/subtasks/${subtaskId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ completed: updatedSubtasks.find((s) => s.id === subtaskId)?.completed, taskId }),
      });

      if (allCompleted || newStatus !== task.status) {
        await fetch("/api/tasks", {
          method: "PATCH",
          headers,
          body: JSON.stringify({ id: taskId, updates: { status: newStatus } }),
        });
      }

      addActivity("Subtask synced", "success");
    } catch {
      addActivity("Failed to sync subtask", "error");
      fetchTasks();
    }
  };

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    const optimisticTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status } : t
    );
    setTasks(optimisticTasks);
    if (isDemo) return;

    try {
      addActivity(`Updating status to ${status}...`, "pending");
      const token = await getAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      await fetch("/api/tasks", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ id: taskId, updates: { status } }),
      });
      addActivity("Status updated", "success");
    } catch {
      addActivity("Failed to update status", "error");
      fetchTasks();
    }
  };

  const handleDelete = async (taskId: string) => {
    const optimisticTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(optimisticTasks);
    if (isDemo) return;

    try {
      addActivity("Deleting task...", "pending");
      const token = await getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      await fetch(`/api/tasks?id=${taskId}`, { method: "DELETE", headers });
      addActivity("Task deleted", "success");
    } catch {
      addActivity("Failed to delete task", "error");
      fetchTasks();
    }
  };

  const handleReassign = async (taskId: string, assigneeId: string | null) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, assigneeId } : t)));
    if (isDemo) {
      addActivity(assigneeId ? `Assigned to ${memberName(assigneeId)}` : "Unassigned", "success");
      return;
    }
    try {
      addActivity("Reassigning task...", "pending");
      const token = await getAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ id: taskId, updates: { assigneeId } }),
      });
      if (!res.ok) throw new Error("reassign failed");
      addActivity(assigneeId ? `Assigned to ${memberName(assigneeId)}` : "Unassigned", "success");
    } catch {
      addActivity("Failed to reassign", "error");
      fetchTasks();
    }
  };

  const renderCard = (task: Task) => (
    <motion.div
      key={task.id}
      layout
      initial={newTaskIds.has(task.id) ? { opacity: 0, y: 16, scale: 0.96 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 25,
        layout: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
      }}
    >
      <TaskCard
        task={task}
        isExpanded={expandedTasks.has(task.id)}
        onToggleExpand={() => handleExpand(task.id)}
        onToggleSubtask={handleToggleSubtask}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        assignedByName={isTeam && !isManager ? memberName(task.createdBy) : undefined}
        members={isManagerBoard ? members : undefined}
        onReassign={isManagerBoard ? handleReassign : undefined}
        compact={isManagerBoard}
      />
    </motion.div>
  );

  // Kanban columns: one per member (+ Unassigned). Built from tasks filtered by
  // date/category only; the member filter focuses a single column.
  const kanbanColumns = (() => {
    let base = activeCategory === "All" ? tasks : tasks.filter((t) => t.category === activeCategory);
    if (selectedDate) {
      base = base.filter((t) => (t.scheduledDate || t.createdAt.split("T")[0]) === selectedDate);
    }
    const cols = members.map((m) => ({
      key: m.uid,
      name: m.displayName || m.email || "Member",
      tasks: base.filter((t) => t.assigneeId === m.uid),
    }));
    cols.push({ key: "__unassigned", name: "Unassigned", tasks: base.filter((t) => !t.assigneeId) });
    if (memberFilter === "unassigned") return cols.filter((c) => c.key === "__unassigned");
    if (memberFilter !== "all") return cols.filter((c) => c.key === memberFilter);
    return cols;
  })();

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full">
        <HorizontalCalendar
          tasks={tasks}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
        <div
          className="sticky top-0 z-10 px-4 sm:px-6 pt-4 pb-2"
          style={{
            background: "rgba(7,8,10,0.9)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sm:flex-wrap sm:overflow-x-visible">
            {CATEGORIES.map((cat) => (
              <div
                key={cat}
                className="shrink-0 rounded-[86px] px-4 py-1.5"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  width: cat === "All" ? "50px" : cat === "Personal" ? "75px" : "65px",
                  height: "32px",
                }}
              />
            ))}
          </div>
        </div>
        <TaskSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <HorizontalCalendar
        tasks={tasks}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />
      <div
        className="sticky top-0 z-10 px-4 sm:px-6 pt-4 pb-2"
        style={{
          background: "rgba(7,8,10,0.9)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Category chips — hidden on the manager Kanban board. */}
        {!isManagerBoard && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sm:flex-wrap sm:overflow-x-visible items-center">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-[86px] px-4 py-1.5 text-[14px] font-medium ${
                  activeCategory === cat
                    ? "bg-raycast-card text-raycast-white"
                    : "bg-raycast-surface text-raycast-medium-gray"
                }`}
                style={{
                  letterSpacing: "0.2px",
                  border: activeCategory === cat ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.06)",
                }}
                whileHover={{ opacity: 0.6 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        )}

        {/* Manager Kanban controls: focus a single column by member. */}
        {isManagerBoard && (
          <div className="flex items-center justify-between gap-2 py-1">
            <span className="text-[13px] font-medium text-raycast-white">Team board</span>
            <Select
              ariaLabel="Filter by member"
              align="right"
              size="md"
              className="min-w-[150px]"
              value={memberFilter}
              onChange={setMemberFilter}
              options={[
                { value: "all", label: "All members" },
                { value: "unassigned", label: "Unassigned" },
                ...members.map((m) => ({ value: m.uid, label: m.displayName || m.email || "Member" })),
              ]}
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-20 pt-2">
        {isManagerBoard ? (
          // Kanban: horizontally-scrolling columns, one per employee.
          <div className="flex gap-3 overflow-x-auto pb-4 pt-1 items-start scrollbar-hide">
            {kanbanColumns.map((col) => {
              const done = col.tasks.filter((t) => t.status === "completed").length;
              return (
                <div
                  key={col.key}
                  className="flex w-[460px] max-w-[90vw] shrink-0 flex-col gap-3 rounded-xl p-3.5"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
                    {col.key === "__unassigned" ? (
                      <span className="text-[13px] font-medium text-raycast-medium-gray">Unassigned</span>
                    ) : (
                      <UserChip name={col.name} size="md" />
                    )}
                    <span
                      className="shrink-0 rounded-[86px] px-2 py-0.5 text-[11px] font-medium text-raycast-dim-gray"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      {done}/{col.tasks.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {col.tasks.length === 0 ? (
                      <div
                        className="rounded-lg px-3 py-8 text-center text-[12px] text-raycast-dim-gray"
                        style={{ border: "1px dashed rgba(255,255,255,0.07)" }}
                      >
                        No tasks
                      </div>
                    ) : (
                      col.tasks.map((task) => renderCard(task))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredTasks.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmptyState />
              </motion.div>
            ) : (
              <div className="flex flex-col gap-3">{filteredTasks.map((task) => renderCard(task))}</div>
            )}
          </AnimatePresence>
        )}
      </div>

      <ActivityLog activities={activities} />
    </div>
  );
}
