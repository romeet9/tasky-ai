"use client";

import { useState, useEffect } from "react";

interface Activity {
  id: string;
  message: string;
  status: "pending" | "success" | "error";
  timestamp: number;
}

export default function ActivityLog({ activities }: { activities: Activity[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const statusIcon = (status: Activity["status"]) => {
    if (status === "pending") {
      return (
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-raycast-blue border-t-transparent" />
      );
    }
    if (status === "success") {
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6L5 9L10 3" stroke="#5fc992" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="4" stroke="#FF6363" strokeWidth="1.5"/>
        <path d="M4 4L8 8M8 4L4 8" stroke="#FF6363" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  };

  const statusColor = (status: Activity["status"]) => {
    if (status === "success") return "text-raycast-green";
    if (status === "error") return "text-raycast-red";
    return "text-raycast-blue";
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full text-raycast-white transition-opacity hover:opacity-60 active:opacity-40 sm:bottom-5 sm:right-5 sm:h-10 sm:w-10"
        style={{
          background: "var(--raycast-surface)",
          boxShadow: "rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.25) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px -1px 0px 0px inset",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 1.5C6.5 1.5 4.5 3.5 4.5 6V9L3 12H15L13.5 9V6C13.5 3.5 11.5 1.5 9 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 14C7 15.1 7.9 16 9 16C10.1 16 11 15.1 11 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        {activities.filter((a) => a.status === "pending").length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-raycast-blue opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-raycast-blue" />
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="fixed bottom-16 right-4 left-4 z-50 rounded-xl sm:left-auto sm:w-80 sm:right-5"
          style={{
            background: "var(--raycast-surface)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h3
              className="text-[14px] font-medium text-raycast-white"
              style={{ letterSpacing: "0.2px" }}
            >
              Activity
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-raycast-dim-gray transition-opacity hover:opacity-60"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {activities.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13px] text-raycast-dim-gray" style={{ letterSpacing: "0px" }}>
                No activity yet
              </p>
            ) : (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {[...activities].reverse().map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="mt-0.5 shrink-0">
                      {statusIcon(activity.status)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug text-raycast-white" style={{ letterSpacing: "0.2px" }}>
                        {activity.message}
                      </p>
                      <p className={`mt-0.5 text-[11px] ${statusColor(activity.status)}`} style={{ letterSpacing: "0px" }}>
                        {formatTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
