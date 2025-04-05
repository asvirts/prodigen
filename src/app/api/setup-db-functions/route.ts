import { createClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// This endpoint sets up necessary Supabase SQL functions
export async function GET() {
  try {
    const supabase = createClient()

    // Create function to disable RLS
    const disableRlsResult = await supabase
      .rpc("create_disable_rls_function")
      .catch(async (_error) => {
        console.log("Creating disable_rls_on_hours function...")
        const { error: sqlError } = await supabase
          .from("_")
          .select("*")
          .limit(0)
          .then(async () => {
            return await supabase.rpc("exec_sql", {
              sql_query: `
              CREATE OR REPLACE FUNCTION disable_rls_on_hours()
              RETURNS void AS $$
              BEGIN
                EXECUTE 'ALTER TABLE "p-hours" DISABLE ROW LEVEL SECURITY;';
              END;
              $$ LANGUAGE plpgsql;
              `
            })
          })
          .catch(() => {
            return {
              error: { message: "Failed to create disable_rls_on_hours" }
            }
          })

        return { result: "Function creation attempted", error: sqlError }
      })

    // Create function to enable RLS
    const enableRlsResult = await supabase
      .rpc("create_enable_rls_function")
      .catch(async (_error) => {
        console.log("Creating enable_rls_on_hours function...")
        const { error: sqlError } = await supabase
          .from("_")
          .select("*")
          .limit(0)
          .then(async () => {
            return await supabase.rpc("exec_sql", {
              sql_query: `
              CREATE OR REPLACE FUNCTION enable_rls_on_hours()
              RETURNS void AS $$
              BEGIN
                EXECUTE 'ALTER TABLE "p-hours" ENABLE ROW LEVEL SECURITY;';
              END;
              $$ LANGUAGE plpgsql;
              `
            })
          })
          .catch(() => {
            return {
              error: { message: "Failed to create enable_rls_on_hours" }
            }
          })

        return { result: "Function creation attempted", error: sqlError }
      })

    // Create function to add permissive policy
    const policyResult = await supabase
      .rpc("create_add_policy_function")
      .catch(async (_error) => {
        console.log("Creating add_permissive_policy_to_hours function...")
        const { error: sqlError } = await supabase
          .from("_")
          .select("*")
          .limit(0)
          .then(async () => {
            return await supabase.rpc("exec_sql", {
              sql_query: `
              CREATE OR REPLACE FUNCTION add_permissive_policy_to_hours()
              RETURNS void AS $$
              BEGIN
                -- Drop policy if it exists
                BEGIN
                  EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated users full access" ON "p-hours";';
                EXCEPTION WHEN OTHERS THEN
                  -- Ignore errors when dropping non-existent policy
                END;
                
                -- Create new policy
                EXECUTE 'CREATE POLICY "Allow authenticated users full access" ON "p-hours" FOR ALL TO authenticated USING (true) WITH CHECK (true);';
              END;
              $$ LANGUAGE plpgsql;
              `
            })
          })
          .catch(() => {
            return {
              error: {
                message: "Failed to create add_permissive_policy_to_hours"
              }
            }
          })

        return { result: "Function creation attempted", error: sqlError }
      })

    return NextResponse.json({
      status: "success",
      functions: {
        disable_rls: disableRlsResult,
        enable_rls: enableRlsResult,
        add_policy: policyResult
      },
      message: "Setup DB functions completed - see results for details"
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to set up database functions",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
