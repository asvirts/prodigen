import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient(cookies())

    // Check if p_hours table exists
    const { data: hoursData, error: hoursError } = await supabase
      .from("p_hours")
      .select("*")
      .limit(1)

    // Try using SQL query directly to get tables
    const { data: tablesData, error: tablesError } = await supabase
      .rpc("get_tables")
      .catch(() => {
        // If RPC not available, return empty data
        return { data: null, error: { message: "RPC not available" } }
      })

    if (hoursError) {
      return NextResponse.json({
        status: "error",
        message: "Error accessing p_hours table",
        error: hoursError.message,
        details: hoursError
      })
    }

    // Check table name typo - maybe it's still named p-hours with hyphen?
    const { data: hyphenData, error: hyphenError } = await supabase
      .from("p-hours")
      .select("*")
      .limit(1)
      .catch(() => {
        // Return empty if table doesn't exist
        return { data: null, error: { message: "Hyphen table check failed" } }
      })

    return NextResponse.json({
      status: "success",
      p_hours: {
        exists: !hoursError,
        data: hoursData || []
      },
      p_hyphen_hours: {
        exists: !hyphenError,
        data: hyphenData || []
      },
      tables: tablesData || [],
      tablesError: tablesError?.message
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to database",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
