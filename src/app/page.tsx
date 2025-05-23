
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ExpenseFormDialog } from "@/components/ExpenseFormDialog";
import { IncomeFormDialog } from "@/components/IncomeFormDialog";
import { Ledger } from "@/components/Ledger";
import { Logo } from "@/components/Logo";
import { useExpenses } from "@/hooks/useExpenses";
import { useIncomes } from "@/hooks/useIncomes";
import type { ExpenseCreateDto, IncomeCreateDto, Transaction, ExpenseUpdateDto, IncomeUpdateDto } from "@/lib/types";
import { PlusCircle, TrendingUp, Search, CalendarDays, CalendarRange, Plus, Minus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getFormattedMonth } from "@/lib/utils";

export default function HomePage() {
  const [isExpenseFormOpen, setIsExpenseFormOpen] = React.useState(false);
  const [isIncomeFormOpen, setIsIncomeFormOpen] = React.useState(false);
  
  const { expenses, uniqueExpenseTypes, isLoading: isLoadingExpenses, addExpense, updateExpense, error: expenseError } = useExpenses(); // Renamed uniqueReasons
  const { incomes, uniqueIncomeExpenseTypes, isLoading: isLoadingIncomes, addIncome, updateIncome, error: incomeError } = useIncomes(); // Renamed uniqueIncomeReasons

  const [selectedYear, setSelectedYear] = React.useState<string | null>(null);
  const [selectedMonthBucket, setSelectedMonthBucket] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  const allTransactions: Transaction[] = React.useMemo(() => {
    const combined: Transaction[] = [
      ...expenses.map(exp => ({ ...exp, type: 'expense' as const })),
      ...incomes.map(inc => ({ ...inc, type: 'income' as const })),
    ];
    return combined.sort((a, b) => b.timestamp - a.timestamp);
  }, [expenses, incomes]);

  const availableYears = React.useMemo(() => {
    const years = new Set(allTransactions.map(t => new Date(t.timestamp).getFullYear().toString()));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [allTransactions]);

  const availableMonthBucketsInSelectedYear = React.useMemo(() => {
    if (!selectedYear) return [];
    const yearTransactions = allTransactions.filter(t => new Date(t.timestamp).getFullYear().toString() === selectedYear);
    const monthBuckets = new Set(yearTransactions.map(t => t.month_bucket));
    return Array.from(monthBuckets)
      .sort((a, b) => b.localeCompare(a)) 
      .map(mb => ({ value: mb, label: getFormattedMonth(mb) }));
  }, [allTransactions, selectedYear]);

  const transactionsForDisplay = React.useMemo(() => {
    let filtered = allTransactions;

    if (selectedYear) {
      filtered = filtered.filter(t => new Date(t.timestamp).getFullYear().toString() === selectedYear);
    }

    if (selectedMonthBucket) {
      filtered = filtered.filter(t => t.month_bucket === selectedMonthBucket);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.expense_type?.toLowerCase().includes(lowerSearchTerm) || // Changed from reason
          String(item.amount).includes(lowerSearchTerm)
      );
    }
    return filtered;
  }, [allTransactions, selectedYear, selectedMonthBucket, searchTerm]);

  const handleAddExpense = async (data: ExpenseCreateDto) => {
    await addExpense(data);
  };

  const handleAddIncome = async (data: IncomeCreateDto) => {
    await addIncome(data);
  };
  
  const globalLoading = isLoadingExpenses || isLoadingIncomes;

  const handleYearChange = (year: string) => {
    setSelectedYear(year === "all" ? null : year);
    setSelectedMonthBucket(null); 
  };

  const handleMonthChange = (monthBucket: string) => {
    setSelectedMonthBucket(monthBucket === "all" ? null : monthBucket);
  };

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

      <main className="flex-1 container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {expenseError && <p className="text-destructive text-center mb-4">Error loading expenses: {expenseError.message}</p>}
        {incomeError && <p className="text-destructive text-center mb-4">Error loading income: {incomeError.message}</p>}
        
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select onValueChange={handleYearChange} value={selectedYear || "all"}>
              <SelectTrigger className="h-12 text-base" aria-label="Select year">
                <CalendarDays className="mr-2 h-5 w-5 text-muted-foreground" />
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={handleMonthChange} value={selectedMonthBucket || "all"} disabled={!selectedYear}>
              <SelectTrigger className="h-12 text-base" aria-label="Select month">
                <CalendarRange className="mr-2 h-5 w-5 text-muted-foreground" />
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {availableMonthBucketsInSelectedYear.map(month => (
                  <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by type or amount..." // Changed from reason
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 h-12 text-base"
                aria-label="Search transactions"
              />
            </div>
          </div>
        </div>

        {globalLoading && allTransactions.length === 0 && (
          <p className="text-center text-muted-foreground py-10">Loading transactions...</p>
        )}
        {!globalLoading && allTransactions.length === 0 && (
           <p className="text-center text-muted-foreground py-10">No transactions yet. Add your first income or expense!</p>
        )}
        {!globalLoading && allTransactions.length > 0 && transactionsForDisplay.length === 0 && (
          <p className="text-center text-muted-foreground py-10">
            {searchTerm 
              ? "No transactions match your search criteria for the selected period."
              : "No transactions found for the selected period."
            }
          </p>
        )}
        
        {transactionsForDisplay.length > 0 && (
          <Ledger
            transactions={transactionsForDisplay}
            isLoading={globalLoading && transactionsForDisplay.length === 0} 
            onUpdateExpense={updateExpense as (id: string, data: ExpenseUpdateDto) => Promise<void>}
            onUpdateIncome={updateIncome as (id: string, data: IncomeUpdateDto) => Promise<void>}
            isLoadingWhileUpdating={isLoadingExpenses || isLoadingIncomes} 
            uniqueExpenseTypes={uniqueExpenseTypes} // Renamed from uniqueExpenseReasons
            uniqueIncomeExpenseTypes={uniqueIncomeExpenseTypes} // Renamed from uniqueIncomeReasons
          />
        )}
      </main>

      <div className="fixed bottom-6 right-6 md:hidden flex space-x-4 z-50">
        <Button
          onClick={() => setIsIncomeFormOpen(true)}
          className="h-16 w-16 rounded-full shadow-xl bg-green-500 hover:bg-green-600 text-white"
          aria-label="Add new income"
        >
          <Plus className="h-8 w-8" />
        </Button>
        <Button
          onClick={() => setIsExpenseFormOpen(true)}
          className="h-16 w-16 rounded-full shadow-xl bg-red-500 hover:bg-red-600 text-white"
          aria-label="Add new expense"
        >
          <Minus className="h-8 w-8" />
        </Button>
      </div>

      <ExpenseFormDialog
        isOpen={isExpenseFormOpen}
        onClose={() => setIsExpenseFormOpen(false)}
        onSubmit={handleAddExpense}
        isLoading={isLoadingExpenses}
        uniqueExpenseTypes={uniqueExpenseTypes} // Renamed from uniqueReasons
      />

      <IncomeFormDialog
        isOpen={isIncomeFormOpen}
        onClose={() => setIsIncomeFormOpen(false)}
        onSubmit={handleAddIncome}
        isLoading={isLoadingIncomes}
        uniqueExpenseTypes={uniqueIncomeExpenseTypes} // Renamed from uniqueReasons
      />
      
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
         © {new Date().getFullYear()} CashFlow Tracker. Track your outgoing cash effortlessly.
      </footer>
    </div>
  );
}
