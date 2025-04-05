"use client"

import React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateTask } from "../tasks/actions"
import { toast } from "sonner"

// Define Task type interface
interface Task {
  id: number
  title: string
  description?: string | null
  status: string
  due_date?: string | null
  created_at: string
}

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const [isPending, startTransition] = useTransition()

  const handleToggleComplete = () => {
    startTransition(async () => {
      const newStatus = task.status === "completed" ? "todo" : "completed"
      const result = await updateTask({
        id: task.id,
        status: newStatus
      })

      if (result?.error) {
        toast.error(`Failed to update task: ${result.error}`)
      } else {
        toast.success(
          task.status === "completed"
            ? "Task marked as incomplete"
            : "Task marked as complete"
        )
      }
    })
  }

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleComplete}
          disabled={isPending}
          className="p-0 h-8 w-8 -ml-2 mt-0"
        >
          {task.status === "completed" ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="sr-only">
            {task.status === "completed"
              ? "Mark as incomplete"
              : "Mark as complete"}
          </span>
        </Button>
        <div className="space-y-1">
          <p
            className={cn(
              "text-sm font-medium leading-none",
              task.status === "completed" &&
                "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </p>
          <p className="text-xs text-muted-foreground">
            Status: <span className="capitalize">{task.status}</span>
          </p>
        </div>
      </div>
      <div
        className={`px-2 py-1 text-xs rounded-full ${
          task.status === "pending" || task.status === "todo"
            ? "bg-yellow-100 text-yellow-800"
            : task.status === "completed"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
        }`}
      >
        {task.status}
      </div>
    </div>
  )
}
