import type { Expense } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface LedgerItemProps {
  expense: Expense;
}

export function LedgerItem({ expense }: LedgerItemProps) {
  const handleEdit = () => {
    console.log("Edit expense:", expense.id);
    // Placeholder for actual edit functionality
  };

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
      <div className="flex items-center space-x-2">
        <p className="text-lg font-semibold text-destructive tabular-nums">
          -{formatCurrency(expense.amount)}
        </p>
        <Button variant="ghost" size="icon" onClick={handleEdit} className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit expense</span>
        </Button>
      </div>
    </div>
  );
}
