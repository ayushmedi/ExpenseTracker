
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { IncomeForm } from "./IncomeForm";
import type { IncomeCreateDto } from "@/lib/types";

interface IncomeFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IncomeCreateDto) => Promise<void>;
  isLoading?: boolean;
  uniqueExpenseTypes: string[]; // Changed from uniqueReasons
}

export function IncomeFormDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  uniqueExpenseTypes, // Changed prop name
}: IncomeFormDialogProps) {
  
  const handleSubmit = async (data: IncomeCreateDto) => {
    await onSubmit(data);
    if (!isLoading) { 
        onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Income</DialogTitle>
          <DialogDescription>
            Enter the amount and an optional type or source for your income. {/* Changed text */}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <IncomeForm
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
