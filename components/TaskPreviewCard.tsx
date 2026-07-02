"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Calendar, ChevronDown } from "lucide-react";
import type { WorkspaceMember } from "@/types/workspace";

interface Subtask {
  id: string;
  label: string;
}

interface PreviewTask {
  id: string;
  title: string;
  description: string;
  category: string;
  subtasks: Subtask[];
  priority?: "high" | "medium" | "low";
  scheduledDate?: string | null;
  assigneeId?: string | null;
  assigneeName?: string | null;
}

interface TaskPreviewCardProps {
  tasks: PreviewTask[];
  onAdd: (selectedTasks: PreviewTask[]) => void;
  isAdding: boolean;
  // When provided (manager in a team workspace), each task shows an editable
  // assignee picker defaulted to the AI's proposal.
  members?: WorkspaceMember[];
}

const PRIORITY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
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

export default function TaskPreviewCard({ tasks, onAdd, isAdding, members }: TaskPreviewCardProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(tasks.map((t) => t.id)));
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  // Per-task assignee overrides; falls back to the AI's proposed assigneeId.
  const [assignees, setAssignees] = useState<Record<string, string | null>>({});
  const canAssign = !!members && members.length > 0;
  const assigneeFor = (t: PreviewTask): string | null =>
    t.id in assignees ? assignees[t.id] : t.assigneeId ?? null;

  const toggleTask = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedCount = selected.size;
  const selectedTasks = tasks
    .filter((t) => selected.has(t.id))
    .map((t) => ({ ...t, assigneeId: assigneeFor(t) }));

  return (
    <motion.div
      className="mt-3 space-y-2"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div
            className="flex h-5 w-5 items-center justify-center rounded"
            style={{ background: "rgba(85,179,255,0.1)" }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1.5L5.8 3.3L7.7 3.5L6.3 4.8L6.7 6.7L5 5.7L3.3 6.7L3.7 4.8L2.3 3.5L4.2 3.3Z" fill="#55b3ff" />
            </svg>
          </div>
          <span className="text-[12px] font-medium text-[#9c9c9d]" style={{ letterSpacing: "0.2px" }}>
            {tasks.length} task{tasks.length > 1 ? "s" : ""} generated
          </span>
        </div>
        <span className="text-[11px] text-[#6a6b6c]" style={{ letterSpacing: "0.2px" }}>
          {selectedCount} selected
        </span>
      </div>

      {/* Task cards */}
      {tasks.map((task, index) => {
        const isSelected = selected.has(task.id);
        const isExpanded = expandedTasks.has(task.id);
        const priority = task.priority || "medium";

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
            key={task.id}
            className="rounded-lg overflow-hidden cursor-pointer"
            style={{
              background: isSelected ? "rgba(85,179,255,0.04)" : "#101111",
              border: isSelected ? "1px solid rgba(85,179,255,0.15)" : "1px solid rgba(255,255,255,0.06)",
              boxShadow: isSelected
                ? "rgba(85,179,255,0.08) 0px 2px 8px, rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset"
                : "rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset",
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1], delay: 0.05 * index }}
            onClick={() => toggleTask(task.id)}
          >
            {/* Task header */}
            <div className="flex items-start gap-2.5 px-3 py-3">
              {/* Checkbox */}
              <motion.div
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded mt-0.5"
                style={{
                  background: isSelected ? "#55b3ff" : "transparent",
                  border: isSelected ? "none" : "2px solid #252829",
                }}
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.svg
                      width="8"
                      height="8"
                      viewBox="0 0 10 10"
                      fill="none"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    >
                      <path d="M2 5L4.5 7.5L8 3" stroke="#07080a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Task info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[14px] font-medium text-[#f9f9f9] block truncate" style={{ letterSpacing: "0.2px" }}>
                      {task.title}
                    </span>
                    {task.description && (
                      <span className="text-[13px] text-[#9c9c9d] block mt-0.5 truncate" style={{ letterSpacing: "0.2px" }}>
                        {task.description}
                      </span>
                    )}
                  </div>
                  {/* Priority badge */}
                  <span
                    className="inline-flex items-center gap-1 rounded-[86px] px-2 py-0.5 text-[10px] font-medium shrink-0"
                    style={{
                      background: PRIORITY_COLORS[priority].bg,
                      border: `1px solid ${PRIORITY_COLORS[priority].border}`,
                      color: PRIORITY_COLORS[priority].text,
                      letterSpacing: "0px",
                    }}
                  >
                    <span className={`h-1 w-1 rounded-full ${PRIORITY_COLORS[priority].dot}`} />
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </span>
                </div>

                {/* Meta row: date, category, subtasks */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {scheduledDisplay && datePillStyle && (
                    <span
                      className="inline-flex items-center gap-1 rounded-[86px] px-2 py-0.5 text-[11px] font-medium"
                      style={{ ...datePillStyle, letterSpacing: "0px" }}
                    >
                      <Calendar size={10} strokeWidth={2} />
                      {scheduledDisplay}
                    </span>
                  )}
                  <span className="text-[11px] text-[#6a6b6c]" style={{ letterSpacing: "0px" }}>
                    {task.category}
                  </span>
                  {task.subtasks.length > 0 && (
                    <span className="text-[11px] text-[#6a6b6c]" style={{ letterSpacing: "0px" }}>
                      {task.subtasks.length} subtask{task.subtasks.length > 1 ? "s" : ""}
                    </span>
                  )}
                  {task.subtasks.length > 0 && (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(task.id);
                      }}
                      className="flex items-center gap-0.5 text-[11px] text-[#6a6b6c] hover:text-[#9c9c9d] transition-colors"
                      style={{ letterSpacing: "0px" }}
                    >
                      <ChevronDown size={12} />
                      {isExpanded ? "Hide" : "Show"}
                    </motion.button>
                  )}
                  {canAssign && (
                    <select
                      value={assigneeFor(task) ?? ""}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        setAssignees((prev) => ({
                          ...prev,
                          [task.id]: e.target.value || null,
                        }))
                      }
                      className="rounded-[86px] bg-[#1b1c1e] px-2 py-0.5 text-[11px] text-[#cecece] outline-none"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <option value="">Unassigned</option>
                      {members!.map((m) => (
                        <option key={m.uid} value={m.uid} className="bg-[#101111]">
                          {m.displayName || m.email}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Subtasks */}
                <AnimatePresence>
                  {isExpanded && task.subtasks.length > 0 && (
                    <motion.div
                      className="mt-2 ml-1"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <div className="pt-2 space-y-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                        {task.subtasks.map((st, i) => (
                          <motion.div
                            key={st.id}
                            className="flex items-start gap-2 py-0.5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.12, delay: i * 0.04 }}
                          >
                            <div className="h-1 w-1 rounded-full shrink-0 mt-1.5" style={{ background: "#252829" }} />
                            <span className="text-[13px] text-[#9c9c9d]" style={{ letterSpacing: "0.2px" }}>
                              {st.label}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Add button — Raycast CTA style */}
      <motion.button
        onClick={() => onAdd(selectedTasks)}
        disabled={selectedCount === 0 || isAdding}
        className="w-full rounded-[86px] py-2.5 text-[14px] font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: selectedCount > 0 ? "hsla(0,0%,100%,0.815)" : "rgba(255,255,255,0.04)",
          color: selectedCount > 0 ? "#18191a" : "#6a6b6c",
          boxShadow: selectedCount > 0 ? "rgba(255,255,255,0.1) 0px 1px 0px 0px inset" : "none",
          letterSpacing: "0.2px",
        }}
        whileHover={selectedCount > 0 ? { opacity: 0.85 } : {}}
        whileTap={selectedCount > 0 ? { scale: 0.98 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {isAdding ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-[#18191a] border-t-transparent animate-spin" />
            Adding...
          </span>
        ) : (
          `Add ${selectedCount} Task${selectedCount !== 1 ? "s" : ""}`
        )}
      </motion.button>
    </motion.div>
  );
}