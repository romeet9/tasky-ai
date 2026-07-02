// Central RBAC policy. This is the single source of truth for "what can a role
// do". API guards (lib/workspace/server.ts) and the UI both read from here so
// they never drift. The Firestore rules mirror the rank comparison in
// firestore.rules — keep the two in sync when changing ranks.

import type { Permission, WorkspaceRole } from '@/types/workspace';

// Higher rank = more privilege. Used for "at least X" checks and to prevent
// privilege escalation (you can't act on someone ranked >= you).
export const ROLE_RANK: Record<WorkspaceRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

export const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
};

const MEMBER_PERMISSIONS: Permission[] = [
  'workspace:view',
  'members:view',
  'tasks:view',
  'tasks:create',
  'tasks:update',
  'tasks:delete',
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...MEMBER_PERMISSIONS,
  'workspace:update',
  'members:invite',
  'members:remove',
  'members:update_role',
  // Managers (owner/admin) can assign tasks to other members and reassign.
  'tasks:assign',
];

export const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  viewer: ['workspace:view', 'members:view', 'tasks:view'],
  member: MEMBER_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  // Owner can do everything an admin can, plus delete the workspace.
  owner: [...ADMIN_PERMISSIONS, 'workspace:delete'],
};

export function can(role: WorkspaceRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function roleAtLeast(role: WorkspaceRole, min: WorkspaceRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

// Which roles an actor is allowed to grant/assign. You can never mint an owner
// through role assignment (ownership transfer is a separate, deliberate action),
// and you can only assign roles ranked at or below your own.
export function assignableRoles(actorRole: WorkspaceRole): WorkspaceRole[] {
  return (Object.keys(ROLE_RANK) as WorkspaceRole[]).filter(
    (r) => r !== 'owner' && ROLE_RANK[r] <= ROLE_RANK[actorRole]
  );
}

// Can `actor` modify (change role / remove) a member currently holding
// `target` role? Owner can act on anyone below them; everyone else can only
// act on strictly-lower ranks. Nobody can act on an owner via this path.
export function canActOnMember(
  actorRole: WorkspaceRole,
  targetRole: WorkspaceRole
): boolean {
  if (targetRole === 'owner') return false;
  if (actorRole === 'owner') return true;
  return ROLE_RANK[actorRole] > ROLE_RANK[targetRole];
}
