"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { getAccessToken } from "@/lib/auth";

interface CreateMeetingModalProps {
  onClose: () => void;
  onCreate: (data: {
    title: string;
    description: string;
    meetingUrl: string;
    durationMinutes: number;
    participants: { name: string; email: string }[];
  }) => void;
}

export default function CreateMeetingModal({ onClose, onCreate }: CreateMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [participants, setParticipants] = useState<{ name: string; email: string }[]>([]);
  const [participantInput, setParticipantInput] = useState("");
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [isCheckingGoogle, setIsCheckingGoogle] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Generate meet link on modal open (if Google is connected)
  const generateMeetLink = useCallback(async () => {
    if (meetingUrl && !linkError) return; // Don't regenerate if we already have a valid link
    
    setIsGeneratingLink(true);
    setLinkError("");

    try {
      const token = await getAccessToken();
      const now = new Date();
      const startTime = new Date(now.getTime() + 15 * 60000).toISOString();
      const endTime = new Date(now.getTime() + (durationMinutes + 15) * 60000).toISOString();

      const res = await fetch("/api/meetings/create-link", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: title.trim() || "Quick Meeting",
          description: description.trim(),
          startTime,
          endTime,
          attendees: participants.filter((p) => p.email).map((p) => ({ email: p.email })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMeetingUrl(data.meetUrl || "");
        setLinkError("");
      } else {
        const errorData = await res.json();
        setLinkError(errorData.error || "Failed to generate link");
      }
    } catch {
      setLinkError("Failed to generate meeting link");
    } finally {
      setIsGeneratingLink(false);
    }
  }, [title, description, durationMinutes, participants, meetingUrl, linkError]);

  // Check Google status on mount
  useEffect(() => {
    const checkGoogle = async () => {
      setIsCheckingGoogle(true);
      try {
        const token = await getAccessToken();
        const statusRes = await fetch("/api/meetings/google-status", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setGoogleConnected(statusData.connected || false);
          setGoogleEmail(statusData.email || null);
        }
      } catch {
        setGoogleConnected(false);
        setGoogleEmail(null);
      } finally {
        setIsCheckingGoogle(false);
      }
    };
    checkGoogle();
  }, []);

  // Generate link when Google is connected (on modal open)
  useEffect(() => {
    if (googleConnected && !isCheckingGoogle && !meetingUrl && !isGeneratingLink) {
      generateMeetLink();
    }
  }, [googleConnected, isCheckingGoogle, meetingUrl, isGeneratingLink, generateMeetLink]);

  const addParticipant = () => {
    const trimmed = participantInput.trim();
    if (!trimmed) return;
    const parts = trimmed.split(/[,;\s]+/);
    const name = parts[0] || "";
    const email = parts[1] || "";
    if (name) {
      setParticipants((prev) => [...prev, { name, email }]);
      setParticipantInput("");
    }
  };

  const removeParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const copyToClipboard = async () => {
    if (!meetingUrl) return;
    try {
      await navigator.clipboard.writeText(meetingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      console.error("Failed to copy link");
    }
  };

  const handleGoogleConnect = () => {
    window.location.href = "/api/auth/google?redirect=/chat";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({
      title: title.trim(),
      description: description.trim(),
      meetingUrl: meetingUrl.trim(),
      durationMinutes,
      participants,
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-md max-h-[85vh] rounded-xl overflow-hidden flex flex-col"
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
          <h2 className="text-[15px] font-medium text-[#f9f9f9]" style={{ letterSpacing: "0.2px" }}>
            New Meeting
          </h2>
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Google Status */}
          <div>
            {isCheckingGoogle ? (
              <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="h-4 w-4 rounded-full border-2 border-[#55b3ff] border-t-transparent animate-spin" />
                <span className="text-[11px] text-[#6a6b6c]" style={{ letterSpacing: "0.2px" }}>
                  Checking Google Calendar...
                </span>
              </div>
            ) : googleConnected ? (
              <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "rgba(95,201,146,0.08)", border: "1px solid rgba(95,201,146,0.15)" }}>
                <div className="h-2 w-2 rounded-full bg-[#5fc992]" />
                <span className="text-[11px] text-[#9c9c9d]" style={{ letterSpacing: "0.2px" }}>
                  Google Calendar connected{googleEmail ? ` (${googleEmail})` : ""}
                </span>
              </div>
            ) : (
              <motion.button
                type="button"
                onClick={handleGoogleConnect}
                className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-[12px] font-medium"
                style={{
                  background: "rgba(85,179,255,0.1)",
                  border: "1px solid rgba(85,179,255,0.2)",
                  color: "#55b3ff",
                  letterSpacing: "0.2px",
                }}
                whileHover={{ opacity: 0.85 }}
                whileTap={{ scale: 0.97 }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1a3 3 0 100 6 3 3 0 000-6zM1 10v1a1 1 0 001 1h10a1 1 0 001-1v-1M3.5 7h7M5.5 5l1.5 2 1.5-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Connect Google Calendar
              </motion.button>
            )}
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-[11px] font-medium text-[#6a6b6c] mb-1.5" style={{ letterSpacing: "0.05px" }}>
              Meeting Link
            </label>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {isGeneratingLink ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-[#55b3ff] border-t-transparent animate-spin" />
                    <span className="ml-2 text-[11px] text-[#6a6b6c]" style={{ letterSpacing: "0.2px" }}>
                      Generating link...
                    </span>
                  </>
                ) : linkError ? (
                  <span className="text-[11px] text-[#FF6363]" style={{ letterSpacing: "0.2px" }}>
                    {linkError}
                  </span>
                ) : meetingUrl ? (
                  <span className="text-[11px] text-[#55b3ff] truncate flex-1" style={{ letterSpacing: "0.2px" }}>
                    {meetingUrl}
                  </span>
                ) : (
                  <span className="text-[11px] text-[#6a6b6c]" style={{ letterSpacing: "0.2px" }}>
                    {googleConnected ? "Link will appear here..." : "Connect Google Calendar to generate link"}
                  </span>
                )}
              </div>
              
              {meetingUrl && !isGeneratingLink && (
                <motion.button
                  type="button"
                  onClick={copyToClipboard}
                  className="shrink-0 rounded-lg px-3 py-2 text-[11px] font-medium"
                  style={{
                    background: copiedLink ? "rgba(95,201,146,0.1)" : "rgba(255,255,255,0.04)",
                    border: copiedLink ? "1px solid rgba(95,201,146,0.2)" : "1px solid rgba(255,255,255,0.06)",
                    color: copiedLink ? "#5fc992" : "#9c9c9d",
                    letterSpacing: "0.2px",
                  }}
                  whileHover={{ opacity: 0.85 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copiedLink ? "Copied!" : "Copy"}
                </motion.button>
              )}
            </div>

            {/* Regenerate Link Button */}
            {!isGeneratingLink && meetingUrl && !linkError && (
              <motion.button
                type="button"
                onClick={() => {
                  setMeetingUrl("");
                  setLinkError("");
                  generateMeetLink();
                }}
                className="mt-2 text-[10px] text-[#6a6b6c] hover:text-[#9c9c9d] transition-colors"
                style={{ letterSpacing: "0.2px" }}
                whileHover={{ opacity: 0.8 }}
              >
                Regenerate link
              </motion.button>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-medium text-[#6a6b6c] mb-1.5" style={{ letterSpacing: "0.05px" }}>
              Meeting Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sprint Planning"
              required
              className="w-full rounded-lg px-3 py-2 text-[13px] text-[#f9f9f9] bg-[#07080a] border border-[rgba(255,255,255,0.08)] focus:outline-none focus:ring-1 focus:ring-[#55b3ff]"
              style={{ letterSpacing: "0.2px" }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-medium text-[#6a6b6c] mb-1.5" style={{ letterSpacing: "0.05px" }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional meeting description..."
              rows={2}
              className="w-full rounded-lg px-3 py-2 text-[13px] text-[#f9f9f9] bg-[#07080a] border border-[rgba(255,255,255,0.08)] focus:outline-none focus:ring-1 focus:ring-[#55b3ff] resize-none"
              style={{ letterSpacing: "0.2px" }}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[11px] font-medium text-[#6a6b6c] mb-1.5" style={{ letterSpacing: "0.05px" }}>
              Duration
            </label>
            <div className="flex gap-2">
              {[15, 30, 45, 60].map((min) => (
                <motion.button
                  key={min}
                  type="button"
                  onClick={() => setDurationMinutes(min)}
                  className="flex-1 rounded-lg py-2 text-[12px] font-medium"
                  style={{
                    background: durationMinutes === min ? "rgba(85,179,255,0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${durationMinutes === min ? "rgba(85,179,255,0.2)" : "rgba(255,255,255,0.06)"}`,
                    color: durationMinutes === min ? "#55b3ff" : "#6a6b6c",
                    letterSpacing: "0.2px",
                  }}
                  whileHover={{ opacity: 0.6 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {min}m
                </motion.button>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-[11px] font-medium text-[#6a6b6c] mb-1.5" style={{ letterSpacing: "0.05px" }}>
              Participants
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={participantInput}
                onChange={(e) => setParticipantInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addParticipant();
                  }
                }}
                placeholder="Name, email"
                className="flex-1 rounded-lg px-3 py-2 text-[13px] text-[#f9f9f9] bg-[#07080a] border border-[rgba(255,255,255,0.08)] focus:outline-none focus:ring-1 focus:ring-[#55b3ff]"
                style={{ letterSpacing: "0.2px" }}
              />
              <motion.button
                type="button"
                onClick={addParticipant}
                className="shrink-0 rounded-lg px-3 py-2 text-[11px] font-medium text-[#9c9c9d]"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  letterSpacing: "0.2px",
                }}
                whileHover={{ opacity: 0.6 }}
                whileTap={{ scale: 0.95 }}
              >
                Add
              </motion.button>
            </div>
            {participants.length > 0 && (
              <div className="mt-2 space-y-1">
                {participants.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg px-3 py-1.5"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[12px] text-[#f9f9f9]" style={{ letterSpacing: "0.2px" }}>
                        {p.name}
                      </span>
                      {p.email && (
                        <span className="text-[10px] text-[#6a6b6c] ml-2" style={{ letterSpacing: "0.2px" }}>
                          {p.email}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeParticipant(i)}
                      className="shrink-0 text-[#6a6b6c] hover:text-[#FF6363] transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-5 py-3 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <motion.button
            type="button"
            onClick={onClose}
            className="rounded-[86px] px-4 py-2 text-[12px] font-medium text-[#9c9c9d]"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              letterSpacing: "0.2px",
            }}
            whileHover={{ opacity: 0.6 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="rounded-[86px] px-4 py-2 text-[12px] font-medium text-[#f9f9f9] disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: "#FF6363",
              boxShadow: "rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 99, 99, 0.25) 0px 0px 0px 1px",
              letterSpacing: "0.2px",
            }}
            whileHover={{ opacity: 0.85 }}
            whileTap={{ scale: 0.97 }}
          >
            Create Meeting
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}