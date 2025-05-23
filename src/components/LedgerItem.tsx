
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
  uniqueExpenseTypesForType: string[]; // Changed from uniqueReasonsForType
  isLoadingWhileUpdating?: boolean;
}

const editTransactionFormSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  expense_type: z.string().max(100, "Type description is too long.").optional(), // Changed from reason
});

type EditTransactionFormValues = z.infer<typeof editTransactionFormSchema>;

export function LedgerItem({ transaction, onUpdateTransaction, uniqueExpenseTypesForType, isLoadingWhileUpdating }: LedgerItemProps) { // Changed prop name
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const [expenseTypeInput, setExpenseTypeInput] = React.useState(transaction.expense_type || ""); // Changed from reasonInput
  const [suggestedExpenseTypes, setSuggestedExpenseTypes] = React.useState<string[]>([]); // Changed from suggestedReasons
  const [isSuggestionsOpen, setIsSuggestionsOpen] = React.useState(false);

  const form = useForm<EditTransactionFormValues>({
    resolver: zodResolver(editTransactionFormSchema),
    defaultValues: {
      amount: transaction.amount,
      expense_type: transaction.expense_type || "", // Changed from reason
    },
  });

  React.useEffect(() => {
    if (isEditing) {
      form.reset({
        amount: transaction.amount,
        expense_type: transaction.expense_type || "", // Changed from reason
      });
      setExpenseTypeInput(transaction.expense_type || ""); // Changed from reasonInput
      setTimeout(() => {
        form.setFocus('amount');
      }, 0);
    }
  }, [isEditing, transaction, form]);

  React.useEffect(() => {
    if (expenseTypeInput.length > 0 && isEditing) {
      const filtered = uniqueExpenseTypesForType // Changed from uniqueReasonsForType
        .filter((r) => r.toLowerCase().includes(expenseTypeInput.toLowerCase()))
        .slice(0, 5);
      setSuggestedExpenseTypes(filtered); // Changed from setSuggestedReasons
    } else {
      setSuggestedExpenseTypes([]); // Changed from setSuggestedReasons
    }
  }, [expenseTypeInput, uniqueExpenseTypesForType, isEditing]); // Changed prop name

  const handleEditSubmit = async (data: EditTransactionFormValues) => {
    setIsSaving(true);
    try {
      await onUpdateTransaction(transaction.id, {
        amount: data.amount,
        expense_type: data.expense_type || undefined, // Ensure empty string becomes undefined; Changed from reason
      });
      setIsEditing(false);
      setExpenseTypeInput(data.expense_type || ""); // Changed from reasonInput
      setIsSuggestionsOpen(false);
    } catch (error) {
      console.error("Failed to update transaction:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    form.reset({
      amount: transaction.amount,
      expense_type: transaction.expense_type || "", // Changed from reason
    });
    setExpenseTypeInput(transaction.expense_type || ""); // Changed from reasonInput
    setIsSuggestionsOpen(false);
  };

  const handleExpenseTypeSelect = (expenseType: string) => { // Changed from handleReasonSelect
    form.setValue("expense_type", expenseType, { shouldValidate: true }); // Changed from reason
    setExpenseTypeInput(expenseType); // Changed from setReasonInput
    setIsSuggestionsOpen(false); 
  };

  const handleExpenseTypeKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => { // Changed from handleReasonKeyDown
    if (event.key === "Enter") {
      if (isSuggestionsOpen && suggestedExpenseTypes.length === 1) { // Changed from suggestedReasons
        event.preventDefault(); 
        handleExpenseTypeSelect(suggestedExpenseTypes[0]); // Changed from handleReasonSelect, suggestedReasons
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
  
  const defaultExpenseTypeText = transaction.type === 'income' ? "Unspecified Income Type" : "Unspecified Expense Type"; // Changed text
  const expenseTypePlaceholder = transaction.type === 'income' ? "Edit type/source (optional)" : "Edit expense type (optional)"; // Changed text


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
              name="expense_type" // Changed from reason
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <Popover open={isSuggestionsOpen && isEditing} onOpenChange={setIsSuggestionsOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={1}
                          className="text-sm resize-none"
                          placeholder={expenseTypePlaceholder} // Changed placeholder
                          aria-label="Edit expense type" // Changed aria-label
                          value={expenseTypeInput} // Changed from reasonInput
                          onChange={(e) => {
                            const newValue = e.target.value;
                            field.onChange(e);
                            setExpenseTypeInput(newValue); // Changed from setReasonInput
                            if (newValue.length > 0) {
                              const filteredOnChange = uniqueExpenseTypesForType // Changed from uniqueReasonsForType
                                .filter((r) => r.toLowerCase().includes(newValue.toLowerCase()))
                                .slice(0, 5);
                              setSuggestedExpenseTypes(filteredOnChange); // Changed from setSuggestedReasons
                              if (filteredOnChange.length > 0) {
                                setIsSuggestionsOpen(true); 
                              } else {
                                setIsSuggestionsOpen(false);
                              }
                            } else {
                              setSuggestedExpenseTypes([]); // Changed from setSuggestedReasons
                              setIsSuggestionsOpen(false);
                            }
                          }}
                          onKeyDown={handleExpenseTypeKeyDown} // Changed from handleReasonKeyDown
                        />
                      </FormControl>
                    </PopoverTrigger>
                    {suggestedExpenseTypes.length > 0 && ( // Changed from suggestedReasons
                      <PopoverContent 
                        className="w-[--radix-popover-trigger-width] p-0"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                      >
                        <ul className="py-1">
                          {suggestedExpenseTypes.map((suggestion) => ( // Changed from suggestedReasons
                            <li key={suggestion}>
                              <Button
                                variant="ghost"
                                className="w-full justify-start px-3 py-1.5 h-auto text-sm"
                                onClick={() => handleExpenseTypeSelect(suggestion)} // Changed from handleReasonSelect
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
      <div className="flex-grow min-w-0"> 
        <p className="font-medium text-foreground truncate"> 
          {transaction.expense_type || defaultExpenseTypeText} {/* Changed from reason */}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(transaction.timestamp, {  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div className="flex items-center space-x-1 sm:space-x-2 ml-2 shrink-0"> 
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

