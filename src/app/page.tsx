
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ExpenseFormDialog } from "@/components/ExpenseFormDialog";
import { Ledger } from "@/components/Ledger";
import { FAB } from "@/components/FAB";
import { Logo } from "@/components/Logo";
import { useExpenses } from "@/hooks/useExpenses";
import type { ExpenseCreateDto } from "@/lib/types";
import { PlusCircle } from "lucide-react";

export default function HomePage() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { expenses, uniqueReasons, isLoading, addExpense, updateExpense, error } = useExpenses();

  const handleAddExpense = async (data: ExpenseCreateDto) => {
    await addExpense(data);
    // Form dialog handles its own closing on successful submit via its onSubmit prop
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Logo />
          <Button onClick={() => setIsFormOpen(true)} className="hidden md:inline-flex" variant="default" size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Add Expense
          </Button>
        </div>
      </header>

      <main className="flex-1 container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <p className="text-destructive text-center mb-4">Error: {error.message}</p>}
        <Ledger
          expenses={expenses}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isLoading={isLoading && expenses.length === 0} // Pass overall loading for initial load
          onUpdateExpense={updateExpense}
          isLoadingWhileUpdating={isLoading} // Pass general loading state for update operations
          uniqueReasons={uniqueReasons}
        />
      </main>

      <FAB onClick={() => setIsFormOpen(true)} />

      <ExpenseFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddExpense}
        isLoading={isLoading}
        uniqueReasons={uniqueReasons}
      />
      
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
         © {new Date().getFullYear()} CashFlow Tracker. Stay on top of your finances.
      </footer>
    </div>
  );
}
