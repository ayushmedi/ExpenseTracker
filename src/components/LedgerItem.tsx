import type { Expense } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LedgerItemProps {
  expense: Expense;
}

export function LedgerItem({ expense }: LedgerItemProps) {
  return (
    <div className="flex justify-between items-center py-3 px-1 border-b border-border/60 last:border-b-0">
      <div className="flex-grow">
        <p className="font-medium text-foreground">
          {expense.reason || "Unspecified"}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(expense.timestamp, {  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <p className="text-lg font-semibold text-destructive tabular-nums">
        -{formatCurrency(expense.amount)}
      </p>
    </div>
  );
}
