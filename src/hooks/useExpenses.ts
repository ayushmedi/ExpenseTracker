
import { useState, useEffect, useCallback } from 'react';
import type { Expense, ExpenseCreateDto } from '@/lib/types';
import { getExpenseRepository } from '@/lib/store';
import { useToast } from "@/hooks/use-toast";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [uniqueReasons, setUniqueReasons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const repository = getExpenseRepository();

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedExpenses, fetchedReasons] = await Promise.all([
        repository.getAllExpenses(),
        repository.getUniqueReasons()
      ]);
      setExpenses(fetchedExpenses);
      setUniqueReasons(fetchedReasons);
      setError(null);
    } catch (e) {
      setError(e as Error);
      toast({
        title: "Error",
        description: "Could not load expenses.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [repository, toast]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = useCallback(async (data: ExpenseCreateDto) => {
    setIsLoading(true);
    try {
      await repository.addExpense(data);
      await fetchExpenses(); // Refetch all data
      setError(null);
    } catch (e) {
      setError(e as Error);
      toast({
        title: "Error",
        description: "Could not add expense.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [repository, fetchExpenses, toast]);

  const updateExpense = useCallback(async (id: string, data: Partial<Pick<ExpenseCreateDto, 'amount' | 'reason'>>) => {
    setIsLoading(true); // Use general loading state, or introduce a specific one if needed
    try {
      const updated = await repository.updateExpense(id, data);
      if (updated) {
        await fetchExpenses(); // Refetch all data
        // Success toast removed as per user request
      } else {
        throw new Error("Expense not found or update failed.");
      }
      setError(null);
    } catch (e) {
      setError(e as Error);
      toast({
        title: "Error",
        description: (e as Error).message || "Could not update expense.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [repository, fetchExpenses, toast]);

  return {
    expenses,
    uniqueReasons,
    isLoading,
    error,
    addExpense,
    updateExpense,
    refreshExpenses: fetchExpenses, // Expose a refresh function
  };
}
