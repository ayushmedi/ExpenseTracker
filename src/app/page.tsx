
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ExpenseFormDialog } from "@/components/ExpenseFormDialog";
import { IncomeFormDialog } from "@/components/IncomeFormDialog"; // Added
import { Ledger } from "@/components/Ledger";
import { FAB } from "@/components/FAB";
import { Logo } from "@/components/Logo";
import { useExpenses } from "@/hooks/useExpenses";
import { useIncomes } from "@/hooks/useIncomes"; // Added
import type { ExpenseCreateDto, IncomeCreateDto } from "@/lib/types"; // Added IncomeCreateDto
import { PlusCircle, TrendingUp } from "lucide-react"; // Added TrendingUp

export default function HomePage() {
  const [isExpenseFormOpen, setIsExpenseFormOpen] = React.useState(false);
  const [isIncomeFormOpen, setIsIncomeFormOpen] = React.useState(false); // Added
  const [searchTerm, setSearchTerm] = React.useState("");

  const { expenses, uniqueReasons: uniqueExpenseReasons, isLoading: isLoadingExpenses, addExpense, updateExpense, error: expenseError } = useExpenses();
  const { uniqueIncomeReasons, isLoading: isLoadingIncomes, addIncome, error: incomeError } = useIncomes(); // Added

  const handleAddExpense = async (data: ExpenseCreateDto) => {
    await addExpense(data);
    // Form dialog handles its own closing on successful submit via its onSubmit prop
  };

  const handleAddIncome = async (data: IncomeCreateDto) => { // Added
    await addIncome(data);
    // Form dialog handles its own closing
  };
  
  const globalLoading = isLoadingExpenses || isLoadingIncomes; // Combine loading states

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="hidden md:flex items-center space-x-2">
            <Button onClick={() => setIsIncomeFormOpen(true)} variant="outline" size="lg">
              <TrendingUp className="mr-2 h-5 w-5" /> Add Income
            </Button>
            <Button onClick={() => setIsExpenseFormOpen(true)} variant="default" size="lg">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Expense
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {expenseError && <p className="text-destructive text-center mb-4">Error loading expenses: {expenseError.message}</p>}
        {incomeError && <p className="text-destructive text-center mb-4">Error loading income: {incomeError.message}</p>}
        
        {/* Placeholder for combined or tabbed ledger display later */}
        <Ledger
          expenses={expenses}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isLoading={isLoadingExpenses && expenses.length === 0} 
          onUpdateExpense={updateExpense}
          isLoadingWhileUpdating={isLoadingExpenses} 
          uniqueReasons={uniqueExpenseReasons}
        />
      </main>

      {/* FAB could be context-aware later, or have two FABs if screen space allows */}
      <FAB onClick={() => setIsExpenseFormOpen(true)} /> 

      <ExpenseFormDialog
        isOpen={isExpenseFormOpen}
        onClose={() => setIsExpenseFormOpen(false)}
        onSubmit={handleAddExpense}
        isLoading={isLoadingExpenses}
        uniqueReasons={uniqueExpenseReasons}
      />

      <IncomeFormDialog // Added
        isOpen={isIncomeFormOpen}
        onClose={() => setIsIncomeFormOpen(false)}
        onSubmit={handleAddIncome}
        isLoading={isLoadingIncomes}
        uniqueReasons={uniqueIncomeReasons}
      />
      
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
         © {new Date().getFullYear()} CashFlow Tracker. Stay on top of your finances.
      </footer>
    </div>
  );
}
