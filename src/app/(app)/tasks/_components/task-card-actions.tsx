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

interface TaskCardActionsProps {
  task: Task
}

export function TaskCardActions({ task }: TaskCardActionsProps) {
  const [isPendingDelete, startDeleteTransition] = useTransition()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = () => {
    setDeleteError(null)
    startDeleteTransition(async () => {
      const result = await deleteTask(task.id)
      if (result?.error) {
        setDeleteError(result.error)
        console.error("Delete failed:", result.error)
      }
    })
  }

  return (
    <div className="flex justify-end gap-2 items-center">
      {deleteError && (
        <p className="text-xs text-red-500 mr-2">Error: {deleteError}</p>
      )}

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
            onSuccess={() => setIsEditDialogOpen(false)}
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
