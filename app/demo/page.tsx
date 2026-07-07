"use client";

// PUBLIC DEMO (no login, no backend). Reproduces the real /chat two-panel
// dashboard populated with a demo team and tasks assigned across members, so
// the full manager experience — "who's assigned what" — is visible at a glance.
// Fully interactive locally (check subtasks, reassign, change status) without a
// server. Remove before shipping. See /chat for the real, authed dashboard.

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronsUpDown, Check, Plus, Settings } from "lucide-react";
import TaskList from "@/components/TaskList";
import TaskPreviewCard from "@/components/TaskPreviewCard";
import ChatInput from "@/components/ChatInput";
import { DEMO_MEMBERS, DEMO_TASKS, DEMO_WORKSPACES } from "@/lib/demo/data";

// The AI's proposed assignments shown in the chat preview (before confirm).
const PROPOSED = [
  {
    id: "p1", title: "Landing page redesign", description: "Ship the new marketing homepage.",
    category: "Work", priority: "high" as const, assigneeId: "u-alice",
    subtasks: [
      { id: "p1a", label: "Design the hero + nav layout" },
      { id: "p1b", label: "Rebuild the pricing section" },
      { id: "p1c", label: "Wire responsive breakpoints" },
    ],
  },
  {
    id: "p2", title: "Tasks API integration", description: "Wire the backend endpoints for tasks.",
    category: "Work", priority: "high" as const, assigneeId: "u-bob",
    subtasks: [
      { id: "p2a", label: "Define the Firestore schema" },
      { id: "p2b", label: "Build the CRUD endpoints" },
    ],
  },
  {
    id: "p3", title: "Competitor pricing research", description: "Benchmark the top 5 competitors.",
    category: "Learning", priority: "medium" as const, assigneeId: "u-priya",
    subtasks: [
      { id: "p3a", label: "List the 5 competitors" },
      { id: "p3b", label: "Capture their tier + price" },
    ],
  },
];

const TASKY_LOGO = (
  <svg width="14" height="14" viewBox="0 0 480 480" fill="none">
    <path
      d="M240 0v120A120 120 0 0 1 120 0H0a240 240 0 0 0 240 240A240 240 0 0 0 0 480h120a120 120 0 0 1 120-120v120a240 240 0 1 0 0-480Z"
      fill="#FF6363"
    />
  </svg>
);

function AssistantHeader() {
  return (
    <div className="flex items-center gap-2 mb-3">
      {TASKY_LOGO}
      <span className="text-[12px] font-medium text-[#9c9c9d]" style={{ letterSpacing: "0.2px" }}>
        Tasky AI
      </span>
    </div>
  );
}

function UserHeader() {
  return (
    <div className="flex items-center justify-end gap-2 mb-2">
      <span className="text-[12px] font-medium text-[#9c9c9d]" style={{ letterSpacing: "0.2px" }}>
        You
      </span>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[80%]"
        style={{
          background: "rgba(255,99,99,0.06)",
          borderRadius: "10px",
          border: "1px solid rgba(255,99,99,0.08)",
          padding: "10px 14px",
        }}
      >
        <p className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ letterSpacing: "0.2px", color: "#cecece" }}>
          {children}
        </p>
      </div>
    </div>
  );
}

function AssistantText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ letterSpacing: "0.2px", color: "#f9f9f9" }}>
      {children}
    </p>
  );
}

// Static, seeded conversation demonstrating the manager → AI assignment flow.
function DemoChat() {
  const [input, setInput] = useState("");
  return (
    <div className="flex flex-col h-full bg-[#07080a]">
      {/* Header — visual chrome matching the real chat */}
      <div
        className="sticky top-0 z-10 flex items-center justify-end gap-1.5 px-4 py-2.5"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(7,8,10,0.9)",
          backdropFilter: "blur(12px)",
        }}
      >
        {["New Chat", "Clear"].map((label) => (
          <span
            key={label}
            className="flex items-center gap-1.5 rounded-[86px] px-3 py-1.5 text-[12px] font-medium"
            style={{
              color: "#9c9c9d",
              boxShadow:
                "rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px -1px 0px 0px inset",
              letterSpacing: "0.2px",
            }}
          >
            {label === "New Chat" && <Plus size={11} />}
            {label}
          </span>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="mx-auto max-w-[720px] px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-8">
            <AssistantHeader />
            <AssistantText>
              Share your morning brief and I&apos;ll break it into organized tasks for your team.
            </AssistantText>
          </div>

          <div className="mb-8">
            <UserHeader />
            <UserBubble>
              Assign the landing page redesign to Alice, the API integration to Bob, and the competitor
              pricing research to Priya.
            </UserBubble>
          </div>

          <div className="mb-8">
            <AssistantHeader />
            <AssistantText>
              On it. Here&apos;s what I&apos;ll assign to your team — review the owners and confirm:
            </AssistantText>
            <div className="mt-4">
              <TaskPreviewCard tasks={PROPOSED} onAdd={() => {}} isAdding={false} members={DEMO_MEMBERS} />
            </div>
          </div>

          <div className="mb-8">
            <UserHeader />
            <UserBubble>Looks good — confirm.</UserBubble>
          </div>

          <div className="mb-8">
            <AssistantHeader />
            <AssistantText>
              Done ✅ Assigned 3 tasks — Alice → Landing page redesign, Bob → Tasks API integration, Priya →
              Competitor pricing research. You&apos;ll see them grouped by owner on the right.
            </AssistantText>
          </div>
        </div>
      </div>

      <ChatInput
        input={input}
        onInputChange={setInput}
        onKeyDown={() => {}}
        onSend={() => {}}
        isLoading={false}
        uploadedFiles={[]}
        onFilesChange={() => {}}
        detailLevel="standard"
        onDetailLevelChange={() => {}}
        model="ollama"
        onModelChange={() => {}}
      />
    </div>
  );
}

// Presentational copy of the real WorkspaceSwitcher (demo — no data mutations).
function DemoSwitcher() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(DEMO_WORKSPACES[0].id);
  const active = DEMO_WORKSPACES.find((w) => w.id === activeId)!;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white transition hover:bg-white/10"
      >
        <span className="min-w-0">
          <span className="block truncate font-medium">{active.name}</span>
          <span className="block truncate text-xs text-neutral-400 capitalize">{active.role}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-neutral-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full min-w-[16rem] overflow-hidden rounded-lg border border-white/10 bg-[#0e0f12] shadow-xl">
            <div className="max-h-64 overflow-y-auto py-1">
              {DEMO_WORKSPACES.map((ws) => (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => {
                    setActiveId(ws.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-white transition hover:bg-white/5"
                >
                  <span className="min-w-0">
                    <span className="block truncate">{ws.name}</span>
                    <span className="block truncate text-xs text-neutral-500 capitalize">{ws.role}</span>
                  </span>
                  {ws.id === activeId && <Check className="h-4 w-4 text-emerald-400" />}
                </button>
              ))}
            </div>
            <div className="border-t border-white/10 p-1">
              <span className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-white">
                <Plus className="h-4 w-4" /> New workspace
              </span>
              <span className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-neutral-300">
                <Settings className="h-4 w-4" /> Manage workspaces
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Slim top bar: signals this is a guided demo and gives a conversion path.
function DemoBanner() {
  return (
    <div
      className="flex shrink-0 items-center justify-between gap-3 px-4 py-2.5 sm:px-5"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "linear-gradient(90deg, rgba(255,99,99,0.06), rgba(85,179,255,0.05))",
      }}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 text-[13px] text-[#9c9c9d] transition-colors hover:text-[#f9f9f9]"
          style={{ letterSpacing: "0.2px" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Back</span>
        </Link>
        <span className="h-3.5 w-px shrink-0 bg-white/10" />
        <p className="truncate text-[13px] text-[#cecece]" style={{ letterSpacing: "0.2px" }}>
          <span className="font-medium text-[#f9f9f9]">Live demo</span>
          <span className="hidden sm:inline"> — start with the “Getting Started” checklist in the first column. Everything is interactive.</span>
        </p>
      </div>
      <Link
        href="/login"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-[13px] font-medium text-black transition hover:opacity-85"
        style={{ letterSpacing: "0.2px" }}
      >
        Create free account
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function DemoPill() {
  return (
    <span
      className="shrink-0 rounded-[86px] px-2.5 py-1 text-[11px] font-medium"
      style={{ background: "rgba(85,179,255,0.1)", border: "1px solid rgba(85,179,255,0.2)", color: "#55b3ff" }}
    >
      Demo data
    </span>
  );
}

export default function DemoPage() {
  const demo = { tasks: DEMO_TASKS, members: DEMO_MEMBERS, isManager: true };
  // Render client-only: this demo composes framer-motion + time-based demo data,
  // which would otherwise cause SSR/client hydration mismatches.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-screen bg-[#07080a]" />;

  return (
    <div className="flex h-screen flex-col bg-[#07080a]">
      <DemoBanner />

      {/* Desktop: two-panel layout, identical to /chat */}
      <div className="hidden min-h-0 flex-1 lg:grid lg:grid-cols-[420px_1fr]">
        <div className="h-full overflow-hidden border-r border-raycast-white-border">
          <DemoChat />
        </div>
        <div className="h-full overflow-y-auto">
          <div className="flex items-center justify-between gap-2 border-b border-raycast-white-border px-4 py-2.5">
            <div className="w-60">
              <DemoSwitcher />
            </div>
            <DemoPill />
          </div>
          <TaskList demo={demo} />
        </div>
      </div>

      {/* Mobile: stacked switcher + task board */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:hidden">
        <div className="flex items-center justify-between gap-2 border-b border-raycast-white-border px-4 py-2.5">
          <div className="w-full max-w-xs">
            <DemoSwitcher />
          </div>
          <DemoPill />
        </div>
        <div className="flex-1">
          <TaskList demo={demo} />
        </div>
      </div>
    </div>
  );
}
