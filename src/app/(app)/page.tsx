import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import Link from "next/link"
import {
  ArrowRightIcon,
  CalendarIcon,
  DollarSignIcon,
  ListChecksIcon,
  HeartIcon,
  ClockIcon,
  ListTodoIcon,
  HeartPulseIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TaskItemWrapper } from "./_components/task-item-wrapper"
import { HourEntryWrapper } from "./_components/hour-entry-wrapper"

<<<<<<< HEAD
// Helper to format currency
function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount)
}
=======
export default async function Home() {
  const cookieStore = await cookies() // Get cookie store
  const supabase = createServerSupabaseClient(cookieStore) // Pass cookie store
>>>>>>> e3a6ed6b7d02761e24a0c75f325f6e1225bbe1e6

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data: userData, error: authError } = await supabase.auth.getUser()
  if (authError || !userData?.user) {
    redirect("/auth")
  }

  const userId = userData.user.id

  // Get user information
  const {
    data: { user }
  } = await supabase.auth.getUser()

  // Extract user's name from email or metadata
  let userName = "there"
  if (user) {
    if (user.user_metadata?.name) {
      userName = user.user_metadata.name.split(" ")[0]
    } else if (user.email) {
      userName = user.email.split("@")[0]
    }
  }

  // Fetch summaries for each module
  const fetchTasks = async () => {
    try {
      // Get user ID from auth session
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        console.error("No authenticated user found")
        return { pendingCount: 0, tasks: [], error: "No authenticated user" }
      }

      console.log("Current user ID:", user.id)

      // Fetch all tasks for the user
      const { data: allTasks, error: allTasksError } = await supabase
        .from("p-tasks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (allTasksError) {
        console.error("Error fetching all tasks:", allTasksError)
        return { pendingCount: 0, tasks: [], error: allTasksError.message }
      }

      console.log("Total tasks found:", allTasks?.length || 0)

      // Count pending and todo tasks
      const pendingTasks =
        allTasks?.filter(
          (task) => task.status === "pending" || task.status === "todo"
        ) || []

      const pendingCount = pendingTasks.length

      return {
        pendingCount,
        tasks: allTasks || [],
        error: null
      }
    } catch (err) {
      console.error("Exception in fetchTasks:", err)
      return { pendingCount: 0, tasks: [], error: String(err) }
    }
  }

  const fetchFinances = async () => {
    try {
      // Get current month's transactions
      const now = new Date()
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const startDateString = startDate.toISOString().split("T")[0]
      const endDateString = endDate.toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("p-transactions")
        .select("*")
        .gte("date", startDateString)
        .lte("date", endDateString)

      if (error) {
        console.error("Error loading finances:", error)
        return { monthlyIncome: 0, monthlyExpenses: 0, error: error.message }
      }

      let monthlyIncome = 0
      let monthlyExpenses = 0

      data?.forEach((tx) => {
        const amount = Number(tx.amount)
        if (tx.type === "income") {
          monthlyIncome += amount
        } else {
          monthlyExpenses += amount
        }
      })

      return {
        monthlyIncome,
        monthlyExpenses,
        monthlyNet: monthlyIncome - monthlyExpenses,
        error: null
      }
    } catch (err) {
      console.error("Exception in fetchFinances:", err)
      return {
        monthlyIncome: 0,
        monthlyExpenses: 0,
        monthlyNet: 0,
        error: String(err)
      }
    }
  }

  const fetchWellness = async () => {
    try {
      // Get all habits
      const { data: habits, error: habitsError } = await supabase
        .from("p-wellness-habits")
        .select("*")

      if (habitsError) {
        console.error("Error loading habits:", habitsError)
        return {
          completedHabits: 0,
          totalHabits: 0,
          habits: [],
          error: habitsError.message
        }
      }

      console.log("Total habits found:", habits?.length || 0)
      if (habits && habits.length > 0) {
        console.log("Sample habit:", habits[0])
      }

      // Get today's logs
      const today = new Date().toISOString().split("T")[0]
      const { data: logs, error: logsError } = await supabase
        .from("p-wellness-logs")
        .select("*")
        .eq("date", today)

      if (logsError) {
        console.error("Error loading today's logs:", logsError)
        return {
          completedHabits: 0,
          totalHabits: habits?.length || 0,
          habits: habits || [],
          error: logsError.message
        }
      }

      console.log("Today's logs found:", logs?.length || 0)

      // Process data
      const completedHabits = logs?.length || 0

      return {
        completedHabits,
        totalHabits: habits?.length || 0,
        habits: habits || [],
        error: null
      }
    } catch (err) {
      console.error("Exception in fetchWellness:", err)
      return {
        completedHabits: 0,
        totalHabits: 0,
        habits: [],
        error: String(err)
      }
    }
  }

  const fetchHours = async () => {
    try {
      // Get all hours entries first without date filtering to check if any exist
      const { data: allHours, error: allHoursError } = await supabase
        .from("p-hours")
        .select("*")
        .limit(10)

      if (allHoursError) {
        console.error("Error loading all hours:", allHoursError)
      } else {
        console.log("Total available hours entries:", allHours?.length || 0)
        if (allHours && allHours.length > 0) {
          console.log("Sample hour entry:", allHours[0])
        }
      }

      // Calculate total hours (from all entries, not just this week)
      let totalHours = 0
      allHours?.forEach((entry) => {
        try {
          // Handle different duration formats
          let durationValue = 0
          if (typeof entry.duration === "string") {
            // Try to extract number from string like "2.5 hours" or "2 hours"
            const match = entry.duration.match(/(\d+(\.\d+)?)/)
            if (match && match[1]) {
              durationValue = parseFloat(match[1])
            }
          } else if (typeof entry.duration === "number") {
            durationValue = entry.duration
          }

          totalHours += durationValue
          console.log(
            `Processed duration: ${entry.duration} → ${durationValue}`
          )
        } catch (parseError) {
          console.error("Error parsing duration:", entry.duration, parseError)
        }
      })

      // For display purposes, use any available hours instead of only showing this week
      return {
        weeklyHours: totalHours,
        entries: allHours || [],
        error: null
      }
    } catch (err) {
      console.error("Exception in fetchHours:", err)
      return { weeklyHours: 0, entries: [], error: String(err) }
    }
  }

  // Fetch all data in parallel with safe error handling for each
  const [tasksData, financesData, wellnessData, hoursData] = await Promise.all([
    fetchTasks().catch((err) => ({
      pendingCount: 0,
      tasks: [],
      error: String(err)
    })),
    fetchFinances().catch((err) => ({
      monthlyIncome: 0,
      monthlyExpenses: 0,
      monthlyNet: 0,
      error: String(err)
    })),
    fetchWellness().catch((err) => ({
      completedHabits: 0,
      totalHabits: 0,
      habits: [],
      error: String(err)
    })),
    fetchHours().catch((err) => ({
      weeklyHours: 0,
      entries: [],
      error: String(err)
    }))
  ])

  // Server Action for signing out
  const signOut = async () => {
    "use server"
<<<<<<< HEAD
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
=======

    const cookieStore = await cookies() // Get cookie store within action
    const supabase = createServerSupabaseClient(cookieStore) // Pass cookie store
>>>>>>> e3a6ed6b7d02761e24a0c75f325f6e1225bbe1e6
    await supabase.auth.signOut()
    return redirect("/auth")
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Hello, {userName}!
              </h1>
              <p className="text-muted-foreground">
                Welcome to your personal productivity dashboard. Here's a quick
                overview of your day.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="rounded bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric"
                })}
              </div>
              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm">
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Dashboard</h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Tasks Summary Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {tasksData.error ? (
                    <p className="text-sm text-red-500">Failed to load tasks</p>
                  ) : (
                    <div className="text-2xl font-bold">
                      {tasksData.pendingCount}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">pending tasks</p>
                </div>
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                  <ListTodoIcon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
              {tasksData.tasks && tasksData.tasks.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-muted-foreground font-medium">
                    Recent Tasks:
                  </div>
                  <ul className="mt-2 space-y-3">
                    {tasksData.tasks.slice(0, 2).map((task) => (
                      <li key={task.id} className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-full truncate",
                            task.status === "completed" &&
                              "text-muted-foreground line-through"
                          )}
                        >
                          • {task.title}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter className="px-6 pt-2 pb-4">
              <Link
                href="/tasks"
                className="text-xs text-blue-600 hover:underline flex items-center"
              >
                View all tasks <ArrowRightIcon className="ml-1 h-3 w-3" />
              </Link>
            </CardFooter>
          </Card>

          {/* Finance Summary Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Finances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {financesData.error ? (
                    <p className="text-sm text-red-500">
                      Failed to load finances
                    </p>
                  ) : (
                    <div className="text-2xl font-bold">
                      ${financesData.monthlyIncome.toFixed(2)}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    monthly income
                  </p>
                </div>
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                  <DollarSignIcon className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
              </div>
              {financesData.transactions &&
                financesData.transactions.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs text-muted-foreground font-medium">
                      Recent Transactions:
                    </div>
                    <ul className="mt-2 text-sm space-y-1">
                      {financesData.transactions
                        .slice(0, 2)
                        .map((transaction) => (
                          <li key={transaction.id} className="truncate">
                            • {transaction.description}: $
                            {transaction.amount.toFixed(2)}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
            </CardContent>
            <CardFooter className="px-6 pt-2 pb-4">
              <Link
                href="/finance"
                className="text-xs text-blue-600 hover:underline flex items-center"
              >
                Manage finances <ArrowRightIcon className="ml-1 h-3 w-3" />
              </Link>
            </CardFooter>
          </Card>

          {/* Wellness Summary Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Wellness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {wellnessData.error ? (
                    <p className="text-sm text-red-500">
                      Failed to load wellness
                    </p>
                  ) : (
                    <div className="text-2xl font-bold">
                      {wellnessData.completedHabits} /{" "}
                      {wellnessData.totalHabits}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    completed habits
                  </p>
                </div>
                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                  <HeartPulseIcon className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                </div>
              </div>
              {wellnessData.habits && wellnessData.habits.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-muted-foreground font-medium">
                    Top Habits:
                  </div>
                  <ul className="mt-2 text-sm space-y-1">
                    {wellnessData.habits.slice(0, 2).map((habit) => (
                      <li key={habit.id} className="truncate">
                        • {habit.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter className="px-6 pt-2 pb-4">
              <Link
                href="/wellness"
                className="text-xs text-blue-600 hover:underline flex items-center"
              >
                Track wellness <ArrowRightIcon className="ml-1 h-3 w-3" />
              </Link>
            </CardFooter>
          </Card>

          {/* Hours Summary Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {hoursData.error ? (
                    <p className="text-sm text-red-500">Failed to load hours</p>
                  ) : (
                    <div className="text-2xl font-bold">
                      {hoursData.weeklyHours.toFixed(1)}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    hours this week
                  </p>
                </div>
                <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900">
                  <ClockIcon className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                </div>
              </div>
              {hoursData.entries && hoursData.entries.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-muted-foreground font-medium">
                    Recent Entries:
                  </div>
                  <div className="space-y-4">
                    {hoursData.entries.slice(0, 4).map((entry) => (
                      <HourEntryWrapper key={entry.id} entry={entry} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="px-6 pt-2 pb-4">
              <Link
                href="/hours"
                className="text-xs text-blue-600 hover:underline flex items-center"
              >
                Track hours <ArrowRightIcon className="ml-1 h-3 w-3" />
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Tasks */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Tasks</CardTitle>
                <Link
                  href="/tasks"
                  className="text-xs text-blue-600 hover:underline flex items-center"
                >
                  View all <ArrowRightIcon className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {tasksData.error ? (
                <p className="text-sm text-red-500">Failed to load tasks</p>
              ) : tasksData.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks found</p>
              ) : (
                <div className="space-y-4">
                  {tasksData.tasks.slice(0, 4).map((task) => (
                    <TaskItemWrapper key={task.id} task={task} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Hours */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Time Entries</CardTitle>
                <Link
                  href="/hours"
                  className="text-xs text-blue-600 hover:underline flex items-center"
                >
                  View all <ArrowRightIcon className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {hoursData.error ? (
                <p className="text-sm text-red-500">Failed to load hours</p>
              ) : hoursData.entries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No time entries found
                </p>
              ) : (
                <div className="space-y-4">
                  {hoursData.entries.slice(0, 4).map((entry) => (
                    <HourEntryWrapper key={entry.id} entry={entry} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
