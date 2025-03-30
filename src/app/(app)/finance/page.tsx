import React from "react" // Remove useState, useEffect
import { getTransactions, Transaction } from "./actions"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge" // For income/expense type
import { AddTransactionDialog } from "./_components/add-transaction-dialog" // Import the Dialog component

// Helper to format currency
function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount)
}

// Make it async again for server-side data fetching
export default async function FinancePage() {
  // Fetch data on the server
  const { transactions, error } = await getTransactions()

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Finance Co-Pilot</h1>
        {/* Render the client component for the dialog */}
        <AddTransactionDialog />
      </div>

      {error && (
        <p className="text-red-500">Error loading transactions: {error}</p>
      )}

      {/* Transaction Table - Render directly based on server-fetched data */}
      {!error && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                {/* <TableHead>Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions && transactions.length > 0 ? (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {new Date(tx.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {tx.description}
                    </TableCell>
                    <TableCell>{tx.category || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={tx.type === "income" ? "default" : "secondary"}
                      >
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        tx.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(Math.abs(tx.amount))}
                    </TableCell>
                    {/* <TableCell> TODO: Add Edit/Delete buttons </TableCell> */}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No transactions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {transactions && transactions.length > 0 && (
              <TableCaption>A list of your recent transactions.</TableCaption>
            )}
          </Table>
        </div>
      )}
    </div>
  )
}
