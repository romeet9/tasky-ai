-- ============================================
-- Tasky AI - Complete Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. USERS TABLE
create table if not exists users (
  id uuid references auth.users primary key,
  email text unique not null,
  name text,
  company text,
  role text default 'employee',
  google_refresh_token text,
  google_access_token text,
  google_token_expires_at timestamptz,
  google_email text,
  created_at timestamptz default now()
);

-- 2. CHAT SESSIONS
create table if not exists chat_sessions (
  id text primary key,
  user_id uuid references users(id),
  title text not null,
  messages jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. TASKS
create table if not exists tasks (
  id text primary key,
  user_id uuid references users(id),
  title text not null,
  description text,
  category text default 'Personal',
  status text default 'pending',
  created_at timestamptz default now()
);

-- 4. SUBTASKS
create table if not exists subtasks (
  id text primary key,
  task_id text references tasks(id) on delete cascade,
  label text not null,
  completed boolean default false
);

-- 5. USAGE LOGS
create table if not exists usage_logs (
  id text primary key,
  user_id uuid references users(id),
  tokens_used int default 0,
  created_at timestamptz default now()
);

-- 6. MEETINGS
create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  title text not null,
  description text,
  meeting_url text,
  duration_minutes int,
  status text default 'scheduled',
  audio_url text,
  created_at timestamptz default now()
);

-- 7. MEETING MINUTES
create table if not exists meeting_minutes (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  transcript text,
  summary text,
  action_items jsonb default '[]',
  decisions jsonb default '[]',
  roadmap jsonb default '[]',
  created_at timestamptz default now()
);

-- 8. MEETING PARTICIPANTS
create table if not exists meeting_participants (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade not null,
  name text not null,
  email text
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table users enable row level security;
alter table chat_sessions enable row level security;
alter table tasks enable row level security;
alter table subtasks enable row level security;
alter table usage_logs enable row level security;
alter table meetings enable row level security;
alter table meeting_minutes enable row level security;
alter table meeting_participants enable row level security;

-- ============================================
-- POLICIES
-- ============================================

-- Users: allow read, insert, update for own data
drop policy if exists "Users can view own data" on users;
create policy "Users can view own data" on users for select using (auth.uid() = id);

drop policy if exists "Users can insert own data" on users;
create policy "Users can insert own data" on users for insert with check (auth.uid() = id);

drop policy if exists "Users can update own data" on users;
create policy "Users can update own data" on users for update using (auth.uid() = id);

-- Chat sessions
drop policy if exists "Users can manage own sessions" on chat_sessions;
create policy "Users can manage own sessions" on chat_sessions for all using (auth.uid() = user_id);

-- Tasks
drop policy if exists "Users can manage own tasks" on tasks;
create policy "Users can manage own tasks" on tasks for all using (auth.uid() = user_id);

-- Subtasks
drop policy if exists "Allow all on subtasks" on subtasks;
create policy "Allow all on subtasks" on subtasks for all using (true);

-- Usage logs
drop policy if exists "Users can view own usage" on usage_logs;
create policy "Users can view own usage" on usage_logs for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own usage" on usage_logs;
create policy "Users can insert own usage" on usage_logs for insert with check (auth.uid() = user_id);

-- Meetings
drop policy if exists "Users can manage own meetings" on meetings;
create policy "Users can manage own meetings" on meetings for all using (auth.uid() = user_id);

-- Meeting minutes
drop policy if exists "Users can manage own meeting minutes" on meeting_minutes;
create policy "Users can manage own meeting minutes" on meeting_minutes for all using (auth.uid() = user_id);

-- Meeting participants
drop policy if exists "Users can manage meeting participants" on meeting_participants;
create policy "Users can manage meeting participants" on meeting_participants for all using (
  exists (
    select 1 from meetings m where m.id = meeting_participants.meeting_id and m.user_id = auth.uid()
  )
);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_chat_sessions_user on chat_sessions(user_id, updated_at desc);
create index if not exists idx_tasks_user on tasks(user_id, created_at desc);
create index if not exists idx_subtasks_task on subtasks(task_id);
create index if not exists idx_usage_logs_user_time on usage_logs(user_id, created_at desc);
create index if not exists idx_meetings_user on meetings(user_id, created_at desc);
create index if not exists idx_meeting_minutes_meeting on meeting_minutes(meeting_id);
create index if not exists idx_meeting_minutes_user on meeting_minutes(user_id);
create index if not exists idx_meeting_participants_meeting on meeting_participants(meeting_id);

-- ============================================
-- TRIGGER: Auto-create user profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, company)
  values (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'company')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- BACKFILL: Existing auth users into users table
-- ============================================
insert into users (id, email, name, created_at)
select id, email, raw_user_meta_data->>'name', created_at
from auth.users
on conflict (id) do nothing;
