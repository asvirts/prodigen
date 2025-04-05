import React, { Suspense } from "react" // Import Suspense
import { cookies } from "next/headers" // Import cookies
<<<<<<< HEAD
import { createClient } from "@/lib/supabase/server" // Update import name
// Define the types locally since they don't seem to be exported properly from actions
interface Budget {
  id: number
  user_id: string
  year: number
  month: number
  category: string | null
  amount: number
  created_at: string
}

interface Transaction {
  id: number
  user_id: string
  description: string
  amount: number
  type: "income" | "expense"
  date: string
  category?: string | null
  created_at: string
}

=======
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server" // Import server client
import { Budget, Transaction } from "./actions"
>>>>>>> e3a6ed6b7d02761e24a0c75f325f6e1225bbe1e6
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge" // For income/expense type
import { AddTransactionDialog } from "./_components/add-transaction-dialog" // Import the Dialog component
import { TransactionRowActions } from "./_components/transaction-row-actions" // Import row actions
import { MonthNavigator } from "./_components/month-navigator" // Import MonthNavigator
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // Import Card for summary
import { Progress } from "@/components/ui/progress" // Import Progress bar
import { format } from "date-fns"
import { SetBudgetForm } from "./_components/set-budget-form" // Import budget form
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog" // Import Dialog
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic" // Force dynamic rendering

// Helper to format currency
function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount)
}

<<<<<<< HEAD
// Define Page Props to receive searchParams
interface FinancePageProps {
  searchParams?: {
    year?: string | string[]
    month?: string | string[]
    [key: string]: string | string[] | undefined
  }
}

=======
// Using the built-in type system for Next.js Pages
>>>>>>> e3a6ed6b7d02761e24a0c75f325f6e1225bbe1e6
export default async function FinancePage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Convert searchParams to plain object with defaults
<<<<<<< HEAD
  // Fix by using properly structured code that doesn't directly access properties
  const getParamValue = (param: string | string[] | undefined): string => {
    if (typeof param === "string") return param
    if (Array.isArray(param) && param.length > 0) return param[0]
    return ""
=======
  const parsedParams = await searchParams
  const params = {
    year: typeof parsedParams.year === "string" ? parsedParams.year : "",
    month: typeof parsedParams.month === "string" ? parsedParams.month : ""
>>>>>>> e3a6ed6b7d02761e24a0c75f325f6e1225bbe1e6
  }

  const yearValue = getParamValue(searchParams.year)
  const monthValue = getParamValue(searchParams.month)

  const now = new Date()
  const year = parseInt(yearValue, 10) || now.getFullYear()
  const month = parseInt(monthValue, 10) || now.getMonth() + 1
  const currentFilter = { year, month }

<<<<<<< HEAD
  // --- Properly initialize Supabase client ---
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
=======
  // --- Client Initialization (Correct for Page Render) ---
  const cookieStore = await cookies()
  if (!cookieStore) {
    throw new Error("Cookie store not available")
  }
>>>>>>> e3a6ed6b7d02761e24a0c75f325f6e1225bbe1e6

  // Get the current user
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    // Handle auth error appropriately, maybe redirect
    console.error("Auth error in FinancePage:", authError)
    return <div>Authentication Error. Please log in.</div>
  }

  // --- Data Fetching (Directly in Page Component) ---
  const fetchTransactions = async () => {
    try {
      let query = supabase.from("p-transactions").select("*") // Use hyphen format consistently
      // Apply filter
      const startDate = new Date(currentFilter.year, currentFilter.month - 1, 1)
      const endDate = new Date(currentFilter.year, currentFilter.month, 0)
      const startDateString = startDate.toISOString().split("T")[0]
      const endDateString = endDate.toISOString().split("T")[0]
      query = query.gte("date", startDateString).lte("date", endDateString)
      // Apply sorting
      query = query
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
      // Execute
      const { data, error } = await query
      if (error)
        return {
          data: null,
          error: `Failed to fetch transactions: ${error.message}`
        }
      const transactions = data.map((tx) => ({
        ...tx,
        amount: Number(tx.amount)
      })) as Transaction[]
      return { data: transactions, error: null }
    } catch (err) {
      console.error("Exception in fetchTransactions:", err)
      return { data: null, error: String(err) }
    }
  }

  const fetchBudgets = async () => {
    try {
      const { data, error } = await supabase
        .from("p-budgets") // Use hyphen format consistently
        .select("*")
        .eq("year", currentFilter.year)
        .eq("month", currentFilter.month)
      if (error)
        return {
          data: null,
          error: `Failed to fetch budgets: ${error.message}`
        }
      const budgets = data.map((b) => ({
        ...b,
        amount: Number(b.amount)
      })) as Budget[]
      return { data: budgets, error: null }
    } catch (err) {
      console.error("Exception in fetchBudgets:", err)
      return { data: null, error: String(err) }
    }
  }

  // Fetch concurrently
  const [transactionsResult, budgetsResult] = await Promise.all([
    fetchTransactions(),
    fetchBudgets()
  ])

  const { data: transactions, error: transactionError } = transactionsResult
  const { data: budgets, error: budgetError } = budgetsResult

  // Calculate Monthly Summary
  let monthlyIncome = 0
  let monthlyExpenses = 0
  // Calculate expenses per category
  const expensesByCategory: { [key: string]: number } = {}

  if (transactions) {
    transactions.forEach((tx) => {
      if (tx.type === "income") {
        monthlyIncome += tx.amount
      } else {
        monthlyExpenses += tx.amount
        const category = tx.category || "Uncategorized" // Group null categories
        expensesByCategory[category] =
          (expensesByCategory[category] || 0) + tx.amount
      }
    })
  }
  const monthlyNet = monthlyIncome - monthlyExpenses

  // Get unique non-null category names from all fetched budgets
  const distinctBudgetCategories = [
    ...new Set(
      budgets?.filter((b) => b.category !== null).map((b) => b.category!) ?? []
    )
  ].sort() // Sort alphabetically

  // Prepare Budget vs Actual data
  const budgetSummary: {
    category: string | null
    budget: number
    actual: number
    remaining: number
    percentUsed: number
  }[] = []
  let overallBudget: Budget | undefined
  const categoryBudgets = new Map<string, Budget>()

  if (budgets) {
    budgets.forEach((b) => {
      if (b.category === null) {
        overallBudget = b
      } else {
        categoryBudgets.set(b.category, b)
      }
    })
  }

  // Add overall budget summary (if exists)
  if (overallBudget) {
    const actual = monthlyExpenses
    const remaining = overallBudget.amount - actual
    const percentUsed =
      overallBudget.amount > 0 ? (actual / overallBudget.amount) * 100 : 0
    budgetSummary.push({
      category: "Overall Expenses",
      budget: overallBudget.amount,
      actual,
      remaining,
      percentUsed
    })
  }

  // Add category budget summaries
  for (const [category, budget] of categoryBudgets.entries()) {
    const actual = expensesByCategory[category] || 0
    const remaining = budget.amount - actual
    const percentUsed = budget.amount > 0 ? (actual / budget.amount) * 100 : 0
    budgetSummary.push({
      category,
      budget: budget.amount,
      actual,
      remaining,
      percentUsed
    })
  }

  // Add categories with expenses but no budget set
  for (const category in expensesByCategory) {
    if (!categoryBudgets.has(category)) {
      budgetSummary.push({
        category,
        budget: 0,
        actual: expensesByCategory[category],
        remaining: -expensesByCategory[category],
        percentUsed: 0
      })
    }
  }

  // Sort budget summary (e.g., overall first, then alphabetically by category)
  budgetSummary.sort((a, b) => {
    if (a.category === "Overall Expenses") return -1
    if (b.category === "Overall Expenses") return 1
    return (a.category ?? "").localeCompare(b.category ?? "")
  })

  return (
    <div className="container">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h1 className="text-2xl font-semibold">Finance Co-Pilot</h1>
        {/* Wrap MonthNavigator in Suspense as it uses useSearchParams */}
        <Suspense fallback={<div>Loading month...</div>}>
          <MonthNavigator />
        </Suspense>
        <div className="flex items-center gap-2">
          {/* Dialog for Setting Budgets */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Set Budgets</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Set Budgets</DialogTitle>
              </DialogHeader>
              {/* Pass current year/month, existing budgets, and detected categories */}
              <SetBudgetForm
                year={currentFilter.year}
                month={currentFilter.month}
                existingBudgets={budgets ?? []}
                detectedCategories={distinctBudgetCategories}
              />
            </DialogContent>
          </Dialog>
          <AddTransactionDialog budgetedCategories={distinctBudgetCategories} />
        </div>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            {/* Icon can go here */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(monthlyIncome)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(monthlyExpenses)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Monthly</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                monthlyNet >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(monthlyNet)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">
            Budget vs Actuals (
            {format(
              new Date(currentFilter.year, currentFilter.month - 1),
              "MMMM yyyy"
            )}
            )
          </h2>
          {/* Maybe move Set Budgets button here? */}
        </div>
        {budgetError && (
          <p className="text-red-500">Error loading budgets: {budgetError}</p>
        )}
        {!budgetError && budgets?.length === 0 && (
          <p className="text-muted-foreground">
            No budgets set for this month yet.
          </p>
        )}
        {!budgetError && budgetSummary.length > 0 && (
          <div className="space-y-4">
            {budgetSummary.map((item) => (
              <Card key={item.category ?? "overall"} className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">
                    {item.category ?? "Uncategorized"}
                  </span>
                  <span
                    className={`font-semibold ${
                      item.remaining >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(item.remaining)}{" "}
                    {item.remaining >= 0 ? "Remaining" : "Over Budget"}
                  </span>
                </div>
                <Progress
                  value={Math.min(item.percentUsed, 100)}
                  className="h-2 mb-1"
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Spent: {formatCurrency(item.actual)}</span>
                  <span>
                    Budget: {formatCurrency(item.budget > 0 ? item.budget : 0)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
        {/* TODO: Add button/form to set/edit budgets */}
      </div>

      {/* Transaction Table Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Transactions</h2>
        {transactionError && <p className="text-red-500">{transactionError}</p>}
        {transactions && transactions.length > 0 && (
          <Table>
            <TableCaption>
              A list of your transactions for the selected month.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{format(new Date(tx.date), "PPP")}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell>{tx.category ?? "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={tx.type === "income" ? "default" : "destructive"}
                      className="capitalize"
                    >
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(tx.amount)}
                  </TableCell>
                  <TableCell>
                    <TransactionRowActions
                      transaction={tx}
                      budgetedCategories={distinctBudgetCategories}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
