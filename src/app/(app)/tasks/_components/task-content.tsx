"use client"

import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getTasks } from "../actions"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { TaskCardActions } from "./task-card-actions"
import { cn } from "@/lib/utils"

export function TaskContent() {
  const [showCompleted, setShowCompleted] = useState(false)

  // Use React Query to fetch tasks
  const { data, error, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      return await getTasks()
    }
  })

  const tasks = data?.tasks || []

  // Filter tasks based on the showCompleted state
  const filteredTasks = showCompleted
    ? tasks
    : tasks.filter((task) => task.status !== "completed")

  return (
    <>
      <div className="flex items-center justify-between mt-6 mb-4 border-t pt-6">
        <h2 className="text-xl font-semibold">Your Tasks</h2>

        <div className="flex items-center space-x-2">
          <Switch
            id="show-completed"
            checked={showCompleted}
            onCheckedChange={setShowCompleted}
          />
          <Label htmlFor="show-completed">Show completed tasks</Label>
        </div>
      </div>

      {error && <p className="text-red-500">Error loading tasks: {error}</p>}

      {isLoading && <p className="text-muted-foreground">Loading tasks...</p>}

      {!isLoading && !error && !tasks?.length && (
        <p>No tasks yet. Add your first task!</p>
      )}

      {!isLoading && !error && tasks?.length > 0 && !filteredTasks.length && (
        <p>
          All tasks are completed. Toggle the switch to view them or add a new
          task.
        </p>
      )}

      {/* Task list display */}
      {filteredTasks.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className={cn(
                "flex flex-col justify-between transition-colors",
                task.status === "completed" && "bg-muted/50"
              )}
            >
              <div>
                <CardHeader>
                  <CardTitle
                    className={cn(
                      task.status === "completed" &&
                        "text-muted-foreground line-through"
                    )}
                  >
                    {task.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className={cn(
                      "text-sm text-muted-foreground",
                      task.status === "completed" && "line-through opacity-70"
                    )}
                  >
                    {task.description || "No description"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Status: <span className="capitalize">{task.status}</span>
                  </p>
                  {task.due_date && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </div>
              <CardFooter className="pt-4">
                <TaskCardActions task={task} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
