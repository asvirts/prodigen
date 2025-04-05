-- Consolidated schema changes for tasks, hours, and clients tables
begin;

  -- Create clients table
  create table if not exists "public"."p-clients" (
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

  -- Enable RLS on clients table
  alter table "public"."p-clients" enable row level security;

  -- RLS policies for clients
  create policy "Users can view their own clients"
    on "public"."p-clients" for select
    using (auth.uid() = user_id);

  create policy "Users can create their own clients"
    on "public"."p-clients" for insert
    with check (auth.uid() = user_id);

  create policy "Users can update their own clients"
    on "public"."p-clients" for update
    using (auth.uid() = user_id);

  -- Modify tasks table to use UUID and add client_id
  alter table "public"."p-tasks" add column if not exists "new_id" uuid not null default gen_random_uuid();
  alter table "public"."p-tasks" add column if not exists "client_id" uuid references "public"."p-clients"(id) on delete set null;
  
  -- Drop existing constraints
  alter table "public"."p-tasks" drop constraint if exists "p-tasks_pkey";
  
  -- Drop the old id column and rename new_id to id
  alter table "public"."p-tasks" drop column if exists id;
  alter table "public"."p-tasks" rename column new_id to id;
  
  -- Add the primary key constraint back
  alter table "public"."p-tasks" add constraint "p-tasks_pkey" primary key (id);

  -- Create hours table
  create table if not exists "public"."p-hours" (
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

  -- Enable RLS on hours table
  alter table "public"."p-hours" enable row level security;

  -- RLS policies for hours
  create policy "Users can view their own hours"
    on "public"."p-hours" for select
    using (auth.uid() = user_id);

  create policy "Users can create their own hours"
    on "public"."p-hours" for insert
    with check (auth.uid() = user_id);

  create policy "Users can update their own hours"
    on "public"."p-hours" for update
    using (auth.uid() = user_id);

  create policy "Users can delete their own hours"
    on "public"."p-hours" for delete
    using (auth.uid() = user_id);

  -- Create indexes
  create index if not exists "p-clients_user_id_idx" on "public"."p-clients" ("user_id");
  create index if not exists "p-tasks_id_idx" on "public"."p-tasks" (id);
  create index if not exists "p-tasks_client_id_idx" on "public"."p-tasks" (client_id);
  create index if not exists "p-hours_user_id_idx" on "public"."p-hours" ("user_id");
  create index if not exists "p-hours_client_id_idx" on "public"."p-hours" ("client_id");
  create index if not exists "p-hours_task_id_idx" on "public"."p-hours" ("task_id");
  create index if not exists "p-hours_date_idx" on "public"."p-hours" ("date");

commit;