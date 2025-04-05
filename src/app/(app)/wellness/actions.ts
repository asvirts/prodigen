"use server"

import { cookies } from "next/headers"
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Define the Habit type based on p-wellness-habits table
export type Habit = {
  id: string // UUID in the migration
  user_id: string
  name: string
  description?: string | null
  goal_frequency?: string | null
  created_at: string
  updated_at: string
}

// Define the WellnessLog type based on p-wellness-logs table
export type WellnessLog = {
  id: string // UUID in the migration
  user_id: string
  habit_id: string // UUID in the migration
  date: string // Date field in the migration
  notes?: string | null
  created_at: string
}

// Helper function to create client within actions
async function createClient() {
  const cookieStore = await cookies()
  return createServerSupabaseClient(cookieStore)
}

// Type for the data coming from the add habit form
interface AddHabitData {
  name: string
  description?: string
  goal_frequency?: string
}

// Type for the data coming from the edit habit form
interface UpdateHabitData {
  id: number
  name?: string
  description?: string
  goal_frequency?: string
}

// --- Server Actions ---

// Function to get habits for the current user
export async function getHabits(): Promise<{
  habits: Habit[] | null
  error: string | null
}> {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    return { habits: null, error: "User not authenticated." }
  }

  const { data, error } = await supabase
    .from("p-wellness-habits") // Updated table name to match schema
    .select("*")
    .order("created_at", { ascending: true }) // Show oldest habits first

  if (error) {
    console.error("Error fetching habits:", error)
    return { habits: null, error: "Failed to fetch habits." }
  }

  return { habits: data as Habit[], error: null }
}

// Server Action to add a new habit
export async function addHabit(
  formData: AddHabitData
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  // 1. Get current user
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    console.error("Authentication Error:", userError)
    return { success: false, error: "User not authenticated." }
  }
  const userId = userData.user.id

  // 2. Prepare habit data
  if (!formData.name) {
    return { success: false, error: "Habit name is required." }
  }

  const habitData = {
    user_id: userId,
    name: formData.name,
    description: formData.description || null,
    goal_frequency: formData.goal_frequency || null
  }

  // 3. Insert into Supabase
  const { error } = await supabase.from("p-wellness-habits").insert(habitData) // Updated table name

  if (error) {
    console.error("Error adding habit:", error)
    return { success: false, error: "Failed to add habit. " + error.message }
  }

  // 4. Revalidate the wellness page path
  revalidatePath("/wellness")

  return { success: true, error: null }
}

// Server Action to log completion of a habit for today
export async function addWellnessLog(
  habitId: number
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  // 1. Get current user
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    console.error("Authentication Error:", userError)
    return { success: false, error: "User not authenticated." }
  }
  const userId = userData.user.id

  // 2. Prepare log data (using today's date)
  // Supabase date type expects 'YYYY-MM-DD'
  const today = new Date().toISOString().split("T")[0]

  const logData = {
    user_id: userId,
    habit_id: habitId,
    date: today // Updated field name to match schema
  }

  // 3. Insert into Supabase
  const { error } = await supabase.from("p-wellness-logs").insert(logData)

  if (error) {
    console.error("Error adding wellness log:", error)
    return {
      success: false,
      error: "Failed to log habit completion. " + error.message
    }
  }

  // 4. Revalidate the wellness page path
  revalidatePath("/wellness")

  return { success: true, error: null }
}

// Server Action to get IDs of habits logged today by the current user
export async function getTodaysLoggedHabitIds(): Promise<{
  loggedHabitIds: Set<number> | null
  error: string | null
}> {
  const supabase = await createClient()

  // 1. Get current user
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    console.error("Authentication Error fetching today's logs:", userError)
    return { loggedHabitIds: null, error: "User not authenticated." }
  }
  const userId = userData.user.id

  // 2. Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  // 3. Fetch logs for today and the user, selecting only habit_id
  const { data, error } = await supabase
    .from("p-wellness-logs")
    .select("habit_id") // Only select the habit_id column
    .eq("user_id", userId)
    .eq("date", today) // Updated field name to match schema

  if (error) {
    console.error("Error fetching today's wellness logs:", error)
    return { loggedHabitIds: null, error: "Failed to fetch today's logs." }
  }

  // 4. Convert the result into a Set of habit IDs for quick lookup
  const loggedHabitIds = new Set(data.map((log) => log.habit_id))

  return { loggedHabitIds, error: null }
}

// Server Action to delete a habit
export async function deleteHabit(
  habitId: number
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  // 1. Get user (RLS handles ownership check)
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    return { success: false, error: "User not authenticated." }
  }

  // 2. Delete from Supabase (logs will cascade delete due to foreign key constraint)
  const { error } = await supabase
    .from("p-wellness-habits") // Updated table name
    .delete()
    .match({ id: habitId })

  if (error) {
    console.error("Error deleting habit:", error)
    return { success: false, error: "Failed to delete habit. " + error.message }
  }

  // 3. Revalidate the wellness page path
  revalidatePath("/wellness")

  return { success: true, error: null }
}

// Server Action to update an existing habit
export async function updateHabit(
  formData: UpdateHabitData
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  // 1. Get user (RLS handles ownership)
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    return { success: false, error: "User not authenticated." }
  }

  // 2. Prepare update data
  const { id, ...updateData } = formData
  const dataToUpdate: Partial<Omit<Habit, "id" | "user_id" | "created_at">> = {}

  if (updateData.name !== undefined) {
    if (!updateData.name || updateData.name.length < 2) {
      return {
        success: false,
        error: "Habit name must be at least 2 characters."
      }
    }
    dataToUpdate.name = updateData.name
  }
  if (updateData.description !== undefined)
    dataToUpdate.description = updateData.description
  if (updateData.goal_frequency !== undefined)
    dataToUpdate.goal_frequency = updateData.goal_frequency

  if (Object.keys(dataToUpdate).length === 0) {
    return { success: false, error: "No fields provided for update." }
  }

  // 3. Update in Supabase
  const { error } = await supabase
    .from("p-wellness-habits")
    .update(dataToUpdate)
    .match({ id: id })

  if (error) {
    console.error("Error updating habit:", error)
    return { success: false, error: "Failed to update habit. " + error.message }
  }

  // 4. Revalidate the wellness page path
  revalidatePath("/wellness")

  return { success: true, error: null }
}

// TODO: Implement more generic getWellnessLogs action (e.g., for calendar view)
