
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
import type { IncomeCreateDto } from "@/lib/types";

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  reason: z.string().max(100, "Reason is too long.").optional(),
});

type IncomeFormValues = z.infer<typeof formSchema>;

interface IncomeFormProps {
  onSubmit: (data: IncomeCreateDto) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  uniqueReasons: string[];
}

export function IncomeForm({ onSubmit, onCancel, isLoading, uniqueReasons }: IncomeFormProps) {
  const form = useForm<IncomeFormValues>({
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
  }, [form]); // form.setFocus was not correctly memoized before

  React.useEffect(() => {
    if (reasonInput.length > 0) {
      const filtered = uniqueReasons
        .filter((r) => r.toLowerCase().includes(reasonInput.toLowerCase()))
        .slice(0, 5);
      setSuggestedReasons(filtered);
      // setIsSuggestionsOpen(filtered.length > 0); // This was moved to onChange
    } else {
      setSuggestedReasons([]);
      // setIsSuggestionsOpen(false); // This was moved to onChange
    }
  }, [reasonInput, uniqueReasons]);

  const handleFormSubmit = async (values: IncomeFormValues) => {
    const dataToSubmit = {
        ...values,
        amount: isNaN(values.amount) ? 0 : values.amount,
    };
    await onSubmit(dataToSubmit);
    form.reset({ amount: NaN, reason: "" });
    setReasonInput("");
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
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source/Reason (Optional)</FormLabel>
              <Popover open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Salary, Freelance Project"
                      {...field}
                      value={reasonInput}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        field.onChange(e); 
                        setReasonInput(newValue); 

                        if (newValue.length > 0) {
                          const filteredOnChange = uniqueReasons
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
            {isLoading ? "Saving..." : "Save Income"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
