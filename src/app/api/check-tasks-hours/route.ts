import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient(cookies())

    // Fetch tasks
    const { data: tasks, error: tasksError } = await supabase
      .from("p-tasks")
      .select("*")
      .limit(5)

    // Fetch hours
    const { data: hours, error: hoursError } = await supabase
      .from("p-hours")
      .select("*")
      .limit(5)

    // Fetch first user
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .limit(1)

    // Return all data
    return NextResponse.json({
      tasks: {
        count: tasks?.length || 0,
        data: tasks || [],
        error: tasksError || null
      },
      hours: {
        count: hours?.length || 0,
        data: hours || [],
        error: hoursError || null
      },
      users: {
        count: users?.length || 0,
        data: users || [],
        error: usersError || null
      }
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
