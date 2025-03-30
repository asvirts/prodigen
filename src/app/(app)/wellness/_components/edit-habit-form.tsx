"use client"

import React, { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Habit, updateHabit } from "../actions" // Import update action and Habit type

// Form schema for editing
const editHabitFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Habit name must be at least 2 characters." }),
  description: z.string().optional(),
  goal_frequency: z.string().optional()
})

interface EditHabitFormProps {
  habit: Habit // Receive habit data to edit
  onSuccess?: () => void // Callback on success
}

export function EditHabitForm({ habit, onSuccess }: EditHabitFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof editHabitFormSchema>>({
    resolver: zodResolver(editHabitFormSchema),
    defaultValues: {
      name: habit.name || "",
      description: habit.description || "",
      goal_frequency: habit.goal_frequency || ""
    }
  })

  function onSubmit(values: z.infer<typeof editHabitFormSchema>) {
    setError(null)
    startTransition(async () => {
      try {
        const result = await updateHabit({
          id: habit.id, // Include the habit ID
          ...values
        })

        if (result?.error) {
          throw new Error(result.error)
        }

        console.log("Habit updated successfully!")
        onSuccess?.() // Call callback
      } catch (err) {
        console.error(err)
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred."
        )
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Habit Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Drink Water, Exercise" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Why is this habit important?"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="goal_frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal / Frequency (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Daily, 3 times a week, 8 glasses"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p className="text-sm font-medium text-destructive">Error: {error}</p>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Saving Changes..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  )
}
