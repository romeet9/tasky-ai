"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Task } from "@/types/task";
import type { WorkspaceMember } from "@/types/workspace";
import { Calendar } from "lucide-react";
import UserChip from "@/components/UserChip";

interface TaskCardProps {
  task: Task;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onStatusChange: (taskId: string, status: Task["status"]) => void;
  onDelete: (taskId: string) => void;
  // Team context (optional). assigneeName/assignedByName are resolved by the
  // parent from the workspace roster.
  assigneeName?: string | null;
  assignedByName?: string | null;
  // When provided (manager), the assignee chip becomes a reassign dropdown.
  members?: WorkspaceMember[];
  onReassign?: (taskId: string, assigneeId: string | null) => void;
}

const STATUS_ORDER: Task["status"][] = ["pending", "in-progress", "completed"];

const PRIORITY_COLORS: Record<Task["priority"], { bg: string; border: string; text: string; dot: string }> = {
  high: {
    bg: "rgba(255, 99, 99, 0.15)",
    border: "rgba(255, 99, 99, 0.3)",
    text: "#FF6363",
    dot: "bg-raycast-red",
  },
  medium: {
    bg: "rgba(255, 188, 51, 0.15)",
    border: "rgba(255, 188, 51, 0.3)",
    text: "#ffbc33",
    dot: "bg-raycast-yellow",
  },
  low: {
    bg: "rgba(85, 179, 255, 0.15)",
    border: "rgba(85, 179, 255, 0.3)",
    text: "#55b3ff",
    dot: "bg-raycast-blue",
  },
};

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateToString(d: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function isToday(dateStr: string): boolean {
  return dateStr === formatDate(new Date());
}

function isTomorrow(dateStr: string): boolean {
  const tmr = new Date();
  tmr.setDate(tmr.getDate() + 1);
  return dateStr === formatDate(tmr);
}

function isPast(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

export default function TaskCard({
  task,
  isExpanded,
  onToggleExpand,
  onToggleSubtask,
  onStatusChange,
  onDelete,
  assigneeName,
  assignedByName,
  members,
  onReassign,
}: TaskCardProps) {
  const canReassign = !!members && !!onReassign;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  const statusColors: Record<Task["status"], string> = {
    pending: "bg-raycast-dim-gray",
    "in-progress": "bg-raycast-blue",
    completed: "bg-raycast-green",
  };

  const scheduledDisplay = (() => {
    if (!task.scheduledDate) return null;
    if (isToday(task.scheduledDate)) return "Today";
    if (isTomorrow(task.scheduledDate)) return "Tomorrow";
    return dateToString(new Date(task.scheduledDate + "T00:00:00"));
  })();

  const datePillStyle = (() => {
    if (!task.scheduledDate) return null;
    if (isToday(task.scheduledDate)) {
      return {
        background: "rgba(85,179,255,0.10)",
        border: "1px solid rgba(85,179,255,0.20)",
        color: "#55b3ff",
      };
    }
    if (isTomorrow(task.scheduledDate)) {
      return {
        background: "rgba(255,188,51,0.08)",
        border: "1px solid rgba(255,188,51,0.20)",
        color: "#ffbc33",
      };
    }
    if (isPast(task.scheduledDate)) {
      return {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.04)",
        color: "#434345",
      };
    }
    return {
      background: "rgba(85,179,255,0.08)",
      border: "1px solid rgba(85,179,255,0.15)",
      color: "#55b3ff",
    };
  })();

  return (
    <motion.div
      className="rounded-xl"
      style={{
        background: "var(--raycast-surface)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset",
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ opacity: 0.85 }}
    >
      <div className="flex items-start gap-3 p-4 sm:p-5">
        <button
          onClick={() => {
            onStatusChange(task.id, "in-progress");
          }}
          className="mt-0.5 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-raycast-dim-gray transition-opacity hover:opacity-60 active:border-raycast-blue sm:mt-1 sm:h-6 sm:w-6"
        >
          {task.status === "completed" && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {task.status === "in-progress" && (
            <div className="h-2.5 w-2.5 rounded-full bg-raycast-blue" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3
                className="text-[18px] font-medium leading-tight text-raycast-white sm:text-[22px]"
                style={{ letterSpacing: "0px" }}
              >
                {task.title}
              </h3>
              <p
                className="mt-0.5 text-[13px] leading-snug text-raycast-medium-gray sm:text-[14px]"
                style={{ letterSpacing: "0.2px" }}
              >
                {task.description}
              </p>
            </div>
            <button
              onClick={() => onDelete(task.id)}
              className="shrink-0 cursor-pointer p-1 text-raycast-dim-gray transition-opacity hover:opacity-60 active:text-raycast-red sm:p-0"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Date pill — only shown when scheduledDate is set */}
          {scheduledDisplay && datePillStyle && (
            <div className="mt-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-[86px] px-2.5 py-1 text-[12px] font-medium"
                style={{
                  ...datePillStyle,
                  letterSpacing: "0px",
                }}
              >
                <Calendar size={12} strokeWidth={2} />
                {scheduledDisplay}
              </span>
            </div>
          )}

          {/* Metadata row — wraps to second line */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-[86px] bg-raycast-card px-2.5 py-1 text-[12px] font-medium text-raycast-light-gray"
              style={{ letterSpacing: "0px", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusColors[task.status]}`} />
              {task.status === "in-progress" ? "In Progress" : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-[86px] px-2.5 py-1 text-[12px] font-medium"
              style={{
                letterSpacing: "0px",
                background: PRIORITY_COLORS[task.priority].bg,
                border: `1px solid ${PRIORITY_COLORS[task.priority].border}`,
                color: PRIORITY_COLORS[task.priority].text,
              }}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_COLORS[task.priority].dot}`} />
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            <span className="text-[12px] text-raycast-dim-gray" style={{ letterSpacing: "0px" }}>
              {task.category}
            </span>
            {totalSubtasks > 0 && (
              <span className="text-[12px] text-raycast-dim-gray" style={{ letterSpacing: "0px" }}>
                {completedSubtasks}/{totalSubtasks} subtasks
              </span>
            )}

            {/* Manager: reassign dropdown. */}
            {canReassign && (
              <select
                value={task.assigneeId ?? ""}
                onChange={(e) => onReassign!(task.id, e.target.value || null)}
                className="rounded-[86px] bg-raycast-card px-2.5 py-1 text-[12px] text-raycast-light-gray outline-none"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <option value="">Unassigned</option>
                {members!.map((m) => (
                  <option key={m.uid} value={m.uid} className="bg-[#101111]">
                    {m.displayName || m.email}
                  </option>
                ))}
              </select>
            )}

            {/* Read-only assignee chip (non-manager team view). */}
            {!canReassign && assigneeName && (
              <UserChip name={assigneeName} label="Assigned to" />
            )}

            {/* Who assigned it (employee view). */}
            {assignedByName && <UserChip name={assignedByName} label="by" />}
          </div>
        </div>
      </div>

      {totalSubtasks > 0 && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={onToggleExpand}
            className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left transition-opacity hover:opacity-60 active:opacity-40 sm:px-5 sm:py-3"
          >
            <span className="text-[14px] font-medium text-raycast-medium-gray" style={{ letterSpacing: "0.2px" }}>
              Subtasks
            </span>
            <motion.svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-raycast-dim-gray"/>
            </motion.svg>
          </button>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 sm:px-5 sm:pb-4">
                  {task.subtasks.map((subtask, i) => (
                    <motion.button
                      key={subtask.id}
                      onClick={() => onToggleSubtask(task.id, subtask.id)}
                      className="flex cursor-pointer items-center gap-3 py-2.5 w-full text-left transition-opacity active:opacity-60"
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15, delay: i * 0.04 }}
                    >
                      <motion.div
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded"
                        animate={{
                          scale: subtask.completed ? [0.9, 1.05, 1] : 1,
                        }}
                        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                        style={{
                          border: subtask.completed ? "none" : "2px solid #252829",
                          background: subtask.completed
                            ? "linear-gradient(135deg, #55b3ff, #3a9bef)"
                            : "transparent",
                          boxShadow: subtask.completed
                            ? "rgba(85, 179, 255, 0.25) 0px 0px 0px 1px"
                            : "rgba(0, 0, 0, 0.28) 0px 1.189px 2.377px",
                        }}
                      >
                        {subtask.completed && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6L5 9L10 3" stroke="#07080a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </motion.div>
                      <span
                        className={`text-[14px] leading-snug transition-colors ${
                          subtask.completed
                            ? "text-raycast-dim-gray line-through"
                            : "text-raycast-white"
                        }`}
                        style={{ letterSpacing: "0.2px" }}
                      >
                        {subtask.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}