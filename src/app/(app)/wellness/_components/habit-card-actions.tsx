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
import { deleteHabit, Habit } from "../actions" // Remove unused updateHabit
import { Loader2 } from "lucide-react"
import { EditHabitForm } from "./edit-habit-form" // Import edit form
import { toast } from "sonner" // Import toast
// TODO: Import Dialog and EditHabitForm later

interface HabitCardActionsProps {
  habit: Habit
}

export function HabitCardActions({ habit }: HabitCardActionsProps) {
  const [isDeleting, startDeleteTransition] = useTransition()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false) // State for dialog

  const handleDelete = () => {
    // Optional: Add confirmation dialog
    // if (!confirm('Are you sure you want to delete this habit and all its logs?')) return;

    startDeleteTransition(async () => {
      const result = await deleteHabit(habit.id)
      if (result?.error) {
        toast.error(`Failed to delete habit: ${result.error}`) // Error toast
      } else {
        toast.success("Habit deleted successfully!") // Success toast
      }
      // Revalidation happens in action
    })
  }

  return (
    <div className="flex flex-col items-start gap-1 mt-2">
      <div className="flex justify-end gap-2 w-full">
        {/* Wrap Edit button in Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting} // Disable if deleting
            >
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Edit Habit: {habit.name}</DialogTitle>
            </DialogHeader>
            <EditHabitForm
              habit={habit}
              onSuccess={() => {
                setIsEditDialogOpen(false)
                toast.success("Habit updated successfully!") // Success toast
              }}
            />
          </DialogContent>
        </Dialog>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
        </Button>
      </div>
    </div>
  )
}
