export interface Expense {
    id: number;
    title: string;
    categoryId: number;
    date: string;
    amount: number;
    budgetId: number;
}

export interface Category {
    id: number;
    name: string;
    description: string;
}

export interface Budget {
  id: number;
  title: string; 
  amount: number; 
  startDate: string; 
  endDate: string; 
  duration?: number; 
  spentAmount?: number; 
  remainingAmount?: number; 
  expenses?: Expense[]; 
}

