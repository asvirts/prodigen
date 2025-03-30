"use client"

import React, { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog"
import { deleteTask, Task, updateTask } from "../actions"
import { EditTaskForm } from "./edit-task-form"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface TaskCardActionsProps {
  task: Task
}

export function TaskCardActions({ task }: TaskCardActionsProps) {
  const [isPendingDelete, startDeleteTransition] = useTransition()
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

  return (
    <div className="flex justify-end gap-2 items-center">
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPendingDelete}>
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
        disabled={isPendingDelete}
      >
        {isPendingDelete ? "Deleting..." : "Delete"}
      </Button>
    </div>
  )
}
