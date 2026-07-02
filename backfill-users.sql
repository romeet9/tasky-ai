-- Backfill existing auth users into the users table
insert into users (id, email, name, created_at)
select id, email, raw_user_meta_data->>'name', created_at
from auth.users
on conflict (id) do nothing;

-- Also add Google token columns if they don't exist
alter table users add column if not exists google_refresh_token text;
alter table users add column if not exists google_access_token text;
alter table users add column if not exists google_token_expires_at timestamptz;
alter table users add column if not exists google_email text;
