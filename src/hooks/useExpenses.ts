
import { useState, useEffect, useCallback } from 'react';
import type { Expense, ExpenseCreateDto, ExpenseUpdateDto } from '@/lib/types'; // Added ExpenseUpdateDto
import { getExpenseRepository } from '@/lib/store';
import { useToast } from "@/hooks/use-toast";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [uniqueExpenseTypes, setUniqueExpenseTypes] = useState<string[]>([]); // Changed from uniqueReasons
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const repository = getExpenseRepository();

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedExpenses, fetchedExpenseTypes] = await Promise.all([ // Changed from fetchedReasons
        repository.getAllExpenses(),
        repository.getUniqueExpenseTypes() // Changed from getUniqueReasons
      ]);
      setExpenses(fetchedExpenses);
      setUniqueExpenseTypes(fetchedExpenseTypes); // Changed from setUniqueReasons
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
      await fetchExpenses(); 
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

  const updateExpense = useCallback(async (id: string, data: ExpenseUpdateDto) => { // Changed type from Partial<Pick<ExpenseCreateDto, 'amount' | 'reason'>>
    setIsLoading(true); 
    try {
      const updated = await repository.updateExpense(id, data);
      if (updated) {
        await fetchExpenses(); 
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
    uniqueExpenseTypes, // Changed from uniqueReasons
    isLoading,
    error,
    addExpense,
    updateExpense,
    refreshExpenses: fetchExpenses, 
  };
}
