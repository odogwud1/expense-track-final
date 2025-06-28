import { Component, inject, signal,effect} from '@angular/core';
import { MatTableDataSource, MatTableModule} from '@angular/material/table';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule, MatPaginator} from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ExpenseService } from '../service/expense.service';
import { Router,ActivatedRoute,RouterModule, NavigationEnd } from '@angular/router'; 
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
    ReactiveFormsModule,
  ],
  templateUrl: './expense-budget.component.html',
  styleUrl: './expense-budget.component.css',
})
export class ExpenseBudgetComponent {
  router = inject(Router);
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  isEditMode = false;
  budgetId: number = 0;
  budgetForm: FormGroup;
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
    'status',
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
    duration: '',
    spentAmount: 0,
    remainingAmount: 0,
  };

  loadBudgetsAndExpenses(): void {
    this.expenseService.getBudgets();
    this.expenseService.getExpenses();

    effect(() => {
      const budgets = this.expenseService.budgets();
      const expenses = this.expenseService.expenses();

      const updatedBudgets = budgets.map((budget) => {
        const totalAmount = budget.amount;
        const spentAmount = expenses
          .filter((exp) => Number(exp.budgetId) === Number(budget.id))
          .reduce((sum, exp) => sum + Number(exp.amount), 0);
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
          duration: duration,
        };
      });

      this.dataSource.data = updatedBudgets;
      this.totalItems = updatedBudgets.length;
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  constructor() {
    const budgets = this.expenseService.budgets();
    this.expenseService.getBudgets();
    this.totalItems = budgets.length;

    this.budgetForm = this.fb.group({
      title: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      console.log('ID from route: ', id);

      if (id) {
        this.isEditMode = true;
        this.budgetId = +id;
        this.mode = 'add';
        this.expenseService.getBudgets();

        const budgets = this.expenseService.budgets();
        const budget = budgets.find(
          (budget) => Number(budget.id) === Number(this.budgetId)
        );

        if (budget) {
          this.budgetForm.patchValue({
            title: budget.title,
            amount: budget.amount,
            startDate: this.expenseService.parseDateString(budget.startDate),
            endDate: this.expenseService.parseDateString(budget.endDate),
          });
        }
      } else {
        this.isEditMode = false;
        this.budgetForm.reset();
      }

      
    });

    

    effect(() => {
      const budgets = this.expenseService.budgets();
      const expenses = this.expenseService.expenses();
      this.expenses = expenses;

      // Update the table data
      const updatedBudgets = budgets.map((budget) => {
        const totalAmount = budget.amount;
        const spentAmount = expenses
          .filter((exp) => Number(exp.budgetId) === Number(budget.id))
          .reduce((sum, exp) => sum + Number(exp.amount), 0);
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
          duration: duration,
        };
      });

      this.dataSource.data = updatedBudgets;
      this.totalItems = updatedBudgets.length;
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }

      if (this.isEditMode) {
        const budgets = this.expenseService.budgets();
        console.log('Effect triggered. Expenses: ', budgets);
        if (budgets.length > 0) {
          this.loadBudgetData(this.budgetId, budgets);
        }
      } else {
        this.budgetForm.reset();
      }
    });
  }

  onSubmit() {
    if (this.budgetForm.valid) {
      const formValue = this.budgetForm.value;

      // Format dates
      const startDate = new Date(formValue.startDate);
      const endDate = new Date(formValue.endDate);

      const budget: Budget = {
        id: this.isEditMode ? this.budgetId : this.generateNewId(),
        title: formValue.title,
        amount: formValue.amount,
        startDate: `${startDate.getDate().toString().padStart(2, '0')}/${(
          startDate.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}/${startDate.getFullYear().toString().slice(-2)}`,
        endDate: `${endDate.getDate().toString().padStart(2, '0')}/${(
          endDate.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}/${endDate.getFullYear().toString().slice(-2)}`,
        spentAmount: 0,
        remainingAmount: formValue.amount,
      };

      if (this.isEditMode) {
        this.expenseService.updateBudget(this.budgetId, budget);
        this.snackbar.open('Budget updated successfully', 'Close', {
          duration: 2000,
        });
      } else {
        this.expenseService.addBudget(budget);
        this.snackbar.open('Budget added successfully', 'Close', {
          duration: 2000,
        });
      }

      this.showBudgetList();
    }
  }

  getCategoryTitle(categoryId: number | null): string {
    if (!categoryId) return 'No Category';
    const categories = this.expenseService.categories();
    const category = categories.find(
      (cat) => Number(cat.id) === Number(categoryId)
    );
    return category ? category.name : 'No Category';
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

  loadBudgetData(budgetId: number, budgets: Budget[]) {
    const budget = budgets.find((b) => Number(b.id) === Number(budgetId));
    if (budget) {
     this.budgetForm.patchValue({
        title: budget.title,
        amount: budget.amount,
        startDate: this.expenseService.parseDateString(budget.startDate),
        endDate: this.expenseService.parseDateString(budget.endDate),
      });
    }
  }

  ngOnInit(): void {
    this.mode = 'list';
    this.loadBudgetsAndExpenses();
    this.expenseService.getBudgets();
    this.expenseService.getExpenses();
    this.expenseService.getCategories();
  }

  showAddBudget() {
    this.mode = 'add';
    this.isEditMode = false;
    this.selectedBudgetId.set(null);
    this.budgetForm.reset();
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

  calculateDuration(start: string, end: string): string {
    if (!start || !end) return '0 days';

    const [startDay, startMonth, startYear] = start.split('/').map(Number);
    const [endDay, endMonth, endYear] = end.split('/').map(Number);

    // Create Date objects with full year (2000 + YY)
    const startDate = new Date(2000 + startYear, startMonth - 1, startDay);
    const endDate = new Date(2000 + endYear, endMonth - 1, endDay);

    // Calculate difference in milliseconds
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? 's' : ''}`;
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
