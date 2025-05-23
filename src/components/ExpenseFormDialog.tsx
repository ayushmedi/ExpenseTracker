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
  uniqueReasons: string[];
}

export function ExpenseFormDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  uniqueReasons,
}: ExpenseFormDialogProps) {
  
  const handleSubmit = async (data: ExpenseCreateDto) => {
    await onSubmit(data);
    if (!isLoading) { // Only close if submit was not blocked by loading state from outside
        onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Enter the amount and an optional reason for your expense.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ExpenseForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
            uniqueReasons={uniqueReasons}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
