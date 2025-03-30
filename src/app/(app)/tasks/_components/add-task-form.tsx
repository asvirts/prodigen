"use client"

import React, { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { addTask } from "../actions" // Import the actual server action
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Calendar } from "@/components/ui/calendar"
// import { cn } from "@/lib/utils"
// import { CalendarIcon } from "@lucide-react" // Needs lucide-react installed
// import { format } from "date-fns"

// Define the form schema using Zod
const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional()
  // due_date: z.date().optional(), // Add date handling later
})

export function AddTaskForm() {
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null) // Add success state
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: ""
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null)
    setSuccessMessage(null)
    startTransition(async () => {
      try {
        // Call the actual server action
        const result = await addTask(values)

        if (result?.error) {
          throw new Error(result.error)
        }

        form.reset() // Reset form on success
        setSuccessMessage("Task added successfully!")
        // Clear success message after a delay
        setTimeout(() => setSuccessMessage(null), 3000)
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 mb-6 p-4 border rounded-md"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} />
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
                <Textarea placeholder="Task description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* TODO: Add Date Picker Field here */}

        {/* Display messages */}
        {error && (
          <p className="text-sm font-medium text-destructive">Error: {error}</p>
        )}
        {successMessage && (
          <p className="text-sm font-medium text-green-600">{successMessage}</p>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding Task..." : "Add Task"}
        </Button>
      </form>
    </Form>
  )
}
