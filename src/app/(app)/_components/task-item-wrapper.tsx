"use client"

import { cn } from "@/lib/utils"

// Define Task type interface
interface Task {
  id: number
  title: string
  description?: string | null
  status: string
  due_date?: string | null
  created_at: string
}

interface TaskItemWrapperProps {
  task: Task
}

export function TaskItemWrapper({ task }: TaskItemWrapperProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p
          className={cn(
            "text-sm font-medium leading-none",
            task.status === "completed" && "text-muted-foreground line-through"
          )}
        >
          {task.title}
        </p>
        <p className="text-xs text-muted-foreground">
          Status: <span className="capitalize">{task.status}</span>
        </p>
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
