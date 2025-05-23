
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ExpenseCreateDto } from "@/lib/types";

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  expense_type: z.string().max(100, "Expense type is too long.").optional(), // Changed from reason
});

type ExpenseFormValues = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  onSubmit: (data: ExpenseCreateDto) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  uniqueExpenseTypes: string[]; // Changed from uniqueReasons
}

export function ExpenseForm({ onSubmit, onCancel, isLoading, uniqueExpenseTypes }: ExpenseFormProps) { // Changed prop name
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: NaN,
      expense_type: "", // Changed from reason
    },
  });

  const [expenseTypeInput, setExpenseTypeInput] = React.useState(""); // Changed from reasonInput
  const [suggestedExpenseTypes, setSuggestedExpenseTypes] = React.useState<string[]>([]); // Changed from suggestedReasons
  const [isSuggestionsOpen, setIsSuggestionsOpen] = React.useState(false);

  React.useEffect(() => {
    form.setFocus('amount');
  }, [form]);

  React.useEffect(() => {
    if (expenseTypeInput.length > 0) {
      const filtered = uniqueExpenseTypes // Changed from uniqueReasons
        .filter((r) => r.toLowerCase().includes(expenseTypeInput.toLowerCase()))
        .slice(0, 5); 
      setSuggestedExpenseTypes(filtered); // Changed from setSuggestedReasons
    } else {
      setSuggestedExpenseTypes([]); // Changed from setSuggestedReasons
    }
  }, [expenseTypeInput, uniqueExpenseTypes]); // Changed prop name

  const handleFormSubmit = async (values: ExpenseFormValues) => {
    const dataToSubmit = {
        ...values,
        amount: isNaN(values.amount) ? 0 : values.amount,
    };
    await onSubmit(dataToSubmit);
    form.reset({ amount: NaN, expense_type: "" }); // Changed from reason
    setExpenseTypeInput(""); // Changed from setReasonInput
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
        await form.handleSubmit(handleFormSubmit)(); 
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  value={isNaN(field.value) ? '' : field.value}
                  aria-required="true"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expense_type" // Changed from reason
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expense Type (Optional)</FormLabel> {/* Changed label */}
              <Popover open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Groceries, Coffee"
                      {...field}
                      value={expenseTypeInput} // Changed from reasonInput
                      onChange={(e) => {
                        const newValue = e.target.value;
                        field.onChange(e); 
                        setExpenseTypeInput(newValue); // Changed from setReasonInput

                        if (newValue.length > 0) {
                          const filteredOnChange = uniqueExpenseTypes // Changed from uniqueReasons
                            .filter((r) => r.toLowerCase().includes(newValue.toLowerCase()))
                            .slice(0, 5);
                          setSuggestedExpenseTypes(filteredOnChange); // Changed from setSuggestedReasons
                          if (filteredOnChange.length > 0) {
                            setIsSuggestionsOpen(true); 
                          } else {
                            setIsSuggestionsOpen(false);
                          }
                        } else {
                          setIsSuggestionsOpen(false);
                        }
                      }}
                      onKeyDown={handleExpenseTypeKeyDown} // Changed from handleReasonKeyDown
                      rows={2}
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
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Expense"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
