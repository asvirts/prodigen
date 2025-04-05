import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient(cookies())

    // Check if tables exist
    const tables = {
      p_hours: await checkTable(supabase, "p_hours"),
      p_dash_hours: await checkTable(supabase, "p-hours")
    }

    // If neither table exists, create p_hours
    let creationResult = null
    if (!tables.p_hours.exists && !tables.p_dash_hours.exists) {
      creationResult = await createHoursTable(supabase)
    }

    return NextResponse.json({
      tables,
      creation: creationResult
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to setup hours table",
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

async function createHoursTable(supabase) {
  try {
    // Create the table using SQL
    const { data, error } = await supabase
      .rpc("create_hours_table")
      .catch(async () => {
        // If RPC doesn't exist, this should be handled by manually creating in SQL editor:
        //
        // CREATE TABLE "p_hours" (
        //   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        //   client_id UUID NOT NULL,
        //   task_id UUID,
        //   date DATE NOT NULL,
        //   duration TEXT NOT NULL,
        //   description TEXT,
        //   billable BOOLEAN NOT NULL DEFAULT TRUE,
        //   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        //   updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        // );

        return {
          data: null,
          error: { message: "RPC not found - need to manually create table" }
        }
      })

    if (error) {
      return {
        success: false,
        message: "Failed to create table via RPC",
        error: error.message,
        sql: `
          CREATE TABLE "p_hours" (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            client_id UUID NOT NULL,
            task_id UUID,
            date DATE NOT NULL,
            duration TEXT NOT NULL,
            description TEXT,
            billable BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
        `
      }
    }

    return {
      success: true,
      data
    }
  } catch (e) {
    return {
      success: false,
      message: "Exception while creating table",
      error: e instanceof Error ? e.message : String(e)
    }
  }
}
