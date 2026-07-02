"use client";

import { ChatCircle, CheckSquare } from "@phosphor-icons/react";

export default function BottomNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
      <div
        className="flex items-center justify-around py-2 border-t"
        style={{
          background: "var(--raycast-bg)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={() => onTabChange("chat")}
          className="flex flex-col items-center gap-1 px-6 py-1.5 transition-opacity"
        >
          <ChatCircle size={22} weight="regular" color={activeTab === "chat" ? "#FF6363" : "#6a6b6c"} />
          <span
            className="text-[10px] font-medium tracking-[0.2px]"
            style={{ color: activeTab === "chat" ? "#FF6363" : "#6a6b6c" }}
          >
            Chat
          </span>
        </button>
        <button
          onClick={() => onTabChange("tasks")}
          className="flex flex-col items-center gap-1 px-6 py-1.5 transition-opacity"
        >
          <CheckSquare size={22} weight="regular" color={activeTab === "tasks" ? "#FF6363" : "#6a6b6c"} />
          <span
            className="text-[10px] font-medium tracking-[0.2px]"
            style={{ color: activeTab === "tasks" ? "#FF6363" : "#6a6b6c" }}
          >
            Tasks
          </span>
        </button>
      </div>
    </div>
  );
}
