import { Injectable, signal } from '@angular/core';
import { Expense } from '../models/expense.models';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  categories: { id: number; name: string }[] = [];

  private expenseSignal = signal<Expense[]>([]);

  constructor(private http: HttpClient) {
    this.fetchCategories();
  }

  fetchCategories() {
    this.http
      .get<{ id: number; name: string }[]>('http://localhost:3000/categories')
      .subscribe((cats) => (this.categories = cats));
  }

  addCategory(name: string) {
    // Find the next id (json-server does this automatically, but you can omit id)
    this.http
      .post<{ id: number; name: string }>('http://localhost:3000/categories', { name })
      .subscribe(() => this.fetchCategories());
  }

  deleteCategory(category:{ id:number; name:string} ) {
    this.http
      .delete(`http://localhost:3000/categories/${category.id}`)
      .subscribe(() => this.fetchCategories());
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

  get expenses() {
    return this.expenseSignal;
  }

  addExpense(expense: Expense) {
    this.http
      .post('http://localhost:3000/expenses', expense)
      .subscribe(() => this.getExpenses());
  }

  deleteExpense(id: number) {
    this.http
      .delete(`http://localhost:3000/expenses/${id}`)
      .subscribe(() => this.getExpenses());
  }

  updateExpense(id: number, updatedExpense: Expense) {
    return this.http
      .put(`http://localhost:3000/expenses/${id}`, updatedExpense)
      .subscribe(() => this.getExpenses());
  }
}
