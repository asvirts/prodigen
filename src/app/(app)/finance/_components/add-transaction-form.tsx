"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns"; // For date formatting
import { CalendarIcon } from "lucide-react"; // Icon for date picker
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Using Textarea for description
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAddTransaction } from "../hooks"; // Import the React Query hook

// Form schema using Zod with enhanced client-side validation
const transactionFormSchema = z.object({
  description: z
    .string()
    .min(2, { message: "Description must be at least 2 characters." })
    .max(100, { message: "Description must not exceed 100 characters." }),
  amount: z.coerce
    .number()
    .positive({ message: "Amount must be a positive number." })
    .refine((val) => val <= 1000000, {
      message: "Amount must be less than 1,000,000",
    }), // Add a reasonable max value
  type: z.enum(["income", "expense"], {
    required_error: "Please select a transaction type.",
  }),
  date: z
    .date({
      required_error: "A date is required.",
      invalid_type_error: "That's not a valid date!",
    })
    .refine((date) => date <= new Date() && date >= new Date("1900-01-01"), {
      message: "Date must be in the past and after 1900",
    }),
  category: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)), // Transform empty string to undefined
});

export function AddTransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [error, setError] = useState<string | null>(null);

  // Use our custom React Query mutation hook
  const { addTransaction: mutateAddTransaction, isSubmitting } =
    useAddTransaction();

  const form = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: "",
      amount: undefined, // Start with undefined amount
      type: undefined,
      date: new Date(), // Default to today
      category: "",
    },
    mode: "onChange", // Enable validation on change for better UX
  });

  function onSubmit(values: z.infer<typeof transactionFormSchema>) {
    setError(null);

    // Format date to 'YYYY-MM-DD' string before sending to server action
    const dateString = format(values.date, "yyyy-MM-dd");

    mutateAddTransaction(
      {
        ...values,
        date: dateString,
      },
      {
        onSuccess: () => {
          form.reset({
            description: "",
            amount: undefined,
            type: undefined,
            date: new Date(),
            category: "",
          });
          onSuccess?.();
        },
        onError: (err) => {
          setError(String(err));
        },
      },
    );
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
                    onChange={(e) => {
                      // Additional client-side validation
                      const value = e.target.value;
                      if (
                        value === "" ||
                        (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)
                      ) {
                        field.onChange(e);
                      }
                    }}
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
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(date);
                        }
                      }}
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

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Adding Transaction..." : "Add Transaction"}
        </Button>
      </form>
    </Form>
  );
}
