import type { UserMetrics, TaskMetrics, TokenMetrics, FeatureMetrics, AdminUser, AuditLog, SystemConfig, DashboardMetrics } from '@/types/admin';

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export const mockUserMetrics: UserMetrics[] = [
  { date: daysAgo(6), newUsers: 12, totalUsers: 847, weeklyGrowthRate: 14.2 },
  { date: daysAgo(5), newUsers: 18, totalUsers: 865, weeklyGrowthRate: 15.8 },
  { date: daysAgo(4), newUsers: 9, totalUsers: 874, weeklyGrowthRate: 13.1 },
  { date: daysAgo(3), newUsers: 24, totalUsers: 898, weeklyGrowthRate: 18.4 },
  { date: daysAgo(2), newUsers: 15, totalUsers: 913, weeklyGrowthRate: 16.2 },
  { date: daysAgo(1), newUsers: 21, totalUsers: 934, weeklyGrowthRate: 17.6 },
  { date: daysAgo(0), newUsers: 11, totalUsers: 945, weeklyGrowthRate: 15.3 },
];

export const mockTaskMetrics: TaskMetrics[] = [
  { date: daysAgo(6), created: 34, byStatus: { pending: 67, 'in-progress': 45, completed: 189 } },
  { date: daysAgo(5), created: 41, byStatus: { pending: 72, 'in-progress': 48, completed: 198 } },
  { date: daysAgo(4), created: 28, byStatus: { pending: 64, 'in-progress': 41, completed: 205 } },
  { date: daysAgo(3), created: 52, byStatus: { pending: 83, 'in-progress': 56, completed: 221 } },
  { date: daysAgo(2), created: 38, byStatus: { pending: 78, 'in-progress': 49, completed: 234 } },
  { date: daysAgo(1), created: 47, byStatus: { pending: 85, 'in-progress': 53, completed: 248 } },
  { date: daysAgo(0), created: 35, byStatus: { pending: 74, 'in-progress': 46, completed: 262 } },
];

export const mockTokenMetrics: TokenMetrics[] = [
  {
    date: daysAgo(6),
    byProvider: {
      Groq: { total: 245000, requests: 890 },
      Ollama: { total: 178000, requests: 640 },
      Together: { total: 89000, requests: 320 },
      OpenRouter: { total: 56000, requests: 200 },
    },
  },
  {
    date: daysAgo(5),
    byProvider: {
      Groq: { total: 268000, requests: 960 },
      Ollama: { total: 195000, requests: 710 },
      Together: { total: 95000, requests: 340 },
      OpenRouter: { total: 61000, requests: 218 },
    },
  },
  {
    date: daysAgo(4),
    byProvider: {
      Groq: { total: 231000, requests: 830 },
      Ollama: { total: 162000, requests: 580 },
      Together: { total: 78000, requests: 280 },
      OpenRouter: { total: 49000, requests: 175 },
    },
  },
  {
    date: daysAgo(3),
    byProvider: {
      Groq: { total: 312000, requests: 1120 },
      Ollama: { total: 224000, requests: 810 },
      Together: { total: 108000, requests: 390 },
      OpenRouter: { total: 72000, requests: 258 },
    },
  },
  {
    date: daysAgo(2),
    byProvider: {
      Groq: { total: 278000, requests: 1000 },
      Ollama: { total: 198000, requests: 715 },
      Together: { total: 94000, requests: 338 },
      OpenRouter: { total: 61000, requests: 218 },
    },
  },
  {
    date: daysAgo(1),
    byProvider: {
      Groq: { total: 295000, requests: 1060 },
      Ollama: { total: 215000, requests: 775 },
      Together: { total: 102000, requests: 365 },
      OpenRouter: { total: 67000, requests: 240 },
    },
  },
  {
    date: daysAgo(0),
    byProvider: {
      Groq: { total: 256000, requests: 920 },
      Ollama: { total: 186000, requests: 670 },
      Together: { total: 87000, requests: 310 },
      OpenRouter: { total: 55000, requests: 196 },
    },
  },
];

export const mockFeatureMetrics: FeatureMetrics[] = [
  { date: daysAgo(6), taskCreations: 234, meetingCreations: 67 },
  { date: daysAgo(5), taskCreations: 278, meetingCreations: 82 },
  { date: daysAgo(4), taskCreations: 195, meetingCreations: 54 },
  { date: daysAgo(3), taskCreations: 342, meetingCreations: 98 },
  { date: daysAgo(2), taskCreations: 267, meetingCreations: 73 },
  { date: daysAgo(1), taskCreations: 312, meetingCreations: 89 },
  { date: daysAgo(0), taskCreations: 245, meetingCreations: 71 },
];

export const mockDashboardMetrics: DashboardMetrics = {
  totalUsers: {
    value: 945,
    change: '+17.6%',
    trend: 'up',
  },
  tasksCreated: {
    value: 275,
    change: '+23.4%',
    trend: 'up',
  },
  tokensUsed: {
    value: '1.8M',
    change: '+12.1%',
    trend: 'up',
  },
  activeRate: {
    value: '87%',
    change: '+3.2%',
    trend: 'up',
  },
};

export const mockSystemConfig: SystemConfig = {
  googleMeetEnabled: true,
  lastUpdated: daysAgoISO(0).replace('Z', '').split('.')[0] + 'Z',
  updatedBy: 'admin@tasky.ai',
};

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: daysAgoISO(0).split('.')[0] + 'Z',
    action: 'google_meet_toggled',
    actor: { uid: 'uid-admin-001', email: 'admin@tasky.ai' },
    details: { enabled: true },
  },
  {
    id: 'log-002',
    timestamp: daysAgoISO(1).split('.')[0] + 'Z',
    action: 'admin_added',
    actor: { uid: 'uid-admin-001', email: 'admin@tasky.ai' },
    details: { newAdminEmail: 'sarah.chen@tasky.ai' },
  },
  {
    id: 'log-003',
    timestamp: daysAgoISO(1).split('.')[0] + 'Z',
    action: 'config_updated',
    actor: { uid: 'uid-admin-001', email: 'admin@tasky.ai' },
    details: { setting: 'max_tokens_per_day', oldValue: '500000', newValue: '1000000' },
  },
  {
    id: 'log-004',
    timestamp: daysAgoISO(2).split('.')[0] + 'Z',
    action: 'user_login',
    actor: { uid: 'uid-user-012', email: 'marcus.rivera@example.com' },
    details: { ipAddress: '192.168.1.42', userAgent: 'Chrome/121' },
  },
  {
    id: 'log-005',
    timestamp: daysAgoISO(2).split('.')[0] + 'Z',
    action: 'google_meet_toggled',
    actor: { uid: 'uid-admin-001', email: 'admin@tasky.ai' },
    details: { enabled: false },
  },
  {
    id: 'log-006',
    timestamp: daysAgoISO(3).split('.')[0] + 'Z',
    action: 'admin_removed',
    actor: { uid: 'uid-admin-001', email: 'admin@tasky.ai' },
    details: { removedAdminEmail: 'mike.johnson@example.com' },
  },
  {
    id: 'log-007',
    timestamp: daysAgoISO(3).split('.')[0] + 'Z',
    action: 'config_updated',
    actor: { uid: 'uid-admin-001', email: 'admin@tasky.ai' },
    details: { setting: 'default_model', oldValue: 'groq/llama3', newValue: 'groq/llama3-70b' },
  },
  {
    id: 'log-008',
    timestamp: daysAgoISO(4).split('.')[0] + 'Z',
    action: 'admin_added',
    actor: { uid: 'uid-admin-001', email: 'admin@tasky.ai' },
    details: { newAdminEmail: 'david.park@example.com' },
  },
  {
    id: 'log-009',
    timestamp: daysAgoISO(5).split('.')[0] + 'Z',
    action: 'user_login',
    actor: { uid: 'uid-user-008', email: 'emma.wilson@example.com' },
    details: { ipAddress: '10.0.0.15', userAgent: 'Firefox/122' },
  },
  {
    id: 'log-010',
    timestamp: daysAgoISO(5).split('.')[0] + 'Z',
    action: 'google_meet_toggled',
    actor: { uid: 'uid-admin-001', email: 'admin@tasky.ai' },
    details: { enabled: true },
  },
  {
    id: 'log-011',
    timestamp: daysAgoISO(6).split('.')[0] + 'Z',
    action: 'config_updated',
    actor: { uid: 'uid-admin-002', email: 'sarah.chen@tasky.ai' },
    details: { setting: 'ollama_endpoint', oldValue: 'http://localhost:11434', newValue: 'http://ollama.local:11434' },
  },
  {
    id: 'log-012',
    timestamp: daysAgoISO(6).split('.')[0] + 'Z',
    action: 'admin_added',
    actor: { uid: 'uid-admin-001', email: 'admin@tasky.ai' },
    details: { newAdminEmail: 'sarah.chen@tasky.ai' },
  },
];

export const mockUsers: AdminUser[] = [
  {
    uid: 'uid-admin-001',
    email: 'admin@tasky.ai',
    displayName: 'Tasky Admin',
    role: 'admin',
    status: 'active',
    createdAt: daysAgoISO(90).split('.')[0] + 'Z',
    lastLoginAt: daysAgoISO(0).split('.')[0] + 'Z',
  },
  {
    uid: 'uid-admin-002',
    email: 'sarah.chen@tasky.ai',
    displayName: 'Sarah Chen',
    role: 'admin',
    status: 'active',
    createdAt: daysAgoISO(60).split('.')[0] + 'Z',
    lastLoginAt: daysAgoISO(1).split('.')[0] + 'Z',
  },
  {
    uid: 'uid-user-003',
    email: 'marcus.rivera@example.com',
    displayName: 'Marcus Rivera',
    role: 'user',
    status: 'active',
    createdAt: daysAgoISO(45).split('.')[0] + 'Z',
    lastLoginAt: daysAgoISO(2).split('.')[0] + 'Z',
  },
  {
    uid: 'uid-user-004',
    email: 'emma.wilson@example.com',
    displayName: 'Emma Wilson',
    role: 'user',
    status: 'active',
    createdAt: daysAgoISO(38).split('.')[0] + 'Z',
    lastLoginAt: daysAgoISO(5).split('.')[0] + 'Z',
  },
  {
    uid: 'uid-user-005',
    email: 'david.park@example.com',
    displayName: 'David Park',
    role: 'admin',
    status: 'active',
    createdAt: daysAgoISO(30).split('.')[0] + 'Z',
    lastLoginAt: daysAgoISO(0).split('.')[0] + 'Z',
  },
  {
    uid: 'uid-user-006',
    email: 'priya.sharma@example.com',
    displayName: 'Priya Sharma',
    role: 'user',
    status: 'active',
    createdAt: daysAgoISO(25).split('.')[0] + 'Z',
    lastLoginAt: daysAgoISO(1).split('.')[0] + 'Z',
  },
  {
    uid: 'uid-user-007',
    email: 'luca.moretti@example.com',
    displayName: 'Luca Moretti',
    role: 'user',
    status: 'active',
    createdAt: daysAgoISO(20).split('.')[0] + 'Z',
    lastLoginAt: daysAgoISO(3).split('.')[0] + 'Z',
  },
  {
    uid: 'uid-user-008',
    email: 'aya.nakamura@example.com',
    displayName: 'Aya Nakamura',
    role: 'user',
    status: 'inactive',
    createdAt: daysAgoISO(55).split('.')[0] + 'Z',
    lastLoginAt: daysAgoISO(28).split('.')[0] + 'Z',
  },
  {
    uid: 'uid-user-009',
    email: 'james.obrien@example.com',
    displayName: "James O'Brien",
    role: 'user',
    status: 'inactive',
    createdAt: daysAgoISO(40).split('.')[0] + 'Z',
    lastLoginAt: daysAgoISO(35).split('.')[0] + 'Z',
  },
  {
    uid: 'uid-user-010',
    email: 'sofia.garcia@example.com',
    displayName: 'Sofia Garcia',
    role: 'user',
    status: 'active',
    createdAt: daysAgoISO(14).split('.')[0] + 'Z',
    lastLoginAt: daysAgoISO(0).split('.')[0] + 'Z',
  },
  {
    uid: 'uid-user-011',
    email: 'alex.kovacs@example.com',
    displayName: 'Alex Kovacs',
    role: 'user',
    status: 'active',
    createdAt: daysAgoISO(10).split('.')[0] + 'Z',
    lastLoginAt: daysAgoISO(1).split('.')[0] + 'Z',
  },
  {
    uid: 'uid-user-012',
    email: 'olivia.nguyen@example.com',
    displayName: 'Olivia Nguyen',
    role: 'user',
    status: 'active',
    createdAt: daysAgoISO(7).split('.')[0] + 'Z',
    lastLoginAt: daysAgoISO(0).split('.')[0] + 'Z',
  },
];