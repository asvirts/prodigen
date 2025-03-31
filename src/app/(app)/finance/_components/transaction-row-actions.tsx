"use client"

import React, { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { deleteTransaction, Transaction } from "../actions" // Remove updateTransaction import
import { Loader2, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu" // Use dropdown for actions
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog" // Import Dialog components
import { EditTransactionForm } from "./edit-transaction-form" // Import Edit Form
// TODO: Import Dialog and EditTransactionForm later

interface TransactionRowActionsProps {
  transaction: Transaction
}

export function TransactionRowActions({
  transaction
}: TransactionRowActionsProps) {
  const [isDeleting, startDeleteTransition] = useTransition()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false) // State for edit dialog

  const handleDelete = () => {
    // Optional: Add confirmation dialog
    if (!confirm("Are you sure you want to delete this transaction?")) return

    startDeleteTransition(async () => {
      const result = await deleteTransaction(transaction.id)
      if (result?.error) {
        toast.error(`Failed to delete transaction: ${result.error}`)
      } else {
        toast.success("Transaction deleted successfully!")
      }
    })
  }

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      {" "}
      {/* Wrap everything in Dialog to control state */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              disabled={isDeleting}
            >
              Edit
            </DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 focus:text-red-600 focus:bg-red-50/50"
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <EditTransactionForm
          transaction={transaction}
          onSuccess={() => setIsEditDialogOpen(false)} // Close dialog on success
        />
      </DialogContent>
    </Dialog>
  )
}
