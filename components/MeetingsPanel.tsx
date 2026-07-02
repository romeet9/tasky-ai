"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  DotsThreeVertical, 
  CaretDown, 
  Share, 
  VideoCamera, 
  PencilSimple, 
  Calendar,
  CircleNotch 
} from "@phosphor-icons/react";
import type { Meeting, MeetingMinutes } from "@/types/meeting";
import { getAccessToken } from "@/lib/auth";

interface MeetingsPanelProps {
  onMeetingSelect?: (meeting: Meeting, mom: MeetingMinutes | null) => void;
  onCreateMeeting?: () => void;
  refreshKey?: number;
}

type ExtendedMeeting = Meeting & {
  mom?: MeetingMinutes | null;
  source?: string;
  htmlLink?: string;
  participants?: { name: string; email?: string }[];
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = ["#FF6363", "#55b3ff", "#5fc992", "#ffbc33", "#a78bfa", "#f472b6"];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function MeetingsPanel({ onMeetingSelect, onCreateMeeting, refreshKey = 0 }: MeetingsPanelProps) {
  const [meetings, setMeetings] = useState<ExtendedMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMeetings, setExpandedMeetings] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getAccessToken();
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [meetingsRes, googleStatusRes] = await Promise.all([
        fetch("/api/meetings", { headers: authHeaders }),
        fetch("/api/meetings/google-status", { headers: authHeaders }),
      ]);

      const meetingsData = meetingsRes.ok ? await meetingsRes.json() : { meetings: [] };
      const fetchedMeetings = (meetingsData.meetings || []).map((m: ExtendedMeeting) => ({ ...m, source: "supabase" }));

      let googleConnectedStatus = false;
      if (googleStatusRes.ok) {
        const statusData = await googleStatusRes.json();
        googleConnectedStatus = statusData.connected;
      }

      let googleMeetings: ExtendedMeeting[] = [];
      if (googleConnectedStatus) {
        try {
          const googleRes = await fetch("/api/meetings/fetch-google", { headers: authHeaders });
          if (googleRes.ok) {
            const googleData = await googleRes.json();
            googleMeetings = (googleData.meetings || []).map((m: ExtendedMeeting) => ({
              ...m,
              source: "google-calendar",
            }));
          }
        } catch (err) {
          console.error("Failed to fetch Google Calendar events:", err);
        }
      }

      const seenUrls = new Set<string>();
      const merged: ExtendedMeeting[] = [];

      for (const m of fetchedMeetings) {
        merged.push(m);
        if (m.meetingUrl) seenUrls.add(m.meetingUrl);
      }

      for (const m of googleMeetings) {
        if (!m.meetingUrl || !seenUrls.has(m.meetingUrl)) {
          merged.push(m);
          if (m.meetingUrl) seenUrls.add(m.meetingUrl);
        }
      }

      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setMeetings(merged);
    } catch (err) {
      console.error("Failed to fetch meetings:", err);
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings, refreshKey]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const toggleExpand = (id: string) => {
    setExpandedMeetings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { label: "Completed", color: "#5fc992", bg: "rgba(95,201,146,0.12)" };
      case "in-progress":
        return { label: "In Progress", color: "#55b3ff", bg: "rgba(85,179,255,0.12)" };
      default:
        return { label: "Scheduled", color: "#9c9c9d", bg: "rgba(255,255,255,0.04)" };
    }
  };

  const handleDelete = async (meetingId: string) => {
    try {
      const token = await getAccessToken();
      await fetch(`/api/meetings/${meetingId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
      setOpenMenuId(null);
    } catch (err) {
      console.error("Failed to delete meeting:", err);
    }
  };

  const handleShare = async (meetingUrl: string) => {
    try {
      await navigator.clipboard.writeText(meetingUrl);
      setToastMessage("Link copied!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#f9f9f9]" style={{ letterSpacing: "0.2px" }}>
              Meetings
            </span>
            <div className="h-6 w-6 rounded flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
              <CircleNotch size={12} color="#55b3ff" weight="regular" className="animate-spin" />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl p-4"
              style={{
                background: "#101111",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset",
              }}
            >
              <div className="flex-1">
                <div className="h-4 w-32 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
                <div className="h-3 w-48 rounded mt-2" style={{ background: "rgba(255,255,255,0.03)" }} />
                <div className="flex gap-2 mt-3">
                  <div className="h-6 w-20 rounded-[86px]" style={{ background: "rgba(255,255,255,0.03)" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#f9f9f9]" style={{ letterSpacing: "0.2px" }}>
            Meetings
          </span>
          <motion.button
            onClick={() => onCreateMeeting?.()}
            className="flex items-center justify-center h-6 w-6 rounded transition-colors"
            style={{ background: "rgba(255,255,255,0.04)" }}
            whileHover={{ opacity: 0.6 }}
            whileTap={{ scale: 0.9 }}
          >
            <Plus size={10} color="#9c9c9d" weight="regular" />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl mb-4"
              style={{
                background: "#101111",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset",
              }}
            >
              <Calendar size={22} color="#6a6b6c" weight="regular" />
            </div>
            <span className="text-[14px] font-medium text-[#9c9c9d]" style={{ letterSpacing: "0.2px" }}>
              No meetings yet
            </span>
            <span className="text-[12px] text-[#6a6b6c] mt-1" style={{ letterSpacing: "0px" }}>
              Click the + button to create one
            </span>
          </div>
        ) : (
          meetings.map((meeting, i) => {
            const isExpanded = expandedMeetings.has(meeting.id);
            const status = meeting.status || "scheduled";
            const statusConfig = getStatusConfig(status);
            const participants = meeting.participants || [];
            const isCompleted = status === "completed";
            const hasUrl = !!meeting.meetingUrl;

            return (
              <motion.div
                key={meeting.id}
                className="rounded-xl"
                style={{
                  background: "#101111",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset",
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1], delay: i * 0.04 }}
                whileHover={{ opacity: 0.85 }}
              >
                <div className="p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[16px] font-medium leading-tight text-[#f9f9f9] truncate" style={{ letterSpacing: "0px" }}>
                            {meeting.title}
                          </h3>
                          {meeting.source === "google-calendar" && (
                            <span
                              className="shrink-0 rounded-[86px] px-2 py-0.5 text-[9px] font-medium"
                              style={{ background: "rgba(85,179,255,0.1)", color: "#55b3ff", letterSpacing: "0px", border: "1px solid rgba(85,179,255,0.15)" }}
                            >
                              Google
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[13px] text-[#9c9c9d]" style={{ letterSpacing: "0.2px" }}>
                            {formatDate(meeting.createdAt)}
                          </span>
                          {meeting.durationMinutes && (
                            <>
                              <span className="text-[13px] text-[#434345]">·</span>
                              <span className="text-[13px] text-[#9c9c9d]" style={{ letterSpacing: "0.2px" }}>
                                {meeting.durationMinutes}m
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="relative" ref={openMenuId === meeting.id ? menuRef : undefined}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === meeting.id ? null : meeting.id);
                          }}
                          className="shrink-0 p-1 rounded transition-colors"
                          style={{ color: "#6a6b6c" }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "#9c9c9d"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "#6a6b6c"}
                        >
                          <DotsThreeVertical size={16} weight="regular" />
                        </button>

                        <AnimatePresence>
                          {openMenuId === meeting.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -4, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -4, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 top-full mt-1 z-10 min-w-[100px] rounded-lg overflow-hidden"
                              style={{
                                background: "#1b1c1e",
                                border: "1px solid rgba(255,255,255,0.08)",
                                boxShadow: "rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset, rgba(0,0,0,0.3) 0px 8px 16px",
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(meeting.id);
                                }}
                                className="w-full px-3 py-2 text-left text-[13px] text-[#FF6363] transition-colors flex items-center gap-2"
                                style={{ letterSpacing: "0.2px" }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,99,99,0.08)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                              >
                                Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-[86px] px-2.5 py-1 text-[11px] font-medium text-[#cecece]"
                        style={{ background: statusConfig.bg, letterSpacing: "0px", border: "1px solid rgba(255,255,255,0.04)" }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusConfig.color }} />
                        {statusConfig.label}
                      </span>

                      {participants.length > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1.5">
                            {participants.slice(0, 4).map((p, idx) => (
                              <div
                                key={idx}
                                className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-medium shrink-0"
                                style={{
                                  background: getAvatarColor(p.name),
                                  color: "#07080a",
                                  border: "1.5px solid #101111",
                                  zIndex: participants.length - idx,
                                }}
                              >
                                {getInitials(p.name)}
                              </div>
                            ))}
                            {participants.length > 4 && (
                              <div
                                className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-medium shrink-0"
                                style={{
                                  background: "#1b1c1e",
                                  color: "#9c9c9d",
                                  border: "1.5px solid #101111",
                                }}
                              >
                                +{participants.length - 4}
                              </div>
                            )}
                          </div>
                          <span className="text-[11px] text-[#6a6b6c]" style={{ letterSpacing: "0px" }}>
                            {participants.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {!isCompleted && hasUrl && (
                  <div className="flex gap-2 px-4 pb-4">
                    <motion.button
                      onClick={() => handleShare(meeting.meetingUrl!)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-[86px] py-1.5 text-[12px] font-medium text-[#f9f9f9] transition-colors"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", letterSpacing: "0px" }}
                      whileHover={{ opacity: 0.85 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Share size={14} weight="regular" />
                      Share
                    </motion.button>
                    <motion.a
                      href={meeting.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-[86px] py-1.5 text-[12px] font-medium text-[#07080a] transition-colors"
                      style={{ background: "#55b3ff", letterSpacing: "0px" }}
                      whileHover={{ opacity: 0.85 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <VideoCamera size={14} weight="regular" />
                      Join
                    </motion.a>
                    <motion.button
                      onClick={() => setOpenMenuId(meeting.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-[86px] py-1.5 text-[12px] font-medium text-[#f9f9f9] transition-colors"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", letterSpacing: "0px" }}
                      whileHover={{ opacity: 0.85 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <PencilSimple size={14} weight="regular" />
                      Edit
                    </motion.button>
                  </div>
                )}

                {isCompleted && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <button
                      onClick={() => toggleExpand(meeting.id)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left transition-opacity"
                      style={{ cursor: "pointer" }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = "0.6"}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                    >
                      <span className="text-[14px] font-medium text-[#9c9c9d]" style={{ letterSpacing: "0.2px" }}>
                        Details
                      </span>
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}>
                        <CaretDown size={16} color="#6a6b6c" weight="regular" />
                      </motion.div>
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
                          <div className="px-4 pb-4 space-y-3">
                            {meeting.description && (
                              <div>
                                <span className="text-[10px] font-medium text-[#6a6b6c] uppercase" style={{ letterSpacing: "0.05px" }}>
                                  Description
                                </span>
                                <p className="mt-1 text-[13px] leading-snug text-[#f9f9f9]" style={{ letterSpacing: "0.2px" }}>
                                  {meeting.description}
                                </p>
                              </div>
                            )}

                            {meeting.mom ? (
                              <>
                                <div>
                                  <span className="text-[10px] font-medium text-[#6a6b6c] uppercase" style={{ letterSpacing: "0.05px" }}>
                                    Summary
                                  </span>
                                  <p className="mt-1 text-[13px] leading-snug text-[#f9f9f9]" style={{ letterSpacing: "0.2px" }}>
                                    {meeting.mom.summary}
                                  </p>
                                </div>
                                {meeting.mom.actionItems.length > 0 && (
                                  <div>
                                    <span className="text-[10px] font-medium text-[#6a6b6c] uppercase" style={{ letterSpacing: "0.05px" }}>
                                      {meeting.mom.actionItems.length} Action Items
                                    </span>
                                    <div className="mt-2 space-y-2">
                                      {meeting.mom.actionItems.slice(0, 3).map((item, j) => (
                                        <motion.div
                                          key={j}
                                          className="flex items-start gap-2"
                                          initial={{ opacity: 0, x: -4 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ duration: 0.15, delay: j * 0.04 }}
                                        >
                                          <div
                                            className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded"
                                            style={{
                                              border: "2px solid #252829",
                                              background: "transparent",
                                              boxShadow: "rgba(0, 0, 0, 0.28) 0px 1.189px 2.377px",
                                            }}
                                          >
                                            <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#55b3ff" }} />
                                          </div>
                                          <span className="text-[14px] leading-snug text-[#f9f9f9]" style={{ letterSpacing: "0.2px" }}>
                                            {item.task}
                                          </span>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <motion.button
                                  className="w-full rounded-[86px] py-2 text-[13px] font-medium text-[#f9f9f9]"
                                  style={{
                                    background: "#FF6363",
                                    boxShadow: "rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 99, 99, 0.25) 0px 0px 0px 1px",
                                    letterSpacing: "0.2px",
                                  }}
                                  whileHover={{ opacity: 0.85 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMeetingSelect?.(meeting, meeting.mom || null);
                                  }}
                                >
                                  View Full MOM
                                </motion.button>
                              </>
                            ) : (
                              <motion.button
                                className="w-full rounded-[86px] py-2 text-[13px] font-medium text-[#f9f9f9]"
                                style={{
                                  background: "#FF6363",
                                  boxShadow: "rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 99, 99, 0.25) 0px 0px 0px 1px",
                                  letterSpacing: "0.2px",
                                }}
                                whileHover={{ opacity: 0.85 }}
                                whileTap={{ scale: 0.97 }}
                              >
                                Generate MOM
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-[86px] text-[13px] font-medium text-[#07080a]"
            style={{ background: "#55b3ff", letterSpacing: "0px" }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}