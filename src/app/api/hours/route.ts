import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export type Client = {
  id: string
  name: string
  contact_email?: string
  contact_phone?: string
  billing_rate?: number
  billing_currency?: string
  created_at: string
}

export type HourEntry = {
  id: string
  client_id: string
  task_id?: string
  date: string
  duration: string
  description?: string
  billable: boolean
  created_at: string
  updated_at: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")
    const taskId = searchParams.get("taskId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    console.log("Fetching hour entries with params:", {
      clientId,
      taskId,
      startDate,
      endDate
    })

    // Important: Await the createClient function
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Get the authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Authentication error:", authError)
      return NextResponse.json(
        {
          error: "Authentication required",
          details: "You must be signed in to view time entries",
          hint: "Check your authentication status",
          authError
        },
        { status: 401 }
      )
    }

    // Use p-hours table (verified to exist)
    // RLS will filter to only show entries belonging to this user
    let query = supabase.from("p-hours").select("*")

    // Apply filters
    if (clientId) {
      query = query.eq("client_id", clientId)
    }

    if (taskId) {
      query = query.eq("task_id", taskId)
    }

    if (startDate) {
      query = query.gte("date", startDate)
    }

    if (endDate) {
      query = query.lte("date", endDate)
    }

    const { data: hours, error } = await query.order("date", {
      ascending: false
    })

    if (error) {
      console.error("Supabase error when fetching hour entries:", error)

      // If it's an RLS policy error, provide specific guidance
      if (error.code === "42501") {
        return NextResponse.json(
          {
            error: "Permission denied by RLS policy",
            details:
              "Your RLS policy allows users to view only their own entries",
            hint: "You can only view entries that belong to you",
            code: error.code
          },
          { status: 403 }
        )
      }

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

    console.log(`Successfully fetched ${hours?.length || 0} hour entries`)
    return NextResponse.json(hours || [])
  } catch (error) {
    console.error("Exception when fetching hour entries:", error)
    return NextResponse.json(
      {
        error: "Invalid request",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 400 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    console.log("Deleting hour entry with id:", id)

    // Important: Await the createClient function
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Get the authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Authentication error:", authError)
      return NextResponse.json(
        {
          error: "Authentication required",
          details: "You must be signed in to delete time entries",
          hint: "Check your authentication status",
          authError
        },
        { status: 401 }
      )
    }

    // Use p-hours table (verified to exist)
    const { error } = await supabase.from("p-hours").delete().eq("id", id)

    if (error) {
      console.error("Supabase error when deleting hour entry:", error)

      // If it's an RLS policy error, provide specific guidance
      if (error.code === "42501") {
        return NextResponse.json(
          {
            error: "Permission denied by RLS policy",
            details:
              "Your RLS policy allows users to delete only their own entries",
            hint: "You can only delete entries that belong to you",
            code: error.code
          },
          { status: 403 }
        )
      }

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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Exception when deleting hour entry:", error)
    return NextResponse.json(
      {
        error: "Failed to delete entry",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Creating hour entry with data:", body)

    // Important: Await the createClient function
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Get the authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Authentication error:", authError)
      return NextResponse.json(
        {
          error: "Authentication required",
          details: "You must be signed in to create time entries",
          hint: "Check your authentication status",
          authError
        },
        { status: 401 }
      )
    }

    // Add user_id to the data being inserted
    const dataWithUserId = {
      ...body,
      user_id: user.id
    }

    console.log("Adding user_id to data:", dataWithUserId)

    // Use p-hours table (verified to exist)
    const { data, error } = await supabase
      .from("p-hours")
      .insert(dataWithUserId)
      .select()

    if (error) {
      console.error("Supabase error when creating hour entry:", error)

      // If it's an RLS policy error, provide specific guidance
      if (error.code === "42501") {
        return NextResponse.json(
          {
            error: "Permission denied by RLS policy",
            details:
              "Your RLS policy requires a user_id field that matches the authenticated user",
            hint: "Ensure you have a user_id column in your table and it matches auth.uid() as per your policy",
            code: error.code
          },
          { status: 403 }
        )
      }

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
      console.error("No data returned after insert")
      return NextResponse.json(
        {
          error: "No data returned after insert"
        },
        { status: 500 }
      )
    }

    console.log("Successfully created hour entry:", data[0])
    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Exception when creating hour entry:", error)
    return NextResponse.json(
      {
        error: "Invalid request payload",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 400 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const body = await request.json()
    console.log("Updating hour entry with id and data:", id, body)

    // Important: Await the createClient function
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Get the authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Authentication error:", authError)
      return NextResponse.json(
        {
          error: "Authentication required",
          details: "You must be signed in to update time entries",
          hint: "Check your authentication status",
          authError
        },
        { status: 401 }
      )
    }

    // Ensure the entry belongs to the user (RLS will enforce this but we check anyway)
    const { error: fetchError } = await supabase
      .from("p-hours")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching entry to update:", fetchError)
      return NextResponse.json(
        {
          error: fetchError.message,
          details: "Could not find the entry to update",
          hint: fetchError.hint,
          code: fetchError.code
        },
        { status: 404 }
      )
    }

    // Add user_id to preserve it in the update
    const dataWithUserId = {
      ...body,
      user_id: user.id
    }

    // Use p-hours table (verified to exist)
    const { data, error } = await supabase
      .from("p-hours")
      .update(dataWithUserId)
      .eq("id", id)
      .select()

    if (error) {
      console.error("Supabase error when updating hour entry:", error)

      // If it's an RLS policy error, provide specific guidance
      if (error.code === "42501") {
        return NextResponse.json(
          {
            error: "Permission denied by RLS policy",
            details:
              "Your RLS policy allows users to update only their own entries",
            hint: "You can only update entries that belong to you",
            code: error.code
          },
          { status: 403 }
        )
      }

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
      console.error("No data returned after update")
      return NextResponse.json(
        {
          error: "No data returned after update"
        },
        { status: 500 }
      )
    }

    console.log("Successfully updated hour entry:", data[0])
    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Exception when updating hour entry:", error)
    return NextResponse.json(
      {
        error: "Invalid request payload",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 400 }
    )
  }
}
