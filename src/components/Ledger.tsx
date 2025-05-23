"use client";

import * as React from "react";
import type { Expense } from "@/lib/types";
import { LedgerMonthGroup } from "./LedgerMonthGroup";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { Search } from "lucide-react";

interface LedgerProps {
  expenses: Expense[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isLoading: boolean;
}

interface GroupedExpenses {
  [monthBucket: string]: Expense[];
}

export function Ledger({ expenses, searchTerm, onSearchChange, isLoading }: LedgerProps) {
  const filteredExpenses = React.useMemo(() => {
    if (!searchTerm) return expenses;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return expenses.filter(
      (exp) =>
        exp.reason?.toLowerCase().includes(lowerSearchTerm) ||
        String(exp.amount).includes(lowerSearchTerm)
    );
  }, [expenses, searchTerm]);

  const groupedExpenses = React.useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      const { month_bucket } = expense;
      if (!acc[month_bucket]) {
        acc[month_bucket] = [];
      }
      acc[month_bucket].push(expense);
      return acc;
    }, {} as GroupedExpenses);
  }, [filteredExpenses]);

  const sortedMonthBuckets = React.useMemo(() => {
    return Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a)); // Newest month first
  }, [groupedExpenses]);

  // Determine default open accordion items (e.g., current month or most recent month with expenses)
  const defaultOpenValue = sortedMonthBuckets.length > 0 ? [sortedMonthBuckets[0]] : [];


  if (isLoading && expenses.length === 0) {
    return <p className="text-center text-muted-foreground py-10">Loading expenses...</p>;
  }

  if (expenses.length === 0 && !isLoading) {
    return <p className="text-center text-muted-foreground py-10">No expenses yet. Add your first one!</p>;
  }
  
  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by reason or amount..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 h-12 text-base"
          aria-label="Search expenses"
        />
      </div>

      {filteredExpenses.length === 0 && searchTerm && !isLoading && (
         <p className="text-center text-muted-foreground py-10">No expenses match your search.</p>
      )}

      {sortedMonthBuckets.length > 0 && (
        <ScrollArea className="h-[calc(100vh-280px)] md:h-[calc(100vh-240px)]"> {/* Adjust height as needed */}
          <Accordion type="multiple" defaultValue={defaultOpenValue} className="w-full pr-3">
            {sortedMonthBuckets.map((monthBucket) => (
              <LedgerMonthGroup
                key={monthBucket}
                monthBucket={monthBucket}
                expenses={groupedExpenses[monthBucket]}
              />
            ))}
          </Accordion>
        </ScrollArea>
      )}
    </div>
  );
}
