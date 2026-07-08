"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { Task } from "@/types/task";

interface HorizontalCalendarProps {
  tasks: Task[];
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
}

function getDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getDaysFromStart(startDate: Date, count: number): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < count; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }
  return days;
}

function getTasksForDate(tasks: Task[], dateKey: string): Task[] {
  return tasks.filter((task) => {
    const taskDate = task.scheduledDate || task.createdAt.split("T")[0];
    return taskDate === dateKey;
  });
}

export default function HorizontalCalendar({
  tasks,
  selectedDate,
  onDateSelect,
}: HorizontalCalendarProps) {
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const days = useMemo(() => getDaysFromStart(startDate, 7), [startDate]);

  const goToPreviousWeek = () => {
    const newStart = new Date(startDate);
    newStart.setDate(startDate.getDate() - 7);
    setStartDate(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(startDate);
    newStart.setDate(startDate.getDate() + 7);
    setStartDate(newStart);
  };

  const goToToday = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    setStartDate(monday);
    onDateSelect(getDateKey(now));
  };

  const clearSelection = () => {
    onDateSelect(null);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return getDateKey(date) === getDateKey(today);
  };

  return (
    <div
      className="sticky top-0 z-10 px-4 sm:px-6 pt-4 pb-2"
      style={{
        background: "rgba(7,8,10,0.9)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          aria-label="Previous week"
          onClick={goToPreviousWeek}
          className="shrink-0 rounded-[86px] p-2 text-raycast-medium-gray transition-all hover:bg-raycast-card hover:text-raycast-white active:scale-95"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="flex flex-1 gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
          {days.map((day) => {
            const dateKey = getDateKey(day);
            const isSelected = selectedDate === dateKey;
            const today = isToday(day);
            const dayTasks = getTasksForDate(tasks, dateKey);
            const hasTasks = dayTasks.length > 0;
            const hasHighPriority = dayTasks.some((t) => t.priority === "high");
            const hasMediumPriority = dayTasks.some((t) => t.priority === "medium");

            const dotColor = hasHighPriority
              ? "bg-raycast-red"
              : hasMediumPriority
              ? "bg-raycast-yellow"
              : hasTasks
              ? "bg-raycast-blue"
              : "";

            return (
              <motion.button
                key={dateKey}
                onClick={() => onDateSelect(isSelected ? null : dateKey)}
                className="flex flex-1 min-w-[40px] sm:min-w-[48px] flex-col items-center justify-center rounded-lg py-2 transition-all active:scale-95"
                style={{
                  background: isSelected
                    ? "var(--raycast-blue-glow)"
                    : "transparent",
                  border: isSelected
                    ? "1px solid rgba(85,179,255,0.3)"
                    : "1px solid transparent",
                  boxShadow: isSelected ? "0px 0px 12px rgba(85,179,255,0.2)" : "none",
                }}
                whileHover={{ opacity: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span
                  className="text-[11px] sm:text-[12px] font-medium"
                  style={{
                    color: today ? "var(--raycast-blue)" : "var(--raycast-medium-gray)",
                    letterSpacing: "0px",
                  }}
                >
                  {day.toLocaleDateString("en-US", { weekday: "short" }).charAt(0)}
                </span>
                <span
                  className="text-[15px] sm:text-[17px] font-semibold mt-0.5"
                  style={{
                    color: isSelected
                      ? "var(--raycast-blue)"
                      : today
                      ? "var(--raycast-blue)"
                      : "var(--raycast-white)",
                    letterSpacing: "-0.374px",
                  }}
                >
                  {day.getDate()}
                </span>
                {hasTasks && (
                  <span
                    className={`mt-0.5 h-1 w-1 rounded-full ${dotColor}`}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        <button
          aria-label="Next week"
          onClick={goToNextWeek}
          className="shrink-0 rounded-[86px] p-2 text-raycast-medium-gray transition-all hover:bg-raycast-card hover:text-raycast-white active:scale-95"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="hidden sm:flex items-center gap-2 ml-2">
          <motion.button
            onClick={goToToday}
            className="rounded-[86px] px-3 py-1 text-[13px] font-medium text-raycast-blue transition-all hover:bg-raycast-card active:scale-95"
            style={{
              border: "1px solid var(--raycast-blue)",
              letterSpacing: "0px",
            }}
            whileHover={{ opacity: 0.85 }}
            whileTap={{ scale: 0.95 }}
          >
            Today
          </motion.button>
          {selectedDate && (
            <motion.button
              onClick={clearSelection}
              className="rounded-[86px] px-3 py-1 text-[13px] font-medium text-raycast-dim-gray transition-all hover:bg-raycast-card hover:text-raycast-medium-gray active:scale-95"
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                letterSpacing: "0px",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ opacity: 0.85 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear
            </motion.button>
          )}
        </div>
      </div>

      {/* Mobile buttons */}
      <div className="flex sm:hidden items-center justify-center gap-2 mt-2">
        <motion.button
          onClick={goToToday}
          className="rounded-[86px] px-3 py-1 text-[13px] font-medium text-raycast-blue transition-all hover:bg-raycast-card active:scale-95"
          style={{
            border: "1px solid var(--raycast-blue)",
            letterSpacing: "0px",
          }}
          whileHover={{ opacity: 0.85 }}
          whileTap={{ scale: 0.95 }}
        >
          Today
        </motion.button>
        {selectedDate && (
          <motion.button
            onClick={clearSelection}
            className="rounded-[86px] px-3 py-1 text-[13px] font-medium text-raycast-dim-gray transition-all hover:bg-raycast-card hover:text-raycast-medium-gray active:scale-95"
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              letterSpacing: "0px",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ opacity: 0.85 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear
          </motion.button>
        )}
      </div>
    </div>
  );
}