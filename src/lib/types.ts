
export interface TransactionBase {
  id: string;
  timestamp: number; // Unix timestamp in milliseconds
  amount: number; // Always positive
  reason?: string;
  month_bucket: string; // YYYY-MM format, derived from local timezone
}

export interface Expense extends TransactionBase {
  type: 'expense';
}

export interface Income extends TransactionBase {
  type: 'income';
}

export type Transaction = Expense | Income;

// DTOs for creating new entries
export type ExpenseCreateDto = Omit<Expense, 'id' | 'timestamp' | 'month_bucket' | 'type'>;
export type IncomeCreateDto = Omit<Income, 'id' | 'timestamp' | 'month_bucket' | 'type'>;

// DTOs for updating entries
export type ExpenseUpdateDto = Partial<Pick<ExpenseCreateDto, 'amount' | 'reason'>>;
export type IncomeUpdateDto = Partial<Pick<IncomeCreateDto, 'amount' | 'reason'>>;


// For future enhancements
export interface Category {
  id: string;
  name: string;
  icon?: string; // Icon name or SVG string
}

export interface RecurringExpense {
  id: string;
  expenseTemplate: ExpenseCreateDto;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: number;
  endDate?: number;
}

export interface Budget {
  id:string;
  month_bucket: string; // YYYY-MM
  category?: string; // Optional: budget for a specific category
  limit: number;
}
