import React from "react"
import { getHabits, Habit, getTodaysLoggedHabitIds } from "./actions" // Import action and type
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card"
import { AddHabitDialog } from "./_components/add-habit-dialog" // Import the dialog component
import { LogHabitButton } from "./_components/log-habit-button" // Import the log button

export default async function WellnessPage() {
  // Fetch habits AND today's logged habit IDs concurrently
  const [habitResult, loggedIdsResult] = await Promise.all([
    getHabits(),
    getTodaysLoggedHabitIds()
  ])

  const { habits, error: habitsError } = habitResult
  const { loggedHabitIds, error: logsError } = loggedIdsResult

  // Combine errors if any
  const error = habitsError || logsError

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Wellness Companion</h1>
        {/* Render the Add Habit Dialog trigger button */}
        <AddHabitDialog />
      </div>

      {error && (
        <p className="text-red-500">Error loading wellness data: {error}</p>
      )}

      <h2 className="text-xl font-semibold mt-6 mb-4">Your Habits</h2>

      {!error && !habits?.length && (
        <p>No habits defined yet. Add your first habit to start tracking!</p>
      )}

      {/* Basic habit list display */}
      {habits && habits.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => {
            const isLoggedToday = loggedHabitIds?.has(habit.id) ?? false // Check if ID is in the Set
            return (
              <Card key={habit.id}>
                <CardHeader>
                  <CardTitle>{habit.name}</CardTitle>
                  {habit.description && (
                    <CardDescription>{habit.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {habit.goal_frequency && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Goal: {habit.goal_frequency}
                    </p>
                  )}
                  {/* Pass isLoggedToday to the button component */}
                  <LogHabitButton
                    habitId={habit.id}
                    habitName={habit.name}
                    isLoggedToday={isLoggedToday}
                  />
                </CardContent>
                {/* TODO: Add Edit/Delete buttons for habits later */}
                {/* <CardFooter className="flex justify-end gap-2 pt-4">
                   <Button variant="outline" size="sm">Edit</Button>
                   <Button variant="destructive" size="sm">Delete</Button>
                </CardFooter> */}
              </Card>
            )
          })}
        </div>
      )}
      {/* Section for Logging - Add later */}
      {/* <h2 className="text-xl font-semibold mt-8 mb-4 border-t pt-6">Log Progress</h2> */}
    </div>
  )
}
