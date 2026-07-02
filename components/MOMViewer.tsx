"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Meeting, MeetingMinutes, ActionItem, RoadmapPhase } from "@/types/meeting";

interface MOMViewerProps {
  meeting: Meeting;
  mom: MeetingMinutes;
  onClose: () => void;
  onAddTasks?: (actionItems: ActionItem[]) => void;
}

export default function MOMViewer({ meeting, mom, onClose, onAddTasks }: MOMViewerProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-2xl max-h-[85vh] rounded-xl overflow-hidden flex flex-col"
        style={{
          background: "#101111",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset",
        }}
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
        >
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-medium text-[#f9f9f9] truncate" style={{ letterSpacing: "0.2px" }}>
              {meeting.title}
            </h2>
            <p className="text-[11px] text-[#6a6b6c] mt-0.5" style={{ letterSpacing: "0.2px" }}>
              {new Date(meeting.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <motion.button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded"
            style={{ background: "rgba(255,255,255,0.04)" }}
            whileHover={{ opacity: 0.6 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5" stroke="#9c9c9d" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Summary */}
          <div>
            <span className="text-[10px] font-medium text-[#6a6b6c] uppercase" style={{ letterSpacing: "0.05px" }}>
              Summary
            </span>
            <p className="text-[13px] text-[#9c9c9d] mt-1.5 leading-relaxed" style={{ letterSpacing: "0.2px" }}>
              {mom.summary || "No summary available."}
            </p>
          </div>

          {/* Action Items */}
          {mom.actionItems.length > 0 && (
            <div>
              <span className="text-[10px] font-medium text-[#6a6b6c] uppercase" style={{ letterSpacing: "0.05px" }}>
                Action Items ({mom.actionItems.length})
              </span>
              <div className="mt-2 space-y-1.5">
                {mom.actionItems.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-2.5 rounded-lg px-3 py-2"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: i * 0.04 }}
                  >
                    <div
                      className="mt-0.5 h-3 w-3 shrink-0 rounded"
                      style={{ border: "1px solid #252829" }}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[13px] text-[#f9f9f9] block" style={{ letterSpacing: "0.2px" }}>
                        {item.task}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[#6a6b6c]" style={{ letterSpacing: "0.2px" }}>
                          {item.owner}
                        </span>
                        {item.deadline && item.deadline !== "TBD" && (
                          <>
                            <span className="text-[#6a6b6c] text-[8px]">•</span>
                            <span className="text-[10px] text-[#6a6b6c]" style={{ letterSpacing: "0.2px" }}>
                              {item.deadline}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Decisions */}
          {mom.decisions.length > 0 && (
            <div>
              <span className="text-[10px] font-medium text-[#6a6b6c] uppercase" style={{ letterSpacing: "0.05px" }}>
                Decisions
              </span>
              <div className="mt-2 space-y-1">
                {mom.decisions.map((decision, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#5fc992] shrink-0 mt-1.5" />
                    <span className="text-[13px] text-[#9c9c9d]" style={{ letterSpacing: "0.2px" }}>
                      {decision}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Roadmap */}
          {mom.roadmap.length > 0 && (
            <div>
              <span className="text-[10px] font-medium text-[#6a6b6c] uppercase" style={{ letterSpacing: "0.05px" }}>
                Roadmap
              </span>
              <div className="mt-2 space-y-3">
                {mom.roadmap.map((phase, i) => (
                  <motion.div
                    key={i}
                    className="rounded-lg px-3 py-2.5"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: i * 0.05 }}
                  >
                    <span className="text-[11px] font-medium text-[#55b3ff]" style={{ letterSpacing: "0.2px" }}>
                      {phase.phase}
                    </span>
                    <div className="mt-1.5 space-y-1">
                      {phase.items.map((item, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <span className="text-[8px] text-[#6a6b6c] mt-1">—</span>
                          <span className="text-[12px] text-[#9c9c9d]" style={{ letterSpacing: "0.2px" }}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <span className="text-[10px] text-[#6a6b6c]" style={{ letterSpacing: "0.2px" }}>
            Generated by Tasky AI
          </span>
          {mom.actionItems.length > 0 && (
            <motion.button
              onClick={() => onAddTasks?.(mom.actionItems)}
              className="rounded-[86px] px-4 py-1.5 text-[12px] font-medium text-[#f9f9f9]"
              style={{
                background: "#FF6363",
                boxShadow: "rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 99, 99, 0.25) 0px 0px 0px 1px",
                letterSpacing: "0.2px",
              }}
              whileHover={{ opacity: 0.85 }}
              whileTap={{ scale: 0.97 }}
            >
              Add {mom.actionItems.length} Tasks →
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
