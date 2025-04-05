import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Check if wellness tables exist with a simple query
    const tables = {
      wellness_habits: await checkTable(supabase, "p-wellness-habits"),
      wellness_logs: await checkTable(supabase, "p-wellness-logs")
    }

    return NextResponse.json({
      tables,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Error checking wellness tables",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

async function checkTable(supabase, tableName) {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select("*", { count: "exact" })
      .limit(1)

    return {
      exists: !error,
      error: error?.message,
      count: count || 0,
      sample: data
    }
  } catch (e) {
    return {
      exists: false,
      error: e instanceof Error ? e.message : String(e)
    }
  }
}
