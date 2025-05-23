
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
      amount: NaN, // Initialize as NaN to keep it controlled and visually empty
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
      setIsSuggestionsOpen(filtered.length > 0);
    } else {
      setSuggestedReasons([]);
      setIsSuggestionsOpen(false);
    }
  }, [reasonInput, uniqueReasons]);

  const handleFormSubmit = async (values: ExpenseFormValues) => {
    // Filter out NaN amount before submitting if it was never touched
    const dataToSubmit = {
        ...values,
        amount: isNaN(values.amount) ? 0 : values.amount, // Or handle as error if preferred
    };
    await onSubmit(dataToSubmit);
    form.reset(); // This will reset to NaN and ""
    setReasonInput("");
  };

  const handleReasonSelect = (reason: string) => {
    form.setValue("reason", reason);
    setReasonInput(reason);
    setIsSuggestionsOpen(false);
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
                  {...field} // field.ref is now correctly passed from RHF
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
                      {...field} // RHF field props
                      value={reasonInput} // Override value for local control
                      onChange={(e) => { // Override onChange for local control + RHF
                        field.onChange(e); 
                        setReasonInput(e.target.value);
                      }}
                      rows={2}
                    />
                  </FormControl>
                </PopoverTrigger>
                {suggestedReasons.length > 0 && (
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
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
