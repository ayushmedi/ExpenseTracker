
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
  uniqueExpenseTypes: string[]; // Renamed from uniqueExpenseReasons
  uniqueIncomeExpenseTypes: string[]; // Renamed from uniqueIncomeReasons
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
  uniqueExpenseTypes, // Renamed prop
  uniqueIncomeExpenseTypes // Renamed prop
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
    return Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a)); 
  }, [groupedTransactions]);

  const defaultOpenValue = sortedMonthBuckets.length > 0 ? [sortedMonthBuckets[0]] : [];

  if (isLoading && transactions.length === 0) {
    return <p className="text-center text-muted-foreground py-10">Loading transactions...</p>;
  }
  
  if (transactions.length === 0 && !isLoading) {
    return <p className="text-center text-muted-foreground py-10">No transactions available for the current selection.</p>;
  }
  
  return (
    <div className="space-y-6">
      {sortedMonthBuckets.length > 0 && (
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
                uniqueExpenseTypes={uniqueExpenseTypes} // Pass renamed prop
                uniqueIncomeExpenseTypes={uniqueIncomeExpenseTypes} // Pass renamed prop
              />
            ))}
          </Accordion>
        </ScrollArea>
      )}
    </div>
  );
}
