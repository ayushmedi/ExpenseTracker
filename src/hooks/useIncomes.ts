
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Income, IncomeCreateDto, IncomeUpdateDto } from '@/lib/types';
import { getIncomeRepository } from '@/lib/store';
import { useToast } from "@/hooks/use-toast";

export function useIncomes() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [uniqueIncomeExpenseTypes, setUniqueIncomeExpenseTypes] = useState<string[]>([]); // Changed from uniqueIncomeReasons
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const repository = getIncomeRepository();

  const fetchIncomesAndExpenseTypes = useCallback(async () => { // Changed from fetchIncomesAndReasons
    setIsLoading(true);
    try {
      const [fetchedIncomes, fetchedExpenseTypes] = await Promise.all([ // Changed from fetchedReasons
        repository.getAllIncomes(),
        repository.getUniqueExpenseTypes() // Changed from getUniqueReasons
      ]);
      setIncomes(fetchedIncomes);
      setUniqueIncomeExpenseTypes(fetchedExpenseTypes); // Changed from setUniqueIncomeReasons
      setError(null);
    } catch (e) {
      setError(e as Error);
      toast({
        title: "Error",
        description: "Could not load income data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [repository, toast]);

  useEffect(() => {
    fetchIncomesAndExpenseTypes(); // Changed from fetchIncomesAndReasons
  }, [fetchIncomesAndExpenseTypes]);

  const addIncome = useCallback(async (data: IncomeCreateDto) => {
    setIsLoading(true);
    try {
      await repository.addIncome(data);
      await fetchIncomesAndExpenseTypes(); // Changed from fetchIncomesAndReasons
      setError(null);
    } catch (e) {
      setError(e as Error);
      toast({
        title: "Error",
        description: "Could not add income.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [repository, fetchIncomesAndExpenseTypes, toast]);

  const updateIncome = useCallback(async (id: string, data: IncomeUpdateDto) => {
    setIsLoading(true);
    try {
      const updated = await repository.updateIncome(id, data);
      if (updated) {
        await fetchIncomesAndExpenseTypes(); // Changed from fetchIncomesAndReasons
      } else {
        throw new Error("Income not found or update failed.");
      }
      setError(null);
    } catch (e) {
      setError(e as Error);
      toast({
        title: "Error",
        description: (e as Error).message || "Could not update income.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [repository, fetchIncomesAndExpenseTypes, toast]);

  return {
    incomes,
    uniqueIncomeExpenseTypes, // Changed from uniqueIncomeReasons
    isLoading,
    error,
    addIncome,
    updateIncome,
    refreshIncomes: fetchIncomesAndExpenseTypes, // Changed from fetchIncomesAndReasons
  };
}
