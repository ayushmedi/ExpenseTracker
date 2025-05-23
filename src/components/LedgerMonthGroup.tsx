
import type { Expense, ExpenseCreateDto } from "@/lib/types";
import { LedgerItem } from "./LedgerItem";
import { getFormattedMonth, formatCurrency } from "@/lib/utils";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils"; // Added cn import

interface LedgerMonthGroupProps {
  monthBucket: string;
  expenses: Expense[];
  onUpdateExpense: (id: string, data: Partial<Pick<ExpenseCreateDto, 'amount' | 'reason'>>) => Promise<void>;
  isLoadingWhileUpdating?: boolean;
  uniqueReasons: string[];
}

export function LedgerMonthGroup({ monthBucket, expenses, onUpdateExpense, isLoadingWhileUpdating, uniqueReasons }: LedgerMonthGroupProps) {
  if (expenses.length === 0) {
    return null;
  }

  const totalForMonth = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const totalColorClass = totalForMonth > 0 ? 'text-destructive' : 'text-muted-foreground';

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
        <div className="space-y-1"> {/* Reduced space for denser look */}
          {expenses.map((expense) => (
            <LedgerItem 
              key={expense.id} 
              expense={expense} 
              onUpdateExpense={onUpdateExpense}
              isLoadingWhileUpdating={isLoadingWhileUpdating}
              uniqueReasons={uniqueReasons}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

