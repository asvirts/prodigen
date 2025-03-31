"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Transaction } from "../actions"
import { useDeleteTransaction } from "../hooks"
import { Loader2, MoreHorizontal, Pencil } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { EditTransactionDialog } from "./edit-transaction-dialog"

interface TransactionRowActionsProps {
  transaction: Transaction
  budgetedCategories: string[]
}

export function TransactionRowActions({
  transaction,
  budgetedCategories
}: TransactionRowActionsProps) {
  const deleteMutation = useDeleteTransaction()

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this transaction?")) return

    deleteMutation.mutate(transaction.id, {
      // onSuccess and onError handled by the hook
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              disabled={deleteMutation.isPending}
              className="flex items-center"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          </DialogTrigger>
          <EditTransactionDialog
            transaction={transaction}
            budgetedCategories={budgetedCategories}
          />
        </Dialog>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="text-red-600 focus:text-red-600 focus:bg-red-50/50 flex items-center"
        >
          {deleteMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="mr-2 h-4 w-4" />
          )}
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
