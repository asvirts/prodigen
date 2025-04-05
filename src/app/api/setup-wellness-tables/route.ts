import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Regular client for checking tables
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Admin client for creating tables (bypasses RLS)
    const adminClient = createAdminClient()

    // Check if tables exist
    const tables = {
      wellness_habits: await checkTable(supabase, "p-wellness-habits"),
      wellness_logs: await checkTable(supabase, "p-wellness-logs")
    }

    // If either table doesn't exist, create them
    let creationResult = null
    if (!tables.wellness_habits.exists || !tables.wellness_logs.exists) {
      creationResult = await createWellnessTables(adminClient)
    }

    return NextResponse.json({
      tables,
      creation: creationResult
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to setup wellness tables",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

async function checkTable(supabase, tableName) {
  try {
    const { data, error } = await supabase.from(tableName).select("*").limit(1)

    return {
      exists: !error,
      error: error?.message,
      sample: data
    }
  } catch (e) {
    return {
      exists: false,
      error: e instanceof Error ? e.message : String(e)
    }
  }
}

async function createWellnessTables(adminClient) {
  try {
    // SQL to create wellness tables
    const createTablesSQL = `
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
    `

    // Execute SQL to create tables
    const { error } = await adminClient.rpc("pgclient", {
      query: createTablesSQL
    })

    if (error) {
      return {
        success: false,
        message: "Failed to create wellness tables",
        error: error.message
      }
    }

    return {
      success: true,
      message: "Wellness tables created successfully"
    }
  } catch (e) {
    return {
      success: false,
      message: "Exception while creating wellness tables",
      error: e instanceof Error ? e.message : String(e)
    }
  }
}
