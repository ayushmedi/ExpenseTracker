
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Income, IncomeCreateDto } from '@/lib/types';
import { getIncomeRepository } from '@/lib/store';
import { useToast } from "@/hooks/use-toast";

export function useIncomes() {
  const [incomes, setIncomes] = useState<Income[]>([]); // Will be used later for displaying incomes
  const [uniqueIncomeReasons, setUniqueIncomeReasons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const repository = getIncomeRepository();

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // For now, we only fetch unique reasons. Fetching all incomes will be for display later.
      const fetchedReasons = await repository.getUniqueReasons();
      // const fetchedIncomes = await repository.getAllIncomes();
      // setIncomes(fetchedIncomes); 
      setUniqueIncomeReasons(fetchedReasons);
      setError(null);
    } catch (e) {
      setError(e as Error);
      toast({
        title: "Error",
        description: "Could not load initial income data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [repository, toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const addIncome = useCallback(async (data: IncomeCreateDto) => {
    setIsLoading(true);
    try {
      await repository.addIncome(data);
      // After adding, refetch unique reasons as it might have changed
      const fetchedReasons = await repository.getUniqueReasons();
      setUniqueIncomeReasons(fetchedReasons);
      // We'll refetch all incomes when we implement the display
      // const fetchedIncomes = await repository.getAllIncomes();
      // setIncomes(fetchedIncomes);
      setError(null);
      // No success toast for income added, similar to expense
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
  }, [repository, toast]);

  // updateIncome will be added later when income ledger display is implemented

  return {
    incomes, // For future use
    uniqueIncomeReasons,
    isLoading,
    error,
    addIncome,
    refreshIncomes: fetchInitialData, // Expose a refresh function
  };
}
