import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient(cookies())

    // Create a PostgreSQL function to get all tables
    const createRpcResult = await supabase
      .rpc("create_get_tables_function")
      .catch(async (_error) => {
        // If RPC doesn't exist, try to create it using raw SQL
        const { error: _sqlError } = await supabase.auth.admin
          .createUser({
            email: "",
            password: ""
          })
          .catch(() => {
            // This will fail, we're just getting a reference to trigger auth
            return { error: { message: "Auth check" } }
          })

        return {
          error: { message: "Need to manually create function using SQL" }
        }
      })

    // Check if p-hours table exists (with hyphen)
    const { data: hyphenData, error: hyphenError } = await supabase
      .from("p-hours")
      .select("*")
      .limit(1)
      .catch(() => {
        return { data: null, error: { message: "Hyphen table not found" } }
      })

    // Check if p_hours table exists (with underscore)
    const { data: underscoreData, error: underscoreError } = await supabase
      .from("p_hours")
      .select("*")
      .limit(1)
      .catch(() => {
        return { data: null, error: { message: "Underscore table not found" } }
      })

    return NextResponse.json({
      create_rpc_result: createRpcResult,
      hyphen_table: {
        exists: !hyphenError,
        error: hyphenError?.message,
        data: hyphenData
      },
      underscore_table: {
        exists: !underscoreError,
        error: underscoreError?.message,
        data: underscoreData
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to execute database functions",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
