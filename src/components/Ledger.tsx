
"use client";

import * as React from "react";
import type { Transaction, ExpenseUpdateDto, IncomeUpdateDto } from "@/lib/types";
import { LedgerMonthGroup } from "./LedgerMonthGroup";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { Search } from "lucide-react";

interface LedgerProps {
  transactions: Transaction[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isLoading: boolean;
  onUpdateExpense: (id: string, data: ExpenseUpdateDto) => Promise<void>;
  onUpdateIncome: (id: string, data: IncomeUpdateDto) => Promise<void>;
  isLoadingWhileUpdating?: boolean;
  uniqueExpenseReasons: string[];
  uniqueIncomeReasons: string[];
}

interface GroupedTransactions {
  [monthBucket: string]: Transaction[];
}

export function Ledger({ 
  transactions, 
  searchTerm, 
  onSearchChange, 
  isLoading, 
  onUpdateExpense, 
  onUpdateIncome,
  isLoadingWhileUpdating, 
  uniqueExpenseReasons,
  uniqueIncomeReasons 
}: LedgerProps) {
  const filteredTransactions = React.useMemo(() => {
    if (!searchTerm) return transactions;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return transactions.filter(
      (item) =>
        item.reason?.toLowerCase().includes(lowerSearchTerm) ||
        String(item.amount).includes(lowerSearchTerm)
    );
  }, [transactions, searchTerm]);

  const groupedTransactions = React.useMemo(() => {
    return filteredTransactions.reduce((acc, transaction) => {
      const { month_bucket } = transaction;
      if (!acc[month_bucket]) {
        acc[month_bucket] = [];
      }
      acc[month_bucket].push(transaction);
      return acc;
    }, {} as GroupedTransactions);
  }, [filteredTransactions]);

  const sortedMonthBuckets = React.useMemo(() => {
    return Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a)); // Newest month first
  }, [groupedTransactions]);

  const defaultOpenValue = sortedMonthBuckets.length > 0 ? [sortedMonthBuckets[0]] : [];

  if (isLoading && transactions.length === 0) {
    return <p className="text-center text-muted-foreground py-10">Loading transactions...</p>;
  }

  if (transactions.length === 0 && !isLoading) {
    return <p className="text-center text-muted-foreground py-10">No transactions yet. Add your first one!</p>;
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
          aria-label="Search transactions"
        />
      </div>

      {filteredTransactions.length === 0 && searchTerm && !isLoading && (
         <p className="text-center text-muted-foreground py-10">No transactions match your search.</p>
      )}

      {sortedMonthBuckets.length > 0 && (
        <ScrollArea className="h-[calc(100vh-280px)] md:h-[calc(100vh-240px)]">
          <Accordion type="multiple" defaultValue={defaultOpenValue} className="w-full pr-3">
            {sortedMonthBuckets.map((monthBucket) => (
              <LedgerMonthGroup
                key={monthBucket}
                monthBucket={monthBucket}
                transactions={groupedTransactions[monthBucket]}
                onUpdateExpense={onUpdateExpense}
                onUpdateIncome={onUpdateIncome}
                isLoadingWhileUpdating={isLoadingWhileUpdating}
                uniqueExpenseReasons={uniqueExpenseReasons}
                uniqueIncomeReasons={uniqueIncomeReasons}
              />
            ))}
          </Accordion>
        </ScrollArea>
      )}
    </div>
  );
}
