-- Create tables for wellness tracking features
begin;

  -- Create wellness habits table
  create table if not exists "public"."p-wellness-habits" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "name" text not null,
    "description" text,
    "goal_frequency" text,
    "user_id" uuid not null references auth.users(id) on delete cascade,
    constraint "p-wellness-habits_pkey" primary key ("id")
  );

  -- Enable RLS on wellness habits table
  alter table "public"."p-wellness-habits" enable row level security;

  -- RLS policies for wellness habits
  create policy "Users can view their own wellness habits"
    on "public"."p-wellness-habits" for select
    using (auth.uid() = user_id);

  create policy "Users can create their own wellness habits"
    on "public"."p-wellness-habits" for insert
    with check (auth.uid() = user_id);

  create policy "Users can update their own wellness habits"
    on "public"."p-wellness-habits" for update
    using (auth.uid() = user_id);

  create policy "Users can delete their own wellness habits"
    on "public"."p-wellness-habits" for delete
    using (auth.uid() = user_id);

  -- Create wellness logs table
  create table if not exists "public"."p-wellness-logs" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "habit_id" uuid not null references "public"."p-wellness-habits"(id) on delete cascade,
    "date" date not null,
    "notes" text,
    "user_id" uuid not null references auth.users(id) on delete cascade,
    constraint "p-wellness-logs_pkey" primary key ("id")
  );

  -- Enable RLS on wellness logs table
  alter table "public"."p-wellness-logs" enable row level security;

  -- RLS policies for wellness logs
  create policy "Users can view their own wellness logs"
    on "public"."p-wellness-logs" for select
    using (auth.uid() = user_id);

  create policy "Users can create their own wellness logs"
    on "public"."p-wellness-logs" for insert
    with check (auth.uid() = user_id);

  create policy "Users can update their own wellness logs"
    on "public"."p-wellness-logs" for update
    using (auth.uid() = user_id);

  create policy "Users can delete their own wellness logs"
    on "public"."p-wellness-logs" for delete
    using (auth.uid() = user_id);

  -- Create indexes
  create index if not exists "p-wellness-habits_user_id_idx" on "public"."p-wellness-habits" ("user_id");
  create index if not exists "p-wellness-logs_user_id_idx" on "public"."p-wellness-logs" ("user_id");
  create index if not exists "p-wellness-logs_habit_id_idx" on "public"."p-wellness-logs" ("habit_id");
  create index if not exists "p-wellness-logs_date_idx" on "public"."p-wellness-logs" ("date");
  
  -- Unique constraint to prevent duplicate entries for the same habit on the same day
  create unique index if not exists "p-wellness-logs_unique_habit_date_idx" 
    on "public"."p-wellness-logs" ("habit_id", "date", "user_id");

commit; 