
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ExpenseForm } from "./ExpenseForm";
import type { ExpenseCreateDto } from "@/lib/types";

interface ExpenseFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseCreateDto) => Promise<void>;
  isLoading?: boolean;
  uniqueExpenseTypes: string[]; // Changed from uniqueReasons
}

export function ExpenseFormDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  uniqueExpenseTypes, // Changed prop name
}: ExpenseFormDialogProps) {
  
  const handleSubmit = async (data: ExpenseCreateDto) => {
    await onSubmit(data);
    if (!isLoading) { 
        onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Enter the amount and an optional expense type for your expense. {/* Changed "reason" to "expense type" */}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ExpenseForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
            uniqueExpenseTypes={uniqueExpenseTypes} // Changed prop name
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
