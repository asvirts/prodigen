"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Transaction,
  Budget,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  setBudget,
} from "./actions";

// Create a client-side Supabase client
const createClientSideClient = () => {
  return createClient();
};

// Hook for fetching transactions
export function useTransactions(year: number, month: number) {
  return useQuery({
    queryKey: ["transactions", year, month],
    queryFn: async () => {
      const supabase = createClientSideClient();

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      const startDateString = startDate.toISOString().split("T")[0];
      const endDateString = endDate.toISOString().split("T")[0];

      let query = supabase.from("p-transactions").select("*");
      query = query
        .gte("date", startDateString)
        .lte("date", endDateString)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }

      return data.map((tx) => ({
        ...tx,
        amount: Number(tx.amount),
      })) as Transaction[];
    },
  });
}

// Hook for fetching budgets
export function useBudgets(year: number, month: number) {
  return useQuery({
    queryKey: ["budgets", year, month],
    queryFn: async () => {
      const supabase = createClientSideClient();

      const { data, error } = await supabase
        .from("p-budgets")
        .select("*")
        .eq("year", year)
        .eq("month", month);

      if (error) {
        throw new Error(`Failed to fetch budgets: ${error.message}`);
      }

      return data.map((b) => ({
        ...b,
        amount: Number(b.amount),
      })) as Budget[];
    },
  });
}

// Hook for adding a transaction with optimistic updates
export function useAddTransaction() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = useMutation({
    mutationFn: addTransaction,
    onMutate: async (newTransaction) => {
      setIsSubmitting(true);
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      // Snapshot the previous value
      const prevTransactions = queryClient.getQueryData<Transaction[]>([
        "transactions",
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["transactions"], (old: Transaction[] = []) => {
        const optimisticTransaction: Transaction = {
          id: Math.random(), // temp id
          user_id: "optimistic",
          description: newTransaction.description,
          amount: newTransaction.amount,
          type: newTransaction.type,
          date: newTransaction.date,
          category: newTransaction.category || null,
          created_at: new Date().toISOString(),
        };

        return [optimisticTransaction, ...old];
      });

      return { prevTransactions };
    },
    onSuccess: () => {
      toast.success("Transaction added successfully!");
      setIsSubmitting(false);
    },
    onError: (error, _, context) => {
      // Revert back to the previous state if there's an error
      if (context?.prevTransactions) {
        queryClient.setQueryData(["transactions"], context.prevTransactions);
      }
      toast.error(`Failed to add transaction: ${error}`);
      setIsSubmitting(false);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  return {
    addTransaction: mutation.mutate,
    isSubmitting,
  };
}

// Hook for deleting a transaction with optimistic updates
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onMutate: async (transactionId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      // Snapshot the previous value
      const prevTransactions = queryClient.getQueryData<Transaction[]>([
        "transactions",
      ]);

      // Optimistically remove the transaction
      queryClient.setQueryData(["transactions"], (old: Transaction[] = []) => {
        return old.filter((transaction) => transaction.id !== transactionId);
      });

      return { prevTransactions };
    },
    onSuccess: () => {
      toast.success("Transaction deleted!");
    },
    onError: (error, _, context) => {
      // Revert back to the previous state if there's an error
      if (context?.prevTransactions) {
        queryClient.setQueryData(["transactions"], context.prevTransactions);
      }
      toast.error(`Failed to delete transaction: ${error}`);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

// Hook for updating a transaction with optimistic updates
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTransaction,
    onMutate: async (updatedTransaction) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      // Snapshot the previous value
      const prevTransactions = queryClient.getQueryData<Transaction[]>([
        "transactions",
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["transactions"], (old: Transaction[] = []) => {
        return old.map((transaction) => {
          if (transaction.id === updatedTransaction.id) {
            return { ...transaction, ...updatedTransaction };
          }
          return transaction;
        });
      });

      return { prevTransactions };
    },
    onSuccess: () => {
      toast.success("Transaction updated!");
    },
    onError: (error, _, context) => {
      // Revert back to the previous state if there's an error
      if (context?.prevTransactions) {
        queryClient.setQueryData(["transactions"], context.prevTransactions);
      }
      toast.error(`Failed to update transaction: ${error}`);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

// Hook for setting a budget with optimistic updates
export function useSetBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setBudget,
    onMutate: async (newBudget) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["budgets", newBudget.year, newBudget.month],
      });

      // Snapshot the previous value
      const prevBudgets = queryClient.getQueryData<Budget[]>([
        "budgets",
        newBudget.year,
        newBudget.month,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["budgets", newBudget.year, newBudget.month],
        (old: Budget[] = []) => {
          const existingBudgetIndex = old.findIndex(
            (b) =>
              b.category === newBudget.category &&
              b.year === newBudget.year &&
              b.month === newBudget.month,
          );

          if (existingBudgetIndex >= 0) {
            // Update existing budget
            const updatedBudgets = [...old];
            updatedBudgets[existingBudgetIndex] = {
              ...updatedBudgets[existingBudgetIndex],
              amount: newBudget.amount,
            };
            return updatedBudgets;
          } else {
            // Add new budget
            const optimisticBudget: Budget = {
              id: Math.random(), // temp id
              user_id: "optimistic",
              year: newBudget.year,
              month: newBudget.month,
              category: newBudget.category,
              amount: newBudget.amount,
              created_at: new Date().toISOString(),
            };
            return [...old, optimisticBudget];
          }
        },
      );

      return { prevBudgets };
    },
    onSuccess: () => {
      toast.success("Budget updated!");
    },
    onError: (error, variables, context) => {
      // Revert back to the previous state if there's an error
      if (context?.prevBudgets) {
        queryClient.setQueryData(
          ["budgets", variables.year, variables.month],
          context.prevBudgets,
        );
      }
      toast.error(`Failed to update budget: ${error}`);
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: ["budgets", variables.year, variables.month],
      });
    },
  });
}
