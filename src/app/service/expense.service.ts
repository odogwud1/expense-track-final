import { Injectable, signal } from '@angular/core';
import { Expense, Budget, Category } from '../models/expense.models';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private expenseSignal = signal<Expense[]>([]);
  private budgetSignal = signal<Budget[]>([]);
  private categorySignal = signal<Category[]>([]);

  constructor(private http: HttpClient) {}

  get expenses() {
    return this.expenseSignal;
  }

  get categories() {
    return this.categorySignal;
  }

  get budgets() {
    return this.budgetSignal;
  }

  getCategories() {
    this.http
      .get<Category[]>('http://localhost:3000/categories')
      .subscribe((cats) => {
        console.log('Fetched categories:', cats); // Debugging
        this.categorySignal.set(cats); // Update the categories array
      });
  }

  getCategoryTitle(categoryId: number | null): string {
    if (!categoryId) return 'No Category';

    console.log('Looking for categoryId:', categoryId);
    const category = this.categories().find(
      (cat) => Number(cat.id) === Number(categoryId)
    );
    console.log('Found category:', category);
    return category ? category.name : 'No Category';
  }

  parseDateString(dateStr: string): Date | null {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(2000 + year, month - 1, day);
  }
  
  getBudgetTitle(budgetId: number | null): string {
    if (!budgetId) return 'No Budget';
    const budgets = this.budgets();
    const budget = budgets.find(
      (budget) => Number(budget.id) === Number(budgetId)
    );
    return budget ? budget.title : 'No Budget';
  }

  updateBudget(id: number, updatedBudget: Budget) {
    return this.http
      .put(`http://localhost:3000/budgets/${id}`, updatedBudget)
      .subscribe(() => this.getBudgets());
  }

  addCategory(category: Category) {
    this.http
      .post<Category[]>('http://localhost:3000/categories', category)
      .subscribe(() => this.getCategories());
  }

  deleteCategory(categoryId: number) {
    this.http
      .delete(`http://localhost:3000/categories/${categoryId}`)
      .subscribe(() => this.getCategories());
  }

  getExpensesRaw() {
    return this.http.get<Expense[]>('http://localhost:3000/expenses');
  }

  getExpenses() {
    this.http
      .get<Expense[]>('http://localhost:3000/expenses')
      .subscribe((expenses) => {
        console.log('Fetched expenses:', expenses); // Debugging
        this.expenseSignal.set(expenses); // Update the signal
      });
  }

  addExpense(expense: Expense) {
    this.http
      .post<Expense>('http://localhost:3000/expenses', expense)
      .subscribe(() => this.getExpenses());
  }

  deleteExpense(expenseID: number) {
    this.http
      .delete(`http://localhost:3000/expenses/${Number(expenseID)}`)
      .subscribe(() => this.getExpenses());
  }

  updateExpense(id: number, updatedExpense: Expense) {
    return this.http
      .put(`http://localhost:3000/expenses/${id}`, updatedExpense)
      .subscribe(() => this.getExpenses());
  }

  getBudgets() {
    this.http
      .get<Budget[]>('http://localhost:3000/budgets')
      .subscribe((budgets) => {
        console.log('Fetched expenses:', budgets); // Debugging
        this.budgetSignal.set(budgets); // Update the signal
      });
  }

  addBudget(budget: Budget) {
    this.http
      .post<Budget>('http://localhost:3000/budgets', budget)
      .subscribe(() => this.getBudgets());
  }

  deleteBudget(budgetId: number) {
    this.http
      .delete(`http://localhost:3000/budgets/${Number(budgetId)}`)
      .subscribe(() => this.getBudgets());
  }
}
