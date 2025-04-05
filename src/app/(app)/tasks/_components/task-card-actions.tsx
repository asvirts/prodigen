"use client"

import React, { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { deleteTask, Task, updateTask } from "../actions"
import { EditTaskForm } from "./edit-task-form"
import { toast } from "sonner"
import { CheckCircle2, Circle } from "lucide-react"

interface TaskCardActionsProps {
  task: Task
}

export function TaskCardActions({ task }: TaskCardActionsProps) {
  const [isPendingDelete, startDeleteTransition] = useTransition()
  const [isPendingComplete, startCompleteTransition] = useTransition()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteTask(task.id)
      if (result?.error) {
        toast.error(`Failed to delete task: ${result.error}`)
      } else {
        toast.success("Task deleted successfully!")
      }
    })
  }

  const handleToggleComplete = () => {
    startCompleteTransition(async () => {
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
    <div className="flex justify-end gap-2 items-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleComplete}
        disabled={isPendingComplete}
        className="mr-auto p-0 h-8 w-8"
      >
        {task.status === "completed" ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
        <span className="sr-only">
          {task.status === "completed"
            ? "Mark as incomplete"
            : "Mark as complete"}
        </span>
      </Button>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isPendingDelete || isPendingComplete}
          >
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <EditTaskForm
            task={task}
            onSuccess={() => {
              setIsEditDialogOpen(false)
              toast.success("Task updated successfully!")
            }}
          />
        </DialogContent>
      </Dialog>

      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isPendingDelete || isPendingComplete}
      >
        {isPendingDelete ? "Deleting..." : "Delete"}
      </Button>
    </div>
  )
}
