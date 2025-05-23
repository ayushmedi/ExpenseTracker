import type { Expense } from "@/lib/types";
import { LedgerItem } from "./LedgerItem";
import { getFormattedMonth, formatCurrency } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface LedgerMonthGroupProps {
  monthBucket: string;
  expenses: Expense[];
}

export function LedgerMonthGroup({ monthBucket, expenses }: LedgerMonthGroupProps) {
  if (expenses.length === 0) {
    return null;
  }

  const totalForMonth = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <AccordionItem value={monthBucket} className="mb-4 border rounded-lg shadow-sm bg-card">
      <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:no-underline">
        <div className="flex justify-between w-full items-center">
          <span>{getFormattedMonth(monthBucket)}</span>
          <span className="text-base font-medium text-muted-foreground tabular-nums">
            Total: {formatCurrency(totalForMonth)}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-4">
        <div className="space-y-2">
          {expenses.map((expense) => (
            <LedgerItem key={expense.id} expense={expense} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
