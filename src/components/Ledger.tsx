
"use client";

import * as React from "react";
import type { Transaction, ExpenseUpdateDto, IncomeUpdateDto } from "@/lib/types";
import { LedgerMonthGroup } from "./LedgerMonthGroup";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";

interface LedgerProps {
  transactions: Transaction[];
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
  isLoading, 
  onUpdateExpense, 
  onUpdateIncome,
  isLoadingWhileUpdating, 
  uniqueExpenseReasons,
  uniqueIncomeReasons 
}: LedgerProps) {

  const groupedTransactions = React.useMemo(() => {
    return transactions.reduce((acc, transaction) => {
      const { month_bucket } = transaction;
      if (!acc[month_bucket]) {
        acc[month_bucket] = [];
      }
      acc[month_bucket].push(transaction);
      return acc;
    }, {} as GroupedTransactions);
  }, [transactions]);

  const sortedMonthBuckets = React.useMemo(() => {
    return Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a)); // Newest month first
  }, [groupedTransactions]);

  const defaultOpenValue = sortedMonthBuckets.length > 0 ? [sortedMonthBuckets[0]] : [];

  if (isLoading && transactions.length === 0) {
    return <p className="text-center text-muted-foreground py-10">Loading transactions...</p>;
  }
  
  if (transactions.length === 0 && !isLoading) {
    // This message is now primarily handled by page.tsx based on transactionsForDisplay
    // but kept as a fallback if Ledger is somehow rendered directly with no transactions.
    return <p className="text-center text-muted-foreground py-10">No transactions available for the current selection.</p>;
  }
  
  return (
    <div className="space-y-6">
      {sortedMonthBuckets.length > 0 && (
        // Adjusted height calculations:
        // Mobile (filters stacked): Approx 100vh - 332px
        // Desktop MD (filters one line): Approx 100vh - 220px
        <ScrollArea className="h-[calc(100vh-332px)] md:h-[calc(100vh-220px)]">
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

    