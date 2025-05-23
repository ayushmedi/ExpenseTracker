
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
  reason: z.string().max(100, "Reason is too long.").optional(),
});

type ExpenseFormValues = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  onSubmit: (data: ExpenseCreateDto) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  uniqueReasons: string[];
}

export function ExpenseForm({ onSubmit, onCancel, isLoading, uniqueReasons }: ExpenseFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: NaN,
      reason: "",
    },
  });

  const [reasonInput, setReasonInput] = React.useState("");
  const [suggestedReasons, setSuggestedReasons] = React.useState<string[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = React.useState(false);

  React.useEffect(() => {
    form.setFocus('amount');
  }, [form.setFocus]);

  React.useEffect(() => {
    if (reasonInput.length > 0) {
      const filtered = uniqueReasons
        .filter((r) => r.toLowerCase().includes(reasonInput.toLowerCase()))
        .slice(0, 5); // Show top 5 suggestions
      setSuggestedReasons(filtered);
      // Note: isSuggestionsOpen is now primarily controlled by onChange and handleReasonSelect
    } else {
      setSuggestedReasons([]);
      // Also ensure popover closes if input becomes empty
      setIsSuggestionsOpen(false); 
    }
  }, [reasonInput, uniqueReasons]);

  const handleFormSubmit = async (values: ExpenseFormValues) => {
    const dataToSubmit = {
        ...values,
        amount: isNaN(values.amount) ? 0 : values.amount,
    };
    await onSubmit(dataToSubmit);
    form.reset({ amount: NaN, reason: "" });
    setReasonInput("");
    setIsSuggestionsOpen(false); // Ensure popover is closed after submit
  };

  const handleReasonSelect = (reason: string) => {
    form.setValue("reason", reason, { shouldValidate: true });
    setReasonInput(reason);
    setIsSuggestionsOpen(false); // Explicitly close popover on selection
  };

  const handleReasonKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      if (isSuggestionsOpen && suggestedReasons.length === 1) {
        event.preventDefault(); // Prevent default Enter behavior (newline/submit)
        handleReasonSelect(suggestedReasons[0]); // Select the suggestion
      } else if (!event.shiftKey) { 
        // If not Shift+Enter (which allows newline)
        // This means: popover is closed, or it's open with 0 or >1 suggestions.
        // In these cases, Enter (without Shift) should submit the form.
        event.preventDefault(); // Prevent newline in textarea
        await form.handleSubmit(handleFormSubmit)(); // Submit the form
      }
      // If Shift+Enter, default behavior (newline) is allowed because no preventDefault is called.
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
                  aria-required="true"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason (Optional)</FormLabel>
              <Popover open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Groceries, Coffee"
                      {...field}
                      value={reasonInput}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        field.onChange(e); // Update RHF state
                        setReasonInput(newValue); // Update local state

                        if (newValue.length > 0) {
                          const filteredOnChange = uniqueReasons
                            .filter((r) => r.toLowerCase().includes(newValue.toLowerCase()))
                            .slice(0, 5);
                          // setSuggestedReasons(filteredOnChange); // Done by useEffect
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
                      rows={2}
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
