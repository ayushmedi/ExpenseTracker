
"use client";

import * as React from "react";
import type { Transaction, ExpenseUpdateDto, IncomeUpdateDto } from "@/lib/types";
import { LedgerMonthGroup } from "./LedgerMonthGroup";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";

interface LedgerProps {
  transactions: Transaction[];
  isLoading: boolean; // To show general loading for the list if needed
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

  // Open the most recent month in the filtered list by default
  const defaultOpenValue = sortedMonthBuckets.length > 0 ? [sortedMonthBuckets[0]] : [];

  // Note: Specific "loading" and "no transactions" messages are now handled by the parent (page.tsx)
  // This component now assumes it will be rendered if there are transactions to display,
  // or it will show its own loading state if `isLoading` is true while `transactions` might be empty during a fetch.

  if (isLoading && transactions.length === 0) {
     // This might still be useful if transactions are being re-fetched based on filters
     // and the parent wants to show a loading state specifically for the ledger section.
    return <p className="text-center text-muted-foreground py-10">Loading transactions...</p>;
  }
  
  // If transactionsForDisplay in page.tsx is empty, this component won't be rendered by page.tsx logic.
  // So, an explicit "No transactions" check here is mostly a fallback.
  if (transactions.length === 0 && !isLoading) {
    return <p className="text-center text-muted-foreground py-10">No transactions available for the current selection.</p>;
  }
  
  return (
    <div className="space-y-6">
      {/* Search input has been moved to page.tsx */}
      {/* Conditional messages for no search results are also in page.tsx */}

      {sortedMonthBuckets.length > 0 && (
        // Adjusted height: 280px (header+footer+padding) + ~60px for new filter row = ~340px
        // md: 240px (header+footer+padding) + ~60px = ~300px
        <ScrollArea className="h-[calc(100vh-380px)] md:h-[calc(100vh-340px)]">
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
