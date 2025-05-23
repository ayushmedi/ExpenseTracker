
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import type { Transaction, ExpenseUpdateDto, IncomeUpdateDto } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pencil, Check, X } from "lucide-react";

interface LedgerItemProps {
  transaction: Transaction;
  onUpdateTransaction: (id: string, data: ExpenseUpdateDto | IncomeUpdateDto) => Promise<void>;
  uniqueReasonsForType: string[];
  isLoadingWhileUpdating?: boolean;
}

const editTransactionFormSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  reason: z.string().max(100, "Reason is too long.").optional(),
});

type EditTransactionFormValues = z.infer<typeof editTransactionFormSchema>;

export function LedgerItem({ transaction, onUpdateTransaction, uniqueReasonsForType, isLoadingWhileUpdating }: LedgerItemProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const [reasonInput, setReasonInput] = React.useState(transaction.reason || "");
  const [suggestedReasons, setSuggestedReasons] = React.useState<string[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = React.useState(false);

  const form = useForm<EditTransactionFormValues>({
    resolver: zodResolver(editTransactionFormSchema),
    defaultValues: {
      amount: transaction.amount,
      reason: transaction.reason || "",
    },
  });

  React.useEffect(() => {
    if (isEditing) {
      form.reset({
        amount: transaction.amount,
        reason: transaction.reason || "",
      });
      setReasonInput(transaction.reason || "");
      setTimeout(() => {
        // Ensure focus target exists and is an HTMLInputElement or HTMLTextAreaElement
        const amountField = form.control.fieldsRef.current.amount?.ref as HTMLElement | undefined;
        if (amountField && typeof amountField.focus === 'function') {
          amountField.focus();
        }
      }, 0);
    }
  }, [isEditing, transaction, form]);

  React.useEffect(() => {
    if (reasonInput.length > 0 && isEditing) {
      const filtered = uniqueReasonsForType
        .filter((r) => r.toLowerCase().includes(reasonInput.toLowerCase()))
        .slice(0, 5);
      setSuggestedReasons(filtered);
    } else {
      setSuggestedReasons([]);
    }
  }, [reasonInput, uniqueReasonsForType, isEditing]);

  const handleEditSubmit = async (data: EditTransactionFormValues) => {
    setIsSaving(true);
    try {
      await onUpdateTransaction(transaction.id, {
        amount: data.amount,
        reason: data.reason || undefined, // Ensure empty string becomes undefined
      });
      setIsEditing(false);
      setReasonInput(data.reason || "");
      setIsSuggestionsOpen(false);
    } catch (error) {
      console.error("Failed to update transaction:", error);
      // Potentially add user-facing error toast here if needed
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    form.reset({
      amount: transaction.amount,
      reason: transaction.reason || "",
    });
    setReasonInput(transaction.reason || "");
    setIsSuggestionsOpen(false);
  };

  const handleReasonSelect = (reason: string) => {
    form.setValue("reason", reason, { shouldValidate: true });
    setReasonInput(reason);
    setIsSuggestionsOpen(false); // Explicitly close popover
  };

  const handleReasonKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      if (isSuggestionsOpen && suggestedReasons.length === 1) {
        event.preventDefault(); 
        handleReasonSelect(suggestedReasons[0]);
      } else if (!event.shiftKey) { 
        event.preventDefault(); 
        await form.handleSubmit(handleEditSubmit)(); 
      }
    }
  };

  const displayAmount = transaction.type === 'income' 
    ? `+${formatCurrency(transaction.amount)}` 
    : `-${formatCurrency(transaction.amount)}`;
  const amountColorClass = transaction.type === 'income' ? 'text-green-600' : 'text-destructive';
  const defaultReasonText = transaction.type === 'income' ? "Unspecified Income" : "Unspecified Expense";
  const reasonPlaceholder = transaction.type === 'income' ? "Edit source/reason (optional)" : "Edit reason (optional)";


  if (isEditing) {
    return (
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleEditSubmit)} className="p-1 border-b border-border/60 last:border-b-0 bg-card shadow-md rounded-md my-1">
          <div className="flex flex-col space-y-2 p-3">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={isNaN(field.value) ? '' : field.value}
                      className="h-9 text-sm"
                      aria-label="Edit amount"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <Popover open={isSuggestionsOpen && isEditing} onOpenChange={setIsSuggestionsOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={1}
                          className="text-sm resize-none"
                          placeholder={reasonPlaceholder}
                          aria-label="Edit reason"
                          value={reasonInput}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            field.onChange(e);
                            setReasonInput(newValue);
                            if (newValue.length > 0) {
                              const filteredOnChange = uniqueReasonsForType
                                .filter((r) => r.toLowerCase().includes(newValue.toLowerCase()))
                                .slice(0, 5);
                              setSuggestedReasons(filteredOnChange); // Update suggestions immediately
                              if (filteredOnChange.length > 0) {
                                setIsSuggestionsOpen(true); 
                              } else {
                                setIsSuggestionsOpen(false);
                              }
                            } else {
                              setSuggestedReasons([]); // Clear suggestions
                              setIsSuggestionsOpen(false);
                            }
                          }}
                          onKeyDown={handleReasonKeyDown}
                        />
                      </FormControl>
                    </PopoverTrigger>
                    {suggestedReasons.length > 0 && (
                      <PopoverContent 
                        className="w-[--radix-popover-trigger-width] p-0"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                      >
                        <ul className="py-1">
                          {suggestedReasons.map((suggestion) => (
                            <li key={suggestion}>
                              <Button
                                variant="ghost"
                                className="w-full justify-start px-3 py-1.5 h-auto text-sm"
                                onClick={() => handleReasonSelect(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </PopoverContent>
                    )}
                  </Popover>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
             <p className="text-xs text-muted-foreground self-start pt-1">
                {formatDate(transaction.timestamp, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
             </p>
          </div>
          <div className="flex justify-end space-x-2 p-2 border-t bg-muted/30">
            <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSaving || isLoadingWhileUpdating}>
              <X className="h-4 w-4 mr-1 sm:mr-2" /> Cancel
            </Button>
            <Button type="submit" variant="default" size="sm" disabled={isSaving || isLoadingWhileUpdating}>
              <Check className="h-4 w-4 mr-1 sm:mr-2" /> Save
            </Button>
          </div>
        </form>
      </FormProvider>
    );
  }

  return (
    <div className="flex justify-between items-center py-3 px-1 border-b border-border/60 last:border-b-0 hover:bg-muted/30 transition-colors rounded-md group">
      <div className="flex-grow min-w-0"> {/* Added min-w-0 for better flex handling with truncation */}
        <p className="font-medium text-foreground truncate"> {/* Added truncate */}
          {transaction.reason || defaultReasonText}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(transaction.timestamp, {  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div className="flex items-center space-x-1 sm:space-x-2 ml-2 shrink-0"> {/* Added shrink-0 and adjusted spacing */}
        <p className={`text-base sm:text-lg font-semibold tabular-nums ${amountColorClass}`}>
          {displayAmount}
        </p>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} disabled={isLoadingWhileUpdating} className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit transaction</span>
        </Button>
      </div>
    </div>
  );
}

    