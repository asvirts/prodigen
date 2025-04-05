-- Create clients table if not exists
create table if not exists "p-clients" (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  contact_email text,
  contact_phone text,
  billing_rate decimal(10,2),
  billing_currency text default 'USD'
);

-- Enable RLS on clients table
alter table "p-clients" enable row level security;

-- RLS policies for clients
create policy "Users can view their own clients"
  on "p-clients" for select
  using (auth.uid() = user_id);

create policy "Users can create their own clients"
  on "p-clients" for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own clients"
  on "p-clients" for update
  using (auth.uid() = user_id);

-- Create hours tracking table
create table if not exists "p-hours" (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  client_id uuid references "p-clients" not null,
  task_id uuid references "p-tasks",
  date date not null,
  duration interval not null,
  description text,
  billable boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on hours table
alter table "p-hours" enable row level security;

-- RLS policies for hours
create policy "Users can view their own hours"
  on "p-hours" for select
  using (auth.uid() = user_id);

create policy "Users can create their own hours"
  on "p-hours" for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own hours"
  on "p-hours" for update
  using (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger hours_updated_at
  before update on "p-hours"
  for each row
  execute function update_updated_at_column();