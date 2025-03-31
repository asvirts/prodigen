"use server"

import { cookies } from "next/headers"
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Define the Transaction type based on your Supabase table
export type Transaction = {
  id: number
  user_id: string
  description: string
  amount: number // Supabase returns numeric as number by default
  type: "income" | "expense"
  date: string // ISO 8601 date string (YYYY-MM-DD)
  category?: string | null
  created_at: string // ISO 8601 timestamp string
}

// Type for Budget data
interface Budget {
  id: number
  user_id: string
  year: number
  month: number
  category: string | null
  amount: number
  created_at: string
}

interface SetBudgetData {
  year: number
  month: number
  category: string | null // Null for overall budget
  amount: number
}

// Type for the data coming from the add transaction form
interface AddTransactionData {
  description: string
  amount: number
  type: "income" | "expense"
  date: string // Expecting 'YYYY-MM-DD' string from form
  category?: string
}

// Type for the data coming from the edit transaction form
interface UpdateTransactionData {
  id: number
  description?: string
  amount?: number
  type?: "income" | "expense"
  date?: string // 'YYYY-MM-DD'
  category?: string
}

// --- Server Actions ---

// Function to get transactions for the current user, filtered by month/year
export async function getTransactions(filter?: {
  year: number
  month: number
}): Promise<{
  transactions: Transaction[] | null
  error: string | null
}> {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient(cookieStore)
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    return { transactions: null, error: "User not authenticated." }
  }

  let query = supabase.from("p-transactions").select("*")

  // Apply month/year filter if provided
  if (filter) {
    // Ensure month is 1-indexed for Date, adjust for Supabase (0-indexed month in JS Date)
    const startDate = new Date(filter.year, filter.month - 1, 1)
    const endDate = new Date(filter.year, filter.month, 0) // Day 0 of next month = last day of current month

    // Format dates for Supabase query (YYYY-MM-DD)
    const startDateString = startDate.toISOString().split("T")[0]
    const endDateString = endDate.toISOString().split("T")[0]

    console.log(
      `Filtering transactions between ${startDateString} and ${endDateString}`
    ) // Debug log

    query = query
      .gte("date", startDateString) // Greater than or equal to start date
      .lte("date", endDateString) // Less than or equal to end date
  }

  // Add sorting
  query = query
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  // Execute query
  const { data, error } = await query

  if (error) {
    console.error("Error fetching transactions:", error)
    return { transactions: null, error: "Failed to fetch transactions." }
  }

  // Note: Supabase might return numeric types as strings depending on config/client.
  // Ensure amounts are numbers if necessary.
  const transactions = data.map((tx) => ({ ...tx, amount: Number(tx.amount) }))

  return { transactions: transactions as Transaction[], error: null }
}

// Server Action to add a new transaction
export async function addTransaction(
  formData: AddTransactionData
): Promise<{ success: boolean; error: string | null }> {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  // 1. Get current user
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    console.error("Authentication Error:", userError)
    return { success: false, error: "User not authenticated." }
  }
  const userId = userData.user.id

  // 2. Validate and prepare transaction data
  // Ensure amount is positive, type determines sign later if needed
  const amount = Math.abs(formData.amount)
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: "Invalid amount." }
  }

  const transactionData = {
    user_id: userId,
    description: formData.description,
    amount: amount, // Store positive amount
    type: formData.type,
    date: formData.date, // Assuming YYYY-MM-DD format is correct
    category: formData.category || null
  }

  // 3. Insert into Supabase
  const { error } = await supabase
    .from("p-transactions")
    .insert(transactionData)

  if (error) {
    console.error("Error adding transaction:", error)
    return {
      success: false,
      error: "Failed to add transaction. " + error.message
    }
  }

  // 4. Revalidate the finance page path
  revalidatePath("/finance")

  return { success: true, error: null }
}

// Server Action to delete a transaction
export async function deleteTransaction(
  transactionId: number
): Promise<{ success: boolean; error: string | null }> {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  // 1. Get user (RLS handles ownership check)
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    return { success: false, error: "User not authenticated." }
  }

  // 2. Delete from Supabase
  const { error } = await supabase
    .from("p-transactions")
    .delete()
    .match({ id: transactionId })

  if (error) {
    console.error("Error deleting transaction:", error)
    return {
      success: false,
      error: "Failed to delete transaction. " + error.message
    }
  }

  // 3. Revalidate the finance page path
  revalidatePath("/finance")

  return { success: true, error: null }
}

// Server Action to update an existing transaction
export async function updateTransaction(
  formData: UpdateTransactionData
): Promise<{ success: boolean; error: string | null }> {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  // 1. Get user (RLS handles ownership)
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    return { success: false, error: "User not authenticated." }
  }

  // 2. Prepare update data
  const { id, ...updateData } = formData
  const dataToUpdate: Partial<
    Omit<Transaction, "id" | "user_id" | "created_at">
  > = {}

  if (updateData.description !== undefined) {
    if (!updateData.description || updateData.description.length < 2) {
      return {
        success: false,
        error: "Description must be at least 2 characters."
      }
    }
    dataToUpdate.description = updateData.description
  }
  if (updateData.amount !== undefined) {
    const amount = Math.abs(updateData.amount)
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Invalid amount." }
    }
    dataToUpdate.amount = amount
  }
  if (updateData.type !== undefined) dataToUpdate.type = updateData.type
  if (updateData.date !== undefined) dataToUpdate.date = updateData.date
  if (updateData.category !== undefined)
    dataToUpdate.category = updateData.category

  if (Object.keys(dataToUpdate).length === 0) {
    return { success: false, error: "No fields provided for update." }
  }

  // 3. Update in Supabase
  const { error } = await supabase
    .from("p-transactions")
    .update(dataToUpdate)
    .match({ id: id })

  if (error) {
    console.error("Error updating transaction:", error)
    return {
      success: false,
      error: "Failed to update transaction. " + error.message
    }
  }

  // 4. Revalidate the finance page path
  revalidatePath("/finance")

  return { success: true, error: null }
}

// --- Budget Actions ---

// Action to get all budgets for a given month/year
export async function getBudgets(filter: {
  year: number
  month: number
}): Promise<{ budgets: Budget[] | null; error: string | null }> {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient(cookieStore)
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    return { budgets: null, error: "User not authenticated." }
  }

  const { data, error } = await supabase
    .from("p-budgets")
    .select("*")
    .eq("year", filter.year)
    .eq("month", filter.month)

  if (error) {
    console.error("Error fetching budgets:", error)
    return { budgets: null, error: "Failed to fetch budgets." }
  }

  // Ensure amount is a number
  const budgets = data.map((b) => ({ ...b, amount: Number(b.amount) }))
  return { budgets: budgets as Budget[], error: null }
}

// Action to set (create or update) a budget for a given month/year/category
export async function setBudget(
  budgetData: SetBudgetData
): Promise<{ success: boolean; error: string | null }> {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient(cookieStore)
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    return { success: false, error: "User not authenticated." }
  }
  const userId = userData.user.id

  if (isNaN(budgetData.amount) || budgetData.amount < 0) {
    return { success: false, error: "Invalid budget amount." }
  }

  // Data for upsert (insert or update)
  const upsertData = {
    user_id: userId,
    year: budgetData.year,
    month: budgetData.month,
    category: budgetData.category, // Can be null
    amount: budgetData.amount
  }

  // Use upsert with the unique constraint columns to ensure correct update/insert
  const { error } = await supabase
    .from("p-budgets")
    .upsert(upsertData, { onConflict: "user_id, year, month, category" })

  if (error) {
    console.error("Error setting budget:", error)
    return { success: false, error: "Failed to set budget. " + error.message }
  }

  revalidatePath("/finance") // Revalidate finance page to show updated budget
  return { success: true, error: null }
}
