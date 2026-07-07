"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Task } from "@/types/task";
import type { WorkspaceMember } from "@/types/workspace";
import { Calendar, ChevronDown, Flag, ListChecks, UserRound } from "lucide-react";

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
  // Denser layout for narrow Kanban columns.
  compact?: boolean;
}

// Tokens from DESIGN-raycast.md — the card follows the dark surface ladder,
// hairline borders (no shadows), and soft semantic badges.
const RC = {
  surface: "#0d0d0d",
  surfaceElevated: "#101111",
  ink: "#f4f4f6",
  body: "#cdcdcd",
  mute: "#9c9c9d",
  ash: "#6a6b6c",
  stone: "#434345",
  hairline: "#242728",
  hairlineSoft: "rgba(255,255,255,0.08)",
  onDarkMute: "rgba(255,255,255,0.72)",
  blue: "#57c1ff",
  blueSoft: "rgba(87,193,255,0.15)",
  red: "#ff6161",
  redSoft: "rgba(255,97,97,0.15)",
  green: "#59d499",
  greenSoft: "rgba(89,212,153,0.15)",
  yellow: "#ffc533",
  yellowSoft: "rgba(255,197,51,0.15)",
};

const PRIORITY: Record<Task["priority"], { text: string; soft: string; label: string; emoji: string }> = {
  high: { text: RC.red, soft: RC.redSoft, label: "High", emoji: "🔴" },
  medium: { text: RC.yellow, soft: RC.yellowSoft, label: "Medium", emoji: "🟡" },
  low: { text: RC.blue, soft: RC.blueSoft, label: "Low", emoji: "🔵" },
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
  compact = false,
}: TaskCardProps) {
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const isDone = task.status === "completed";
  const priority = PRIORITY[task.priority];

  // Readable due date, e.g. "3 Jul".
  const dateLabel = (() => {
    if (!task.scheduledDate) return null;
    const [y, m, d] = task.scheduledDate.split("-").map(Number);
    if (!y || !m || !d) return null;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d} ${months[m - 1]}`;
  })();

  // Chips for priority / date / subtasks — taller than the base badge.
  const badge =
    "inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-2.5 text-[11px] font-medium leading-[1.5]";
  const badgeLS = { letterSpacing: "0.3px" };

  return (
    <motion.div
      className="group relative rounded-[10px] border transition-colors"
      style={{
        background: RC.surface,
        borderColor: RC.hairline,
        fontFeatureSettings: '"calt", "kern", "liga", "ss03"',
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.16)" }}
    >
      <div className={`flex items-start gap-3 ${compact ? "p-3.5" : "p-4"}`}>
        <button
          onClick={() => onStatusChange(task.id, isDone ? "pending" : "in-progress")}
          title={isDone ? "Mark as pending" : "Mark as in progress"}
          className={`mt-0.5 flex shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-colors ${
            compact ? "h-5 w-5" : "h-[22px] w-[22px]"
          }`}
          style={{
            borderColor: isDone ? RC.green : task.status === "in-progress" ? RC.blue : RC.stone,
            background: isDone ? RC.green : "transparent",
          }}
        >
          {isDone && (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="#07080a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {task.status === "in-progress" && <div className="h-2 w-2 rounded-full" style={{ background: RC.blue }} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3
                className={`font-medium leading-snug ${compact ? "text-[15px] line-clamp-2" : "text-[18px]"} ${
                  isDone ? "line-through" : ""
                }`}
                style={{ letterSpacing: "0.2px", color: isDone ? RC.ash : RC.ink }}
              >
                {task.title}
              </h3>
              {task.description && (
                <p
                  className={`mt-1 leading-snug ${compact ? "text-[12.5px] line-clamp-2" : "text-[14px]"}`}
                  style={{ letterSpacing: "0.1px", color: isDone ? RC.ash : RC.mute }}
                >
                  {task.description}
                </p>
              )}
            </div>
            <button
              onClick={() => onDelete(task.id)}
              title="Delete task"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] opacity-0 transition group-hover:opacity-100 focus:opacity-100 hover:bg-[rgba(255,97,97,0.12)]"
              style={{ color: RC.ash }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Meta line — priority · date on the left, subtasks dropdown at the far right */}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <span className={badge} style={{ ...badgeLS, background: RC.surfaceElevated, color: RC.body }}>
                <Flag size={12} strokeWidth={2.5} color={priority.text} />
                {priority.label}
              </span>
              {dateLabel && (
                <span className={badge} style={{ ...badgeLS, background: RC.surfaceElevated, color: RC.body }}>
                  <Calendar size={12} strokeWidth={2} style={{ color: RC.mute }} />
                  {dateLabel}
                </span>
              )}
              {assignedByName && (
                <span
                  className="flex shrink-0 items-center gap-1 text-[11px]"
                  style={{ color: RC.ash }}
                  title={`Assigned by ${assignedByName}`}
                >
                  <UserRound size={12} strokeWidth={2} />
                  {assignedByName}
                </span>
              )}
            </div>

            {totalSubtasks > 0 && (
              <button
                onClick={onToggleExpand}
                title={isExpanded ? "Hide subtasks" : "Show subtasks"}
                className={`${badge} shrink-0 cursor-pointer transition-colors`}
                style={{ ...badgeLS, background: RC.surfaceElevated, color: RC.body }}
              >
                <ListChecks size={12} strokeWidth={2} style={{ color: RC.mute }} />
                <span className="tabular-nums">
                  {completedSubtasks}/{totalSubtasks} subtasks
                </span>
                <motion.span
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.18 }}
                  className="text-[#8a8a8c]"
                >
                  <ChevronDown size={11} strokeWidth={2} />
                </motion.span>
              </button>
            )}
          </div>

          {totalSubtasks > 0 && (
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-1.5 flex flex-col">
                    {task.subtasks.map((subtask, i) => (
                      <motion.button
                        key={subtask.id}
                        onClick={() => onToggleSubtask(task.id, subtask.id)}
                        className="flex w-full cursor-pointer items-start gap-2.5 py-2 text-left transition-opacity active:opacity-60"
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15, delay: i * 0.04 }}
                      >
                        <span
                          className="mt-[1px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px]"
                          style={{
                            border: subtask.completed ? "none" : `2px solid ${RC.stone}`,
                            background: subtask.completed ? RC.blue : "transparent",
                          }}
                        >
                          {subtask.completed && (
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="#07080a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span
                          className={`text-[13px] leading-snug ${subtask.completed ? "line-through" : ""}`}
                          style={{ letterSpacing: "0.1px", color: subtask.completed ? RC.ash : RC.body }}
                        >
                          {subtask.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}
