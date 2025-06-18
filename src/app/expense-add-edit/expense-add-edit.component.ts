import { Component, effect, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ExpenseService } from '../service/expense.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { Budget, Category, Expense } from '../models/expense.models';


@Component({
  selector: 'app-expense-add-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    RouterModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './expense-add-edit.component.html',
  styleUrl: './expense-add-edit.component.css',
})


export class ExpenseAddEditComponent {
  router = inject(Router);
  snackBar = inject(MatSnackBar);
  route = inject(ActivatedRoute);

  expenseForm: FormGroup;

  isEditMode = false;
  expenseID: number = 0;

  constructor(private fb: FormBuilder, public expenseService: ExpenseService) {
    this.expenseForm = this.fb.group({
      title: ['', Validators.required],
      categoryId: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      date: ['', Validators.required],
      budgetId: [null, Validators.required]
    });

    this.expenseService.getCategories();
    this.expenseService.getBudgets();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      console.log('ID from route: ', id);

      if (id) {
        this.isEditMode = true;
        this.expenseID = +id;
        this.expenseService.getExpenses();
      }
    });

    effect(() => {
      if (this.isEditMode) {
        const expenses = this.expenseService.expenses();
        console.log('Effect triggered. Expenses: ', expenses);
        if (expenses.length > 0) {
          this.loadExpenseData(this.expenseID, expenses);
        }
      }
    });
  }

  get categoriesList() {
    return this.expenseService.categories();
  }

  get budgetsList() {
    return this.expenseService.budgets();
  }

  loadExpenseData(expenseID: number, expenses: Expense[]) {
    console.log('Looking for ID:', expenseID);
    const expense = expenses.find((e) => Number(e.id) === Number(expenseID));
    console.log('Found expense:', expense);
    if (expense) {
      let dateObj = null;
      if (expense.date) {
        const [day, month, year] = expense.date.split('/');
        dateObj = new Date(2000 + parseInt(year),parseInt(month) - 1, parseInt(day));
        console.log('Parsed date:', dateObj);
      }
      const selectedBudget = this.budgetsList.find(b => b.id === expense.budgetId);
      console.log('Selected budget:', selectedBudget);
      this.expenseForm.patchValue({
        title: expense.title,
        amount: expense.amount,
        categoryId: expense.categoryId,
        budgetId:expense.budgetId ,
        date: dateObj 
      });
      console.log('Form patched with values:', this.expenseForm.value);
      console.log(
        'Current budgetId in form:',
        this.expenseForm.get('budgetId')?.value
      );
      console.log('Available budgets:', this.budgetsList);
    }
  }

  generateNewId(): number {
    if (!this.expenseService.expenses().length) {
      return 1;
    }

    const lastId = Math.max(
      ...this.expenseService.expenses().map((expense) => expense.id)
    );
    return lastId + 1;
  }

  onSubmit() {
    if (this.expenseForm.valid) {

      const formValue = { ...this.expenseForm.value };
      console.log('Form value before processing:', formValue);
      if (formValue.date) {
        const dateObj = new Date(formValue.date);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = String(dateObj.getFullYear()).slice(-2);
        formValue.date = `${day}/${month}/${year}`;
      }

      const expense: Expense = {
        ...formValue,
        id: this.expenseID || this.generateNewId(),
      };

      if (this.isEditMode && this.expenseID !== null) {
        this.expenseService.updateExpense(this.expenseID, expense);
        this.snackBar.open('Expense edited successfully');
      } else {
        expense.id = this.generateNewId();
        this.expenseService.addExpense(expense);
        this.snackBar.open('Expense added successfully');
      }
      this.expenseForm.reset();
      this.router.navigate(['/dashboard']);
    }
  }

  onClear() {
    this.expenseForm.reset();
    console.log('Cleared');
  }

  onCancel() {
    this.router.navigate(['/dashboard']);
    console.log('Cancelled');
  }

  navigateToCategories() {
    this.router.navigate(['/categories']);
    console.log('Navigated to categories');
  }
}
