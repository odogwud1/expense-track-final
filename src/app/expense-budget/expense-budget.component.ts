import { Component, inject, signal,} from '@angular/core';
import { MatTableDataSource, MatTableModule} from '@angular/material/table';
import { FormBuilder, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule, MatPaginator} from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ExpenseService } from '../service/expense.service';
import { Router, RouterModule } from '@angular/router'; 
import { Budget, Expense } from '../models/expense.models';
import { ViewChild } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-expense-budget',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    RouterModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatInputModule,
  ],
  templateUrl: './expense-budget.component.html',
  styleUrl: './expense-budget.component.css',
})
export class ExpenseBudgetComponent {
  router = inject(Router);
  fb = inject(FormBuilder);
  expenseService = inject(ExpenseService);
  snackbar = inject(MatSnackBar);
  mode: 'list' | 'add' | 'view' = 'list';

  selectedBudgetId = signal<Budget | null>(null);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<Budget>([]);
  totalItems: number = 0;
  pageSize: number = 5;
  expenses: Expense[] = [];

  expenseDataSource = new MatTableDataSource<Expense>([]);

  expenseColumns: string[] = [
    'index',
    'title',
    'category',
    'date',
    'amount',
    'actions',
  ];

  displayedColumns: string[] = [
    'index',
    'title',
    'total-amount',
    'spent-amount',
    'remaining-amount',
    'start-date',
    'end-date',
    'duration',
    'actions',
  ];

  newBudget: Budget = {
    id: 0,
    title: '',
    amount: 0,
    startDate: '',
    endDate: '',
    duration: 0,
    spentAmount: 0,
    remainingAmount: 0,
  };

  addBudget() {
    if (this.validateBudget()) {
      const budgetToAdd = {
      id: this.generateNewId(),
      amount : this.newBudget.amount,
      title: this.newBudget.title,
      startDate: this.newBudget.startDate,
      endDate: this.newBudget.endDate,
    };
      this.expenseService.addBudget(budgetToAdd);
      this.snackbar.open('Budget added successfully', 'Close', {
        duration: 2000,
      });
      this.showBudgetList();
    }
  }

  generateNewId(): number {
    if (!this.expenseService.budgets().length) {
      return 1;
    }

    const lastId = Math.max(
      ...this.expenseService.budgets().map((budget) => budget.id)
    );
    return lastId + 1;
  }

  private validateBudget(): boolean {
    // Format start date
    if (this.newBudget.startDate) {
      const startDateObj = new Date(this.newBudget.startDate);
      const startDay = String(startDateObj.getDate()).padStart(2, '0');
      const startMonth = String(startDateObj.getMonth() + 1).padStart(2, '0');
      const startYear = String(startDateObj.getFullYear()).slice(-2);
      this.newBudget.startDate = `${startDay}/${startMonth}/${startYear}`;
    }

    // Format end date
    if (this.newBudget.endDate) {
      const endDateObj = new Date(this.newBudget.endDate);
      const endDay = String(endDateObj.getDate()).padStart(2, '0');
      const endMonth = String(endDateObj.getMonth() + 1).padStart(2, '0');
      const endYear = String(endDateObj.getFullYear()).slice(-2);
      this.newBudget.endDate = `${endDay}/${endMonth}/${endYear}`;
    }

    return (
      this.newBudget.title.trim() !== '' &&
      this.newBudget.amount > 0 &&
      this.newBudget.startDate !== '' &&
      this.newBudget.endDate !== ''
    );
  }

  constructor() {
    const budgets = this.expenseService.budgets();
    this.expenseService.getBudgets();
    this.totalItems = budgets.length;
  }

  ngOnInit(): void {
    this.loadBudgetsAndExpenses();
    this.expenseService.getBudgets();
    this.expenseService.getExpenses();
  }

  showAddBudget() {
    this.mode = 'add';
    this.selectedBudgetId.set(null);
  }

  showBudgetList() {
    this.mode = 'list';
    this.selectedBudgetId.set(null);
    this.loadBudgetsAndExpenses();
  }

  showBudgetDetails(budget: Budget) {
    this.mode = 'view';
    this.selectedBudgetId.set(budget);

    const filteredExpenses = this.expenses.filter(
      (expense) => Number(expense.budgetId) === Number(budget.id)
    );
    this.expenseDataSource.data = filteredExpenses;
    this.expenseDataSource.paginator = this.paginator;
  }

  deleteExpense(expenseId: number): void {
    this.expenseService.deleteExpense(expenseId);
    this.snackbar.open('Expense deleted successfully', 'Close', {
      duration: 2000,
    });
    this.loadBudgetsAndExpenses();
  }

  loadBudgetsAndExpenses(): void {
    this.expenseService.getBudgets();
    this.expenseService.getExpenses();

    setTimeout(() => {
      let budgets = this.expenseService.budgets();
      this.expenses = this.expenseService.expenses();

      budgets = budgets.map((budget: any) => {
        const totalAmount = budget.amount ?? budget.budgetAmount ?? 0;
        const spentAmount = this.getSpentAmount(budget.id);
        const remainingAmount = totalAmount - spentAmount;
        const duration = this.calculateDuration(
          budget.startDate,
          budget.endDate
        );
        return {
          ...budget,
          amount: totalAmount,
          spentAmount,
          remainingAmount,
          duration,
        };
      });

      this.dataSource.data = budgets;
      this.totalItems = budgets.length;
      if (this.paginator) this.dataSource.paginator = this.paginator;
    }, 500);
  }

  calculateDuration(start: string, end: string): string {
    if (!start || !end) return '';

    const [startDay, startMonth, startYear] = start.split('/').map(Number);
    const [endDay, endMonth, endYear] = end.split('/').map(Number);
    if (
      [startDay, startMonth, startYear, endDay, endMonth, endYear].some(isNaN)
    )
      return '';

    const startDate = new Date(2000 + startYear, startMonth - 1, startDay);
    const endDate = new Date(2000 + endYear, endMonth - 1, endDay);

    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (isNaN(diffDays) || diffDays < 0) return '';
    if (diffDays < 7) {
      return `${diffDays} day(s)`;
    } else if (diffDays < 30) {
      const weeks = Math.round(diffDays / 7);
      return `${weeks} week(s)`;
    } else {
      const months = Math.round(diffDays / 30);
      return `${months} month(s)`;
    }
  }

  getSpentAmount(budgetId: number): number {
    return this.expenses
      .filter((exp) => Number(exp.budgetId) === Number(budgetId))
      .reduce((sum, exp) => sum + Number(exp.amount), 0);
  }

  deleteBudget(id: number): void {
    this.expenseService.deleteBudget(id);
    this.snackbar.open('Budget deleted successfully', 'Close', {
      duration: 2000,
    });
  }

  onPageChange(event: any): void {
    this.pageSize = event.pageSize;
  }
}
