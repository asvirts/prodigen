"use server"

import { createClient } from "@/lib/supabase/server"
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

// --- Server Actions ---

// Function to get transactions for the current user
export async function getTransactions(): Promise<{
  transactions: Transaction[] | null
  error: string | null
}> {
  const supabase = createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    return { transactions: null, error: "User not authenticated." }
  }

  // TODO: Add filtering (date range, type) and pagination later
  const { data, error } = await supabase
    .from("p-transactions")
    .select("*")
    .order("date", { ascending: false }) // Order by transaction date
    .order("created_at", { ascending: false }) // Secondary sort by creation time

  if (error) {
    console.error("Error fetching transactions:", error)
    return { transactions: null, error: "Failed to fetch transactions." }
  }

  // Note: Supabase might return numeric types as strings depending on config/client.
  // Ensure amounts are numbers if necessary.
  const transactions = data.map((tx) => ({ ...tx, amount: Number(tx.amount) }))

  return { transactions: transactions as Transaction[], error: null }
}

// Type for the data coming from the add transaction form
interface AddTransactionData {
  description: string
  amount: number
  type: "income" | "expense"
  date: string // Expecting 'YYYY-MM-DD' string from form
  category?: string
}

// Server Action to add a new transaction
export async function addTransaction(
  formData: AddTransactionData
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()

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

// TODO: Implement updateTransaction, deleteTransaction actions
