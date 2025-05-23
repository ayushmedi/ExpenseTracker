
import type { Expense, ExpenseCreateDto, Income, IncomeCreateDto } from './types';
import { getMonthBucket } from './utils';

const EXPENSES_STORAGE_KEY = 'cashflow_expenses';
const EXPENSE_REASONS_STORAGE_KEY = 'cashflow_expense_reasons';
const INCOME_STORAGE_KEY = 'cashflow_incomes';
const INCOME_REASONS_STORAGE_KEY = 'cashflow_income_reasons';

export interface ExpenseRepository {
  addExpense(data: ExpenseCreateDto): Promise<Expense>;
  getAllExpenses(): Promise<Expense[]>;
  getUniqueReasons(): Promise<string[]>;
  updateExpense(id: string, data: Partial<Pick<ExpenseCreateDto, 'amount' | 'reason'>>): Promise<Expense | null>;
}

export interface IncomeRepository {
  addIncome(data: IncomeCreateDto): Promise<Income>;
  getAllIncomes(): Promise<Income[]>;
  getUniqueReasons(): Promise<string[]>;
  updateIncome(id: string, data: Partial<Pick<IncomeCreateDto, 'amount' | 'reason'>>): Promise<Income | null>;
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
    const storedReasons = localStorage.getItem(EXPENSE_REASONS_STORAGE_KEY);
    return storedReasons ? JSON.parse(storedReasons) : [];
  }

  private async _saveReasonsToStorage(reasons: string[]): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(EXPENSE_REASONS_STORAGE_KEY, JSON.stringify(reasons));
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
        reasons.push(data.reason.trim());
        await this._saveReasonsToStorage(reasons);
      }
    }
    return newExpense;
  }

  async getAllExpenses(): Promise<Expense[]> {
    const expenses = await this._getExpensesFromStorage();
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

class LocalStorageIncomeRepository implements IncomeRepository {
  private async _getIncomesFromStorage(): Promise<Income[]> {
    if (typeof window === 'undefined') return [];
    const storedIncomes = localStorage.getItem(INCOME_STORAGE_KEY);
    return storedIncomes ? JSON.parse(storedIncomes) : [];
  }

  private async _saveIncomesToStorage(incomes: Income[]): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(incomes));
  }

  private async _getReasonsFromStorage(): Promise<string[]> {
    if (typeof window === 'undefined') return [];
    const storedReasons = localStorage.getItem(INCOME_REASONS_STORAGE_KEY);
    return storedReasons ? JSON.parse(storedReasons) : [];
  }

  private async _saveReasonsToStorage(reasons: string[]): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(INCOME_REASONS_STORAGE_KEY, JSON.stringify(reasons));
  }

  async addIncome(data: IncomeCreateDto): Promise<Income> {
    const incomes = await this._getIncomesFromStorage();
    const now = new Date();
    const newIncome: Income = {
      ...data,
      id: crypto.randomUUID(),
      timestamp: now.getTime(),
      month_bucket: getMonthBucket(now),
    };
    incomes.push(newIncome);
    await this._saveIncomesToStorage(incomes);

    if (data.reason) {
      const reasons = await this.getUniqueReasons();
      const lowerCaseReason = data.reason.toLowerCase().trim();
      if (lowerCaseReason && !reasons.map(r => r.toLowerCase()).includes(lowerCaseReason)) {
        reasons.push(data.reason.trim());
        await this._saveReasonsToStorage(reasons);
      }
    }
    return newIncome;
  }

  async getAllIncomes(): Promise<Income[]> {
    const incomes = await this._getIncomesFromStorage();
    return incomes.sort((a, b) => b.timestamp - a.timestamp);
  }

  async getUniqueReasons(): Promise<string[]> {
    return this._getReasonsFromStorage();
  }

  async updateIncome(id: string, data: Partial<Pick<IncomeCreateDto, 'amount' | 'reason'>>): Promise<Income | null> {
    let incomes = await this._getIncomesFromStorage();
    const incomeIndex = incomes.findIndex(inc => inc.id === id);

    if (incomeIndex === -1) {
      return null;
    }

    const updatedIncome = {
      ...incomes[incomeIndex],
      ...data,
      amount: data.amount !== undefined ? Number(data.amount) : incomes[incomeIndex].amount,
      reason: data.reason !== undefined ? (data.reason || undefined) : incomes[incomeIndex].reason,
    };
    incomes[incomeIndex] = updatedIncome;
    await this._saveIncomesToStorage(incomes);

    if (updatedIncome.reason) {
      const reasons = await this.getUniqueReasons();
      const lowerCaseReason = updatedIncome.reason.toLowerCase().trim();
      if (lowerCaseReason && !reasons.map(r => r.toLowerCase()).includes(lowerCaseReason)) {
        reasons.push(updatedIncome.reason.trim());
        await this._saveReasonsToStorage(reasons);
      }
    }
    return updatedIncome;
  }
}


let expenseRepositoryInstance: ExpenseRepository | null = null;
let incomeRepositoryInstance: IncomeRepository | null = null;

export function getExpenseRepository(): ExpenseRepository {
  if (!expenseRepositoryInstance) {
    expenseRepositoryInstance = new LocalStorageExpenseRepository();
  }
  return expenseRepositoryInstance;
}

export function getIncomeRepository(): IncomeRepository {
  if (!incomeRepositoryInstance) {
    incomeRepositoryInstance = new LocalStorageIncomeRepository();
  }
  return incomeRepositoryInstance;
}