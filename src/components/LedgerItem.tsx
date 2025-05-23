
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import type { Expense, ExpenseCreateDto } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pencil, Check, X } from "lucide-react";

interface LedgerItemProps {
  expense: Expense;
  onUpdateExpense: (id: string, data: Partial<Pick<ExpenseCreateDto, 'amount' | 'reason'>>) => Promise<void>;
  isLoadingWhileUpdating?: boolean;
  uniqueReasons: string[];
}

const editExpenseFormSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  reason: z.string().max(100, "Reason is too long.").optional(),
});

type EditExpenseFormValues = z.infer<typeof editExpenseFormSchema>;

export function LedgerItem({ expense, onUpdateExpense, isLoadingWhileUpdating, uniqueReasons }: LedgerItemProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const [reasonInput, setReasonInput] = React.useState(expense.reason || "");
  const [suggestedReasons, setSuggestedReasons] = React.useState<string[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = React.useState(false);

  const form = useForm<EditExpenseFormValues>({
    resolver: zodResolver(editExpenseFormSchema),
    defaultValues: {
      amount: expense.amount,
      reason: expense.reason || "",
    },
  });

  React.useEffect(() => {
    if (isEditing) {
      form.reset({
        amount: expense.amount,
        reason: expense.reason || "",
      });
      setReasonInput(expense.reason || ""); // Reset reasonInput when editing starts/resets
      setTimeout(() => {
        form.setFocus('amount');
      }, 0);
    }
  }, [isEditing, expense, form]);

  React.useEffect(() => {
    if (reasonInput.length > 0 && isEditing) { // Only show suggestions in edit mode
      const filtered = uniqueReasons
        .filter((r) => r.toLowerCase().includes(reasonInput.toLowerCase()))
        .slice(0, 5);
      setSuggestedReasons(filtered);
    } else {
      setSuggestedReasons([]);
    }
  }, [reasonInput, uniqueReasons, isEditing]);

  const handleEditSubmit = async (data: EditExpenseFormValues) => {
    setIsSaving(true);
    try {
      await onUpdateExpense(expense.id, {
        amount: data.amount,
        reason: data.reason || undefined,
      });
      setIsEditing(false);
      setReasonInput(data.reason || ""); // Update reasonInput after successful save
      setIsSuggestionsOpen(false); // Close suggestions popover
    } catch (error) {
      console.error("Failed to update expense:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    form.reset({
      amount: expense.amount,
      reason: expense.reason || "",
    });
    setReasonInput(expense.reason || "");
    setIsSuggestionsOpen(false);
  };

  const handleReasonSelect = (reason: string) => {
    form.setValue("reason", reason, { shouldValidate: true });
    setReasonInput(reason);
    setIsSuggestionsOpen(false);
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
                          placeholder="Edit reason (optional)"
                          aria-label="Edit reason"
                          value={reasonInput}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            field.onChange(e);
                            setReasonInput(newValue);
                            if (newValue.length > 0) {
                              const filteredOnChange = uniqueReasons
                                .filter((r) => r.toLowerCase().includes(newValue.toLowerCase()))
                                .slice(0, 5);
                              if (filteredOnChange.length > 0) {
                                setIsSuggestionsOpen(true); 
                              } else {
                                setIsSuggestionsOpen(false);
                              }
                            } else {
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
                {formatDate(expense.timestamp, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
             </p>
          </div>
          <div className="flex justify-end space-x-2 p-2 border-t bg-muted/30">
            <Button type="button" variant="ghost" size="icon" onClick={handleCancelEdit} disabled={isSaving || isLoadingWhileUpdating} className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4" />
              <span className="sr-only">Cancel edit</span>
            </Button>
            <Button type="submit" variant="ghost" size="icon" disabled={isSaving || isLoadingWhileUpdating} className="h-8 w-8 text-muted-foreground hover:text-primary">
              <Check className="h-4 w-4" />
              <span className="sr-only">Save changes</span>
            </Button>
          </div>
        </form>
      </FormProvider>
    );
  }

  return (
    <div className="flex justify-between items-center py-3 px-1 border-b border-border/60 last:border-b-0 hover:bg-muted/30 transition-colors rounded-md group">
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
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} disabled={isLoadingWhileUpdating} className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit expense</span>
        </Button>
      </div>
    </div>
  );
}
