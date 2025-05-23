
import type { Expense, ExpenseCreateDto, Income, IncomeCreateDto } from './types';
import { getMonthBucket } from './utils';

const EXPENSES_STORAGE_KEY = 'cashflow_expenses';
const EXPENSE_TYPES_STORAGE_KEY = 'cashflow_expense_types'; // Changed from cashflow_expense_reasons
const INCOME_STORAGE_KEY = 'cashflow_incomes';
const INCOME_TYPES_STORAGE_KEY = 'cashflow_income_types'; // Changed from cashflow_income_reasons

export interface ExpenseRepository {
  addExpense(data: ExpenseCreateDto): Promise<Expense>;
  getAllExpenses(): Promise<Expense[]>;
  getUniqueExpenseTypes(): Promise<string[]>; // Changed from getUniqueReasons
  updateExpense(id: string, data: Partial<Pick<ExpenseCreateDto, 'amount' | 'expense_type'>>): Promise<Expense | null>; // Changed from reason
}

export interface IncomeRepository {
  addIncome(data: IncomeCreateDto): Promise<Income>;
  getAllIncomes(): Promise<Income[]>;
  getUniqueExpenseTypes(): Promise<string[]>; // Changed from getUniqueReasons
  updateIncome(id: string, data: Partial<Pick<IncomeCreateDto, 'amount' | 'expense_type'>>): Promise<Income | null>; // Changed from reason
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

  private async _getExpenseTypesFromStorage(): Promise<string[]> { // Changed from _getReasonsFromStorage
    if (typeof window === 'undefined') return [];
    const storedExpenseTypes = localStorage.getItem(EXPENSE_TYPES_STORAGE_KEY); // Changed key
    return storedExpenseTypes ? JSON.parse(storedExpenseTypes) : [];
  }

  private async _saveExpenseTypesToStorage(expenseTypes: string[]): Promise<void> { // Changed from _saveReasonsToStorage
    if (typeof window === 'undefined') return;
    localStorage.setItem(EXPENSE_TYPES_STORAGE_KEY, JSON.stringify(expenseTypes)); // Changed key
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

    if (data.expense_type) { // Changed from reason
      const expenseTypes = await this.getUniqueExpenseTypes(); // Changed from getUniqueReasons
      const lowerCaseExpenseType = data.expense_type.toLowerCase().trim(); // Changed from reason
      if (lowerCaseExpenseType && !expenseTypes.map(r => r.toLowerCase()).includes(lowerCaseExpenseType)) {
        expenseTypes.push(data.expense_type.trim()); // Changed from reason
        await this._saveExpenseTypesToStorage(expenseTypes); // Changed from _saveReasonsToStorage
      }
    }
    return newExpense;
  }

  async getAllExpenses(): Promise<Expense[]> {
    const expenses = await this._getExpensesFromStorage();
    return expenses.sort((a, b) => b.timestamp - a.timestamp);
  }

  async getUniqueExpenseTypes(): Promise<string[]> { // Changed from getUniqueReasons
    return this._getExpenseTypesFromStorage(); // Changed from _getReasonsFromStorage
  }

  async updateExpense(id: string, data: Partial<Pick<ExpenseCreateDto, 'amount' | 'expense_type'>>): Promise<Expense | null> { // Changed from reason
    let expenses = await this._getExpensesFromStorage();
    const expenseIndex = expenses.findIndex(exp => exp.id === id);

    if (expenseIndex === -1) {
      return null;
    }

    const updatedExpense = {
      ...expenses[expenseIndex],
      ...data,
      amount: data.amount !== undefined ? Number(data.amount) : expenses[expenseIndex].amount,
      expense_type: data.expense_type !== undefined ? (data.expense_type || undefined) : expenses[expenseIndex].expense_type, // Changed from reason
    };
    expenses[expenseIndex] = updatedExpense;
    await this._saveExpensesToStorage(expenses);

    if (updatedExpense.expense_type) { // Changed from reason
      const expenseTypes = await this.getUniqueExpenseTypes(); // Changed from getUniqueReasons
      const lowerCaseExpenseType = updatedExpense.expense_type.toLowerCase().trim(); // Changed from reason
      if (lowerCaseExpenseType && !expenseTypes.map(r => r.toLowerCase()).includes(lowerCaseExpenseType)) {
        expenseTypes.push(updatedExpense.expense_type.trim()); // Changed from reason
        await this._saveExpenseTypesToStorage(expenseTypes); // Changed from _saveReasonsToStorage
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

  private async _getExpenseTypesFromStorage(): Promise<string[]> { // Changed from _getReasonsFromStorage
    if (typeof window === 'undefined') return [];
    const storedExpenseTypes = localStorage.getItem(INCOME_TYPES_STORAGE_KEY); // Changed key
    return storedExpenseTypes ? JSON.parse(storedExpenseTypes) : [];
  }

  private async _saveExpenseTypesToStorage(expenseTypes: string[]): Promise<void> { // Changed from _saveReasonsToStorage
    if (typeof window === 'undefined') return;
    localStorage.setItem(INCOME_TYPES_STORAGE_KEY, JSON.stringify(expenseTypes)); // Changed key
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

    if (data.expense_type) { // Changed from reason
      const expenseTypes = await this.getUniqueExpenseTypes(); // Changed from getUniqueReasons
      const lowerCaseExpenseType = data.expense_type.toLowerCase().trim(); // Changed from reason
      if (lowerCaseExpenseType && !expenseTypes.map(r => r.toLowerCase()).includes(lowerCaseExpenseType)) {
        expenseTypes.push(data.expense_type.trim()); // Changed from reason
        await this._saveExpenseTypesToStorage(expenseTypes); // Changed from _saveReasonsToStorage
      }
    }
    return newIncome;
  }

  async getAllIncomes(): Promise<Income[]> {
    const incomes = await this._getIncomesFromStorage();
    return incomes.sort((a, b) => b.timestamp - a.timestamp);
  }

  async getUniqueExpenseTypes(): Promise<string[]> { // Changed from getUniqueReasons
    return this._getExpenseTypesFromStorage(); // Changed from _getReasonsFromStorage
  }

  async updateIncome(id: string, data: Partial<Pick<IncomeCreateDto, 'amount' | 'expense_type'>>): Promise<Income | null> { // Changed from reason
    let incomes = await this._getIncomesFromStorage();
    const incomeIndex = incomes.findIndex(inc => inc.id === id);

    if (incomeIndex === -1) {
      return null;
    }

    const updatedIncome = {
      ...incomes[incomeIndex],
      ...data,
      amount: data.amount !== undefined ? Number(data.amount) : incomes[incomeIndex].amount,
      expense_type: data.expense_type !== undefined ? (data.expense_type || undefined) : incomes[incomeIndex].expense_type, // Changed from reason
    };
    incomes[incomeIndex] = updatedIncome;
    await this._saveIncomesToStorage(incomes);

    if (updatedIncome.expense_type) { // Changed from reason
      const expenseTypes = await this.getUniqueExpenseTypes(); // Changed from getUniqueReasons
      const lowerCaseExpenseType = updatedIncome.expense_type.toLowerCase().trim(); // Changed from reason
      if (lowerCaseExpenseType && !expenseTypes.map(r => r.toLowerCase()).includes(lowerCaseExpenseType)) {
        expenseTypes.push(updatedIncome.expense_type.trim()); // Changed from reason
        await this._saveExpenseTypesToStorage(expenseTypes); // Changed from _saveReasonsToStorage
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
