import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// This is an admin-only endpoint that helps manage RLS policies
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action") || "info" // Default to info

    // Use the admin client which bypasses RLS
    const supabase = createAdminClient()

    // Get table RLS policies
    if (action === "info") {
      // Get current RLS policies
      return NextResponse.json({
        message: "To manage RLS policies, please use one of these actions:",
        actions: {
          enable_rls: "Enable RLS on p-hours table",
          disable_rls: "Disable RLS on p-hours table (allows all operations)",
          add_policy: "Add a permissive policy for all operations"
        }
      })
    }

    // Disable RLS completely (WARNING: This removes all security!)
    if (action === "disable_rls") {
      // Execute raw SQL to disable RLS on the table
      const { error } = await supabase.rpc("disable_rls_on_hours")

      if (error) {
        console.error("Failed to disable RLS:", error)
        return NextResponse.json(
          {
            error: "Failed to disable RLS",
            details: error.message,
            sql: 'ALTER TABLE "p-hours" DISABLE ROW LEVEL SECURITY;'
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message:
          "Row Level Security disabled on p-hours table. All operations allowed for all users."
      })
    }

    // Enable RLS (recommended for production)
    if (action === "enable_rls") {
      // Execute raw SQL to enable RLS on the table
      const { error } = await supabase.rpc("enable_rls_on_hours")

      if (error) {
        console.error("Failed to enable RLS:", error)
        return NextResponse.json(
          {
            error: "Failed to enable RLS",
            details: error.message,
            sql: 'ALTER TABLE "p-hours" ENABLE ROW LEVEL SECURITY;'
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message:
          "Row Level Security enabled on p-hours table. Operations will be restricted."
      })
    }

    // Add a permissive policy
    if (action === "add_policy") {
      // Execute raw SQL to add a permissive policy
      const { error } = await supabase.rpc("add_permissive_policy_to_hours")

      if (error) {
        console.error("Failed to add policy:", error)
        return NextResponse.json(
          {
            error: "Failed to add policy",
            details: error.message,
            sql: 'CREATE POLICY "Allow authenticated users full access" ON "p-hours" FOR ALL TO authenticated USING (true) WITH CHECK (true);'
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message:
          "Added permissive policy for authenticated users to the p-hours table."
      })
    }

    return NextResponse.json(
      {
        error: "Invalid action",
        message: "Use 'info', 'disable_rls', 'enable_rls', or 'add_policy'"
      },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error managing RLS:", error)
    return NextResponse.json(
      {
        error: "Failed to manage RLS policies",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
