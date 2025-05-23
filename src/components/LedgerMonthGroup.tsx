
import type { Transaction, ExpenseUpdateDto, IncomeUpdateDto } from "@/lib/types";
import { LedgerItem } from "./LedgerItem";
import { getFormattedMonth, formatCurrency } from "@/lib/utils";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface LedgerMonthGroupProps {
  monthBucket: string;
  transactions: Transaction[];
  onUpdateExpense: (id: string, data: ExpenseUpdateDto) => Promise<void>;
  onUpdateIncome: (id: string, data: IncomeUpdateDto) => Promise<void>;
  isLoadingWhileUpdating?: boolean;
  uniqueExpenseTypes: string[]; // Renamed from uniqueExpenseReasons
  uniqueIncomeExpenseTypes: string[]; // Renamed from uniqueIncomeReasons
}

export function LedgerMonthGroup({ 
  monthBucket, 
  transactions, 
  onUpdateExpense,
  onUpdateIncome,
  isLoadingWhileUpdating, 
  uniqueExpenseTypes, // Renamed prop
  uniqueIncomeExpenseTypes // Renamed prop
}: LedgerMonthGroupProps) {
  if (transactions.length === 0) {
    return null;
  }

  const totalForMonth = transactions.reduce((sum, transaction) => {
    return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
  }, 0);

  const totalColorClass = totalForMonth > 0 ? 'text-green-600' : totalForMonth < 0 ? 'text-destructive' : 'text-muted-foreground';

  return (
    <AccordionItem value={monthBucket} className="mb-4 border rounded-lg shadow-sm bg-card">
      <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:no-underline">
        <div className="flex justify-between w-full items-center">
          <span>{getFormattedMonth(monthBucket)}</span>
          <span className={cn("text-base font-medium tabular-nums", totalColorClass)}>
            Total: {formatCurrency(totalForMonth)}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-4">
        <div className="space-y-1">
          {transactions.map((transaction) => (
            <LedgerItem 
              key={transaction.id} 
              transaction={transaction} 
              onUpdateTransaction={transaction.type === 'expense' ? onUpdateExpense : onUpdateIncome}
              uniqueExpenseTypesForType={transaction.type === 'expense' ? uniqueExpenseTypes : uniqueIncomeExpenseTypes} // Pass appropriate unique types
              isLoadingWhileUpdating={isLoadingWhileUpdating}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
