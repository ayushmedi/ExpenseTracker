
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Income, IncomeCreateDto, IncomeUpdateDto } from '@/lib/types';
import { getIncomeRepository } from '@/lib/store';
import { useToast } from "@/hooks/use-toast";

export function useIncomes() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [uniqueIncomeReasons, setUniqueIncomeReasons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const repository = getIncomeRepository();

  const fetchIncomesAndReasons = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedIncomes, fetchedReasons] = await Promise.all([
        repository.getAllIncomes(),
        repository.getUniqueReasons()
      ]);
      setIncomes(fetchedIncomes);
      setUniqueIncomeReasons(fetchedReasons);
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
    fetchIncomesAndReasons();
  }, [fetchIncomesAndReasons]);

  const addIncome = useCallback(async (data: IncomeCreateDto) => {
    setIsLoading(true);
    try {
      await repository.addIncome(data);
      await fetchIncomesAndReasons(); // Refetch all data
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
  }, [repository, fetchIncomesAndReasons, toast]);

  const updateIncome = useCallback(async (id: string, data: IncomeUpdateDto) => {
    setIsLoading(true);
    try {
      const updated = await repository.updateIncome(id, data);
      if (updated) {
        await fetchIncomesAndReasons(); // Refetch all data
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
  }, [repository, fetchIncomesAndReasons, toast]);

  return {
    incomes,
    uniqueIncomeReasons,
    isLoading,
    error,
    addIncome,
    updateIncome,
    refreshIncomes: fetchIncomesAndReasons,
  };
}
