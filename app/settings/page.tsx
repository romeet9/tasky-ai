"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Check, ExternalLink, Loader2, Lock, LogOut, Play } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/components/AuthProvider";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ROLE_LABELS } from "@/lib/rbac/permissions";
import { getAvatarColor, getInitials } from "@/lib/avatar";
import { getAccessToken } from "@/lib/auth";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <Settings />
    </AuthGuard>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <h2 className="text-sm font-medium text-neutral-300">{title}</h2>
      {children}
    </section>
  );
}

function GoogleCalendarSection() {
  const { signIn } = useAuth();
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/meetings/google-status", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setConnected(!!data.connected);
        setEmail(data.email || null);
      }
    } catch {
      // Leave as disconnected on error.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  async function handleConnect() {
    setBusy(true);
    setError(null);
    try {
      // Google sign-in grants the Calendar scope and stores the access token.
      await signIn();
      await loadStatus();
    } catch {
      setError("Couldn't connect Google Calendar. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisconnect() {
    setBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      await fetch("/api/meetings/google-disconnect", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setConnected(false);
      setEmail(null);
    } catch {
      setError("Couldn't disconnect. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SectionCard title="Google Calendar">
      {loading ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking connection…
        </div>
      ) : connected ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-white/10 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#5fc992]" />
            <span className="truncate text-sm text-[#f9f9f9]">
              {email || "Connected"}
            </span>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={busy}
            className="shrink-0 text-xs font-medium text-[#FF6363] transition hover:underline disabled:opacity-50"
          >
            {busy ? "…" : "Disconnect"}
          </button>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-400">
            Connect your calendar to pull in meetings and events.
          </p>
          <button
            onClick={handleConnect}
            disabled={busy}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[#f9f9f9] disabled:opacity-50"
            style={{
              background: "rgba(85,179,255,0.1)",
              border: "1px solid rgba(85,179,255,0.2)",
            }}
          >
            <Calendar className="h-3.5 w-3.5 text-[#55b3ff]" />
            {busy ? "Connecting…" : "Connect Google Calendar"}
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-[#FF6363]">{error}</p>}
    </SectionCard>
  );
}

function Settings() {
  const { user, signOut } = useAuth();
  const { workspaces, activeWorkspaceId } = useWorkspace();
  const { profile, loading: profileLoading, updateJobRole } = useUserProfile();

  const [jobRole, setJobRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setJobRole(profile?.jobRole || "");
  }, [profile?.jobRole]);

  const dirty = jobRole.trim() !== (profile?.jobRole || "");
  const name = user?.displayName || user?.email?.split("@")[0] || "User";

  async function handleSaveRole() {
    setSaving(true);
    setSaveError(null);
    try {
      await updateJobRole(jobRole.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07080a] text-white">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <Link
          href="/chat"
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to app
        </Link>

        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Manage your profile, workspaces, plan, and preferences.
        </p>

        {/* Profile */}
        <SectionCard title="Profile">
          <div className="mt-4 flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ background: getAvatarColor(name) }}
            >
              {getInitials(name)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-[#f9f9f9]">{name}</div>
              <div className="truncate text-xs text-neutral-500">{user?.email}</div>
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="job-role" className="text-xs text-neutral-400">
              Role
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="job-role"
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder={profileLoading ? "Loading…" : "e.g. Product Manager"}
                disabled={profileLoading}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/30 disabled:opacity-50"
              />
              <button
                onClick={handleSaveRole}
                disabled={!dirty || saving || profileLoading}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
              >
                {saving ? "Saving…" : saved ? "Saved" : "Save"}
              </button>
            </div>
            {saveError && <p className="mt-2 text-xs text-[#FF6363]">{saveError}</p>}
          </div>
        </SectionCard>

        {/* Workspaces */}
        <SectionCard title="Workspaces">
          {workspaces.length === 0 ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-neutral-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading workspaces…
            </div>
          ) : (
            <div className="mt-3 divide-y divide-white/5 rounded-lg border border-white/10">
              {workspaces.map((ws) => (
                <div key={ws.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="truncate text-sm text-[#f9f9f9]">{ws.name}</span>
                    {ws.id === activeWorkspaceId && (
                      <span className="rounded-full bg-[#5fc992]/10 px-2 py-0.5 text-[10px] font-medium text-[#5fc992]">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-neutral-400">
                    {ROLE_LABELS[ws.role]}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/workspaces"
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-neutral-400 transition hover:text-white"
          >
            Manage workspaces <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </SectionCard>

        {/* Plan */}
        <SectionCard title="Plan">
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium text-[#f9f9f9]">Free Trial</div>
              <p className="mt-1 text-xs text-neutral-400">
                You&apos;re on the 14-day free trial with full access to Tasky AI.
              </p>
            </div>
            <Link
              href="/#pricing"
              className="shrink-0 rounded-lg bg-white px-4 py-2 text-center text-sm font-medium text-black"
            >
              Upgrade
            </Link>
          </div>
        </SectionCard>

        {/* Model */}
        <SectionCard title="AI Model">
          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-white/10 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#f9f9f9]">Gemma 4</span>
                <span className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                  <Lock className="h-2.5 w-2.5" /> Default
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-400">31B — Google&apos;s latest model</p>
            </div>
            <Check className="h-4 w-4 shrink-0 text-[#5fc992]" />
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            All chats use Gemma 4. More models are coming soon.
          </p>
        </SectionCard>

        {/* Google Calendar */}
        <GoogleCalendarSection />

        {/* Demo */}
        <SectionCard title="Demo">
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-neutral-400">
              See Tasky AI in action with a pre-populated workspace — no data is changed.
            </p>
            <Link
              href="/demo"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#f9f9f9] transition hover:bg-white/10"
            >
              <Play className="h-3.5 w-3.5" /> View demo
            </Link>
          </div>
        </SectionCard>

        {/* Sign out */}
        <section className="mt-6 rounded-xl border border-[#FF6363]/20 bg-[#FF6363]/[0.04] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-medium text-[#f9f9f9]">Sign out</h2>
              <p className="mt-1 text-xs text-neutral-400">
                You&apos;ll be returned to the login page.
              </p>
            </div>
            <button
              onClick={signOut}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#FF6363] px-4 py-2 text-sm font-medium text-white transition hover:opacity-85"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
