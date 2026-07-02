// Workspace + role-based access control (RBAC) types.
//
// Access model: a user belongs to many workspaces. Membership + role live in
// `workspaces/{workspaceId}/members/{uid}`. Roles are ranked; permissions are
// derived from the role via the matrix in `lib/rbac/permissions.ts`.

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

// Granular actions gated by RBAC. Keep these stable — they are the contract
// between the permission matrix, the API guards, and the Firestore rules.
export type Permission =
  | 'workspace:view'
  | 'workspace:update'
  | 'workspace:delete'
  | 'members:view'
  | 'members:invite'
  | 'members:remove'
  | 'members:update_role'
  | 'tasks:view'
  | 'tasks:create'
  | 'tasks:update'
  | 'tasks:delete'
  // Assign a task to *another* member. Self-assignment does not require this.
  | 'tasks:assign';

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  // A personal workspace is auto-created for every user and cannot be deleted
  // or have members removed below the owner.
  personal: boolean;
  createdAt: string;
  createdBy: string;
}

export interface WorkspaceMember {
  uid: string;
  workspaceId: string;
  role: WorkspaceRole;
  email: string | null;
  displayName: string | null;
  joinedAt: string;
  invitedBy: string | null;
}

// A workspace paired with the current user's role in it (list view shape).
export interface WorkspaceWithRole extends Workspace {
  role: WorkspaceRole;
}

export type InviteStatus = 'pending' | 'accepted' | 'revoked';

export interface Invite {
  id: string;
  workspaceId: string;
  workspaceName: string;
  email: string;
  role: Exclude<WorkspaceRole, 'owner'>;
  token: string;
  status: InviteStatus;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
}
