"use server"

import { cookies } from "next/headers"
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Define the Task type based on your Supabase table
export type Task = {
  id: number
  user_id: string
  title: string
  description?: string | null
  status: "todo" | "in_progress" | "done" // Specific enum values
  due_date?: string | null // ISO 8601 date string (YYYY-MM-DD)
  created_at: string // ISO 8601 timestamp string
}

// Helper function to create client within actions
async function createClient() {
  const cookieStore = await cookies()
  return createServerSupabaseClient(cookieStore)
}

// Type for AddTaskData
interface AddTaskData {
  title: string
  description?: string
  due_date?: string | null
}

// Type for UpdateTaskData
interface UpdateTaskData {
  id: number
  title?: string
  description?: string
  status?: "todo" | "in_progress" | "done"
  due_date?: string | null
}

// --- Server Actions ---

// Function to get tasks for the current user
export async function getTasks(): Promise<{
  tasks: Task[] | null
  error: string | null
}> {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    return { tasks: null, error: "User not authenticated." }
  }

  const { data, error } = await supabase
    .from("p-tasks") // Use the correct table name
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tasks:", error)
    return { tasks: null, error: "Failed to fetch tasks." }
  }

  return { tasks: data as Task[], error: null }
}

// Server Action to add a new task
export async function addTask(
  formData: AddTaskData
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  // 1. Get current user
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    console.error("Authentication Error:", userError)
    return { success: false, error: "User not authenticated." }
  }
  const userId = userData.user.id

  // 2. Prepare task data
  const taskData = {
    user_id: userId,
    title: formData.title,
    description: formData.description || null,
    status: "todo", // Default status
    due_date: formData.due_date || null
  }

  // 3. Insert into Supabase
  const { error } = await supabase.from("p-tasks").insert(taskData)

  if (error) {
    console.error("Error adding task:", error)
    return { success: false, error: "Failed to add task. " + error.message }
  }

  // 4. Revalidate the tasks page path to refresh the list
  revalidatePath("/tasks")

  return { success: true, error: null }
}

// Server Action to delete a task
export async function deleteTask(
  taskId: number
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  // 1. Get current user (ensure they own the task implicitly via RLS)
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    console.error("Authentication Error:", userError)
    return { success: false, error: "User not authenticated." }
  }
  // Note: We don't strictly need to check user_id here again because
  // RLS policy on the p-tasks table enforces that users can only delete their own tasks.

  // 2. Delete from Supabase
  const { error } = await supabase
    .from("p-tasks")
    .delete()
    .match({ id: taskId }) // Specify the task ID to delete

  if (error) {
    console.error("Error deleting task:", error)
    return { success: false, error: "Failed to delete task. " + error.message }
  }

  // 3. Revalidate the tasks page path
  revalidatePath("/tasks")

  return { success: true, error: null }
}

// Server Action to update an existing task
export async function updateTask(
  formData: UpdateTaskData
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  // 1. Get current user (RLS handles ownership check)
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    console.error("Authentication Error:", userError)
    return { success: false, error: "User not authenticated." }
  }

  // 2. Prepare update data (only include fields that are provided)
  const { id, ...updateData } = formData
  // Clean up undefined fields if necessary, though Supabase might handle this
  const dataToUpdate: Partial<Omit<Task, "id" | "user_id" | "created_at">> = {}
  if (updateData.title !== undefined) dataToUpdate.title = updateData.title
  if (updateData.description !== undefined)
    dataToUpdate.description = updateData.description
  if (updateData.status !== undefined) dataToUpdate.status = updateData.status
  if (updateData.due_date !== undefined)
    dataToUpdate.due_date = updateData.due_date

  if (Object.keys(dataToUpdate).length === 0) {
    return { success: false, error: "No fields provided for update." }
  }

  // 3. Update in Supabase
  const { error } = await supabase
    .from("p-tasks")
    .update(dataToUpdate)
    .match({ id: id }) // Specify the task ID to update

  if (error) {
    console.error("Error updating task:", error)
    return { success: false, error: "Failed to update task. " + error.message }
  }

  // 4. Revalidate the tasks page path
  revalidatePath("/tasks")

  return { success: true, error: null }
}
