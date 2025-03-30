"use client"

import React, { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns" // For date formatting
import { CalendarIcon } from "lucide-react" // Icon for date picker
import { cn } from "@/lib/utils"

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
import { Textarea } from "@/components/ui/textarea" // Using Textarea for description
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { addTransaction } from "../actions" // Import the server action

// Form schema using Zod
const transactionFormSchema = z.object({
  description: z
    .string()
    .min(2, { message: "Description must be at least 2 characters." }),
  amount: z.coerce
    .number()
    .positive({ message: "Amount must be a positive number." }), // Coerce input to number
  type: z.enum(["income", "expense"], {
    required_error: "Please select a transaction type."
  }),
  date: z.date({ required_error: "A date is required." }),
  category: z.string().optional()
})

export function AddTransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: "",
      amount: undefined, // Start with undefined amount
      type: undefined,
      date: new Date(), // Default to today
      category: ""
    }
  })

  function onSubmit(values: z.infer<typeof transactionFormSchema>) {
    setError(null)
    startTransition(async () => {
      try {
        // Format date to 'YYYY-MM-DD' string before sending to server action
        const dateString = format(values.date, "yyyy-MM-dd")

        const result = await addTransaction({
          ...values,
          date: dateString
        })

        if (result?.error) {
          throw new Error(result.error)
        }

        form.reset()
        // Optionally: Show success message or call onSuccess callback
        console.log("Transaction added successfully!")
        onSuccess?.()
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
      {/* Using Textarea for description */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Groceries, Salary" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  {/* Use type="number" and step for better UX */}
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Income or Expense" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col pt-2">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP") // More readable format
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category (Optional)</FormLabel>
                <FormControl>
                  {/* TODO: Replace with Select dropdown populated from p-budgets later? */}
                  <Input
                    placeholder="e.g., Food, Transport"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {error && (
          <p className="text-sm font-medium text-destructive">Error: {error}</p>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Adding Transaction..." : "Add Transaction"}
        </Button>
      </form>
    </Form>
  )
}
