"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Clock, GearSix, Check } from "@phosphor-icons/react";
import type { Task } from "@/types/task";
import type { User } from "firebase/auth";
import TaskPreviewCard from "@/components/TaskPreviewCard";
import ChatInput from "@/components/ChatInput";
import ChatSkeleton from "@/components/ChatSkeleton";
import { getAccessToken } from "@/lib/auth";
import { db } from "@/lib/firebase/client";
import { collection, query, where, orderBy, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { can } from "@/lib/rbac/permissions";

interface ChatInterfaceProps {
  onTasksAdded?: () => void;
  user: User | null;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  pendingTasks?: Task[];
  timestamp: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  text: string;
}

export default function ChatInterface({
  onTasksAdded,
  user,
}: ChatInterfaceProps) {
  const { activeWorkspaceId, activeWorkspace, activeRole, members } = useWorkspace();
  // Manager in a real team workspace → the AI proposes assignees and the preview
  // shows an editable assignee picker.
  const canAssignTasks =
    !!activeWorkspace && !activeWorkspace.personal && !!activeRole && can(activeRole, "tasks:assign");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [detailLevel, setDetailLevel] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tasky-detail-level") || "standard";
    }
    return "standard";
  });
  // Gemma 4 (ollama) is the only available model for now; the persist effect
  // below overwrites any stale "groq" value in localStorage.
  const [model, setModel] = useState("ollama");
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadSessions = useCallback(async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, "chat_sessions"),
        where("userId", "==", user.uid),
        orderBy("updatedAt", "desc")
      );
      const snapshot = await getDocs(q);
      const loadedSessions: ChatSession[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedSessions.push({
          id: doc.id,
          title: data.title,
          messages: data.messages || [],
          createdAt: data.createdAt?.toDate?.()?.getTime() || Date.now(),
          updatedAt: data.updatedAt?.toDate?.()?.getTime() || Date.now(),
        });
      });
      setSessions(loadedSessions);
    } catch (err) {
      console.warn("Failed to load sessions:", err);
    }
  }, [user]);

  const saveCurrentSession = useCallback(
    async (msgs: Message[]) => {
      if (!user) return;

      try {
        const firstUserMsg = msgs.find((m) => m.role === "user");
        const title = firstUserMsg
          ? firstUserMsg.content.length > 40
            ? firstUserMsg.content.substring(0, 40) + "..."
            : firstUserMsg.content
          : "New chat";
        const sessionId = sessionIdRef.current;

        const sessionData = {
          userId: user.uid,
          title,
          messages: msgs.map(({ pendingTasks, ...rest }) => rest),
          updatedAt: new Date(),
        };

        const existingRef = doc(db, "chat_sessions", sessionId);
        const existing = await getDoc(existingRef);

        if (existing.exists()) {
          await setDoc(
            existingRef,
            { ...sessionData, updatedAt: new Date() },
            { merge: true }
          );
        } else {
          await setDoc(existingRef, {
            ...sessionData,
            createdAt: new Date(),
          });
        }

        loadSessions();
      } catch (err) {
        console.warn("Failed to save session:", err);
      }
    },
    [loadSessions, user]
  );

  const createNewChat = useCallback(() => {
    if (!user) return;
    const newSessionId = crypto.randomUUID();
    sessionIdRef.current = newSessionId;
    localStorage.setItem(`tasky-session-id-${user.uid}`, newSessionId);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Share your morning brief and I'll break it into organized tasks for you.",
        timestamp: Date.now(),
      },
    ]);
    setInput("");
    setUploadedFiles([]);
    setShowHistory(false);
  }, [user]);

  const loadSession = useCallback(
    (session: ChatSession) => {
      if (!user) return;
      sessionIdRef.current = session.id;
      localStorage.setItem(`tasky-session-id-${user.uid}`, session.id);
      setMessages(session.messages);
      setShowHistory(false);
    },
    [user]
  );

  useEffect(() => {
    if (!user) return;
    const sessionIdKey = `tasky-session-id-${user.uid}`;
    let sessionId = localStorage.getItem(sessionIdKey);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(sessionIdKey, sessionId);
    }
    sessionIdRef.current = sessionId;

    const init = async () => {
      try {
        const sessionRef = doc(db, "chat_sessions", sessionId);
        const sessionDoc = await getDoc(sessionRef);

        if (sessionDoc.exists()) {
          const data = sessionDoc.data();
          setMessages(data.messages || []);
          setIsLoaded(true);
          return;
        }
      } catch {
        /* ignore */
      }

      const stored = localStorage.getItem(
        `tasky-messages-${user.uid}-${sessionId}`
      );
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            setIsLoaded(true);
            return;
          }
        } catch {
          /* ignore */
        }
      }

      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Share your morning brief and I'll break it into organized tasks for you.",
          timestamp: Date.now(),
        },
      ]);
      setIsLoaded(true);
    };

    init();
    loadSessions();
  }, [loadSessions, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("tasky-detail-level", detailLevel);
  }, [detailLevel]);

  useEffect(() => {
    localStorage.setItem("tasky-model", model);
  }, [model]);

  const persistMessages = useCallback(
    (msgs: Message[]) => {
      if (!user) return;
      const toStore = msgs.map(({ pendingTasks, ...rest }) => rest);
      localStorage.setItem(
        `tasky-messages-${user.uid}-${sessionIdRef.current}`,
        JSON.stringify(toStore)
      );
      saveCurrentSession(toStore);
    },
    [saveCurrentSession, user]
  );

  const clearChat = useCallback(() => {
    if (!user) return;
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Share your morning brief and I'll break it into organized tasks for you.",
        timestamp: Date.now(),
      },
    ]);
    localStorage.removeItem(`tasky-messages-${user.uid}-${sessionIdRef.current}`);
    setUploadedFiles([]);
  }, [user]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const fileContext =
      uploadedFiles.length > 0
        ? "\n\nAdditional context from uploaded files:\n" +
          uploadedFiles.map((f) => `--- ${f.name} ---\n${f.text}`).join("\n\n")
        : "";

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content:
        input.trim() +
        (fileContext
          ? "\n\n[Attached: " + uploadedFiles.map((f) => f.name).join(", ") + "]"
          : ""),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    persistMessages(newMessages);
    setInput("");
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      const conversationHistory = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const token = await getAccessToken();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: conversationHistory,
          detailLevel,
          fileContext,
          model,
          ...(activeWorkspaceId ? { workspaceId: activeWorkspaceId } : {}),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        pendingTasks: data.tasks || [],
        timestamp: Date.now(),
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      persistMessages(updatedMessages);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Something went wrong. Please try again.",
        timestamp: Date.now(),
      };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      persistMessages(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTasks = async (selectedTasks: any[]) => {
    if (selectedTasks.length === 0 || isAdding) return;

    const count = selectedTasks.length;
    setIsAdding(true);

    const tasksToSave = selectedTasks.map((t) => ({
      id: crypto.randomUUID(),
      title: t.title,
      description: t.description || "",
      category: t.category || "Personal",
      subtasks: t.subtasks.map((st: any) => ({
        id: crypto.randomUUID(),
        label: st.label,
        completed: false,
      })),
      createdAt: new Date().toISOString(),
      scheduledDate: t.scheduledDate || null,
      status: "pending" as const,
      priority: t.priority || "medium",
      assigneeId: t.assigneeId ?? null,
    }));

    try {
      const token = await getAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers,
        body: JSON.stringify({
          tasks: tasksToSave,
          ...(activeWorkspaceId ? { workspaceId: activeWorkspaceId } : {}),
        }),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Failed to save tasks (${res.status}): ${errorBody}`);
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.pendingTasks ? { ...m, pendingTasks: undefined } : m
        )
      );

      const confirmMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `${count} task${count > 1 ? "s" : ""} added to your list.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, confirmMsg]);
      persistMessages([...messages, confirmMsg]);

      setToastMessage(`${count} task${count > 1 ? "s" : ""} added successfully`);
      setTimeout(() => setToastMessage(""), 3000);

      onTasksAdded?.();
    } catch (error) {
      console.error("Failed to save tasks:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  if (!isLoaded) {
    return <ChatSkeleton />;
  }

  return (
    <div className="flex flex-col h-full bg-[#07080a]">
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-end gap-1.5 px-4 py-2.5"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(7,8,10,0.9)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* New Chat button */}
        <motion.button
          onClick={createNewChat}
          className="flex items-center gap-1.5 rounded-[86px] px-3 py-1.5 text-[12px] font-medium"
          style={{
            background: "transparent",
            color: "#9c9c9d",
            boxShadow:
              "rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px -1px 0px 0px inset",
            letterSpacing: "0.2px",
          }}
          whileHover={{ opacity: 0.6 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Plus size={11} weight="regular" />
          New Chat
        </motion.button>

        {/* Clear button */}
        <motion.button
          onClick={clearChat}
          className="flex items-center gap-1.5 rounded-[86px] px-3 py-1.5 text-[12px] font-medium"
          style={{
            background: "transparent",
            color: "#9c9c9d",
            boxShadow:
              "rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px -1px 0px 0px inset",
            letterSpacing: "0.2px",
          }}
          whileHover={{ opacity: 0.6 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          Clear
        </motion.button>

        {/* History button */}
        <motion.button
          aria-label="Chat history"
          onClick={() => {
            loadSessions();
            setShowHistory(!showHistory);
          }}
          className="flex items-center justify-center w-7 h-7 rounded"
          style={{
            background: "transparent",
            boxShadow:
              "rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px -1px 0px 0px inset",
          }}
          whileHover={{ opacity: 0.6 }}
          whileTap={{ scale: 0.9 }}
        >
          <Clock size={12} color="#9c9c9d" weight="regular" />
        </motion.button>

        {/* History popup */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              ref={historyRef}
              className="absolute top-full right-0 mt-2 w-72 rounded-xl overflow-hidden z-50"
              style={{
                background: "#101111",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow:
                  "rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset",
              }}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div
                className="px-3 py-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <span
                  className="text-[11px] font-medium text-[#6a6b6c] uppercase"
                  style={{ letterSpacing: "0.05px" }}
                >
                  Chat History
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {sessions.length === 0 ? (
                  <div className="px-3 py-6 text-center">
                    <span
                      className="text-[12px] text-[#6a6b6c]"
                      style={{ letterSpacing: "0.2px" }}
                    >
                      No previous chats
                    </span>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <motion.button
                      key={session.id}
                      onClick={() => loadSession(session)}
                      className="w-full text-left px-3 py-2.5 flex items-start justify-between gap-2 transition-opacity hover:opacity-60"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      whileHover={{ background: "rgba(255,255,255,0.02)" }}
                    >
                      <div className="min-w-0 flex-1">
                        <span
                          className="text-[13px] font-medium text-[#f9f9f9] block truncate"
                          style={{ letterSpacing: "0.2px" }}
                        >
                          {session.title}
                        </span>
                        <span
                          className="text-[10px] text-[#6a6b6c]"
                          style={{ letterSpacing: "0.05px" }}
                        >
                          {session.messages.length} messages
                        </span>
                      </div>
                      <span
                        className="shrink-0 text-[10px] text-[#6a6b6c]"
                        style={{ letterSpacing: "0.05px" }}
                      >
                        {formatTime(session.updatedAt)}
                      </span>
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings — opens the full settings page directly (no popup) */}
        <Link
          href="/settings"
          aria-label="Settings"
          className="flex items-center justify-center w-7 h-7 rounded transition-opacity hover:opacity-60"
          style={{
            background: "transparent",
            boxShadow:
              "rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px -1px 0px 0px inset",
          }}
        >
          <GearSix size={12} color="#9c9c9d" weight="regular" />
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide relative">
        {/* Success Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              className="fixed top-16 right-4 z-50 flex items-center gap-2.5 rounded-lg px-4 py-3"
              style={{
                background: "#101111",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow:
                  "rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset",
              }}
              initial={{ opacity: 0, x: 20, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ background: "rgba(95,201,146,0.15)" }}
              >
                <Check size={12} color="#5fc992" weight="regular" />
              </div>
              <span
                className="text-[13px] font-medium text-[#f9f9f9]"
                style={{ letterSpacing: "0.2px" }}
              >
                {toastMessage}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-auto max-w-[720px] px-4 py-6 sm:px-6 sm:py-8 pb-[180px] sm:pb-36">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                className="mb-8 last:mb-0"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: index === messages.length - 1 ? 0 : 0,
                }}
              >
                {msg.role === "assistant" && (
                  <motion.div
                    className="flex items-center gap-2 mb-3"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.25,
                      ease: [0.25, 0.1, 0.25, 1],
                      delay: 0.05,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 480 480" fill="none">
                      <path
                        d="M240 0v120A120 120 0 0 1 120 0H0a240 240 0 0 0 240 240A240 240 0 0 0 0 480h120a120 120 0 0 1 120-120v120a240 240 0 1 0 0-480Z"
                        fill="#FF6363"
                      />
                    </svg>
                    <span
                      className="text-[12px] font-medium text-[#9c9c9d]"
                      style={{ letterSpacing: "0.2px" }}
                    >
                      Tasky AI
                    </span>
                    <span
                      className="text-[10px] text-[#6a6b6c]"
                      style={{ letterSpacing: "0.05px" }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </motion.div>
                )}

                {msg.role === "user" && (
                  <motion.div
                    className="flex items-center justify-end gap-2 mb-2"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.25,
                      ease: [0.25, 0.1, 0.25, 1],
                      delay: 0.05,
                    }}
                  >
                    <span
                      className="text-[10px] text-[#6a6b6c]"
                      style={{ letterSpacing: "0.05px" }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span
                      className="text-[12px] font-medium text-[#9c9c9d]"
                      style={{ letterSpacing: "0.2px" }}
                    >
                      You
                    </span>
                  </motion.div>
                )}

                {/* Message content */}
                <motion.div
                  className={msg.role === "user" ? "flex justify-end" : ""}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.25, 0.1, 0.25, 1],
                    delay: 0.08,
                  }}
                >
                  <div
                    className={msg.role === "user" ? "max-w-[75%]" : "max-w-full"}
                    style={{
                      background:
                        msg.role === "user" ? "rgba(255,99,99,0.06)" : "transparent",
                      borderRadius: msg.role === "user" ? "10px" : "0",
                      border:
                        msg.role === "user"
                          ? "1px solid rgba(255,99,99,0.08)"
                          : "none",
                      padding: msg.role === "user" ? "10px 14px" : "0",
                    }}
                  >
                    <p
                      className="text-[14px] leading-relaxed whitespace-pre-wrap"
                      style={{
                        letterSpacing: "0.2px",
                        color: msg.role === "user" ? "#cecece" : "#f9f9f9",
                      }}
                    >
                      {msg.content}
                    </p>
                    {msg.pendingTasks && msg.pendingTasks.length > 0 && (
                      <motion.div
                        className="mt-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{
                          duration: 0.4,
                          ease: [0.25, 0.1, 0.25, 1],
                          delay: 0.15,
                        }}
                      >
                        <TaskPreviewCard
                          tasks={msg.pendingTasks}
                          onAdd={handleAddTasks}
                          isAdding={isAdding}
                          members={canAssignTasks ? members : undefined}
                        />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <motion.div
                className="flex items-center gap-2 mb-3"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.25,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: 0.05,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 480 480" fill="none">
                  <path
                    d="M240 0v120A120 120 0 0 1 120 0H0a240 240 0 0 0 240 240A240 240 0 0 0 0 480h120a120 120 0 0 1 120-120v120a240 240 0 1 0 0-480Z"
                    fill="#FF6363"
                  />
                </svg>
                <span
                  className="text-[12px] font-medium text-[#9c9c9d]"
                  style={{ letterSpacing: "0.2px" }}
                >
                  Tasky AI
                </span>
                <span
                  className="text-[10px] text-[#6a6b6c]"
                  style={{ letterSpacing: "0.05px" }}
                >
                  thinking...
                </span>
              </motion.div>
              <div className="flex items-center gap-2 px-1">
                {[0, 150, 300].map((delay, i) => (
                  <motion.div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-[#6a6b6c]"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: delay / 1000,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        input={input}
        onInputChange={setInput}
        onKeyDown={handleKeyDown}
        onSend={handleSend}
        isLoading={isLoading}
        uploadedFiles={uploadedFiles}
        onFilesChange={setUploadedFiles}
        detailLevel={detailLevel}
        onDetailLevelChange={setDetailLevel}
        model={model}
        onModelChange={setModel}
      />
    </div>
  );
}