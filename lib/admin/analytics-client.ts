import type { 
  UserMetrics, 
  TaskMetrics, 
  TokenMetrics, 
  FeatureMetrics, 
  SystemConfig, 
  AuditLog, 
  AdminUser,
  DashboardMetrics 
} from '@/types/admin';
import { auth } from '@/lib/firebase/client';
import {
  mockUserMetrics,
  mockTaskMetrics,
  mockTokenMetrics,
  mockFeatureMetrics,
  mockDashboardMetrics,
  mockSystemConfig,
  mockAuditLogs,
  mockUsers,
} from '@/lib/admin/mock-data';

type DataSource = 'live' | 'demo';

async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  
  try {
    return await currentUser.getIdToken();
  } catch (error) {
    console.error('Failed to get ID token:', error);
    return null;
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated. Please sign in again.');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await currentUser.getIdToken(true);
        } catch {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } else if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response;
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function applyRange<T extends { date: string }>(data: T[], range: '7d' | '30d'): T[] {
  const days = range === '30d' ? 30 : 7;
  return data.slice(-days);
}

export async function fetchUserMetrics(range: '7d' | '30d', source: DataSource = 'demo'): Promise<UserMetrics[]> {
  if (source === 'demo') return applyRange(mockUserMetrics, range);
  try {
    const response = await fetchWithAuth(`/api/admin/analytics/users?range=${range}`);
    const data = await response.json();
    return data.metrics || [];
  } catch (error) {
    console.error('Failed to fetch user metrics:', error);
    return applyRange(mockUserMetrics, range);
  }
}

export async function fetchTaskMetrics(range: '7d' | '30d', source: DataSource = 'demo'): Promise<TaskMetrics[]> {
  if (source === 'demo') return applyRange(mockTaskMetrics, range);
  try {
    const response = await fetchWithAuth(`/api/admin/analytics/tasks?range=${range}`);
    const data = await response.json();
    return data.metrics || [];
  } catch (error) {
    console.error('Failed to fetch task metrics:', error);
    return applyRange(mockTaskMetrics, range);
  }
}

export async function fetchTokenMetrics(range: '7d' | '30d', source: DataSource = 'demo'): Promise<TokenMetrics[]> {
  if (source === 'demo') return applyRange(mockTokenMetrics, range);
  try {
    const response = await fetchWithAuth(`/api/admin/analytics/tokens?range=${range}`);
    const data = await response.json();
    return data.metrics || [];
  } catch (error) {
    console.error('Failed to fetch token metrics:', error);
    return applyRange(mockTokenMetrics, range);
  }
}

export async function fetchFeatureMetrics(range: '7d' | '30d', source: DataSource = 'demo'): Promise<FeatureMetrics[]> {
  if (source === 'demo') return applyRange(mockFeatureMetrics, range);
  try {
    const response = await fetchWithAuth(`/api/admin/analytics/features?range=${range}`);
    const data = await response.json();
    return data.metrics || [];
  } catch (error) {
    console.error('Failed to fetch feature metrics:', error);
    return applyRange(mockFeatureMetrics, range);
  }
}

export async function fetchDashboardMetrics(source: DataSource = 'demo'): Promise<DashboardMetrics> {
  if (source === 'demo') return mockDashboardMetrics;
  try {
    const response = await fetchWithAuth('/api/admin/dashboard');
    const data = await response.json();
    return data.metrics || mockDashboardMetrics;
  } catch (error) {
    console.error('Failed to fetch dashboard metrics:', error);
    return mockDashboardMetrics;
  }
}

export async function fetchSystemConfig(source: DataSource = 'demo'): Promise<SystemConfig> {
  if (source === 'demo') return { ...mockSystemConfig, lastUpdated: new Date().toISOString() };
  try {
    const response = await fetchWithAuth('/api/admin/config');
    const data = await response.json();
    return data.config || mockSystemConfig;
  } catch (error) {
    console.error('Failed to fetch system config:', error);
    return { ...mockSystemConfig, lastUpdated: new Date().toISOString() };
  }
}

export async function updateSystemConfig(config: Partial<SystemConfig>): Promise<SystemConfig> {
  const response = await fetchWithAuth('/api/admin/config', {
    method: 'PATCH',
    body: JSON.stringify(config),
  });
  const data = await response.json();
  return data.config;
}

export async function fetchAuditLogs(limit: number = 100, source: DataSource = 'demo'): Promise<AuditLog[]> {
  if (source === 'demo') return mockAuditLogs.slice(0, limit);
  try {
    const response = await fetchWithAuth(`/api/admin/logs?limit=${limit}`);
    const data = await response.json();
    return data.logs || [];
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return mockAuditLogs.slice(0, limit);
  }
}

export async function fetchUsers(filters?: {
  role?: 'user' | 'admin';
  status?: 'active' | 'inactive';
  search?: string;
}, source: DataSource = 'demo'): Promise<AdminUser[]> {
  if (source === 'demo') {
    let result = [...mockUsers];
    if (filters?.role) result = result.filter(u => u.role === filters.role);
    if (filters?.status) result = result.filter(u => u.status === filters.status);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(u => u.email.toLowerCase().includes(s) || u.displayName.toLowerCase().includes(s));
    }
    return result;
  }
  try {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const response = await fetchWithAuth(`/api/admin/users?${params.toString()}`);
    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return mockUsers;
  }
}

export async function updateUserRole(uid: string, role: 'user' | 'admin'): Promise<void> {
  await fetchWithAuth('/api/admin/users', {
    method: 'PATCH',
    body: JSON.stringify({ uid, role }),
  });
}