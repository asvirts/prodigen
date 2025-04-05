import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// This is an admin-only endpoint that bypasses RLS policies
// It should be removed or secured in production
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Admin: Creating hour entry with data:", body)

    // Use the admin client which bypasses RLS
    const supabase = createAdminClient()

    const { data, error } = await supabase.from("p-hours").insert(body).select()

    if (error) {
      console.error("Admin: Supabase error when creating hour entry:", error)
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      console.error("Admin: No data returned after insert")
      return NextResponse.json(
        {
          error: "No data returned after insert"
        },
        { status: 500 }
      )
    }

    console.log("Admin: Successfully created hour entry:", data[0])
    return NextResponse.json({
      success: true,
      data: data[0],
      message: "Created using admin role (bypassing RLS)"
    })
  } catch (error) {
    console.error("Admin: Exception when creating hour entry:", error)
    return NextResponse.json(
      {
        error: "Invalid request payload or service role key not set",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 400 }
    )
  }
}
