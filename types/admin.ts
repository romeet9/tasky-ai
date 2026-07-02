export interface UserMetrics {
  date: string;
  newUsers: number;
  totalUsers: number;
  weeklyGrowthRate: number;
}

export interface TaskMetrics {
  date: string;
  created: number;
  byStatus: {
    pending: number;
    'in-progress': number;
    completed: number;
  };
}

export interface TokenMetrics {
  date: string;
  byProvider: {
    Groq: { total: number; requests: number };
    Ollama: { total: number; requests: number };
    Together: { total: number; requests: number };
    OpenRouter: { total: number; requests: number };
  };
}

export interface FeatureMetrics {
  date: string;
  taskCreations: number;
  meetingCreations: number;
}

export interface SystemConfig {
  googleMeetEnabled: boolean;
  lastUpdated: string;
  updatedBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'google_meet_toggled' | 'admin_added' | 'admin_removed' | 'user_login' | 'config_updated';
  actor: {
    uid: string;
    email: string;
  };
  details: Record<string, unknown>;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLoginAt: string;
}

export type DateRangeType = '7d' | '30d' | 'custom';

export interface DateRange {
  type: DateRangeType;
  start?: Date;
  end?: Date;
}

export interface DashboardMetrics {
  totalUsers: {
    value: number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  };
  tasksCreated: {
    value: number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  };
  tokensUsed: {
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  };
  activeRate: {
    value: string;
    change: string;
    trend: 'up' | 'down' | 'neutral';
  };
}