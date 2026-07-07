"use client";

import AuthGuard from "@/components/AuthGuard";
import ChatInterface from "@/components/ChatInterface";
import TaskList from "@/components/TaskList";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import BottomNav from "@/components/BottomNav";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatPageContent />
    </AuthGuard>
  );
}

function ChatPageContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("chat");
  const [taskFetchKey, setTaskFetchKey] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("tasky-active-tab");
    if (saved) setActiveTab(saved);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    localStorage.setItem("tasky-active-tab", tab);
  }, []);

  const handleTasksAdded = useCallback(() => {
    setTaskFetchKey((k) => k + 1);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Desktop: Two-panel layout */}
      <div className="hidden lg:grid lg:grid-cols-[420px_1fr]">
        {/* Left: Chat */}
        <div className="h-screen border-r border-raycast-white-border">
          <ChatInterface onTasksAdded={handleTasksAdded} user={user} />
        </div>

        {/* Right: Tasks */}
        <div className="h-screen overflow-y-auto">
          <div className="flex items-center border-b border-raycast-white-border px-4 py-2.5">
            <div className="w-60">
              <WorkspaceSwitcher />
            </div>
          </div>
          <TaskList fetchKey={taskFetchKey} />
        </div>
      </div>

      {/* Mobile: Tab-based */}
      <div className="lg:hidden flex-1">
        <div className="flex items-center border-b border-raycast-white-border px-4 py-2.5">
          <div className="w-full max-w-xs">
            <WorkspaceSwitcher />
          </div>
        </div>
        {activeTab === "chat" ? (
          <ChatInterface onTasksAdded={handleTasksAdded} user={user} />
        ) : (
          <TaskList fetchKey={taskFetchKey} />
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
