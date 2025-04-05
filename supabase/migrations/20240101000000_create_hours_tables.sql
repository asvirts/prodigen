-- Create clients table
create table "public"."p-clients" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "contact_email" text,
    "contact_phone" text,
    "billing_rate" numeric(10,2),
    "billing_currency" text not null default 'USD',
    "user_id" uuid not null references auth.users(id) on delete cascade,
    constraint "p-clients_pkey" primary key ("id")
);

-- Create hours table
create table "public"."p-hours" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "client_id" uuid not null references "public"."p-clients"(id) on delete cascade,
    "task_id" uuid references "public"."p-tasks"(id) on delete set null,
    "date" date not null,
    "duration" text not null,
    "description" text,
    "billable" boolean not null default true,
    "user_id" uuid not null references auth.users(id) on delete cascade,
    constraint "p-hours_pkey" primary key ("id")
);

-- Add client_id to tasks table if it doesn't exist
do $$ 
begin
    if not exists (select 1 from information_schema.columns 
                  where table_name = 'p-tasks' 
                  and column_name = 'client_id') then
        alter table "public"."p-tasks" 
        add column "client_id" uuid references "public"."p-clients"(id) on delete set null;
    end if;
end $$;

-- Create updated_at trigger function if it doesn't exist
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- Create updated_at trigger
create trigger handle_updated_at
    before update
    on public."p-hours"
    for each row
    execute function public.handle_updated_at();

-- RLS Policies
alter table "public"."p-clients" enable row level security;
alter table "public"."p-hours" enable row level security;

-- Policies for clients
create policy "Users can view their own clients"
    on "public"."p-clients"
    for select
    using (auth.uid() = user_id);

create policy "Users can create their own clients"
    on "public"."p-clients"
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own clients"
    on "public"."p-clients"
    for update
    using (auth.uid() = user_id);

create policy "Users can delete their own clients"
    on "public"."p-clients"
    for delete
    using (auth.uid() = user_id);

-- Policies for hours
create policy "Users can view their own hours"
    on "public"."p-hours"
    for select
    using (auth.uid() = user_id);

create policy "Users can create their own hours"
    on "public"."p-hours"
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own hours"
    on "public"."p-hours"
    for update
    using (auth.uid() = user_id);

create policy "Users can delete their own hours"
    on "public"."p-hours"
    for delete
    using (auth.uid() = user_id);

-- Indexes
create index if not exists "p-clients_user_id_idx" on "public"."p-clients" ("user_id");
create index if not exists "p-hours_user_id_idx" on "public"."p-hours" ("user_id");
create index if not exists "p-hours_client_id_idx" on "public"."p-hours" ("client_id");
create index if not exists "p-hours_task_id_idx" on "public"."p-hours" ("task_id");
create index if not exists "p-hours_date_idx" on "public"."p-hours" ("date");