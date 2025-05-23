
import type { Expense, ExpenseCreateDto } from './types';
import { getMonthBucket } from './utils';

const EXPENSES_STORAGE_KEY = 'cashflow_expenses';
const REASONS_STORAGE_KEY = 'cashflow_reasons';

export interface ExpenseRepository {
  addExpense(data: ExpenseCreateDto): Promise<Expense>;
  getAllExpenses(): Promise<Expense[]>;
  getUniqueReasons(): Promise<string[]>;
  updateExpense(id: string, data: Partial<Pick<ExpenseCreateDto, 'amount' | 'reason'>>): Promise<Expense | null>;
  // Future methods:
  // getExpenseById(id: string): Promise<Expense | null>;
  // deleteExpense(id: string): Promise<boolean>;
}

class LocalStorageExpenseRepository implements ExpenseRepository {
  private async _getExpensesFromStorage(): Promise<Expense[]> {
    if (typeof window === 'undefined') return [];
    const storedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
    return storedExpenses ? JSON.parse(storedExpenses) : [];
  }

  private async _saveExpensesToStorage(expenses: Expense[]): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  }

  private async _getReasonsFromStorage(): Promise<string[]> {
    if (typeof window === 'undefined') return [];
    const storedReasons = localStorage.getItem(REASONS_STORAGE_KEY);
    return storedReasons ? JSON.parse(storedReasons) : [];
  }

  private async _saveReasonsToStorage(reasons: string[]): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REASONS_STORAGE_KEY, JSON.stringify(reasons));
  }

  async addExpense(data: ExpenseCreateDto): Promise<Expense> {
    const expenses = await this._getExpensesFromStorage();
    const now = new Date();
    const newExpense: Expense = {
      ...data,
      id: crypto.randomUUID(),
      timestamp: now.getTime(),
      month_bucket: getMonthBucket(now),
    };
    expenses.push(newExpense);
    await this._saveExpensesToStorage(expenses);

    if (data.reason) {
      const reasons = await this.getUniqueReasons();
      const lowerCaseReason = data.reason.toLowerCase().trim();
      if (lowerCaseReason && !reasons.map(r => r.toLowerCase()).includes(lowerCaseReason)) {
        reasons.push(data.reason.trim()); // Store original casing but check lower
        await this._saveReasonsToStorage(reasons);
      }
    }
    return newExpense;
  }

  async getAllExpenses(): Promise<Expense[]> {
    const expenses = await this._getExpensesFromStorage();
    // Sort by timestamp descending (newest first)
    return expenses.sort((a, b) => b.timestamp - a.timestamp);
  }

  async getUniqueReasons(): Promise<string[]> {
    return this._getReasonsFromStorage();
  }

  async updateExpense(id: string, data: Partial<Pick<ExpenseCreateDto, 'amount' | 'reason'>>): Promise<Expense | null> {
    let expenses = await this._getExpensesFromStorage();
    const expenseIndex = expenses.findIndex(exp => exp.id === id);

    if (expenseIndex === -1) {
      return null;
    }

    const updatedExpense = {
      ...expenses[expenseIndex],
      ...data,
      // Ensure amount is a number if provided
      amount: data.amount !== undefined ? Number(data.amount) : expenses[expenseIndex].amount,
      reason: data.reason !== undefined ? (data.reason || undefined) : expenses[expenseIndex].reason,
    };
    expenses[expenseIndex] = updatedExpense;
    await this._saveExpensesToStorage(expenses);

    if (updatedExpense.reason) {
      const reasons = await this.getUniqueReasons();
      const lowerCaseReason = updatedExpense.reason.toLowerCase().trim();
      if (lowerCaseReason && !reasons.map(r => r.toLowerCase()).includes(lowerCaseReason)) {
        reasons.push(updatedExpense.reason.trim());
        await this._saveReasonsToStorage(reasons);
      }
    }
    return updatedExpense;
  }
}

// Repository instance (could be switched based on environment)
let expenseRepositoryInstance: ExpenseRepository | null = null;

export function getExpenseRepository(): ExpenseRepository {
  if (!expenseRepositoryInstance) {
    // const storageType = process.env.NEXT_PUBLIC_STORAGE_TYPE || 'local';
    // if (storageType === 'firebase') {
    //   expenseRepositoryInstance = new FirebaseExpenseRepository();
    // } else {
    //   expenseRepositoryInstance = new LocalStorageExpenseRepository();
    // }
    expenseRepositoryInstance = new LocalStorageExpenseRepository();
  }
  return expenseRepositoryInstance;
}
