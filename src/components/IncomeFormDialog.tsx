
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
  uniqueReasons: string[];
}

export function IncomeFormDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  uniqueReasons,
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
            Enter the amount and an optional source or reason for your income.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <IncomeForm
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
