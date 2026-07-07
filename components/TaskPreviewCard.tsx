"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { WorkspaceMember } from "@/types/workspace";
import Select from "@/components/Select";

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
  // When provided (manager in a team workspace), each task shows an assignee picker.
  members?: WorkspaceMember[];
}

export default function TaskPreviewCard({ tasks, onAdd, isAdding, members }: TaskPreviewCardProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(tasks.map((t) => t.id)));
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  // Per-task assignee + priority overrides; fall back to the AI's proposals.
  const [assignees, setAssignees] = useState<Record<string, string | null>>({});
  const [priorities, setPriorities] = useState<Record<string, "high" | "medium" | "low">>({});
  const canAssign = !!members && members.length > 0;
  const assigneeFor = (t: PreviewTask): string | null =>
    t.id in assignees ? assignees[t.id] : t.assigneeId ?? null;
  const priorityFor = (t: PreviewTask): "high" | "medium" | "low" =>
    t.id in priorities ? priorities[t.id] : t.priority ?? "medium";

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
    .map((t) => ({ ...t, assigneeId: assigneeFor(t), priority: priorityFor(t) }));

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
          <div className="flex h-5 w-5 items-center justify-center rounded" style={{ background: "rgba(87,193,255,0.12)" }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1.5L5.8 3.3L7.7 3.5L6.3 4.8L6.7 6.7L5 5.7L3.3 6.7L3.7 4.8L2.3 3.5L4.2 3.3Z" fill="#57c1ff" />
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

      {/* Task rows — heading + dropdowns (subtasks · assignee · priority) */}
      {tasks.map((task, index) => {
        const isSelected = selected.has(task.id);
        const isExpanded = expandedTasks.has(task.id);
        return (
          <motion.div
            key={task.id}
            className="overflow-hidden rounded-lg"
            style={{
              background: isSelected ? "rgba(87,193,255,0.05)" : "#0d0d0d",
              border: isSelected ? "1px solid rgba(87,193,255,0.25)" : "1px solid #242728",
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1], delay: 0.05 * index }}
          >
            <div className="flex items-start gap-2.5 px-3 py-2.5">
              {/* Selection checkbox */}
              <button
                onClick={() => toggleTask(task.id)}
                aria-label={isSelected ? "Deselect task" : "Select task"}
                className="mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px]"
                style={{
                  background: isSelected ? "#57c1ff" : "transparent",
                  border: isSelected ? "none" : "2px solid #434345",
                }}
              >
                {isSelected && (
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4.5 7.5L8 3" stroke="#07080a" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              <div className="min-w-0 flex-1">
                {/* Heading only */}
                <button onClick={() => toggleTask(task.id)} className="block w-full text-left">
                  <span className="block text-[14px] font-medium leading-snug text-[#f4f4f6]" style={{ letterSpacing: "0.2px" }}>
                    {task.title}
                  </span>
                </button>

                {/* Dropdown row */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {task.subtasks.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(task.id);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[11px] font-medium"
                      style={{ background: "#101111", border: "1px solid #242728", color: "#cdcdcd" }}
                    >
                      {task.subtasks.length} subtask{task.subtasks.length > 1 ? "s" : ""}
                      <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.18 }}
                        className="text-[#8a8a8c]"
                      >
                        <ChevronDown size={12} />
                      </motion.span>
                    </button>
                  )}
                  {canAssign && (
                    <Select
                      ariaLabel="Assign task"
                      align="left"
                      size="sm"
                      className="max-w-[150px]"
                      value={assigneeFor(task) ?? ""}
                      onChange={(v) => setAssignees((prev) => ({ ...prev, [task.id]: v || null }))}
                      options={[
                        { value: "", label: "Unassigned" },
                        ...members!.map((m) => ({ value: m.uid, label: m.displayName || m.email || "Member" })),
                      ]}
                    />
                  )}
                  <Select
                    ariaLabel="Set priority"
                    align="left"
                    size="sm"
                    value={priorityFor(task)}
                    onChange={(v) => setPriorities((prev) => ({ ...prev, [task.id]: v as "high" | "medium" | "low" }))}
                    options={[
                      { value: "high", label: "High" },
                      { value: "medium", label: "Medium" },
                      { value: "low", label: "Low" },
                    ]}
                  />
                </div>

                {/* Expanded subtasks */}
                <AnimatePresence initial={false}>
                  {isExpanded && task.subtasks.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 flex flex-col gap-1.5">
                        {task.subtasks.map((st, i) => (
                          <motion.div
                            key={st.id}
                            className="flex items-start gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.12, delay: i * 0.04 }}
                          >
                            <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full" style={{ background: "#434345" }} />
                            <span className="text-[12.5px] leading-snug text-[#9c9c9d]" style={{ letterSpacing: "0.1px" }}>
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

      {/* Add button */}
      <motion.button
        onClick={() => onAdd(selectedTasks)}
        disabled={selectedCount === 0 || isAdding}
        className="w-full rounded-[86px] py-2.5 text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-30"
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
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#18191a] border-t-transparent" />
            Adding...
          </span>
        ) : (
          `Add ${selectedCount} Task${selectedCount !== 1 ? "s" : ""}`
        )}
      </motion.button>
    </motion.div>
  );
}
