"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { AddTransactionForm } from "./add-transaction-form"
import { Transaction } from "../actions" // Import Transaction type

interface EditTransactionDialogProps {
  budgetedCategories: string[]
  transaction: Transaction // Transaction to edit
}

export function EditTransactionDialog({
  budgetedCategories,
  transaction
}: EditTransactionDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* The trigger needs to be passed in from the parent (Row Actions) */}
      {/* This component just provides the Dialog Content logic */}
      {/* We will handle the Trigger logic in TransactionRowActions */}

      {/* Example Trigger (will be replaced): */}
      {/* <DialogTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Edit transaction</span>
           Edit Icon Here
        </Button>
      </DialogTrigger> */}

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <AddTransactionForm
          budgetedCategories={budgetedCategories}
          initialData={transaction} // Pass the transaction as initialData
          onSuccess={() => setIsOpen(false)} // Close dialog on success
        />
      </DialogContent>
    </Dialog>
  )
}
