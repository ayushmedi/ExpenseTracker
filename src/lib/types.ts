export interface Expense {
  id: string;
  timestamp: number; // Unix timestamp in milliseconds
  amount: number;
  reason?: string;
  month_bucket: string; // YYYY-MM format, derived from local timezone
}

export type ExpenseCreateDto = Omit<Expense, 'id' | 'timestamp' | 'month_bucket'>;

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
