"use client";

// Global active-workspace state. Loads the user's workspaces once authed,
// tracks the active one (persisted in localStorage), and exposes the caller's
// role in the active workspace so the UI can gate controls (defense-in-depth
// on top of server enforcement).

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchWorkspaces, fetchMembers } from "@/lib/workspace/client";
import type { WorkspaceMember, WorkspaceRole, WorkspaceWithRole } from "@/types/workspace";

const STORAGE_KEY = "tasky-active-workspace";

interface WorkspaceContextType {
  workspaces: WorkspaceWithRole[];
  activeWorkspaceId: string | null;
  activeWorkspace: WorkspaceWithRole | null;
  activeRole: WorkspaceRole | null;
  // Members of the active workspace (for assignee pickers + uid→name lookups).
  members: WorkspaceMember[];
  isLoading: boolean;
  setActiveWorkspaceId: (id: string) => void;
  refresh: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: [],
  activeWorkspaceId: null,
  activeWorkspace: null,
  activeRole: null,
  members: [],
  isLoading: true,
  setActiveWorkspaceId: () => {},
  refresh: async () => {},
});

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceWithRole[]>([]);
  const [activeWorkspaceId, setActiveId] = useState<string | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setActiveId(null);
      setIsLoading(false);
      return;
    }
    try {
      const list = await fetchWorkspaces();
      setWorkspaces(list);
      setActiveId((current) => {
        const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        const preferred = current || saved;
        const exists = list.some((w) => w.id === preferred);
        // Respect a saved choice; otherwise default to the first TEAM workspace
        // (so managers/employees land on the shared board where assignments are
        // visible), falling back to personal only when there's no team.
        return exists
          ? preferred
          : list.find((w) => !w.personal)?.id ?? list[0]?.id ?? null;
      });
    } catch (error) {
      console.error("Failed to load workspaces:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Load members whenever the active workspace changes (any member may view the
  // roster). Used by the assignee picker and manager/employee views.
  useEffect(() => {
    if (!user || !activeWorkspaceId) {
      setMembers([]);
      return;
    }
    let cancelled = false;
    fetchMembers(activeWorkspaceId)
      .then((m) => {
        if (!cancelled) setMembers(m);
      })
      .catch(() => {
        if (!cancelled) setMembers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user, activeWorkspaceId]);

  const setActiveWorkspaceId = useCallback((id: string) => {
    setActiveId(id);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) ?? null;
  const activeRole = activeWorkspace?.role ?? null;

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspaceId,
        activeWorkspace,
        activeRole,
        members,
        isLoading,
        setActiveWorkspaceId,
        refresh,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
