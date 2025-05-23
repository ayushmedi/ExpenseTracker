
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ExpenseFormDialog } from "@/components/ExpenseFormDialog";
import { IncomeFormDialog } from "@/components/IncomeFormDialog";
import { Ledger } from "@/components/Ledger";
import { FAB } from "@/components/FAB";
import { Logo } from "@/components/Logo";
import { useExpenses } from "@/hooks/useExpenses";
import { useIncomes } from "@/hooks/useIncomes";
import type { ExpenseCreateDto, IncomeCreateDto, Transaction, ExpenseUpdateDto, IncomeUpdateDto } from "@/lib/types";
import { PlusCircle, TrendingUp } from "lucide-react";

export default function HomePage() {
  const [isExpenseFormOpen, setIsExpenseFormOpen] = React.useState(false);
  const [isIncomeFormOpen, setIsIncomeFormOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const { expenses, uniqueReasons: uniqueExpenseReasons, isLoading: isLoadingExpenses, addExpense, updateExpense, error: expenseError } = useExpenses();
  const { incomes, uniqueIncomeReasons, isLoading: isLoadingIncomes, addIncome, updateIncome, error: incomeError } = useIncomes();

  const transactions: Transaction[] = React.useMemo(() => {
    const combined: Transaction[] = [
      ...expenses.map(exp => ({ ...exp, type: 'expense' as const })),
      ...incomes.map(inc => ({ ...inc, type: 'income' as const })),
    ];
    return combined.sort((a, b) => b.timestamp - a.timestamp);
  }, [expenses, incomes]);

  const handleAddExpense = async (data: ExpenseCreateDto) => {
    await addExpense(data);
  };

  const handleAddIncome = async (data: IncomeCreateDto) => {
    await addIncome(data);
  };
  
  const globalLoading = isLoadingExpenses || isLoadingIncomes;

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
        
        <Ledger
          transactions={transactions}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isLoading={globalLoading && transactions.length === 0} 
          onUpdateExpense={updateExpense as (id: string, data: ExpenseUpdateDto) => Promise<void>} // Cast for specific DTO
          onUpdateIncome={updateIncome as (id: string, data: IncomeUpdateDto) => Promise<void>}   // Cast for specific DTO
          isLoadingWhileUpdating={isLoadingExpenses || isLoadingIncomes} 
          uniqueExpenseReasons={uniqueExpenseReasons}
          uniqueIncomeReasons={uniqueIncomeReasons}
        />
      </main>

      <FAB onClick={() => setIsExpenseFormOpen(true)} /> 

      <ExpenseFormDialog
        isOpen={isExpenseFormOpen}
        onClose={() => setIsExpenseFormOpen(false)}
        onSubmit={handleAddExpense}
        isLoading={isLoadingExpenses}
        uniqueReasons={uniqueExpenseReasons}
      />

      <IncomeFormDialog
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
