-- Modify tasks table to use UUID instead of bigint
begin;
  -- Temporarily drop the foreign key constraint from hours table
  alter table "public"."p-hours" drop constraint if exists "p-hours_task_id_fkey";

  -- Create a new temporary column for the UUID
  alter table "public"."p-tasks" add column new_id uuid not null default gen_random_uuid();

  -- Drop the existing primary key constraint
  alter table "public"."p-tasks" drop constraint if exists "p-tasks_pkey";

  -- Drop the old id column and rename new_id to id
  alter table "public"."p-tasks" drop column id;
  alter table "public"."p-tasks" rename column new_id to id;

  -- Add the primary key constraint back
  alter table "public"."p-tasks" add constraint "p-tasks_pkey" primary key (id);

  -- Recreate the foreign key constraint from hours table
  alter table "public"."p-hours" add constraint "p-hours_task_id_fkey"
    foreign key (task_id) references "public"."p-tasks"(id) on delete set null;

  -- Create an index on the new UUID column
  create index if not exists "p-tasks_id_idx" on "public"."p-tasks" (id);
commit;