-- Create user preferences table
create table public."p-user_preferences" (
  id uuid not null primary key references auth.users(id),
  theme varchar(20) not null default 'system',
  language varchar(10) not null default 'en',
  timezone varchar(50) not null default 'UTC',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS for security
alter table public."p-user_preferences" enable row level security;

-- Create access policies
create policy "Users can view own preferences" on public."p-user_preferences"
  for select using (auth.uid() = id);

create policy "Users can update own preferences" on public."p-user_preferences"
  for update using (auth.uid() = id);